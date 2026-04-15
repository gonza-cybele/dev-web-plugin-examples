import { existsSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, rmSync, lstatSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PLUGIN } from '../pluginconfig.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const PLUGINS_DIR = 'C:/GitHub/dev-main/Products/ThinRDP/web/workspace/plugins';
const PLUGINS_JSON = join(PLUGINS_DIR, 'plugins.json');

// 1. Create plugins directory if it doesn't exist
if (!existsSync(PLUGINS_DIR)) {
  mkdirSync(PLUGINS_DIR, { recursive: true });
  console.log('Created plugins directory:', PLUGINS_DIR);
}

// 2. Create or update plugins.json
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

// 3. Create symlink (junction on Windows) from plugins dir to local dist_plugins output
const symlinkPath = join(PLUGINS_DIR, PLUGIN.name);
const targetPath = resolve(projectRoot, './dist_plugin', PLUGIN.name);

// lstat doesn't follow symlinks/junctions, unlike existsSync which does
let symlinkStat = null;
try {
  symlinkStat = lstatSync(symlinkPath);
} catch {}

if (symlinkStat) {
  if (symlinkStat.isSymbolicLink()) {
    console.log('Symlink already exists:', symlinkPath, '->', targetPath);
    process.exit(0);
  }
  // Remove existing non-symlink (e.g. leftover build output) to replace with symlink
  rmSync(symlinkPath, { recursive: true });
  console.log('Removed existing directory:', symlinkPath);
}

symlinkSync(targetPath, symlinkPath, 'junction');
console.log('Created symlink:', symlinkPath, '->', targetPath);
