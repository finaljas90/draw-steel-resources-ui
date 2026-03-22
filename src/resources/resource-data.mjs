/**
 * Class resource definitions for Draw Steel heroic resources.
 *
 * Each class entry defines:
 *   - id:             Lowercase class identifier
 *   - className:      Display name of the class
 *   - resourceName:   The heroic resource name (matches classItem.system.primary)
 *   - gains[]:        Ways to gain the resource
 *   - spends[]:       Ways to spend the resource
 *   - passiveEffects[]: Threshold-based passive effects table
 *
 * Gain / spend entries:
 *   - id:          Unique identifier within the class
 *   - description: User-facing text
 *   - amount|cost: Number, dice formula string, or "victories"
 *   - minLevel:    Minimum hero level to unlock
 *   - replaces:    (optional) ID of the entry this one supersedes
 *   - damage:      (optional) { formula, type } for spend-triggered damage rolls
 *
 * Passive effect entries:
 *   - threshold:   Resource value required to activate
 *   - description: Effect text
 *   - minLevel:    Minimum hero level to display
 */

// ── Censor ────────────────────────────────────────────────────────────────────

const CENSOR = {
  id: "censor",
  className: "Censor",
  resourceName: "Wrath",

  gains: [
    {
      id: "combat-start",
      description: "At the start of combat, gain wrath equal to your Victories.",
      amount: "victories",
      minLevel: 1,
    },
    {
      id: "turn-start",
      description: "At the start of each of your turns during combat, you gain 2 wrath.",
      amount: 2,
      minLevel: 1,
    },
    {
      id: "turn-start-lv7",
      description: "At the start of each of your turns during combat, you gain 3 wrath.",
      amount: 3,
      minLevel: 7,
      replaces: "turn-start",
    },
    {
      id: "turn-start-lv10",
      description: "At the start of each of your turns during combat, you gain 4 wrath.",
      amount: 4,
      minLevel: 10,
      replaces: "turn-start-lv7",
    },
    {
      id: "judged-damages-you",
      description: "First time each combat round that a creature judged by you deals damage to you, you gain 1 wrath.",
      amount: 1,
      minLevel: 1,
    },
    {
      id: "damage-judged",
      description: "First time each combat round that you deal damage to a creature judged by you, you gain 1 wrath.",
      amount: 1,
      minLevel: 1,
    },
    {
      id: "damage-judged-lv4",
      description: "First time each combat round that you deal damage to a creature judged by you, you gain 2 wrath.",
      amount: 2,
      minLevel: 4,
      replaces: "damage-judged",
    },
  ],

  spends: [
    {
      id: "spend-free-strike",
      description: "When an adjacent creature judged by you starts to shift, make a melee free strike against them and their speed becomes 0 until end of turn.",
      cost: 1,
      minLevel: 1,
    },
    {
      id: "spend-bane",
      description: "When a creature judged by you within 10 squares makes a power roll, cause them to take a bane.",
      cost: 1,
      minLevel: 1,
    },
    {
      id: "spend-reduce-potency",
      description: "When a creature judged by you within 10 squares uses an ability with potency targeting one creature, reduce potency by 1.",
      cost: 1,
      minLevel: 1,
    },
    {
      id: "spend-taunt",
      description: "If you damage a creature judged by you with a melee ability, the creature is taunted by you until end of their next turn.",
      cost: 1,
      minLevel: 1,
    },
    {
      id: "spend-judgment-frighten",
      description: "When you use Judgment, if the target has P < AVERAGE, they are frightened of you (save ends).",
      cost: 1,
      minLevel: 3,
    },
    {
      id: "spend-judgment-chain-frighten",
      description: "When a creature judged by you is reduced to 0 Stamina and you use Judgment as a free triggered action, if the new target has P < STRONG, they are frightened (save ends). If already frightened, they take holy damage equal to twice your Presence score.",
      cost: 1,
      minLevel: 3,
    },
  ],

  passiveEffects: [],
};

// ── Stubs for remaining classes (rules TBD) ──────────────────────────────────

const CONDUIT   = { id: "conduit",      className: "Conduit",      resourceName: "Piety",      gains: [], spends: [], passiveEffects: [] };
const ELEMENTALIST = { id: "elementalist", className: "Elementalist", resourceName: "Essence",    gains: [], spends: [], passiveEffects: [] };
const FURY      = { id: "fury",         className: "Fury",         resourceName: "Ferocity",   gains: [], spends: [], passiveEffects: [] };
const NULL      = { id: "null",         className: "Null",         resourceName: "Discipline",  gains: [], spends: [], passiveEffects: [] };
const SHADOW    = { id: "shadow",       className: "Shadow",       resourceName: "Insight",     gains: [], spends: [], passiveEffects: [] };
const TACTICIAN = { id: "tactician",    className: "Tactician",    resourceName: "Focus",       gains: [], spends: [], passiveEffects: [] };
const TALENT    = { id: "talent",       className: "Talent",       resourceName: "Clarity",     gains: [], spends: [], passiveEffects: [] };
const TROUBADOUR = { id: "troubadour",  className: "Troubadour",   resourceName: "Drama",       gains: [], spends: [], passiveEffects: [] };

// ── Registry ─────────────────────────────────────────────────────────────────

/** All built-in class definitions, keyed by lowercase class name. */
export const CLASS_DEFINITIONS = {
  censor:       CENSOR,
  conduit:      CONDUIT,
  elementalist: ELEMENTALIST,
  fury:         FURY,
  null:         NULL,
  shadow:       SHADOW,
  tactician:    TACTICIAN,
  talent:       TALENT,
  troubadour:   TROUBADOUR,
};

/**
 * Look up a class definition by the heroic resource name (e.g. "Wrath" → CENSOR).
 * Falls back to matching by className.
 */
export function getClassByResourceName(resourceName) {
  if (!resourceName) return null;
  const lower = resourceName.toLowerCase();
  return Object.values(CLASS_DEFINITIONS).find(
    (c) => c.resourceName.toLowerCase() === lower
  ) ?? null;
}

/**
 * Look up a class definition by class name (e.g. "Censor" → CENSOR).
 */
export function getClassByName(className) {
  if (!className) return null;
  return CLASS_DEFINITIONS[className.toLowerCase()] ?? null;
}
