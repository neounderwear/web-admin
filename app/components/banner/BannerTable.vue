<script setup lang="ts">
import { ref } from "vue";
import type { Banner } from "~/types/banner";
import BannerPreviewModal from "./BannerPreviewModal.vue";
import notfoundAnim from "~/assets/animation/notfound.json";
import { Vue3Lottie } from "vue3-lottie";

defineProps<{
  banners: Banner[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "edit", banner: Banner): void;
  (e: "delete", banner: Banner): void;
  (e: "toggleStatus", banner: Banner): void;
}>();

const showPreviewModal = ref(false);
const bannerToPreview = ref<Banner | null>(null);

function openPreview(banner: Banner) {
  bannerToPreview.value = banner;
  showPreviewModal.value = true;
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th scope="col" class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Preview
            </th>
            <th scope="col" class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Nama Banner
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
            <tr v-for="n in 3" :key="'skeleton-' + n" class="animate-pulse">
              <td class="px-6 py-4">
                <div class="h-12 w-24 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              </td>
              <td class="px-6 py-4">
                <div class="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
              </td>
              <td class="px-6 py-4">
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

          <tr v-else-if="banners.length === 0">
            <td colspan="4" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center justify-center">
                <ClientOnly>
                  <Vue3Lottie :animationData="notfoundAnim" :height="180" :width="180" />
                </ClientOnly>
                <p class="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Belum ada data banner yang ditemukan.</p>
              </div>
            </td>
          </tr>

          <template v-else>
            <tr 
              v-for="banner in banners" 
              :key="banner.id" 
              class="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-700/50"
            >
              <td class="px-6 py-4 align-middle">
                <button
                  @click="openPreview(banner)"
                  class="relative block overflow-hidden rounded-lg shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  title="Klik untuk memperbesar"
                >
                  <img 
                    :src="banner.photoUrl" 
                    :alt="banner.name" 
                    class="h-12 w-24 object-cover" 
                    loading="lazy"
                  />
                  <div class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                    <Icon name="lucide:eye" class="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </button>
              </td>

              <td class="px-6 py-4 align-middle">
                <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ banner.name }}</div>
              </td>

              <td class="px-6 py-4 text-center align-middle">
                <button
                  @click="emit('toggleStatus', banner)"
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  :class="banner.isActive 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 focus:ring-green-500' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500'"
                  title="Klik untuk mengubah status"
                >
                  <span class="mr-1.5 h-1.5 w-1.5 rounded-full" :class="banner.isActive ? 'bg-green-500' : 'bg-gray-400'"></span>
                  {{ banner.isActive ? "Aktif" : "Nonaktif" }}
                </button>
              </td>

              <td class="px-6 py-4 text-right align-middle">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="emit('edit', banner)"
                    title="Edit Banner"
                    class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                  >
                    <Icon name="lucide:edit-2" class="h-4 w-4" />
                  </button>
                  <button
                    @click="emit('delete', banner)"
                    title="Hapus Banner"
                    class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
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

    <BannerPreviewModal 
      v-model="showPreviewModal" 
      :image-url="bannerToPreview?.photoUrl" 
      :banner-name="bannerToPreview?.name || null" 
    />
  </div>
</template>