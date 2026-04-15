import { existsSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, rmSync, lstatSync, readlinkSync } from 'fs';
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

// 3. Create symlink (junction on Windows) from plugins dir to local src (no build step)
const symlinkPath = join(PLUGINS_DIR, PLUGIN.name);
const targetPath = resolve(projectRoot, 'src');

let symlinkStat = null;
try {
  symlinkStat = lstatSync(symlinkPath);
} catch {}

if (symlinkStat) {
  if (symlinkStat.isSymbolicLink()) {
    const currentTarget = readlinkSync(symlinkPath);
    if (currentTarget === targetPath) {
      console.log('Symlink already exists:', symlinkPath, '->', targetPath);
      process.exit(0);
    }
    console.log('Symlink points to old path:', currentTarget, '-> replacing with:', targetPath);
    rmSync(symlinkPath);
  } else {
    rmSync(symlinkPath, { recursive: true });
    console.log('Removed existing directory:', symlinkPath);
  }
}

symlinkSync(targetPath, symlinkPath, 'junction');
console.log('Created symlink:', symlinkPath, '->', targetPath);
