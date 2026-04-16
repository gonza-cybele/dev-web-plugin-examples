import './env.js';
import '@utils/defineCoreImports';
import { createApp } from 'vue';

import { createPinia, setActivePinia } from 'pinia';
import PrimeVue from 'primevue/config';
import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';
import '@assets/scss/themes/light-theme/theme.scss';
import '@assets/scss/themes/dark-theme/theme.scss';
import '@assets/scss/themes/blue-theme/theme.scss';
import '@assets/scss/themes/new-light-theme/theme.scss';
import '@assets/scss/themes/new-dark-theme/theme.scss';
import '@assets/scss/base.scss';
import i18n, { loadLanguagesAsync } from '@lang';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { defaultQueryClientOptions } from 'workspace-lib-utils/src/TQueryClient';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import TConfirmationService from '@components/Dialogs/TConfirmDialog/TConfirmationService.js';
import Tooltip from 'primevue/tooltip';
import { fetchQueryClientUserInfo } from '@queries/auth';
import InputText from 'primevue/inputtext';

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

Promise.allSettled([loadLanguagesAsync, fetchQueryClientUserInfo({ queryClient })]).finally(async () => {
  const pinia = createPinia();
  setActivePinia(pinia);

  const { default: router } = await import('./router');
  const { createTestVueNavGuard } = await import('./router/authNavGuard');
  const { default: App } = await import('./App.vue');

  const app = createApp(App);

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

  router.beforeEach(createTestVueNavGuard(queryClient));

  app.config.globalProperties.$BASE_URL = import.meta.env.BASE_URL;
  app.config.globalProperties.$sidePanel = null;
  app.config.warnHandler = () => {};

  app.mount('#app');
});
