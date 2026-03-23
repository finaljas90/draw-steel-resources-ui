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
      description: "When an adjacent creature judged by you starts to shift, make a melee free strike against them and their speed becomes 0 until end of turn. [[/apply slowed turn]]",
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
      description: "If you damage a creature judged by you with a melee ability, the creature is [[/apply taunted turn]] by you until end of their next turn.",
      cost: 1,
      minLevel: 1,
    },
    {
      id: "spend-judgment-frighten",
      description: "When you use Judgment, if the target has P < AVERAGE, they are [[/apply frightened save]] of you (save ends).",
      cost: 1,
      minLevel: 3,
    },
    {
      id: "spend-judgment-chain-frighten",
      description: "When a creature judged by you is reduced to 0 Stamina and you use Judgment as a free triggered action, if the new target has P < STRONG, they are [[/apply frightened save]] (save ends). If already frightened, they take [[/damage 2*@characteristics.presence.value type=holy]] holy damage.",
      cost: 1,
      minLevel: 3,
    },
  ],

  passiveEffects: [],
};

// ── Stubs for remaining classes (rules TBD) ──────────────────────────────────

// ── Domain Piety Conditions (Conduit) ────────────────────────────────────────

export const DOMAIN_PIETY_TABLE = {
  Creation: "A creature within 10 squares uses an area ability.",
  Death: "A non-minion creature within 10 squares is reduced to 0 Stamina, or a solo creature within 10 squares becomes winded.",
  Fate: "An ally within 10 squares gets a tier 3 outcome, or an enemy within 10 squares gets a tier 1 outcome on a power roll.",
  Knowledge: "The Director spends Malice.",
  Life: "A creature within 10 squares regains Stamina.",
  Love: "You or any ally within 10 squares uses the Aid Attack maneuver or an ability targeting an ally.",
  Nature: "You or a creature within 10 squares takes acid, cold, fire, lightning, poison, or sonic damage.",
  Protection: "You or any ally within 10 squares gains temporary Stamina, or uses a triggered action to reduce incoming damage or impose a bane/double bane on an enemy's power roll.",
  Storm: "An enemy within 10 squares is force moved.",
  Sun: "An enemy within 10 squares takes fire or holy damage.",
  Trickery: "You or a creature within 10 squares takes the Aid Attack or Hide maneuver.",
  War: "You or a creature within 10 squares takes damage greater than 10 + your level in a single turn.",
};

// ── Domain Prayer Effects (Conduit — activated on pray roll of 3) ─────────────

export const DOMAIN_PRAYER_EFFECTS = {
  Creation: "Create a wall of stone within 10 squares, size 5 + @I. Lasts until end of encounter.",
  Death: "Up to two enemies within 10 squares take [[/damage 2*@I corruption]].",
  Fate: "Choose a creature within 10 squares. They automatically obtain a tier 1 or tier 3 outcome (your choice) on their next power roll before end of encounter.",
  Knowledge: "Up to five allies within 10 squares (or yourself instead of one ally) each [[/gain 1 surge]].",
  Life: "Choose yourself or one ally within 10 squares. They can spend a Recovery, end one save-ends or end-of-turn effect, or stand up if prone. Alternatively, you or one ally within 10 squares gains [[/heal 2*@I type=temporary]].",
  Love: "Each ally within 10 squares gains [[/heal 2*@I type=temporary]].",
  Nature: "Vines appear within 10 squares, wrapping @I creatures. Slide each up to @I squares, then the vines fade.",
  Protection: "One ally within 10 squares gains [[/heal 4*@I type=temporary]].",
  Storm: "Each enemy in a 3 cube within 10 squares takes [[/damage 2*@I lightning]].",
  Sun: "One enemy within 10 squares takes [[/damage 3*@I fire]].",
  Trickery: "Slide one creature within 10 squares up to 5+@level squares.",
  War: "Up to three allies within 10 squares (or yourself instead of one ally) each [[/gain 2 surge]].",
};

// ── Conduit ───────────────────────────────────────────────────────────────────

const CONDUIT = {
  id: "conduit",
  className: "Conduit",
  resourceName: "Piety",

  gains: [
    {
      id: "combat-start",
      description: "At the start of a combat encounter, gain piety equal to your Victories.",
      amount: "victories",
      minLevel: 1,
    },
    {
      id: "turn-start",
      description: "At the start of each of your turns during combat, you gain 1d3 piety.",
      amount: "1d3",
      minLevel: 1,
      action: "roll",
    },
    {
      id: "turn-start-lv7",
      description: "At the start of each of your turns during combat, you gain 1d3 + 1 piety. (Faithful's Reward)",
      amount: "1d3 + 1",
      minLevel: 7,
      replaces: "turn-start",
      action: "roll",
    },
    {
      id: "pray",
      description: "Before rolling for piety, you can pray (no action required). Roll 1d3 with additional effects based on the result.",
      amount: "1d3",
      minLevel: 1,
      action: "pray",
    },
    {
      id: "domain-trigger",
      description: "Gain 2 piety from your domain's triggered piety condition.",
      amount: 2,
      minLevel: 1,
      action: "domain",
    },
    {
      id: "domain-trigger-lv4",
      description: "Gain 3 piety from your domain's triggered piety condition. (Blessed Domain: +1 additional piety)",
      amount: 3,
      minLevel: 4,
      replaces: "domain-trigger",
      action: "domain",
    },
  ],

  // Pray result tables — indexed by 1d3 result (1, 2, 3)
  prayResults: {
    1: {
      label: "Roll of 1",
      pietyBonus: 1,
      description: "Gain 1 additional piety, but take psychic damage equal to 1d6 + your level (can't be reduced).",
      damageEnricher: "[[/damage 1d6+@level type=psychic]]",
    },
    2: {
      label: "Roll of 2",
      pietyBonus: 1,
      description: "Gain 1 additional piety.",
    },
    3: {
      label: "Roll of 3",
      pietyBonus: 2,
      description: "Gain 2 additional piety and activate a domain effect of your choice.",
      domainChoice: true,
    },
  },

  // Level 10 pray bonus (Most Pious)
  prayLv10Bonus: {
    description: "When you pray, you gain 1 additional piety on top of all other effects. (Most Pious)",
    pietyBonus: 1,
    minLevel: 10,
  },

  spends: [
    {
      id: "spend-healing-grace",
      description: "<strong>Healing Grace</strong> — The target can spend a Recovery. (maneuver, once per turn)<br><strong>Spend 1+ piety</strong> for enhancements:<ul><li>Target one additional ally within distance.</li><li>End one effect on a target that is ended by a saving throw or that ends at the end of their turn.</li><li>A prone target can stand up.</li><li>A target can spend 1 additional Recovery.</li></ul>",
      spendXDetail: "The target can spend a Recovery. For each piety spent, choose one:<ul><li>Target one additional ally within distance.</li><li>End one effect on a target that is ended by a saving throw or that ends at the end of their turn.</li><li>A prone target can stand up.</li><li>A target can spend 1 additional Recovery.</li></ul>",
      cost: 1,
      minLevel: 1,
      action: "spendX",
      spendXTitle: "Healing Grace",
    },
    {
      id: "spend-word-of-guidance",
      description: "Triggered Action — Word of Guidance: An ally's damage-dealing ability power roll gains a double edge instead of an edge.",
      cost: 1,
      minLevel: 1,
      requiresAbility: "Word of Guidance",
    },
    {
      id: "spend-word-of-judgment",
      description: "Triggered Action — Word of Judgment: An enemy's power roll that would damage an ally gains a double bane instead of a bane.",
      cost: 1,
      minLevel: 1,
      requiresAbility: "Word of Judgment",
    },
    {
      id: "spend-faiths-sword",
      description: "Faith's Sword (free maneuver): Spend piety to give a chosen hero ally 1 of their Heroic Resource for every 2 piety spent.",
      cost: 2,
      minLevel: 9,
      action: "spendX",
      spendXTitle: "Faith's Sword",
      spendXStep: 2,
    },
  ],

  passiveEffects: [],
};
const ELEMENTALIST = {
  id: "elementalist",
  className: "Elementalist",
  resourceName: "Essence",

  gains: [
    {
      id: "combat-start",
      description: "At the start of a combat encounter, gain essence equal to your Victories.",
      amount: "victories",
      minLevel: 1,
    },
    {
      id: "turn-start",
      description: "At the start of each of your turns during combat, you gain 2 essence.",
      amount: 2,
      minLevel: 1,
    },
    {
      id: "turn-start-lv7",
      description: "At the start of each of your turns during combat, you gain 3 essence. (Surging Essence)",
      amount: 3,
      minLevel: 7,
      replaces: "turn-start",
    },
    {
      id: "turn-start-lv10",
      description: "At the start of each of your turns during combat, you gain 4 essence. (Essential Being)",
      amount: 4,
      minLevel: 10,
      replaces: "turn-start-lv7",
    },
    {
      id: "damage-trigger",
      description: "The first time each combat round that you or a creature within 10 squares takes damage that isn't untyped or holy damage, you gain 1 essence.",
      amount: 1,
      minLevel: 1,
    },
    {
      id: "damage-trigger-lv4",
      description: "The first time each combat round that you or a creature within 10 squares takes damage that isn't untyped or holy damage, you gain 2 essence. (Font of Essence)",
      amount: 2,
      minLevel: 4,
      replaces: "damage-trigger",
    },
  ],

  spends: [
    {
      id: "spend-practical-magic",
      description: "<strong>Practical Magic</strong> (maneuver): You teleport up to a number of squares equal to your Reason score ([[@characteristics.reason.value]]). If you choose this option, you can spend essence to teleport 1 additional square for each essence spent.",
      spendXDetail: "You teleport up to {totalSquares} squares (Reason {reason} + {essenceSpent} essence spent).",
      cost: 1,
      minLevel: 1,
      action: "spendX",
      spendXTitle: "Practical Magic",
    },
    {
      id: "spend-explosive-assistance",
      description: "Triggered Action — <strong>Explosive Assistance</strong> (Fire): The forced movement bonus becomes twice your Reason score ([[@characteristics.reason.value]]) instead of equal to it.",
      cost: 1,
      minLevel: 1,
      requiresAbility: "Explosive Assistance",
    },
    {
      id: "spend-skin-like-castle-walls",
      description: "Triggered Action — <strong>Skin Like Castle Walls</strong> (Earth): If the triggering damage has potency effects, the potency is reduced by 1 for the target.",
      cost: 1,
      minLevel: 1,
      requiresAbility: "Skin Like Castle Walls",
    },
    {
      id: "spend-breath-of-dawn",
      description: "Triggered Action — <strong>Breath of Dawn Remembered</strong> (Green): The target can spend one additional Recovery per essence spent.",
      spendXDetail: "Breath of Dawn Remembered — The target spends X additional Recoveries.",
      cost: 1,
      minLevel: 1,
      requiresAbility: "Breath of Dawn Remembered",
      action: "spendX",
      spendXTitle: "Breath of Dawn",
    },
    {
      id: "spend-subtle-relocation",
      description: "Triggered Action — <strong>Subtle Relocation</strong> (Void): Teleport the target up to twice your Reason score ([[@characteristics.reason.value]]) instead.",
      cost: 1,
      minLevel: 1,
      requiresAbility: "Subtle Relocation",
    },
    {
      id: "spend-breath-conversion",
      description: "<strong>Breath Conversion</strong> (no action required): Spend Breath — each 1 Breath becomes [[/gain 3 heroic]].",
      cost: 1,
      minLevel: 10,
      action: "spendX",
      spendXTitle: "Breath → Essence",
    },
  ],

  // Mantle of Essence indicator config
  mantleIndicator: {
    abilityName: "Mantle of Essence",
    minLevel: 4,
    essenceThreshold: 3,
    noThresholdLevel: 7, // at lv7+, no essence requirement (Mantle of Quintessence)
  },

  passiveEffects: [],
};
const FURY = {
  id: "fury",
  className: "Fury",
  resourceName: "Ferocity",

  gains: [
    {
      id: "combat-start",
      description: "At the start of a combat encounter, you gain ferocity equal to your Victories.",
      amount: "victories",
      minLevel: 1,
    },
    {
      id: "turn-start",
      description: "At the start of each of your turns during combat, you gain 1d3 ferocity.",
      amount: "1d3",
      minLevel: 1,
      action: "roll",
    },
    {
      id: "turn-start-lv7",
      description: "At the start of each of your turns during combat, you gain 1d3 + 1 ferocity. (Greater Ferocity)",
      amount: "1d3 + 1",
      minLevel: 7,
      replaces: "turn-start",
      action: "roll",
    },
    {
      id: "damage-trigger",
      description: "The first time each combat round that you take damage, you gain 1 ferocity.",
      amount: 1,
      minLevel: 1,
    },
    {
      id: "damage-trigger-lv4",
      description: "The first time each combat round that you take damage, you gain 2 ferocity. (Damaging Ferocity)",
      amount: 2,
      minLevel: 4,
      replaces: "damage-trigger",
    },
    {
      id: "damage-trigger-lv10",
      description: "The first time each combat round that you take damage, you gain 3 ferocity. (Primordial Ferocity)",
      amount: 3,
      minLevel: 10,
      replaces: "damage-trigger-lv4",
    },
    {
      id: "winded-dying",
      description: "The first time you become winded or are dying in an encounter, you gain 1d3 ferocity.",
      amount: "1d3",
      minLevel: 1,
      action: "roll",
    },
  ],

  spends: [
    // Aspect Triggered Actions (filtered by subclass)
    {
      id: "spend-lines-of-force",
      description: "<strong>Lines of Force</strong> (Berserker)<br><em>Trigger: You or one creature within melee 1 would be force moved.</em><br>Effect: You select a new target of the same size or smaller within distance to be force moved instead. You become the source of the forced movement, determine the new target's destination, and can push the target. The forced movement distance gains a bonus equal to your Might score ([[@characteristics.might.value]]).<br><strong>Spend 1 Ferocity:</strong> The forced movement distance gains a bonus equal to twice your Might score ([[@characteristics.might.value]]) instead.",
      cost: 1,
      minLevel: 1,
      requiresSubclass: "Berserker",
    },
    {
      id: "spend-unearthly-reflexes",
      description: "<strong>Unearthly Reflexes</strong> (Reaver)<br><em>Trigger: You take damage.</em><br>Effect: You take half the damage from the triggering effect and can shift up to a number of squares equal to your Agility score ([[@characteristics.agility.value]]).<br><strong>Spend 1 Ferocity:</strong> If the damage has any potency effects associated with it, the potency is reduced by 1 for you.",
      cost: 1,
      minLevel: 1,
      requiresSubclass: "Reaver",
    },
    {
      id: "spend-furious-change",
      description: "<strong>Furious Change</strong> (Stormwight)<br><em>Trigger: You lose Stamina and are not dying.</em><br>Effect: You gain temporary Stamina equal to your Might score ([[@characteristics.might.value]]) and can enter your animal form or hybrid form.<br><strong>Spend 1 Ferocity:</strong> If you are not dying, you can spend a Recovery.",
      cost: 1,
      minLevel: 1,
      requiresSubclass: "Stormwight",
    },
    {
      id: "spend-aspect-wild",
      description: "<strong>Aspect of the Wild</strong> (Stormwight)<br>You can shapeshift into your animal form, hybrid form, or back into your true form. While in animal or hybrid form, you can speak normally and speak to animals who share your form. In a negotiation with an animal in animal form, treat your Renown as 2 higher.<br><strong>Spend 1 Ferocity:</strong> As a free maneuver, shapeshift a second time.",
      cost: 1,
      minLevel: 1,
      requiresSubclass: "Stormwight",
    },
    // Primordial Strike (all Fury, level 4+)
    {
      id: "spend-primordial-strike",
      description: "<strong>Primordial Strike</strong>: As part of any strike, spend 1 ferocity to gain 1 surge that must be used for that strike. The surge's extra damage can be acid, cold, corruption, fire, lightning, poison, or sonic (your choice).",
      cost: 1,
      minLevel: 4,
      grantsSurge: 1,
    },
    // Chaos Incarnate (level 10, replaces Primordial Strike)
    {
      id: "spend-chaos-incarnate",
      description: "<strong>Chaos Incarnate</strong>: When you use Primordial Strike, you can spend up to 3 ferocity, gaining 1 surge per ferocity spent to use for that strike. The surge's extra damage can be acid, cold, corruption, fire, lightning, poison, or sonic (your choice).",
      spendXDetail: "Chaos Incarnate — Gained {spendAmount} surge(s) for a strike. Extra damage type: acid, cold, corruption, fire, lightning, poison, or sonic (your choice).",
      cost: 1,
      minLevel: 10,
      replaces: "spend-primordial-strike",
      action: "spendX",
      spendXTitle: "Chaos Incarnate",
      spendXHardMax: 3,
      grantsSurgePerSpend: true,
    },
  ],

  // Growing Ferocity tables — aspect/kit-specific passive benefits
  growthTables: [
    {
      id: "berserker",
      label: "Growing Ferocity — Berserker",
      requiresSubclass: "Berserker",
      rows: [
        { threshold: 2, description: "Whenever you use the Knockback maneuver, the forced movement distance gains a bonus equal to your Might score ([[@characteristics.might.value]]).", minLevel: 1 },
        { threshold: 4, description: "The first time you push a creature on a turn, you gain 1 surge.", minLevel: 1, grantsSurge: 1, surgeGroup: "push" },
        { threshold: 6, description: "You gain an edge on Might tests and the Knockback maneuver.", minLevel: 1 },
        { threshold: 8, description: "The first time you push a creature on a turn, you gain 2 surges.", minLevel: 4, grantsSurge: 2, surgeGroup: "push" },
        { threshold: 10, description: "You have a double edge on Might tests and the Knockback maneuver.", minLevel: 7 },
        { threshold: 12, description: "Whenever you use a heroic ability, you gain [[/heal 10 type=temporary]]. Additionally, whenever you make a power roll that imposes forced movement on a target, the forced movement distance gains a bonus equal to your Might score ([[@characteristics.might.value]]).", minLevel: 10 },
      ],
    },
    {
      id: "reaver",
      label: "Growing Ferocity — Reaver",
      requiresSubclass: "Reaver",
      rows: [
        { threshold: 2, description: "Whenever you use the Knockback maneuver, the forced movement distance gains a bonus equal to your Agility score ([[@characteristics.agility.value]]).", minLevel: 1 },
        { threshold: 4, description: "The first time you slide a creature on a turn, you gain 1 surge.", minLevel: 1, grantsSurge: 1, surgeGroup: "slide" },
        { threshold: 6, description: "You gain an edge on Agility tests and the Knockback maneuver.", minLevel: 1 },
        { threshold: 8, description: "The first time you slide a creature on a turn, you gain 2 surges instead of 1.", minLevel: 4, grantsSurge: 2, surgeGroup: "slide" },
        { threshold: 10, description: "You have a double edge on Agility tests and the Knockback maneuver.", minLevel: 7 },
        { threshold: 12, description: "Whenever you use a heroic ability, you gain [[/heal 10 type=temporary]]. Additionally, whenever you make a power roll that imposes forced movement on a target, the forced movement distance gains a bonus equal to your Agility score ([[@characteristics.agility.value]]).", minLevel: 10 },
      ],
    },
    {
      id: "stormwight-boren",
      label: "Growing Ferocity — Boren (Bear)",
      requiresSubclass: "Stormwight",
      requiresKit: "Boren",
      rows: [
        { threshold: 2, description: "You can have up to two creatures grabbed at a time. Additionally, whenever you make a strike against a creature you have grabbed, you gain 1 surge.", minLevel: 1, grantsSurge: 1, surgeGroup: "strike-grab" },
        { threshold: 4, description: "The first time you grab a creature on a turn, you gain 1 surge.", minLevel: 1, grantsSurge: 1, surgeGroup: "grab" },
        { threshold: 6, description: "You gain an edge on the Grab and Knockback maneuvers.", minLevel: 1 },
        { threshold: 8, description: "The first time you grab a creature on a turn, you gain 2 surges instead of 1.", minLevel: 4, grantsSurge: 2, surgeGroup: "grab" },
        { threshold: 10, description: "You have a double edge on the Grab and Knockback maneuvers.", minLevel: 7 },
        { threshold: 12, description: "Whenever you use a heroic ability, you gain [[/heal 10 type=temporary]]. Additionally, whenever you have a creature grabbed, any ability roll made against that creature gains a bonus to its potency equal to your Might score ([[@characteristics.might.value]]).", minLevel: 10 },
      ],
    },
    {
      id: "stormwight-corven",
      label: "Growing Ferocity — Corven (Crow)",
      requiresSubclass: "Stormwight",
      requiresKit: "Corven",
      rows: [
        { threshold: 2, description: "Whenever you use the Disengage move action, the distance you can shift gains a bonus equal to your Agility score ([[@characteristics.agility.value]]).", minLevel: 1 },
        { threshold: 4, description: "The first time you shift on a turn, you gain 1 surge.", minLevel: 1, grantsSurge: 1, surgeGroup: "shift" },
        { threshold: 6, description: "You gain an edge on Agility tests, the Escape Grab maneuver, and the Knockback maneuver.", minLevel: 1 },
        { threshold: 8, description: "The first time you shift on a turn, you gain 2 surges instead of 1.", minLevel: 4, grantsSurge: 2, surgeGroup: "shift" },
        { threshold: 10, description: "You have a double edge on Agility tests, the Escape Grab maneuver, and the Knockback maneuver.", minLevel: 7 },
        { threshold: 12, description: "Whenever you use a heroic ability, you gain [[/heal 10 type=temporary]]. Additionally, the potency of any effects targeting you is reduced by 2 for you.", minLevel: 10 },
      ],
    },
    {
      id: "stormwight-raden",
      label: "Growing Ferocity — Raden (Rat)",
      requiresSubclass: "Stormwight",
      requiresKit: "Raden",
      rows: [
        { threshold: 2, description: "Whenever you use the Disengage move action, the distance you can shift gains a bonus equal to your Agility score ([[@characteristics.agility.value]]).", minLevel: 1 },
        { threshold: 4, description: "The first time you shift on a turn, you gain 1 surge.", minLevel: 1, grantsSurge: 1, surgeGroup: "shift" },
        { threshold: 6, description: "You gain an edge on Agility tests, the Escape Grab maneuver, and the Knockback maneuver.", minLevel: 1 },
        { threshold: 8, description: "The first time you shift on a turn, you gain 2 surges instead of 1.", minLevel: 4, grantsSurge: 2, surgeGroup: "shift" },
        { threshold: 10, description: "You have a double edge on Agility tests, the Escape Grab maneuver, and the Knockback maneuver.", minLevel: 7 },
        { threshold: 12, description: "Whenever you use a heroic ability, you gain [[/heal 10 type=temporary]]. Additionally, the potency of any effects targeting you is reduced by 2 for you.", minLevel: 10 },
      ],
    },
    {
      id: "stormwight-vuken",
      label: "Growing Ferocity — Vuken (Wolf)",
      requiresSubclass: "Stormwight",
      requiresKit: "Vuken",
      rows: [
        { threshold: 2, description: "Whenever you use the Knockback maneuver, you can target one additional creature.", minLevel: 1 },
        { threshold: 4, description: "The first time on a turn that you push a creature or knock a creature prone, you gain 1 surge.", minLevel: 1, grantsSurge: 1, surgeGroup: "push-prone" },
        { threshold: 6, description: "You gain an edge on Agility tests and the Knockback maneuver.", minLevel: 1 },
        { threshold: 8, description: "The first time on a turn that you push a creature or knock a creature prone, you gain 2 surges.", minLevel: 4, grantsSurge: 2, surgeGroup: "push-prone" },
        { threshold: 10, description: "You have a double edge on Agility tests and the Knockback maneuver.", minLevel: 7 },
        { threshold: 12, description: "Whenever you use a heroic ability, you gain [[/heal 10 type=temporary]]. Additionally, whenever you make a power roll that imposes forced movement on a target, the forced movement distance gains a bonus equal to your Agility score ([[@characteristics.agility.value]]).", minLevel: 10 },
      ],
    },
  ],

  passiveEffects: [],
};
const NULL = {
  id: "null",
  className: "Null",
  resourceName: "Discipline",

  gains: [
    {
      id: "combat-start",
      description: "At the start of a combat encounter, you gain discipline equal to your Victories.",
      amount: "victories",
      minLevel: 1,
    },
    {
      id: "turn-start",
      description: "At the start of each of your turns during combat, you gain 2 discipline.",
      amount: 2,
      minLevel: 1,
    },
    {
      id: "turn-start-lv7",
      description: "At the start of each of your turns during combat, you gain 3 discipline. (Improved Body)",
      amount: 3,
      minLevel: 7,
      replaces: "turn-start",
    },
    {
      id: "turn-start-lv10",
      description: "At the start of each of your turns during combat, you gain 4 discipline. (Manifold Body)",
      amount: 4,
      minLevel: 10,
      replaces: "turn-start-lv7",
    },
    {
      id: "null-field-trigger",
      description: "The first time each combat round that an enemy in the area of your Null Field uses a main action, you gain 1 discipline.",
      amount: 1,
      minLevel: 1,
    },
    {
      id: "null-field-trigger-lv4",
      description: "The first time each combat round that an enemy in the area of your Null Field uses a main action, you gain 2 discipline. (Regenerative Field)",
      amount: 2,
      minLevel: 4,
      replaces: "null-field-trigger",
    },
    {
      id: "malice-trigger",
      description: "The first time each combat round that the Director uses an ability that costs Malice, you gain 1 discipline.",
      amount: 1,
      minLevel: 1,
    },
  ],

  spends: [
    {
      id: "spend-null-field",
      description: "<strong>Null Field</strong> (free maneuver, once per turn): Give your Null Field one additional effect until the start of your next turn:<ul><li><strong>Gravitic Disruption:</strong> The first time on a turn that a target takes damage, you can slide them up to 2 squares.</li><li><strong>Inertial Anchor:</strong> Any target who starts their turn in the area can't shift.</li><li><strong>Synaptic Break:</strong> Whenever you or any ally uses an ability against a target that has a potency effect, the potency is increased by 1.</li></ul>",
      cost: 1,
      minLevel: 1,
    },
    {
      id: "spend-inertial-shield",
      description: "<strong>Inertial Shield</strong> (triggered — when you take damage): You take half the damage. Spend 1 discipline to reduce the potency of one effect associated with the damage by 1 for you.",
      cost: 1,
      minLevel: 1,
    },
    {
      id: "spend-instant-action",
      description: "<strong>Instant Action</strong> (Chronokinetic): If you are surprised at the start of combat, spend 3 discipline to no longer be surprised and gain an edge on ability rolls and [[/gain 2 surge]].",
      cost: 3,
      minLevel: 5,
      requiresSubclass: "Chronokinetic",
    },
    {
      id: "spend-psi-boost",
      description: "<strong>Psi Boost:</strong> When you use a main action or maneuver with the Psionic keyword, you can spend discipline to apply one or more of the following boosts. Each boost can only be applied once per ability use:",
      minLevel: 7,
      isGroupHeader: true,
      children: [
        {
          id: "spend-psi-dynamic",
          description: "<strong>Dynamic Power:</strong> If the ability force moves a target, the forced movement distance gains a bonus equal to your Intuition score ([[@characteristics.intuition.value]]).",
          cost: 1,
          minLevel: 7,
        },
        {
          id: "spend-psi-expanded",
          description: "<strong>Expanded Power:</strong> If the ability targets an area, increase the size of the area by 1. If the area is a line, increase one dimension only.",
          cost: 3,
          minLevel: 7,
        },
        {
          id: "spend-psi-extended",
          description: "<strong>Extended Power:</strong> If the ability is ranged, the distance gains a bonus equal to your Intuition score ([[@characteristics.intuition.value]]). If melee, the distance gains a +2 bonus.",
          cost: 1,
          minLevel: 7,
        },
        {
          id: "spend-psi-heightened",
          description: "<strong>Heightened Power:</strong> If the ability deals rolled damage, it deals extra damage equal to your Intuition score ([[@characteristics.intuition.value]]).",
          cost: 1,
          minLevel: 7,
        },
        {
          id: "spend-psi-magnified",
          description: "<strong>Magnified Power:</strong> If the ability has a potency, increase that potency by an amount equal to your Intuition score ([[@characteristics.intuition.value]]).",
          cost: 5,
          minLevel: 7,
        },
        {
          id: "spend-psi-shared",
          description: "<strong>Shared Power:</strong> If the ability targets individual creatures or objects, target one additional creature or object within distance.",
          cost: 5,
          minLevel: 7,
        },
        {
          id: "spend-psi-sharpened",
          description: "<strong>Sharpened Power:</strong> If the ability has any power roll, that roll gains an edge.",
          cost: 1,
          minLevel: 7,
        },
      ],
    },
    {
      id: "spend-manifold-resonance",
      description: "<strong>Manifold Resonance:</strong> Whenever you use an ability, you gain 1 discipline that can only be used to apply a Psi Boost to that ability.",
      minLevel: 10,
      isDescriptionOnly: true,
    },
  ],

  // Discipline Mastery tables — subclass-specific passive benefits
  growthTables: [
    {
      id: "chronokinetic",
      label: "Discipline Mastery — Chronokinetic",
      requiresSubclass: "Chronokinetic",
      description: "Whenever you use Inertial Shield, you can use the Disengage move action as a free triggered action.",
      rows: [
        { threshold: 2, description: "Whenever you use the Knockback maneuver, you can use the Disengage move action as a free triggered action either before or after the maneuver.", minLevel: 1 },
        { threshold: 4, description: "The first time on a turn that you willingly move 1 or more squares as part of an ability, you gain 1 surge.", minLevel: 1, grantsSurge: 1, surgeGroup: "move" },
        { threshold: 6, description: "You gain an edge on the Grab and Knockback maneuvers.", minLevel: 1 },
        { threshold: 8, description: "The first time on a turn that you willingly move 1 or more squares as part of an ability, you gain 2 surges.", minLevel: 4, grantsSurge: 2, surgeGroup: "move" },
        { threshold: 10, description: "You have a double edge on the Grab and Knockback maneuvers.", minLevel: 7 },
        { threshold: 12, description: "Whenever you force move a target, the forced movement distance gains a bonus equal to your Intuition score ([[@characteristics.intuition.value]]). Additionally, whenever you use a heroic ability, you gain [[/heal 10 type=temporary]].", minLevel: 10 },
      ],
    },
    {
      id: "cryokinetic",
      label: "Discipline Mastery — Cryokinetic",
      requiresSubclass: "Cryokinetic",
      description: "Whenever you use Inertial Shield, you can use the Grab maneuver as a free triggered action.",
      rows: [
        { threshold: 2, description: "Whenever you use the Knockback maneuver, you can target one additional creature. Additionally, whenever you deal untyped damage with a psionic ability, you can change it to cold damage instead.", minLevel: 1 },
        { threshold: 4, description: "The first time on a turn that you grab a creature or an enemy moves 1 or more squares in the area of your Null Field, you gain 1 surge.", minLevel: 1, grantsSurge: 1, surgeGroup: "grab-move" },
        { threshold: 6, description: "You gain an edge on the Grab and Knockback maneuvers.", minLevel: 1 },
        { threshold: 8, description: "The first time on a turn that you grab a creature or an enemy moves 1 or more squares in the area of your Null Field, you gain 2 surges.", minLevel: 4, grantsSurge: 2, surgeGroup: "grab-move" },
        { threshold: 10, description: "You have a double edge on the Grab and Knockback maneuvers.", minLevel: 7 },
        { threshold: 12, description: "Whenever you force move a target, the forced movement distance gains a bonus equal to your Intuition score ([[@characteristics.intuition.value]]). Additionally, whenever you use a heroic ability, you gain [[/heal 10 type=temporary]].", minLevel: 10 },
      ],
    },
    {
      id: "metakinetic",
      label: "Discipline Mastery — Metakinetic",
      requiresSubclass: "Metakinetic",
      description: "Whenever you use Inertial Shield, you can use the Knockback maneuver as a free triggered action.",
      rows: [
        { threshold: 2, description: "Whenever you use the Knockback maneuver, the forced movement distance gains a bonus equal to your Intuition score ([[@characteristics.intuition.value]]).", minLevel: 1 },
        { threshold: 4, description: "The first time in a combat round that you take damage or are force moved, you gain 1 surge, even if you resist the effect.", minLevel: 1, grantsSurge: 1, surgeGroup: "damage-forcemove" },
        { threshold: 6, description: "You gain an edge on the Grab and Knockback maneuvers.", minLevel: 1 },
        { threshold: 8, description: "The first time in a combat round that you take damage or are force moved, you gain 2 surges, even if you resist the effect.", minLevel: 4, grantsSurge: 2, surgeGroup: "damage-forcemove" },
        { threshold: 10, description: "You have a double edge on the Grab and Knockback maneuvers.", minLevel: 7 },
        { threshold: 12, description: "Whenever you force move a target, the forced movement distance gains a bonus equal to your Intuition score ([[@characteristics.intuition.value]]). Additionally, whenever you use a heroic ability, you gain [[/heal 10 type=temporary]].", minLevel: 10 },
      ],
    },
  ],

  passiveEffects: [],
};
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
