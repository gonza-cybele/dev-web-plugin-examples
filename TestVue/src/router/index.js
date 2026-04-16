import { createMemoryHistory, createRouter } from 'vue-router';
import TestVueLayout from '@test_vue_layouts/TestVueLayout.vue';
import TestVueHome from '@test_vue_views/TestVueHome.vue';
import LoginPage from '@test_vue_views/LoginPage.vue';

const HOME_ROUTE = '/test-vue-home';

const router = createRouter({
  history: createMemoryHistory(),
  routes:
    import.meta.env.VITE_PLUGIN_MODE === 'true'
      ? [
          {
            path: '/',
            name: 'root',
            component: TestVueLayout,
            redirect: HOME_ROUTE,
            children: [
              {
                path: 'test-vue-home',
                name: 'test-vue-home',
                component: TestVueHome,
              },
            ],
          },
        ]
      : [
          {
            path: '/login',
            name: 'login',
            component: LoginPage,
          },
          {
            path: '/',
            name: 'root',
            component: TestVueLayout,
            redirect: HOME_ROUTE,
            children: [
              {
                path: 'test-vue-home',
                name: 'test-vue-home',
                component: TestVueHome,
              },
            ],
          },
        ],
});

export default router;
