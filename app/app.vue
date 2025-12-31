<script setup lang="ts">
const isAuthResolved = useState<boolean>('auth-resolved');
</script>

<template>
    <div v-if="!isAuthResolved" class="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-900">
       <div class="flex flex-col items-center gap-4">
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p class="text-sm font-medium text-muted animate-pulse">Memuat Aplikasi...</p>
       </div>
    </div>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    
    <UNotifications />
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap");

html {
  font-family: "Outfit", sans-serif;
}
</style>
