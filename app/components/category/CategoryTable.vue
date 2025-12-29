<script setup lang="ts">
import type { Category } from "~/types/category";

defineProps<{
  categories: Category[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "edit", category: Category): void;
  (e: "delete", category: Category): void;
  (e: "toggleStatus", category: Category): void;
}>();
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
    <table class="min-w-full">
      <thead class="bg-gray-50 dark:bg-gray-900">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Nama Kategori</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Deskripsi</th>
          <th scope="col" class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
          <th scope="col" class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        <template v-if="loading">
          <tr v-for="n in 3" :key="'skeleton-' + n">
            <td class="px-6 py-4">
              <div class="h-10 w-20 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="mx-auto h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
              <div class="flex justify-center space-x-3">
                <div class="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div class="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              </div>
            </td>
          </tr>
        </template>

        <tr v-else-if="categories.length === 0" class="transition-colors duration-200 ease-in-out hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
          <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Belum ada data kategori.</td>
        </tr>

        <template v-else>
          <tr v-for="category in categories" :key="category.id" class="transition-colors duration-200 ease-in-out hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-dark dark:text-base">{{ category.name }}</div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-dark dark:text-base">{{ category.description }}</div>
            </td>
            <td class="px-6 py-4 text-center">
              <button
                @click="emit('toggleStatus', category)"
                class="rounded-full transition-all duration-200 ease-in-out-smooth focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
              >
                <span
                  :class="category.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'"
                  class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5"
                >
                  {{ category.isActive ? "Aktif" : "Nonaktif" }}
                </span>
              </button>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
              <button
                @click="emit('edit', category)"
                aria-label="Edit kategori"
                class="rounded p-1 text-accent transition-all duration-200 ease-in-out-smooth hover:text-primary dark:text-accent/90 dark:hover:text-base focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
              >
                <Icon name="lucide:edit" class="h-5 w-5" />
              </button>
              <button
                @click="emit('delete', category)"
                aria-label="Hapus kategori"
                class="rounded p-1 text-red-500 transition-all duration-200 ease-in-out-smooth hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
              >
                <Icon name="lucide:trash" class="h-5 w-5" />
              </button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
