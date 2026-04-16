import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import TConfirmationService from '@components/Dialogs/TConfirmDialog/TConfirmationService.js';
import Tooltip from 'primevue/tooltip';
import InputText from 'primevue/inputtext';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { defaultQueryClientOptions } from 'workspace-lib-utils/src/TQueryClient';
import i18n, { loadLanguagesAsync } from '@lang';
import router from './router';
import PluginView from './PluginView.vue';

export async function mount(el, { pinia: hostPinia } = {}) {
  await loadLanguagesAsync.catch((err) => {
    console.warn('[Test Vue Plugin] Language loading failed, continuing without translations:', err);
  });

  const pinia = createPinia();
  if (hostPinia) {
    pinia.state.value = hostPinia.state.value;
  }
  setActivePinia(pinia);

  const queryClient = new QueryClient({
    ...defaultQueryClientOptions,
    defaultOptions: {
      ...defaultQueryClientOptions.defaultOptions,
      queries: {
        ...defaultQueryClientOptions.defaultOptions.queries,
        cacheTime: Infinity,
      },
    },
  });

  const app = createApp(PluginView);

  app.directive('tooltip', Tooltip);
  app.component('InputText', InputText);

  app.use(i18n);
  app.use(pinia);
  app.use(router);
  app.use(PrimeVue);
  app.use(ToastService);
  app.use(ConfirmationService);
  app.use(TConfirmationService);
  app.use(VueQueryPlugin, { queryClient });

  app.config.globalProperties.$BASE_URL = import.meta.env.BASE_URL;
  app.config.globalProperties.$sidePanel = null;
  app.config.warnHandler = () => {};

  app.mount(el);

  return {
    unmount: () => app.unmount(),
  };
}

export default { mount };
