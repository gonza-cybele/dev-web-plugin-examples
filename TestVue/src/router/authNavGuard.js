import { nextTick } from 'vue';
import checkUserPermissions from '@utils/checkUserPermissions';
import { fetchQueryClientUserInfo } from '@queries/auth';
import { useBrowserLocation } from '@vueuse/core';

export const createTestVueNavGuard = (queryClient) => {
  const location = useBrowserLocation();
  const isPluginMode = import.meta.env.VITE_PLUGIN_MODE === 'true';

  return async (to) => {
    if (isPluginMode) {
      const pathname = location.value.pathname;
      window.history.replaceState(null, '', pathname);
      return true;
    }
    try {
      const search = new URL(window.location.href).search.toLowerCase();
      const hasSignIn = new URLSearchParams(search).has('signin');

      if (hasSignIn) {
        if (to.name !== 'login') {
          nextTick(() => window.history.replaceState(null, '', '?signin'));
          return `/login${search}`;
        } else {
          return true;
        }
      }

      if (to.name === 'login') {
        return true;
      }

      const userInfo = await fetchQueryClientUserInfo({ queryClient });
      const isAuthenticated = userInfo?.authenticated || userInfo?.permissions?.canLogout;

      if (!isAuthenticated) {
        return '/login';
      }

      const userAllowed = await checkUserPermissions(to?.meta?.permissions, {
        queryClient,
      });

      if (!userAllowed) {
        return '/login';
      }
    } catch (error) {
      console.warn('[Test Vue Router Guard] Error checking authentication:', error);
      return '/login';
    }

    const pathname = location.value.pathname;
    window.history.replaceState(null, '', pathname);

    return true;
  };
};
