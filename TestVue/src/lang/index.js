import { createI18n } from 'vue-i18n';
import { PostMetaDataVariables } from '@utils/PostMetaData';
import { publicPath } from '@utils/basePath';
import { nextTick } from 'vue';
import { isNil, uniq, merge } from 'lodash';
import { PLUGIN } from '../../pluginconfig.js';

const DEFAULT_LANG = 'en';
const SERVER_LANG = PostMetaDataVariables.language;

const isPluginMode = import.meta.env.VITE_PLUGIN_MODE === 'true';
const isStandalone = !isPluginMode;
const isProd = import.meta.env.PROD;

// Workspace shared translations
let ROOT_I18N_PATH = isStandalone && isProd ? './i18n/workspace/' : '/workspace/public/i18n/';

// Own Test Vue translations
let APP_I18N_PATH = isStandalone
  ? isProd
    ? './i18n/'
    : `${publicPath}/i18n/`
  : /* is PLUGIN*/ isProd
  ? `/workspace/plugins/${PLUGIN.name}/i18n/`
  : `/workspace-dev/dist_plugins/${PLUGIN.name}/i18n/`;

let messages = [];
const i18n = createI18n({
  legacy: false,
  locale: SERVER_LANG,
  fallbackLocale: DEFAULT_LANG,
  sync: true,
  globalInjection: true,
  messages: messages,
});

const fetchWithRetry = async (url, options = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Resource not found: ${url}`);
        }
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      if (i === retries - 1 || err.message.includes('Resource not found')) {
        throw err;
      }
      console.warn(`Retrying (${i + 1}/${retries})...`);
    }
  }
};

const loadLanguages = async (langs, retries = 3) => {
  langs = uniq(langs);

  const promises = langs.map(async (lang) => {
    try {
      const appDicUrl = `${APP_I18N_PATH}${lang}.json`;
      const rootDicUrl = `${ROOT_I18N_PATH}${lang}.json`;

      const [rootDict, appDict] = await Promise.all([
        fetchWithRetry(rootDicUrl, {}, retries),
        fetchWithRetry(appDicUrl, {}, retries),
      ]);
      const dict = merge({}, rootDict, appDict);
      return { lang, dict };
    } catch (err) {
      console.error(`Failed to load language ${lang}:`, err);
    }
  });

  const jsons = await Promise.allSettled(promises);

  const dictionaries = jsons
    .filter((t) => t.status === 'fulfilled' && t.value !== undefined)
    .reduce((acc, x) => {
      acc[x.value.lang] = x.value.dict;
      return acc;
    }, {});

  return dictionaries;
};

const load = async () => {
  const langMessages = await loadLanguages([DEFAULT_LANG, ...(!isNil(SERVER_LANG) ? [SERVER_LANG] : [])]);

  Object.keys(langMessages).forEach((lang) => {
    try {
      i18n.global.setLocaleMessage(lang, langMessages[lang]);
    } catch (err) {
      console.error(`Failed to load language ${lang}:`, err);
    }
  });

  await nextTick();
  return i18n;
};

export const loadLanguagesAsync = load();

export default i18n;
