<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { Banner } from "~/types/banner";
import { useBanners } from "~/composables/useBanners";
import { useSearch } from "~/composables/useSearch"; 
import BannerFormModal from "~/components/banner/BannerFormModal.vue";
import BannerDeleteModal from "~/components/banner/BannerDeleteModal.vue";
import Toast from "~/components/Toast.vue";
import { usePageTitle } from "~/composables/usePageTitles";
import { useToast } from "~/composables/useToast";

// --- SETUP ---
const pageTitle = usePageTitle();
const { showSuccess, showError } = useToast();

onMounted(() => {
  pageTitle.value = "Kelola Banner";
});

useHead({
  title: "Manajemen Banner",
});

// --- DATA FETCHING ---
const { 
  banners, 
  loading, 
  fetchBanners, 
  addBanner, 
  updateBanner, 
  toggleBannerStatus, 
  deleteBanner, 
  currentPage, 
  hasNextPage, 
  fetchNextPage, 
  fetchPrevPage, 
} = useBanners();

// --- SEARCH IMPLEMENTATION (Client-Side Fuse.js) ---
const { searchQuery: fuseSearchQuery, filteredData: displayedBanners } = useSearch(banners, {
  keys: ['name'],
  threshold: 0.3,
});

// --- STATE ---
const isFormModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedBanner = ref<Banner | null>(null);
const localSearch = ref("");

// Initialize
onMounted(() => {
  localSearch.value = "";
  fetchBanners();
});

// --- SEARCH LOGIC ---
function clearSearch() {
  localSearch.value = "";
  fuseSearchQuery.value = "";
}

// Watch local search input to update Fuse search query
watch(localSearch, (val) => {
  fuseSearchQuery.value = val;
});

// --- MODAL HANDLERS ---
function openAddModal() {
  selectedBanner.value = null;
  isFormModalOpen.value = true;
}

function openEditModal(banner: Banner) {
  selectedBanner.value = banner;
  isFormModalOpen.value = true;
}

function openDeleteModal(banner: Banner) {
  selectedBanner.value = banner;
  isDeleteModalOpen.value = true;
}

function closeFormModal() {
  isFormModalOpen.value = false;
  selectedBanner.value = null;
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false;
  selectedBanner.value = null;
}

// --- ACTION HANDLERS ---
async function handleSaveBanner(data: { name: string; isActive: boolean; file: File | null }) {
  // loading.value = true; // useBanners usually handles its own loading state, but we can force UI loading if needed
  try {
    if (selectedBanner.value) {
      await updateBanner(selectedBanner.value.id, { name: data.name, isActive: data.isActive }, data.file);
      showSuccess("Banner berhasil diperbarui!");
    } else {
      if (data.file) {
        await addBanner(data.name, data.isActive, data.file);
        showSuccess("Banner baru berhasil dibuat!");
      } else {
        throw new Error("File foto wajib diisi untuk banner baru.");
      }
    }
    closeFormModal();
  } catch (error) {
    showError(error);
  }
}

async function handleConfirmDelete() {
  if (!selectedBanner.value) return;
  try {
    await deleteBanner(selectedBanner.value);
    showSuccess("Banner berhasil dihapus.");
    closeDeleteModal();
  } catch (error) {
    showError(error);
  }
}

async function handleToggleStatus(banner: Banner) {
  try {
    await toggleBannerStatus(banner);
    // Optional: showSuccess("Status banner diubah");
  } catch (error) {
    showError(error);
    await fetchBanners(); // Revert UI on error
  }
}
</script>

<template>
  <div class="container mx-auto p-4 sm:p-6 max-w-7xl">
    
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      
      <div class="relative w-full sm:max-w-xs">
        <div class="relative">
          <input 
            v-model="localSearch" 
            type="text" 
            placeholder="Cari banner..." 
            class="w-full rounded-lg border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm transition-all focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400" 
          />
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Icon name="lucide:search" class="h-4 w-4" />
          </div>

          <button
            v-if="localSearch"
            @click="clearSearch"
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <Icon name="lucide:x" class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <button
          @click="openAddModal"
          class="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:w-auto"
        >
          <Icon name="lucide:plus" class="mr-2 h-5 w-5" />
          Banner Baru
        </button>
      </div>
    </div>

    <BannerTable 
      :banners="displayedBanners" 
      :loading="loading" 
      @edit="openEditModal" 
      @delete="openDeleteModal" 
      @toggle-status="handleToggleStatus" 
    />

    <div v-if="!loading && (banners.length > 0 || currentPage > 1)" class="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 dark:border-gray-700 sm:flex-row">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        Halaman <span class="font-medium text-gray-900 dark:text-white">{{ currentPage }}</span>
      </div>
      
      <div class="flex items-center gap-2">
        <button
          @click="fetchPrevPage"
          :disabled="currentPage <= 1 || loading"
          class="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Icon name="lucide:chevron-left" class="mr-1 h-4 w-4" />
          Sebelumnya
        </button>
        
        <button
          @click="fetchNextPage"
          :disabled="!hasNextPage || loading"
          class="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Berikutnya
          <Icon name="lucide:chevron-right" class="ml-1 h-4 w-4" />
        </button>
      </div>
    </div>

    <BannerFormModal 
      v-model="isFormModalOpen" 
      :banner-to-edit="selectedBanner" 
      :loading="loading" 
      @save="handleSaveBanner" 
    />
    
    <BannerDeleteModal 
      v-model="isDeleteModalOpen" 
      :banner-name="selectedBanner?.name || ''" 
      :loading="loading" 
      @confirm="handleConfirmDelete" 
    />
    
    <Toast />
  </div>
</template>