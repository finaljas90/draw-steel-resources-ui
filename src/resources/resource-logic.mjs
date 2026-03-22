/**
 * Resource logic — resolving level-filtered entries, updating actor data,
 * rolling dice, and posting chat messages.
 */

import { MODULE_ID } from "../config.mjs";
import { getClassByResourceName, getClassByName } from "./resource-data.mjs";

// ── Actor helpers ────────────────────────────────────────────────────────────

/** Return the user's configured character actor, or null. */
export function getHeroActor() {
  return game.user.character ?? null;
}

/**
 * Return all hero actors that are assigned as player characters.
 * Used by the GM character selector.
 */
export function getAllHeroActors() {
  return game.users
    .filter((u) => !u.isGM && u.character)
    .map((u) => u.character)
    .filter((a) => a.type === "hero");
}

/** Return the class Item embedded in the actor, or null. */
export function getClassItem(actor) {
  if (!actor) return null;
  return actor.items.find((i) => i.type === "class") ?? null;
}

/**
 * Derive hero level from roll data (the system computes `@level`).
 * Falls back to the class item's level field, then 1.
 */
export function getHeroLevel(actor) {
  if (!actor) return 1;
  const rollData = actor.getRollData?.();
  if (rollData?.level != null) return Number(rollData.level) || 1;
  const classItem = getClassItem(actor);
  return Number(classItem?.system?.level) || 1;
}

/** Get the class definition for an actor, trying resource name then class name. */
export function getClassDefinition(actor) {
  const classItem = getClassItem(actor);
  if (!classItem) return null;
  return getClassByResourceName(classItem.system?.primary) ?? getClassByName(classItem.name);
}

// ── Entry resolution ─────────────────────────────────────────────────────────

/**
 * Filter a list of gain or spend entries by hero level, removing entries
 * that have been superseded by higher-level replacements.
 */
export function resolveEntries(entries, heroLevel) {
  const eligible = entries.filter((e) => e.minLevel <= heroLevel);
  const replacedIds = new Set();
  for (const e of eligible) {
    if (e.replaces) replacedIds.add(e.replaces);
  }
  return eligible.filter((e) => !replacedIds.has(e.id));
}

/**
 * Compute the display label for a gain entry's button.
 * Fixed numbers → "+2", victories → "+{n}", dice → "+1d3".
 */
export function gainLabel(entry, actor) {
  const amt = entry.amount;
  if (typeof amt === "number") return `+${amt}`;
  if (amt === "victories") {
    const v = actor?.system?.hero?.victories ?? 0;
    return `+${v}`;
  }
  // Dice formula string
  return `+${amt}`;
}

/** Compute the display label for a spend entry's button. */
export function spendLabel(entry) {
  return `-${entry.cost}`;
}

// ── Resource mutation ────────────────────────────────────────────────────────

/**
 * Resolve the numeric gain amount. Handles fixed numbers, "victories",
 * and dice formulas. Returns { total, roll?, formula? }.
 */
export async function resolveGainAmount(entry, actor) {
  const amt = entry.amount;
  if (typeof amt === "number") return { total: amt };
  if (amt === "victories") {
    const v = actor?.system?.hero?.victories ?? 0;
    return { total: v, formula: `${v} (Victories)` };
  }
  // Dice formula
  const roll = new Roll(String(amt));
  await roll.evaluate();
  return { total: roll.total, roll, formula: String(amt) };
}

/**
 * Update the heroic resource value on the actor.
 * Clamps to a minimum of 0.
 */
export async function updateHeroicResource(actor, delta) {
  const current = actor.system.hero.primary.value ?? 0;
  const next = Math.max(0, current + delta);
  await actor.update({ "system.hero.primary.value": next });
  return { previous: current, current: next };
}

/** Update the surge count on the actor. Clamps to min 0. */
export async function updateSurges(actor, delta) {
  const current = actor.system.hero.surges ?? 0;
  const next = Math.max(0, current + delta);
  await actor.update({ "system.hero.surges": next });
  return { previous: current, current: next };
}

/** Reset heroic resource to 0. */
export async function resetHeroicResource(actor) {
  const current = actor.system.hero.primary.value ?? 0;
  await actor.update({ "system.hero.primary.value": 0 });
  return { previous: current, current: 0 };
}

// ── Chat messages ────────────────────────────────────────────────────────────

/**
 * Post a resource-change chat message visible to all players.
 *
 * @param {Actor} actor           The hero actor
 * @param {object} opts
 * @param {string} opts.resourceName  e.g. "Wrath", "Surge"
 * @param {string} opts.action        "gained" or "spent"
 * @param {number} opts.amount        Absolute amount changed
 * @param {string} opts.method        Description of the trigger
 * @param {number} opts.previous      Value before change
 * @param {number} opts.current       Value after change
 * @param {string} [opts.formula]     Dice/formula string if applicable
 * @param {Roll}   [opts.damageRoll]  Optional damage roll to include
 * @param {string} [opts.damageType]  Damage type label
 */
export async function postResourceChat(actor, opts) {
  const {
    resourceName, action, amount, method,
    previous, current, formula, damageRoll, damageType,
    damageEnricher,
  } = opts;

  const speaker = ChatMessage.getSpeaker({ actor });

  let rollHtml = "";
  if (formula) {
    rollHtml = `<div class="dsresources-chat-roll"><strong>Roll:</strong> ${amount} (${formula})</div>`;
  }

  let damageHtml = "";
  if (damageRoll) {
    const rendered = await damageRoll.render();
    damageHtml = `
      <div class="dsresources-chat-damage">
        <strong>Damage${damageType ? ` (${damageType})` : ""}:</strong>
        ${rendered}
      </div>`;
  } else if (damageEnricher) {
    damageHtml = `
      <div class="dsresources-chat-damage">
        ${damageEnricher}
      </div>`;
  }

  const content = `
    <div class="dsresources-chat-card">
      <div class="dsresources-chat-header">
        <strong>${speaker.alias}</strong> ${action} <strong>${amount}</strong> ${resourceName}
      </div>
      <div class="dsresources-chat-method">${method}</div>
      ${rollHtml}
      ${damageHtml}
      <div class="dsresources-chat-summary">
        ${resourceName}: ${previous} → ${current}
      </div>
    </div>`;

  await ChatMessage.create({
    user: game.user.id,
    speaker,
    content,
  });
}
