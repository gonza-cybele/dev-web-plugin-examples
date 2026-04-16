<template>
  <div class="test-vue-layout flex flex-column h-full w-full">
    <main class="main-container flex flex-column flex-1 min-h-0 w-full overflow-hidden">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
</script>

<style scoped>
.test-vue-layout {
  background: var(--primary-bgcolor, #ffffff);
}
</style>
