<script setup lang="ts">
import { usePageTitle } from "~/composables/usePageTitles";
import { onMounted } from "vue";

const pageTitle = usePageTitle();

onMounted(() => {
  pageTitle.value = "Chat";
});

useHead({
  title: "Chat",
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Chat</h1>
  </div>
</template>
