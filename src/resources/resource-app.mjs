/**
 * Resource Tracker — ApplicationV2 panel.
 *
 * Singleton window showing heroic resource, surges, and (future) hero tokens.
 * Players see their assigned character; the GM gets a character selector bar
 * at the top to switch between all player-owned hero actors.
 */

import { MODULE_ID } from "../config.mjs";
import { DOMAIN_PIETY_TABLE, DOMAIN_PRAYER_EFFECTS } from "./resource-data.mjs";
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
    id: "draw-steel-resources-ui",
    classes: ["draw-steel-resources-ui"],
    window: {
      title: "DSRESOURCES.WindowTitle",
      resizable: true,
      minimizable: true,
    },
    position: { width: 420, height: 650 },
    actions: {
      switchCharacter:  ResourceApp.#switchCharacter,
      switchTab:        ResourceApp.#switchTab,
      incrementHeroic:  ResourceApp.#incrementHeroic,
      decrementHeroic:  ResourceApp.#decrementHeroic,
      gainHeroic:       ResourceApp.#gainHeroic,
      spendHeroic:      ResourceApp.#spendHeroic,
      prayHeroic:       ResourceApp.#prayHeroic,
      adjustSpendX:     ResourceApp.#adjustSpendX,
      confirmSpendX:    ResourceApp.#confirmSpendX,
      togglePassives:   ResourceApp.#togglePassives,
      resetHeroic:      ResourceApp.#resetHeroic,
      spendSurgeDamage:  ResourceApp.#spendSurgeDamage,
      spendSurgePotency: ResourceApp.#spendSurgePotency,
      incrementSurge:   ResourceApp.#incrementSurge,
      decrementSurge:   ResourceApp.#decrementSurge,
      resetSurge:       ResourceApp.#resetSurge,
      gainGrowthSurge:  ResourceApp.#gainGrowthSurge,
      incrementToken:   ResourceApp.#incrementToken,
      decrementToken:   ResourceApp.#decrementToken,
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

  /** Inline Spend X amount tracking, keyed by spend entry id. */
  _spendXValues = {};

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

  /**
   * Attempt to read the shared hero token pool from the Draw Steel system.
   * Returns { available: true, value: Number } or { available: false }.
   */
  #getHeroTokens() {
    const asNum = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
    try {
      // Draw Steel system exposes hero tokens via the ds namespace
      if (typeof ds !== "undefined") {
        // ds.game.heroTokens (CombatTracker-level shared pool)
        const v1 = asNum(ds.game?.heroTokens);
        if (v1 !== null) return { available: true, value: v1 };
        const v2 = asNum(ds.heroTokens);
        if (v2 !== null) return { available: true, value: v2 };
      }
      // Try game-level setting
      const val = asNum(game.settings.get("draw-steel", "heroTokens"));
      if (val !== null) return { available: true, value: val };
    } catch { /* setting not registered — expected */ }
    try {
      // Some systems store it under the active combat
      const combat = game.combat;
      const v = asNum(combat?.system?.heroTokens);
      if (v !== null) return { available: true, value: v };
    } catch { /* no active combat */ }
    return { available: false };
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

    // Highest characteristic score for surge damage
    const chars = actor.system?.characteristics ?? {};
    let highestChar = 0;
    for (const key of Object.keys(chars)) {
      const val = Number(chars[key]?.value ?? 0);
      if (val > highestChar) highestChar = val;
    }

    // Resolve level-appropriate gain/spend entries
    let gains  = [];
    let spends = [];
    let passiveEffects = [];
    let growthTables = [];

    if (classDef) {
      const enrichOpts = { rollData: actor.getRollData(), async: true };
      const enrichedGains = resolveEntries(classDef.gains, heroLevel);
      gains = [];
      for (const e of enrichedGains) {
        // Expand domain entries into per-domain rows based on actor's subclasses
        if (e.action === "domain") {
          const domains = actor.items.filter((i) => i.type === "subclass");
          for (const domain of domains) {
            const trigger = DOMAIN_PIETY_TABLE[domain.name];
            if (!trigger) continue;
            const domainDesc = await TextEditor.enrichHTML(
              `<strong>${domain.name}:</strong> ${trigger}`, enrichOpts
            );
            gains.push({
              ...e,
              description: domainDesc,
              label: gainLabel(e, actor),
              isPray: false,
            });
          }
          continue;
        }
        const enrichedDesc = await TextEditor.enrichHTML(e.description, enrichOpts);
        gains.push({
          ...e,
          description: enrichedDesc,
          label: e.action === "pray" ? game.i18n.localize("DSRESOURCES.Conduit.Pray") : gainLabel(e, actor),
          isPray: e.action === "pray",
        });
      }
      const enrichedSpends = resolveEntries(classDef.spends, heroLevel);
      spends = [];
      for (const e of enrichedSpends) {
        // Filter by required ability on the actor
        if (e.requiresAbility) {
          const hasAbility = actor.items.some(
            (i) => i.name === e.requiresAbility && i.type === "ability"
          );
          if (!hasAbility) continue;
        }
        if (e.requiresSubclass) {
          const hasSubclass = actor.items.some(
            (i) => i.name === e.requiresSubclass && i.type === "subclass"
          );
          if (!hasSubclass) continue;
        }
        const enrichedDesc = await TextEditor.enrichHTML(e.description, enrichOpts);
        const isSpendX = e.action === "spendX";

        // Compute inline spend X state
        let spendXValue, spendXMin, spendXMax;
        if (isSpendX) {
          const currentResource = actor.system.hero?.primary?.value ?? 0;
          const step = e.spendXStep ?? 1;
          spendXMin = e.cost ?? 1;
          spendXMax = Math.floor(currentResource / step) * step;
          if (e.spendXHardMax) spendXMax = Math.min(spendXMax, e.spendXHardMax);
          if (spendXMax < spendXMin) spendXMax = spendXMin;
          const raw = this._spendXValues[e.id] ?? spendXMin;
          spendXValue = Math.max(spendXMin, Math.min(spendXMax, raw));
          this._spendXValues[e.id] = spendXValue;
        }

        // Process children for group headers (e.g. Psi Boost)
        let processedChildren;
        if (e.isGroupHeader && e.children?.length) {
          processedChildren = [];
          for (const child of e.children) {
            if (child.minLevel > heroLevel) continue;
            if (child.requiresSubclass) {
              const hasSub = actor.items.some(
                (i) => i.name === child.requiresSubclass && i.type === "subclass"
              );
              if (!hasSub) continue;
            }
            const childDesc = await TextEditor.enrichHTML(child.description, enrichOpts);
            processedChildren.push({
              ...child,
              description: childDesc,
              label: spendLabel(child),
              isSpendX: false,
            });
          }
        }

        spends.push({
          ...e,
          description: enrichedDesc,
          label: isSpendX
            ? game.i18n.format("DSRESOURCES.SpendX", { name: e.spendXTitle })
            : spendLabel(e),
          isSpendX,
          spendXValue,
          spendXMin,
          spendXMax,
          children: processedChildren,
        });
      }
      const rawPassives = (classDef.passiveEffects ?? [])
        .filter((pe) => pe.minLevel <= heroLevel);
      passiveEffects = [];
      for (const pe of rawPassives) {
        const enrichedDesc = await TextEditor.enrichHTML(pe.description, enrichOpts);
        passiveEffects.push({ ...pe, description: enrichedDesc, isActive: heroicValue >= pe.threshold });
      }

      // Process growth tables (Fury Growing Ferocity, etc.)
      if (classDef.growthTables?.length) {
        for (const table of classDef.growthTables) {
          if (table.requiresSubclass && !actor.items.some(
            (i) => i.name === table.requiresSubclass && i.type === "subclass"
          )) continue;
          if (table.requiresKit && !actor.items.some(
            (i) => i.name === table.requiresKit && i.type === "kit"
          )) continue;

          const eligibleRows = table.rows.filter((r) => r.minLevel <= heroLevel);
          const processedRows = [];
          for (const row of eligibleRows) {
            const enrichedRowDesc = await TextEditor.enrichHTML(row.description, enrichOpts);
            processedRows.push({
              ...row,
              description: enrichedRowDesc,
              isActive: heroicValue >= row.threshold,
            });
          }

          // Within each surgeGroup, only the highest-threshold active row shows its button
          const activeGroupMax = {};
          for (const row of processedRows) {
            if (row.isActive && row.grantsSurge && row.surgeGroup) {
              if (!activeGroupMax[row.surgeGroup] || row.threshold > activeGroupMax[row.surgeGroup]) {
                activeGroupMax[row.surgeGroup] = row.threshold;
              }
            }
          }
          for (const row of processedRows) {
            row.showSurgeButton = row.isActive
              && row.grantsSurge > 0
              && (!row.surgeGroup || activeGroupMax[row.surgeGroup] === row.threshold);
            row.surgeButtonAmount = row.grantsSurge ?? 0;
          }

          // Enrich optional table description (e.g. Inertial Shield passive)
          let tableDescription;
          if (table.description) {
            tableDescription = await TextEditor.enrichHTML(table.description, enrichOpts);
          }

          growthTables.push({ id: table.id, label: table.label, description: tableDescription, rows: processedRows });
        }
      }
    }

    const hasPassiveEffects = passiveEffects.length > 0;
    const noClassData = !classDef || (gains.length === 0 && spends.length === 0);

    // Mantle of Essence indicator (Elementalist)
    let mantleIndicator = null;
    if (classDef?.mantleIndicator) {
      const mi = classDef.mantleIndicator;
      if (heroLevel >= mi.minLevel) {
        const stamina = actor.system.stamina?.value ?? 0;
        const isDying = stamina <= 0;
        const noThreshold = heroLevel >= mi.noThresholdLevel;
        const isActive = !isDying && (noThreshold || heroicValue >= mi.essenceThreshold);
        mantleIndicator = {
          label: mi.abilityName,
          isActive,
        };
      }
    }

    // Hero token pool (shared party resource)
    const tokenInfo = this.#getHeroTokens();

    return {
      noCharacter: false,
      isGM,
      heroList,
      actorName: actor.name,
      activeTab: this._activeTab,
      resourceName,
      heroicValue,
      surgeValue,
      heroTokenAvailable: tokenInfo.available,
      heroTokenValue: tokenInfo.available ? tokenInfo.value : 0,
      highestChar,
      gains,
      spends,
      hasPassiveEffects,
      showPassives: this._showPassives,
      passiveEffects,
      noClassData,
      mantleIndicator,
      growthTables,
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

    const { total, roll, formula } = await resolveGainAmount(entry, actor);
    const resourceName = getClassItem(actor)?.system?.primary ?? "Resource";
    const result = await updateHeroicResource(actor, total);

    // For dice rolls, show the roll visual in chat
    if (roll) {
      const rollHtml = await roll.render();
      const speaker = ChatMessage.getSpeaker({ actor });
      const content = `
        <div class="dsresources-chat-card">
          <div class="dsresources-chat-header">
            <strong>${speaker.alias}</strong> ${game.i18n.localize("DSRESOURCES.Chat.Gained")} <strong>${total}</strong> ${resourceName}
          </div>
          <div class="dsresources-chat-method">${entry.description}</div>
          <div class="dsresources-chat-roll">${rollHtml}</div>
          <div class="dsresources-chat-summary">
            ${resourceName}: ${result.previous} → ${result.current}
          </div>
        </div>`;
      await ChatMessage.create({ user: game.user.id, speaker, content });
    } else if (entry.action === "domain") {
      // Domain gain — append the domain condition trigger text
      const domains = actor.items.filter((i) => i.type === "subclass");
      const domainLines = domains
        .map((d) => DOMAIN_PIETY_TABLE[d.name])
        .filter(Boolean)
        .map((t) => `<div class="dsresources-chat-domain-line">${t}</div>`)
        .join("");
      const speaker = ChatMessage.getSpeaker({ actor });
      const content = `
        <div class="dsresources-chat-card">
          <div class="dsresources-chat-header">
            <strong>${speaker.alias}</strong> ${game.i18n.localize("DSRESOURCES.Chat.Gained")} <strong>${total}</strong> ${resourceName}
          </div>
          <div class="dsresources-chat-method">${entry.description}</div>
          ${domainLines ? `<div class="dsresources-chat-domain">${domainLines}</div>` : ""}
          <div class="dsresources-chat-summary">
            ${resourceName}: ${result.previous} → ${result.current}
          </div>
        </div>`;
      await ChatMessage.create({ user: game.user.id, speaker, content });
    } else {
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
  }

  static async #spendHeroic(_event, target) {
    const actor = this.#getActiveActor();
    if (!actor) return;

    const spendId = target.dataset.spendId;
    const classDef = getClassDefinition(actor);
    if (!classDef) return;

    const heroLevel = getHeroLevel(actor);
    const entries = resolveEntries(classDef.spends, heroLevel);
    let entry = entries.find((e) => e.id === spendId);
    // Search within children of group headers (e.g. Psi Boost children)
    if (!entry) {
      for (const e of entries) {
        if (e.children) {
          entry = e.children.find((c) => c.id === spendId);
          if (entry) break;
        }
      }
    }
    if (!entry) return;

    const current = actor.system.hero?.primary?.value ?? 0;
    if (current < entry.cost) {
      ui.notifications.warn(game.i18n.localize("DSRESOURCES.Notify.NotEnough"));
      return;
    }

    const resourceName = getClassItem(actor)?.system?.primary ?? "Resource";
    const result = await updateHeroicResource(actor, -entry.cost);

    // Handle optional surge grant on spend (e.g. Primordial Strike)
    if (entry.grantsSurge) {
      await updateSurges(actor, entry.grantsSurge);
    }

    // Handle optional damage roll on spend
    let damageRoll = null;
    let damageType = null;
    if (entry.damage) {
      damageRoll = new Roll(entry.damage.formula);
      await damageRoll.evaluate();
      damageType = entry.damage.type ?? null;
    }

    const method = entry.grantsSurge
      ? `${entry.description}<br><em>Gained ${entry.grantsSurge} surge${entry.grantsSurge > 1 ? "s" : ""}.</em>`
      : entry.description;

    await postResourceChat(actor, {
      resourceName,
      action: game.i18n.localize("DSRESOURCES.Chat.Spent"),
      amount: entry.cost,
      method,
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

  // ── Actions: Pray (Conduit special) ────────────────────────────────────────

  /**
   * Conduit "Pray" action — rolls 1d3 for the pray bonus effect only.
   * The base turn-start piety roll is handled separately by gainHeroic.
   */
  static async #prayHeroic(_event, _target) {
    const actor = this.#getActiveActor();
    if (!actor) return;

    const classDef = getClassDefinition(actor);
    if (!classDef?.prayResults) return;

    const heroLevel = getHeroLevel(actor);
    const resourceName = getClassItem(actor)?.system?.primary ?? "Piety";

    // Roll 1d3 for the pray effect (always 1d3, not affected by level)
    const prayRoll = new Roll("1d3");
    await prayRoll.evaluate();
    const d3Result = prayRoll.total;
    const prayData = classDef.prayResults[d3Result] ?? classDef.prayResults[1];

    // Calculate pray bonus piety only
    let totalPiety = prayData.pietyBonus ?? 0;
    let lv10Bonus = 0;
    if (classDef.prayLv10Bonus && heroLevel >= classDef.prayLv10Bonus.minLevel) {
      lv10Bonus = classDef.prayLv10Bonus.pietyBonus;
      totalPiety += lv10Bonus;
    }

    // Apply the bonus piety
    const result = await updateHeroicResource(actor, totalPiety);

    // Build enriched chat content
    const enrichOpts = { rollData: actor.getRollData(), async: true };
    const rollHtml = await prayRoll.render();

    const bonusLines = [];
    bonusLines.push(`<strong>${prayData.label}:</strong> ${prayData.description}`);
    if (lv10Bonus > 0) {
      bonusLines.push(`<strong>Most Pious:</strong> +${lv10Bonus} additional piety.`);
    }

    let damageHtml = "";
    if (prayData.damageEnricher) {
      const enrichedDmg = await TextEditor.enrichHTML(prayData.damageEnricher, enrichOpts);
      damageHtml = `<div class="dsresources-chat-damage">${enrichedDmg}</div>`;
    }

    let domainHtml = "";
    if (prayData.domainChoice) {
      const domains = actor.items.filter((i) => i.type === "subclass");
      const prayerParts = [];
      for (const d of domains) {
        const effect = DOMAIN_PRAYER_EFFECTS[d.name];
        if (!effect) continue;
        const enrichedEffect = await TextEditor.enrichHTML(effect, enrichOpts);
        prayerParts.push(`<div><strong>${d.name}:</strong> ${enrichedEffect}</div>`);
      }
      const prayerLines = prayerParts.join("");
      domainHtml = `<div class="dsresources-chat-domain">
        <em>Activate a domain effect of your choice:</em>
        ${prayerLines}
      </div>`;
    }

    const speaker = ChatMessage.getSpeaker({ actor });
    const content = `
      <div class="dsresources-chat-card">
        <div class="dsresources-chat-header">
          <strong>${speaker.alias}</strong> prayed and gained <strong>${totalPiety}</strong> ${resourceName}
        </div>
        <div class="dsresources-chat-method">${game.i18n.localize("DSRESOURCES.Conduit.PrayMethod")}</div>
        <div class="dsresources-chat-roll">${rollHtml}</div>
        <div class="dsresources-chat-pray-result">
          ${bonusLines.map((l) => `<div>${l}</div>`).join("")}
        </div>
        ${damageHtml}
        ${domainHtml}
        <div class="dsresources-chat-summary">
          ${resourceName}: ${result.previous} → ${result.current}
        </div>
      </div>`;

    await ChatMessage.create({ user: game.user.id, speaker, content });
  }

  // ── Actions: Inline Spend X controls ─────────────────────────────────────

  /** Adjust the inline spend X amount (called by +/- buttons). */
  static #adjustSpendX(_event, target) {
    const spendId = target.dataset.spendId;
    const direction = Number(target.dataset.direction) || 0;
    if (!spendId) return;

    const actor = this.#getActiveActor();
    if (!actor) return;

    const classDef = getClassDefinition(actor);
    if (!classDef) return;

    const heroLevel = getHeroLevel(actor);
    const entries = resolveEntries(classDef.spends, heroLevel);
    const entry = entries.find((e) => e.id === spendId);
    if (!entry) return;

    const currentResource = actor.system.hero?.primary?.value ?? 0;
    const step = entry.spendXStep ?? 1;
    const minSpend = entry.cost ?? 1;
    let maxSpend = Math.max(minSpend, Math.floor(currentResource / step) * step);
    if (entry.spendXHardMax) maxSpend = Math.min(maxSpend, entry.spendXHardMax);

    const current = this._spendXValues[spendId] ?? minSpend;
    this._spendXValues[spendId] = Math.max(minSpend, Math.min(maxSpend, current + direction * step));
    this.render(false);
  }

  /** Execute the inline spend X (called by the Spend button). */
  static async #confirmSpendX(_event, target) {
    const actor = this.#getActiveActor();
    if (!actor) return;

    const spendId = target.dataset.spendId;
    const classDef = getClassDefinition(actor);
    if (!classDef) return;

    const heroLevel = getHeroLevel(actor);
    const entries = resolveEntries(classDef.spends, heroLevel);
    const entry = entries.find((e) => e.id === spendId);
    if (!entry) return;

    const spendAmount = this._spendXValues[spendId] ?? entry.cost ?? 1;
    const currentResource = actor.system.hero?.primary?.value ?? 0;

    if (currentResource < spendAmount) {
      ui.notifications.warn(game.i18n.localize("DSRESOURCES.Notify.NotEnough"));
      return;
    }

    const resourceName = getClassItem(actor)?.system?.primary ?? "Resource";
    const title = entry.spendXTitle ?? game.i18n.localize("DSRESOURCES.Section.Spend");
    const result = await updateHeroicResource(actor, -spendAmount);

    // Handle optional surge grant per spend (e.g. Chaos Incarnate)
    if (entry.grantsSurgePerSpend) {
      await updateSurges(actor, spendAmount);
    }

    // Reset the inline value after spending
    delete this._spendXValues[spendId];

    // Build chat content with optional detail
    let detailHtml = "";
    if (entry.spendXDetail) {
      let detailText = entry.spendXDetail;
      // Generic placeholder
      detailText = detailText.replace("{spendAmount}", spendAmount);
      // Substitute Practical Magic placeholders with computed values
      if (entry.id === "spend-practical-magic") {
        const reason = actor.system.characteristics?.reason?.value ?? 0;
        const total = reason + spendAmount;
        detailText = detailText
          .replace("{totalSquares}", total)
          .replace("{reason}", reason)
          .replace("{essenceSpent}", spendAmount);
      }
      const enrichOpts = { rollData: actor.getRollData(), async: true };
      detailHtml = await TextEditor.enrichHTML(detailText, enrichOpts);
    }

    const speaker = ChatMessage.getSpeaker({ actor });
    const content = `
      <div class="dsresources-chat-card">
        <div class="dsresources-chat-header">
          <strong>${speaker.alias}</strong> ${game.i18n.localize("DSRESOURCES.Chat.Spent")} <strong>${spendAmount}</strong> ${resourceName}
        </div>
        <div class="dsresources-chat-method">${title} (${spendAmount} ${resourceName})</div>
        ${detailHtml ? `<div class="dsresources-chat-detail">${detailHtml}</div>` : ""}
        <div class="dsresources-chat-summary">
          ${resourceName}: ${result.previous} → ${result.current}
        </div>
      </div>`;

    await ChatMessage.create({ user: game.user.id, speaker, content });
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
      method: game.i18n.localize("DSRESOURCES.Chat.ResourceReset"),
      previous: result.previous,
      current: 0,
    });
  }

  // ── Actions: surges ────────────────────────────────────────────────────────

  /**
   * Spend 1/2/3 surges for extra damage (highest characteristic per surge).
   */
  static async #spendSurgeDamage(_event, target) {
    const actor = this.#getActiveActor();
    if (!actor) return;
    const count = Number(target.dataset.surgeCount) || 1;
    const current = actor.system.hero?.surges ?? 0;
    if (current < count) {
      ui.notifications.warn(game.i18n.localize("DSRESOURCES.Notify.NoSurges"));
      return;
    }

    const chars = actor.system?.characteristics ?? {};
    let highestChar = 0;
    for (const key of Object.keys(chars)) {
      const val = Number(chars[key]?.value ?? 0);
      if (val > highestChar) highestChar = val;
    }

    const totalDamage = highestChar * count;
    const result = await updateSurges(actor, -count);

    // Build a damage enricher string for the chat card
    const damageEnricher = `[[/damage ${totalDamage}]]`;

    await postResourceChat(actor, {
      resourceName: game.i18n.localize("DSRESOURCES.Tabs.Surge"),
      action: game.i18n.localize("DSRESOURCES.Chat.Spent"),
      amount: count,
      method: game.i18n.format("DSRESOURCES.Surge.DamageMethod", { count: String(count), damage: String(totalDamage) }),
      previous: result.previous,
      current: result.current,
      formula: `${count} × ${highestChar} = ${totalDamage}`,
      damageEnricher,
    });
  }

  /**
   * Spend 2 surges to increase potency by 1 for one target.
   */
  static async #spendSurgePotency(_event, _target) {
    const actor = this.#getActiveActor();
    if (!actor) return;
    const current = actor.system.hero?.surges ?? 0;
    if (current < 2) {
      ui.notifications.warn(game.i18n.localize("DSRESOURCES.Notify.NoSurges"));
      return;
    }

    const result = await updateSurges(actor, -2);

    await postResourceChat(actor, {
      resourceName: game.i18n.localize("DSRESOURCES.Tabs.Surge"),
      action: game.i18n.localize("DSRESOURCES.Chat.Spent"),
      amount: 2,
      method: game.i18n.localize("DSRESOURCES.Surge.PotencyMethod"),
      previous: result.previous,
      current: result.current,
    });
  }

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

  // ── Actions: Growth table surge buttons ───────────────────────────────────

  static async #gainGrowthSurge(_event, target) {
    const actor = this.#getActiveActor();
    if (!actor) return;
    const count = Number(target.dataset.surgeAmount) || 1;
    const tableLabel = target.dataset.tableLabel || game.i18n.localize("DSRESOURCES.GrowthSurge");
    const result = await updateSurges(actor, count);
    await postResourceChat(actor, {
      resourceName: game.i18n.localize("DSRESOURCES.Tabs.Surge"),
      action: game.i18n.localize("DSRESOURCES.Chat.Gained"),
      amount: count,
      method: `${tableLabel} — ${game.i18n.localize("DSRESOURCES.GrowthSurge")}`,
      previous: result.previous,
      current: result.current,
    });
  }

  // ── Actions: hero tokens (GM only) ────────────────────────────────────────

  static async #incrementToken(_event, _target) {
    if (!game.user.isGM) return;
    const tokenInfo = this.#getHeroTokens();
    if (!tokenInfo.available) return;
    try {
      if (typeof ds !== "undefined" && ds.heroTokens != null) {
        ds.heroTokens = tokenInfo.value + 1;
      } else if (game.combat?.system?.heroTokens != null) {
        await game.combat.update({ "system.heroTokens": tokenInfo.value + 1 });
      } else {
        await game.settings.set("draw-steel", "heroTokens", tokenInfo.value + 1);
      }
    } catch { /* unable to update hero tokens */ }
    this.render(false);
  }

  static async #decrementToken(_event, _target) {
    if (!game.user.isGM) return;
    const tokenInfo = this.#getHeroTokens();
    if (!tokenInfo.available || tokenInfo.value <= 0) return;
    try {
      if (typeof ds !== "undefined" && ds.heroTokens != null) {
        ds.heroTokens = tokenInfo.value - 1;
      } else if (game.combat?.system?.heroTokens != null) {
        await game.combat.update({ "system.heroTokens": tokenInfo.value - 1 });
      } else {
        await game.settings.set("draw-steel", "heroTokens", tokenInfo.value - 1);
      }
    } catch { /* unable to update hero tokens */ }
    this.render(false);
  }
}
