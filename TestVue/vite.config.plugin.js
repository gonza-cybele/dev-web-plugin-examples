/**
 * Vite config for Plugin build mode
 * Builds Test Vue as an ESM module (bridge.js) to be lazy-loaded by the workspace host.
 * Shared dependencies (Vue, Pinia, Vue Router, Vue i18n) are externalized and served
 * from the workspace host at /workspace/shared/*.js.
 */
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';
import { cpSync, existsSync } from 'node:fs';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';
import { sharedDepsPlugin, VUE_PLUGIN_EXTERNALS } from 'C:/GitHub/dev-web-workspace/plugins/config.mjs';
import { PLUGIN } from './pluginconfig.js';

const WORKSPACE_ROOT = 'C:/GitHub/dev-web-workspace';
const PLUGIN_DIST = resolve('.', `dist_plugin/${PLUGIN.name}`);
const PLUGIN_I18N_SRC = fileURLToPath(new URL('./public/i18n', import.meta.url));

/** Copy plugin's own i18n files to dist — workspace root i18n is served by the host */
const copyPluginI18n = () => ({
  name: 'copy-test_vue-i18n',
  apply: 'build',
  closeBundle() {
    if (!existsSync(PLUGIN_I18N_SRC)) return;
    const dest = resolve(PLUGIN_DIST, 'i18n');
    cpSync(PLUGIN_I18N_SRC, dest, { recursive: true });
    console.log('[copy-test_vue-i18n] Copied Test Vue i18n to', dest);
  },
});

export default defineConfig(({ mode }) => ({
  publicDir: false,
  define: {
    'import.meta.env.VITE_PLUGIN_MODE': JSON.stringify('true'),
    __INTLIFY_JIT_COMPILATION__: true, // CSP-safe: registers AST interpreter (no new Function)
    __INTLIFY_DROP_MESSAGE_COMPILER__: false,
  },
  plugins: [
    vue(),
    svgLoader({ svgo: true, svgoConfig: { plugins: ['removeDimensions', 'prefixIds'] } }),
    copyPluginI18n(),
    sharedDepsPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    dedupe: ['vue', 'pinia', 'vue-router', '@vue/devtools-api', 'primevue', 'vue-i18n', 'primeicons'],
    alias: {
      /* Workspace (host app) */
      '@':           resolve(WORKSPACE_ROOT, 'src'),
      '@assets':     resolve(WORKSPACE_ROOT, 'src/assets'),
      '@components': resolve(WORKSPACE_ROOT, 'src/components'),
      '@layouts':    resolve(WORKSPACE_ROOT, 'src/layouts'),
      '@router':     resolve(WORKSPACE_ROOT, 'src/router'),
      '@stores':     resolve(WORKSPACE_ROOT, 'src/stores'),
      '@views':      resolve(WORKSPACE_ROOT, 'src/views'),
      '@mixins':     resolve(WORKSPACE_ROOT, 'src/mixins'),
      '@enums':      resolve(WORKSPACE_ROOT, 'src/enums'),
      '@queries':    resolve(WORKSPACE_ROOT, 'src/queries'),
      '@services':   resolve(WORKSPACE_ROOT, 'src/services'),
      '@utils':      resolve(WORKSPACE_ROOT, 'src/utils'),
      '@public':     resolve(WORKSPACE_ROOT, 'public'),
      '@plugins':    resolve(WORKSPACE_ROOT, 'plugins'),
      '@libs':       resolve(WORKSPACE_ROOT, 'src/libs'),
      '@helpers':    resolve(WORKSPACE_ROOT, 'src/helpers'),
      '#core':       resolve(WORKSPACE_ROOT, '../dev-web-main/Products/ThinRDP/Web'),
      '#common':     resolve(WORKSPACE_ROOT, '../dev-web-main/Products/Common'),
      'workspace-lib-utils': resolve(WORKSPACE_ROOT, 'workspace-lib-utils'),
      /* Plugin local */
      '@lang':               fileURLToPath(new URL('./src/lang', import.meta.url)),
      '@test_vue':            fileURLToPath(new URL('./src', import.meta.url)),
      '@test_vue_components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@test_vue_layouts':    fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@test_vue_stores':     fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@test_vue_views':      fileURLToPath(new URL('./src/views', import.meta.url)),
      '@test_vue_lang':       fileURLToPath(new URL('./src/lang', import.meta.url)),
    },
  },
  build: {
    target: 'esnext',
    outDir: PLUGIN_DIST,
    emptyOutDir: true,
    minify: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: './src/PluginMain.js',
      output: {
        format: 'es',
        entryFileNames: 'bridge.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
        minifyInternalExports: true,
      },
      preserveEntrySignatures: 'exports-only',
      external: VUE_PLUGIN_EXTERNALS,
    },
  },
  server: {
    fs: {
      allow: ['..', WORKSPACE_ROOT],
    },
  },
}));
