<script setup lang="ts">
import type { Category } from "~/types/category";
import { Vue3Lottie } from "vue3-lottie";
import notfoundAnim from "~/assets/animation/notfound.json";

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
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th scope="col" class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Nama Kategori
            </th>
            <th scope="col" class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Deskripsi
            </th>
            <th scope="col" class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Status
            </th>
            <th scope="col" class="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          
          <template v-if="loading">
            <tr v-for="n in 5" :key="'skeleton-' + n" class="animate-pulse">
              <td class="px-6 py-4">
                <div class="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
              </td>
              <td class="px-6 py-4">
                <div class="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="mx-auto h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-3">
                  <div class="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div class="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </td>
            </tr>
          </template>

          <tr v-else-if="categories.length === 0">
            <td colspan="4" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center justify-center">
                <ClientOnly>
                  <Vue3Lottie :animationData="notfoundAnim" :height="160" :width="160" />
                </ClientOnly>
                <p class="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Belum ada kategori yang ditemukan.</p>
              </div>
            </td>
          </tr>

          <template v-else>
            <tr 
              v-for="category in categories" 
              :key="category.id" 
              class="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-700/50"
            >
              <td class="px-6 py-4 whitespace-nowrap align-middle">
                <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ category.name }}</div>
              </td>

              <td class="px-6 py-4 align-middle">
                <div class="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{{ category.description || '-' }}</div>
              </td>

              <td class="px-6 py-4 text-center align-middle whitespace-nowrap">
                <button
                  @click="emit('toggleStatus', category)"
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  :class="category.isActive 
                    ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 focus:ring-green-600' 
                    : 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 focus:ring-gray-500'"
                  title="Klik untuk mengubah status"
                >
                  <span class="mr-1.5 h-1.5 w-1.5 rounded-full" :class="category.isActive ? 'bg-green-500' : 'bg-gray-400'"></span>
                  {{ category.isActive ? "Aktif" : "Nonaktif" }}
                </button>
              </td>

              <td class="px-6 py-4 text-right align-middle whitespace-nowrap">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="emit('edit', category)" 
                    class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                    title="Edit Kategori"
                  >
                    <Icon name="lucide:edit-2" class="h-4 w-4" />
                  </button>
                  <button 
                    @click="emit('delete', category)" 
                    class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    title="Hapus Kategori"
                  >
                    <Icon name="lucide:trash-2" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>