# Draw Steel - Resources UI

A Foundry VTT module for the [Draw Steel](https://mcdmproductions.com) system that provides a compact, always-visible panel to track and manage Heroic Resources, Surges, and Hero Tokens during play.

## Summary

Resources UI gives players and GMs a dedicated sidebar panel for managing all nine heroic resource types in Draw Steel. Instead of opening character sheets mid-combat, heroes can gain, spend, and track their resources with one-click buttons directly from the panel.

## Features

### Heroic Resource Tracking
- **All 9 classes supported:** Censor (Wrath), Conduit (Piety), Elementalist (Essence), Fury (Ferocity), Null (Discipline), Shadow (Insight), Tactician (Focus), Talent (Clarity), and Troubadour (Drama)
- **Gain buttons** with automatic dice rolling (1d3, 1d3+1), victory-based gains, and fixed amounts
- **Spend buttons** with resource deduction, including variable-cost abilities (Spend X)
- **Level requirements:** entries automatically appear and replace each other based on the hero's level

### Class-Specific Features
- **Conduit:** Pray mechanic with 1d3 prayer rolls and domain-specific triggered gains
- **Elementalist:** Mantle of Essence active/inactive status indicator, specialization-filtered triggered actions
- **Fury:** Growing Ferocity passive effect tables with subclass-specific thresholds and automatic surge granting
- **Null:** Discipline Mastery passive tables, Psi Boost spend group, strain damage tracking with negative resource support
- **Shadow:** Edge Discount surge gain, subclass-filtered Kit abilities
- **Tactician:** Mark benefits and Doctrine-specific triggered actions filtered by subclass
- **Talent:** Strained section, Mind Recovery mechanic (spend a Recovery to gain clarity), Tradition-filtered abilities
- **Troubadour:** Melodrama gain group, subclass-filtered Class Act features

### Subclass and Ability Filtering
- Spend entries with subclass requirements (e.g. Auteur, Duelist, Virtuoso) are only shown to characters with the matching subclass item
- Ability-gated spends only appear when the character has the corresponding ability on their sheet

### Surge Tracking
- Shared surge pool with increment/decrement buttons
- **Extra Damage:** spend surges to deal damage equal to your highest characteristic per surge
- **Increase Potency:** spend 2 surges to increase potency of a power by 1
- Growing resource tables automatically grant surges at thresholds

### Hero Token Tab
- Integrates with the Draw Steel system's native Hero Token API
- **Gain 2 Surges** (1 token), **Succeed on a Save** (1 token), **Reroll a Test** (1 token), **Regain Stamina** (2 tokens)
- GM controls to give and spend tokens manually
- Only visible when the system's Hero Token model is available

### GM Tools
- Character switcher dropdown to view and manage any hero's resources
- Automatically re-renders on actor updates for real-time tracking

### Passive Effect Tables
- Growing Ferocity (Fury), Discipline Mastery (Null), and other threshold-based passive tables
- Active/inactive status highlighted based on current resource value
- Collapsible section to save panel space

<img width="954" height="387" alt="Screenshot 2026-03-24 230200" src="https://github.com/user-attachments/assets/ab521cdd-7fbd-4413-a261-6d04697c596e" />
<img width="672" height="649" alt="Screenshot 2026-03-24 230121" src="https://github.com/user-attachments/assets/a3bbd7a6-fd83-4f21-975e-ace9adb0c00f" />
<img width="647" height="862" alt="Screenshot 2026-03-24 230101" src="https://github.com/user-attachments/assets/330ebed8-6bdc-4d31-a841-ae812100d9a4" />


## Installation

Install via Foundry VTT's module browser by searching for **"Draw Steel - Resource Tracker"**, or paste the manifest URL into the Install Module dialog:

```
https://github.com/OmerCora/draw-steel-resources-ui/releases/latest/download/module.json
```

## Compatibility

| | Version |
|---|---|
| **Foundry VTT** | v13+ (verified 13.351) |
| **Draw Steel System** | v0.9.0+ (verified 0.11.1) |

## License

Module code is licensed under [MIT](LICENSE) &copy; Ömer Cora.

This module uses content from *Draw Steel: Heroes* (ISBN: 978-1-7375124-7-9) under the [DRAW STEEL Creator License](https://mcdm.gg/DS-license).

## Support

If you find this module useful, consider supporting development:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/G2G263V03)

---

*Draw Steel - Resource Tracker is an independent product published under the DRAW STEEL Creator License and is not affiliated with MCDM Productions, LLC. DRAW STEEL &copy; 2024 MCDM Productions, LLC.*
