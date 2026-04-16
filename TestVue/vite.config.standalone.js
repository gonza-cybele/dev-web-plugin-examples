/**
 * Vite config for Standalone build/dev mode
 * Runs Test Vue as an independent app with its own dev server
 */
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { existsSync, rmSync, mkdirSync, cpSync, lstatSync, createReadStream, renameSync } from 'node:fs';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = 'C:/GitHub/dev-web-workspace';
const outDir = './dist';

const copyRootI18n = () => ({
  name: 'copy-root-i18n-for-test_vue',
  apply: 'build',
  closeBundle() {
    try {
      const srcDir = resolve(WORKSPACE_ROOT, 'public/i18n');
      const destDir = resolve(__dirname, `${outDir}/i18n/workspace`);
      console.log('[copyRootI18n] Copying from', srcDir, 'to', destDir);
      rmSync(destDir, { recursive: true, force: true });
      mkdirSync(destDir, { recursive: true });
      if (existsSync(srcDir)) {
        cpSync(srcDir, destDir, { recursive: true });
        console.log('[copyRootI18n] Successfully copied i18n files');
      } else {
        console.warn('[copyRootI18n] Source directory not found:', srcDir);
      }
    } catch (err) {
      console.error('[copyRootI18n] Failed to copy i18n:', err);
    }
  },
});

const cleanupProdFolder = () => ({
  name: 'move-index-and-cleanup-prod-folder',
  apply: 'build',
  closeBundle() {
    try {
      const distRoot = resolve(__dirname, outDir);
      const indexHtml = resolve(distRoot, 'index-prod.html');
      const destIndex = resolve(distRoot, 'index.html');
      if (existsSync(indexHtml)) {
        renameSync(indexHtml, destIndex);
      }
    } catch (err) {
      console.error('[cleanupProdFolder] Failed dist cleanup:', err);
    }
  },
});

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    svgLoader({ svgo: true, svgoConfig: { plugins: ['removeDimensions', 'prefixIds'] } }),
    cleanupProdFolder(),
    copyRootI18n(),
    {
      name: 'serve-i18n-in-dev',
      apply: 'serve',
      configureServer(server) {
        // Serve workspace root i18n (ROOT_I18N_PATH = '/workspace/public/i18n/')
        const rootMountPath = '/workspace/public/i18n';
        const rootLocalDir = resolve(WORKSPACE_ROOT, 'public/i18n');
        // Serve plugin's own i18n (APP_I18N_PATH = 'public//i18n/' which normalises to /public/i18n/)
        const appMountPath = '/public/i18n';
        const appLocalDir = resolve(__dirname, 'public/i18n');
        const serveFrom = (mountPath, localDir) => (req, res, next) => {
          if (!req.url || !req.url.startsWith(mountPath)) return next();
          try {
            const rel = req.url.substring(mountPath.length).replace(/^\/+/, '');
            const filePath = resolve(localDir, rel || '');
            if (!existsSync(filePath) || lstatSync(filePath).isDirectory()) return next();
            res.setHeader('Cache-Control', 'no-cache');
            if (filePath.endsWith('.json')) res.setHeader('Content-Type', 'application/json; charset=utf-8');
            createReadStream(filePath).pipe(res);
          } catch (err) {
            console.warn('[serve-i18n-in-dev] failed to serve', req.url, err);
            next();
          }
        };
        server.middlewares.use(serveFrom(rootMountPath, rootLocalDir));
        server.middlewares.use(serveFrom(appMountPath, appLocalDir));
      },
    },
  ],
  define: {
    __INTLIFY_JIT_COMPILATION__: true,
    __INTLIFY_DROP_MESSAGE_COMPILER__: false,
  },
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
  base: mode === 'production' ? './' : '/test-vue-dev/',
  build: {
    target: 'esnext',
    outDir,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, './index-prod.html'),
      },
      output: {
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'mainTestVue.js',
        manualChunks: (id) => {
          if (id.includes('/src/env.js')) return 'env.config';
          if (id.includes('defineCoreImports.js')) return 'workspace.core.define';
          if (id.includes('useConsts.js')) return 'workspace.core.consts';
          if (id.includes('useCoreImports.js')) return 'workspace.core';
        },
      },
    },
  },
  server: {
    cors: true,
    fs: {
      allow: ['..', WORKSPACE_ROOT],
    },
    hmr: {
      clientPort: 3022,
    },
  },
}));
