<template>
  <div class="p-5">
    <h1>{{ $t('testVue.title') }}</h1>
    <p>Plugin is running in {{ isPluginMode ? 'plugin' : 'standalone' }} mode.</p>
    <p>{{ $t('common.settings') }}</p>

    <Button :label="$t('testVue.fetchData')" icon="pi pi-download" @click="fetchData" />

    <div v-if="isLoading" class="mt-3">
      <i class="pi pi-spin pi-spinner" /> {{ $t('common.loading') }}...
    </div>

    <div v-if="userInfo" class="mt-3">
      <pre>{{ JSON.stringify(userInfo, null, 2) }}</pre>
    </div>

    <div v-if="error" class="mt-3" style="color: var(--red-500)">
      {{ $t('common.error') }}: {{ error.message }}
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import { useUserInfoQuery } from '@queries/auth';

const isPluginMode = import.meta.env.VITE_PLUGIN_MODE === 'true';

const { data: userInfo, error, isLoading, refetch } = useUserInfoQuery({ enabled: false });

const fetchData = () => {
  refetch();
};
</script>
