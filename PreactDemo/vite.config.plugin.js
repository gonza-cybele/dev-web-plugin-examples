/**
 * Vite config for Dashboard plugin (Preact).
 * Builds as a standalone ESM bridge — loaded dynamically by the host at runtime.
 */
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { fileURLToPath } from 'node:url';
import { PLUGIN } from './pluginconfig.js';

export default defineConfig({
  plugins: [preact()],
  build: {
    target: 'esnext',
    outDir: fileURLToPath(new URL(`./dist_plugin/${PLUGIN.name}`, import.meta.url)),
    emptyOutDir: true,
    minify: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: fileURLToPath(new URL('./src/bridge.js', import.meta.url)),
      output: {
        format: 'es',
        entryFileNames: 'bridge.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
      preserveEntrySignatures: 'exports-only',
    },
  },
});
