/**
 * Resource Tracker — ApplicationV2 panel.
 *
 * Singleton window showing heroic resource, surges, and (future) hero tokens.
 * Players see their assigned character; the GM gets a character selector bar
 * at the top to switch between all player-owned hero actors.
 */

import { MODULE_ID } from "../config.mjs";
import {
  getHeroActor,
  getAllHeroActors,
  getClassItem,
  getHeroLevel,
  getClassDefinition,
  resolveEntries,
  gainLabel,
  spendLabel,
  resolveGainAmount,
  updateHeroicResource,
  updateSurges,
  resetHeroicResource,
  postResourceChat,
} from "./resource-logic.mjs";

export class ResourceApp extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {

  // ── Static config ──────────────────────────────────────────────────────────

  static DEFAULT_OPTIONS = {
    id: "drawsteel-resources-ui",
    classes: ["drawsteel-resources-ui"],
    window: {
      title: "DSRESOURCES.WindowTitle",
      resizable: true,
    },
    position: { width: 420, height: 650 },
    actions: {
      switchCharacter:  ResourceApp.#switchCharacter,
      switchTab:        ResourceApp.#switchTab,
      incrementHeroic:  ResourceApp.#incrementHeroic,
      decrementHeroic:  ResourceApp.#decrementHeroic,
      gainHeroic:       ResourceApp.#gainHeroic,
      spendHeroic:      ResourceApp.#spendHeroic,
      togglePassives:   ResourceApp.#togglePassives,
      resetHeroic:      ResourceApp.#resetHeroic,
      incrementSurge:   ResourceApp.#incrementSurge,
      decrementSurge:   ResourceApp.#decrementSurge,
      resetSurge:       ResourceApp.#resetSurge,
    },
  };

  static PARTS = {
    panel: {
      template: `modules/${MODULE_ID}/templates/resource-panel.hbs`,
      scrollable: [".dsresources-tab-content"],
    },
  };

  // ── Singleton ──────────────────────────────────────────────────────────────

  static _instance = null;

  static toggle() {
    if (this._instance?.rendered) {
      this._instance.close();
    } else {
      if (!this._instance) this._instance = new ResourceApp();
      this._instance.render(true);
    }
  }

  static show() {
    if (!this._instance) this._instance = new ResourceApp();
    this._instance.render(true);
  }

  // ── Instance state ─────────────────────────────────────────────────────────

  _activeTab = "heroic";
  _showPassives = false;

  /** GM-only: id of the currently viewed hero actor. null = auto-select first. */
  _selectedActorId = null;

  /**
   * Resolve the actor this panel is currently displaying.
   * Players → their assigned character.
   * GM → the actor selected via the character bar (falls back to first hero).
   */
  #getActiveActor() {
    if (!game.user.isGM) return getHeroActor();
    const heroes = getAllHeroActors();
    if (this._selectedActorId) {
      const found = heroes.find((a) => a.id === this._selectedActorId);
      if (found) return found;
    }
    // Fall back to first available hero
    const first = heroes[0] ?? null;
    if (first) this._selectedActorId = first.id;
    return first;
  }

  // ── Context ────────────────────────────────────────────────────────────────

  async _prepareContext(_options) {
    const isGM = game.user.isGM;
    const actor = this.#getActiveActor();

    // GM character selector data
    let heroList = [];
    if (isGM) {
      heroList = getAllHeroActors().map((a) => ({
        id: a.id,
        name: a.name,
        isSelected: a.id === actor?.id,
      }));
    }

    if (!actor) {
      return { noCharacter: true, isGM, heroList };
    }

    const classItem = getClassItem(actor);
    const classDef  = getClassDefinition(actor);
    const heroLevel = getHeroLevel(actor);
    const resourceName = classItem?.system?.primary ?? game.i18n.localize("DSRESOURCES.HeroicResource");

    const heroicValue = actor.system.hero?.primary?.value ?? 0;
    const surgeValue  = actor.system.hero?.surges ?? 0;

    // Resolve level-appropriate gain/spend entries
    let gains  = [];
    let spends = [];
    let passiveEffects = [];

    if (classDef) {
      gains  = resolveEntries(classDef.gains, heroLevel).map((e) => ({
        ...e,
        label: gainLabel(e, actor),
      }));
      spends = resolveEntries(classDef.spends, heroLevel).map((e) => ({
        ...e,
        label: spendLabel(e),
      }));
      passiveEffects = (classDef.passiveEffects ?? [])
        .filter((pe) => pe.minLevel <= heroLevel)
        .map((pe) => ({
          ...pe,
          isActive: heroicValue >= pe.threshold,
        }));
    }

    const hasPassiveEffects = passiveEffects.length > 0;
    const noClassData = !classDef || (gains.length === 0 && spends.length === 0);

    return {
      noCharacter: false,
      isGM,
      heroList,
      actorName: actor.name,
      activeTab: this._activeTab,
      resourceName,
      heroicValue,
      surgeValue,
      gains,
      spends,
      hasPassiveEffects,
      showPassives: this._showPassives,
      passiveEffects,
      noClassData,
      className: classDef?.className ?? classItem?.name ?? "",
    };
  }

  // ── Actions: character switching (GM only) ─────────────────────────────────

  static #switchCharacter(event, target) {
    event.preventDefault();
    const actorId = target.dataset.actorId;
    if (actorId) {
      this._selectedActorId = actorId;
      this.render(false);
    }
  }

  // ── Actions: tab switching ─────────────────────────────────────────────────

  static #switchTab(event, target) {
    event.preventDefault();
    const tab = target.dataset.tab;
    if (tab) {
      this._activeTab = tab;
      this.render(false);
    }
  }

  // ── Actions: heroic resource ───────────────────────────────────────────────

  static async #incrementHeroic(_event, _target) {
    const actor = this.#getActiveActor();
    if (!actor) return;
    await updateHeroicResource(actor, 1);
  }

  static async #decrementHeroic(_event, _target) {
    const actor = this.#getActiveActor();
    if (!actor) return;
    const current = actor.system.hero?.primary?.value ?? 0;
    if (current <= 0) {
      ui.notifications.warn(game.i18n.localize("DSRESOURCES.Notify.NoResource"));
      return;
    }
    await updateHeroicResource(actor, -1);
  }

  static async #gainHeroic(_event, target) {
    const actor = this.#getActiveActor();
    if (!actor) return;

    const gainId = target.dataset.gainId;
    const classDef = getClassDefinition(actor);
    if (!classDef) return;

    const heroLevel = getHeroLevel(actor);
    const entries = resolveEntries(classDef.gains, heroLevel);
    const entry = entries.find((e) => e.id === gainId);
    if (!entry) return;

    const { total, formula } = await resolveGainAmount(entry, actor);
    const resourceName = getClassItem(actor)?.system?.primary ?? "Resource";
    const result = await updateHeroicResource(actor, total);

    await postResourceChat(actor, {
      resourceName,
      action: game.i18n.localize("DSRESOURCES.Chat.Gained"),
      amount: total,
      method: entry.description,
      previous: result.previous,
      current: result.current,
      formula,
    });
  }

  static async #spendHeroic(_event, target) {
    const actor = this.#getActiveActor();
    if (!actor) return;

    const spendId = target.dataset.spendId;
    const classDef = getClassDefinition(actor);
    if (!classDef) return;

    const heroLevel = getHeroLevel(actor);
    const entries = resolveEntries(classDef.spends, heroLevel);
    const entry = entries.find((e) => e.id === spendId);
    if (!entry) return;

    const current = actor.system.hero?.primary?.value ?? 0;
    if (current < entry.cost) {
      ui.notifications.warn(game.i18n.localize("DSRESOURCES.Notify.NotEnough"));
      return;
    }

    const resourceName = getClassItem(actor)?.system?.primary ?? "Resource";
    const result = await updateHeroicResource(actor, -entry.cost);

    // Handle optional damage roll on spend
    let damageRoll = null;
    let damageType = null;
    if (entry.damage) {
      damageRoll = new Roll(entry.damage.formula);
      await damageRoll.evaluate();
      damageType = entry.damage.type ?? null;
    }

    await postResourceChat(actor, {
      resourceName,
      action: game.i18n.localize("DSRESOURCES.Chat.Spent"),
      amount: entry.cost,
      method: entry.description,
      previous: result.previous,
      current: result.current,
      damageRoll,
      damageType,
    });
  }

  static #togglePassives(_event, _target) {
    this._showPassives = !this._showPassives;
    this.render(false);
  }

  static async #resetHeroic(_event, _target) {
    const actor = this.#getActiveActor();
    if (!actor) return;
    const resourceName = getClassItem(actor)?.system?.primary ?? "Resource";
    const result = await resetHeroicResource(actor);

    await postResourceChat(actor, {
      resourceName,
      action: game.i18n.localize("DSRESOURCES.Chat.Reset"),
      amount: result.previous,
      method: game.i18n.localize("DSRESOURCES.Chat.EncounterEnd"),
      previous: result.previous,
      current: 0,
    });
  }

  // ── Actions: surges ────────────────────────────────────────────────────────

  static async #incrementSurge(_event, _target) {
    const actor = this.#getActiveActor();
    if (!actor) return;
    await updateSurges(actor, 1);
  }

  static async #decrementSurge(_event, _target) {
    const actor = this.#getActiveActor();
    if (!actor) return;
    const current = actor.system.hero?.surges ?? 0;
    if (current <= 0) {
      ui.notifications.warn(game.i18n.localize("DSRESOURCES.Notify.NoSurges"));
      return;
    }
    await updateSurges(actor, -1);
  }

  static async #resetSurge(_event, _target) {
    const actor = this.#getActiveActor();
    if (!actor) return;
    const prev = actor.system.hero?.surges ?? 0;
    await actor.update({ "system.hero.surges": 0 });
    await postResourceChat(actor, {
      resourceName: game.i18n.localize("DSRESOURCES.Tabs.Surge"),
      action: game.i18n.localize("DSRESOURCES.Chat.Reset"),
      amount: prev,
      method: game.i18n.localize("DSRESOURCES.Chat.SurgeReset"),
      previous: prev,
      current: 0,
    });
  }
}
