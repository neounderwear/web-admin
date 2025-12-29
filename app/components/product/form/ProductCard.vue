<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
      <h3 class="text-lg font-semibold leading-6 text-dark dark:text-base">{{ title }}</h3>
      <p v-if="description" class="mt-1 text-sm text-muted dark:text-gray-400">{{ description }}</p>
    </div>
    <div class="p-6">
      <slot />
    </div>
  </div>
</template>
