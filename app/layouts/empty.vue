<script setup lang="ts">
import Toast from "~/components/Toast.vue";
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
    <slot />
    
    <Toast />
  </div>
</template>