<script setup lang="ts">
import { computed } from 'vue';

// Definisi tipe variant warna
type ColorVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info';

const props = defineProps<{
  title: string;
  value: string | number;
  icon: string;
  trend?: string;       // Contoh: "12.5%"
  trendUp?: boolean;    // true = naik, false = turun
  variant?: ColorVariant; // Default: primary
  loading?: boolean;    // Tampilkan skeleton jika true
}>();

// Mapping warna agar aman dari PurgeCSS Tailwind
const colorStyles = computed(() => {
  const variants: Record<ColorVariant, { bg: string; text: string; icon: string }> = {
    primary: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'bg-blue-600'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      icon: 'bg-green-600'
    },
    warning: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-600 dark:text-orange-400',
      icon: 'bg-orange-600'
    },
    danger: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400',
      icon: 'bg-red-600'
    },
    info: {
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      text: 'text-cyan-600 dark:text-cyan-400',
      icon: 'bg-cyan-600'
    }
  };
  
  return variants[props.variant || 'primary'];
});
</script>

<template>
  <div 
    class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-gray-900/50"
  >
    <div v-if="loading" class="animate-pulse space-y-4">
      <div class="flex justify-between">
        <div class="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div class="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>

    <div v-else>
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {{ title }}
          </p>
          <h3 class="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">
            {{ value }}
          </h3>
        </div>
        
        <div 
          class="flex h-12 w-12 items-center justify-center rounded-xl transition-colors"
          :class="[colorStyles.bg, colorStyles.text]"
        >
          <Icon :name="icon" class="h-6 w-6" />
        </div>
      </div>

      <div v-if="trend" class="mt-4 flex items-center gap-2">
        <div 
          class="flex items-center rounded-full px-2 py-0.5 text-xs font-bold"
          :class="trendUp 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
        >
          <Icon 
            :name="trendUp ? 'lucide:trending-up' : 'lucide:trending-down'" 
            class="mr-1 h-3 w-3" 
          />
          <span>{{ trend }}</span>
        </div>
        <span class="text-xs text-gray-400 dark:text-gray-500">vs bulan lalu</span>
      </div>
    </div>

    <div 
      class="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl transition-all group-hover:opacity-20"
      :class="colorStyles.icon"
    ></div>
  </div>
</template>