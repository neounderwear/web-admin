<script setup lang="ts">
import Sidebar from "~/components/Sidebar.vue";
import { ref } from "vue";
import { usePageTitle } from "~/composables/usePageTitles";

const sidebarOpen = ref(true);
const toggleSidebar = () => (sidebarOpen.value = !sidebarOpen.value);

const colorMode = useColorMode();
const toggleTheme = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};

const pageTitle = usePageTitle();
</script>

<template>
  <div class="min-h-screen bg-[#FDFCF8] text-dark dark:bg-gray-950 dark:text-base transition-colors duration-500">
    <Sidebar :sidebar-open="sidebarOpen" @toggle="toggleSidebar" />

    <div class="flex flex-col min-h-screen transition-all duration-300 ease-in-out" :class="sidebarOpen ? 'ml-64' : 'ml-[70px]'">
      <header class="sticky top-0 z-20 h-16 flex items-center justify-between px-6 border-b border-muted/10 bg-white/80 backdrop-blur-md dark:bg-gray-900/80 dark:border-gray-800 transition-colors duration-500">
        <h2 class="text-lg font-bold tracking-tight">{{ pageTitle }}</h2>

        <button
          @click="toggleTheme"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-dark shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:scale-110 dark:bg-gray-800/80 dark:text-white dark:hover:bg-gray-800"
          aria-label="Ganti Tema"
        >
          <ClientOnly>
            <Icon :name="colorMode.value === 'dark' ? 'lucide:moon' : 'lucide:sun'" class="h-5 w-5 transition-transform duration-500 rotate-0 dark:-rotate-180" />
          </ClientOnly>
        </button>
      </header>

      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>

    <Toast />
  </div>
</template>
