<script setup lang="ts">
defineProps<{
  title: string;
  value: string | number;
  icon: string;
  trend?: string; // Misal: "+12%"
  trendUp?: boolean; // true = naik (hijau), false = turun (merah)
  colorClass?: string; // bg-primary, bg-blue-500, dll
}>();
</script>

<template>
  <div class="rounded-xl border border-muted/20 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-muted uppercase tracking-wide">{{ title }}</p>
        <h3 class="mt-2 text-2xl font-bold text-dark dark:text-white">{{ value }}</h3>
      </div>
      <div :class="`flex h-12 w-12 items-center justify-center rounded-full ${colorClass} text-white shadow-lg shadow-${colorClass?.replace('bg-', '')}/40`">
        <Icon :name="icon" class="h-6 w-6" />
      </div>
    </div>

    <div v-if="trend" class="mt-4 flex items-center text-xs">
      <span class="font-bold mr-2 px-1.5 py-0.5 rounded" :class="trendUp ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : 'text-red-600 bg-red-100 dark:bg-red-900/30'">
        {{ trend }}
      </span>
      <span class="text-muted">dari bulan lalu</span>
    </div>
  </div>
</template>
