# dev-web-plugin-examples

Example plugins for the Thinfinity Workspace plugin system. Each folder is a standalone plugin that can be installed via `npm run install-plugin`.

## Examples

- **VanillaDemo** — Minimal plugin with no framework and no build step.
- **VanillaServer** — Vanilla JS plugin served from a local dev server (`localhost:3333`).
- **PreactDemo** — Preact plugin built with Vite.
- **TestVue** — Vue 3 plugin (PrimeVue, Pinia, vue-router) with both standalone and plugin build modes.

## Plugin shape

Every plugin defines a `pluginconfig.js` exporting a `PLUGIN` object (name, label, type, icon, optional `target` URL) and ships its entry under `src/`. Plugins communicate with the host via `src/bridge.js`.

## Scripts

- `npm i` — Install dependencies (not always required).
- `npm run install-plugin` — register the plugin with the local Workspace install.
- `npm run dev:plugin` / `build:plugin` — build in watch or production mode (framework examples).
- `npm run dev` — run the standalone dev server (TestVue, VanillaServer).
