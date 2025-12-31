<script setup lang="ts">
import { ref } from "vue";
import { usePageTitle } from "~/composables/usePageTitles";

// State Sidebar
const sidebarOpen = ref(true);
const toggleSidebar = () => (sidebarOpen.value = !sidebarOpen.value);

// Theme Management
const colorMode = useColorMode();
const toggleTheme = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};

// Page Title
const pageTitle = usePageTitle();
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
    
    <Sidebar :sidebar-open="sidebarOpen" @toggle="toggleSidebar" />

    <div 
      class="flex min-h-screen flex-col transition-all duration-300 ease-in-out" 
      :class="sidebarOpen ? 'ml-64' : 'ml-[72px]'"
    >
      
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md transition-colors dark:border-gray-800 dark:bg-gray-900/80">
        
        <div class="flex items-center gap-4">
          <h2 class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            {{ pageTitle }}
          </h2>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="toggleTheme"
            class="group flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-primary/50 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-primary"
            aria-label="Ganti Tema"
          >
            <ClientOnly>
              <Icon 
                :name="colorMode.value === 'dark' ? 'lucide:moon' : 'lucide:sun'" 
                class="h-4 w-4 transition-transform duration-500"
                :class="{ 'rotate-[360deg]': colorMode.value === 'dark' }" 
              />
            </ClientOnly>
          </button>
        </div>
      </header>

      <main class="flex-1">
        <slot />
      </main>
      
    </div>

    <Toast />
  </div>
</template>