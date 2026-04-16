import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PLUGIN } from '../pluginconfig.js';

const PLUGINS_DIR = 'C:/GitHub/dev-main/Products/ThinRDP/web/workspace/plugins';
const PLUGINS_JSON = join(PLUGINS_DIR, 'plugins.json');

if (!existsSync(PLUGINS_DIR)) {
  mkdirSync(PLUGINS_DIR, { recursive: true });
  console.log('Created plugins directory:', PLUGINS_DIR);
}

let plugins = [];
if (existsSync(PLUGINS_JSON)) {
  plugins = JSON.parse(readFileSync(PLUGINS_JSON, 'utf-8'));
}

const idx = plugins.findIndex((p) => p.name === PLUGIN.name);
if (idx >= 0) {
  plugins[idx] = PLUGIN;
} else {
  plugins.push(PLUGIN);
}

writeFileSync(PLUGINS_JSON, JSON.stringify(plugins, null, 2));
console.log('Updated plugins.json with plugin:', PLUGIN.name);
