/**
 * Draw Steel Resource Tracker
 * Main module entry point — registers hooks, sidebar button, and re-render triggers.
 */

import { MODULE_ID, SYSTEM_ID } from "./config.mjs";
import { ResourceApp } from "./resources/resource-app.mjs";

const log = (...args) => console.log(`${MODULE_ID} |`, ...args);

let _systemValid = false;

// ── Init ─────────────────────────────────────────────────────────────────────

Hooks.once("init", () => {
  if (game.system?.id !== SYSTEM_ID) return;
  _systemValid = true;

  foundry.applications.handlebars.loadTemplates([
    `modules/${MODULE_ID}/templates/resource-panel.hbs`,
  ]);

  Handlebars.registerHelper("eq", function (a, b) { return a === b; });

  log("Initialized");
});

// ── Ready ────────────────────────────────────────────────────────────────────

Hooks.once("ready", () => {
  if (!_systemValid) return;

  game.modules.get(MODULE_ID).api = { ResourceApp };

  log("Ready");
});

// ── Sidebar button ───────────────────────────────────────────────────────────

Hooks.on("getSceneControlButtons", (controls) => {
  if (!_systemValid) return;

  const tokenControls = controls.find((c) => c.name === "token");
  if (!tokenControls) return;

  tokenControls.tools.push({
    name: "dsresources-toggle",
    title: game.i18n.localize("DSRESOURCES.WindowTitle"),
    icon: "fa-solid fa-bolt",
    button: true,
    onClick: () => ResourceApp.toggle(),
  });
});

// ── Re-render on actor updates ───────────────────────────────────────────────

Hooks.on("updateActor", (actor, _changes, _options, _userId) => {
  if (!_systemValid) return;
  if (!ResourceApp._instance?.rendered) return;

  if (game.user.isGM) {
    // GM sees all heroes — re-render for any hero actor update
    if (actor.type === "hero") ResourceApp._instance.render(false);
  } else {
    const myActor = game.user.character;
    if (myActor?.id === actor.id) ResourceApp._instance.render(false);
  }
});
