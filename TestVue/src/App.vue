<template>
  <div class="app-container" data-thinfinity-workspace>
    <template v-if="ready">
      <RouterView />
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePingQuery } from '@queries/auth';

usePingQuery({
  queryConfig: {
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: true,
  },
});

const ready = ref(false);
Promise.allSettled([]).then(() => (ready.value = true));
</script>

<style scoped>
.app-container {
  background: var(--primary-bgcolor);
}
</style>
