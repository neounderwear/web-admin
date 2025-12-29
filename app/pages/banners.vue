<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Banner } from "~/types/banner";
import { useBanners } from "~/composables/useBanners";
import BannerFormModal from "~/components/banner/BannerFormModal.vue";
import BannerDeleteModal from "~/components/banner/BannerDeleteModal.vue";
import Toast from "~/components/Toast.vue";
import { usePageTitle } from "~/composables/usePageTitles";
import { useToast } from "~/composables/useToast";

const pageTitle = usePageTitle();
const { showSuccess, showError } = useToast();

onMounted(() => {
  pageTitle.value = "Kelola Banner";
});

useHead({
  title: "Banner",
});

const { banners, loading, fetchBanners, addBanner, updateBanner, toggleBannerStatus, deleteBanner, currentPage, hasNextPage, fetchNextPage, fetchPrevPage, searchQuery } = useBanners();

const isFormModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedBanner = ref<Banner | null>(null);

const localSearch = ref("");

onMounted(() => {
  localSearch.value = searchQuery.value;
  fetchBanners();
});

function handleSearch() {
  searchQuery.value = localSearch.value;
  fetchBanners();
}

function clearSearch() {
  localSearch.value = "";
  searchQuery.value = "";
  fetchBanners();
}

function openAddModal() {
  selectedBanner.value = null;
  isFormModalOpen.value = true;
}

function openEditModal(banner: Banner) {
  selectedBanner.value = banner;
  isFormModalOpen.value = true;
}

function closeFormModal() {
  isFormModalOpen.value = false;
  selectedBanner.value = null;
}

async function handleSaveBanner(data: { name: string; isActive: boolean; file: File | null }) {
  loading.value = true;
  try {
    if (selectedBanner.value) {
      await updateBanner(selectedBanner.value.id, { name: data.name, isActive: data.isActive }, data.file);
    } else {
      if (data.file) {
        await addBanner(data.name, data.isActive, data.file);
      } else {
        throw new Error("File foto wajib diisi untuk banner baru.");
      }
    }
    localSearch.value = "";
    showSuccess("Banner berhasil disimpan!");
    closeFormModal();
  } catch (error) {
    showError(error);
  } finally {
    loading.value = false;
  }
}

function openDeleteModal(banner: Banner) {
  selectedBanner.value = banner;
  isDeleteModalOpen.value = true;
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false;
  selectedBanner.value = null;
}

async function handleConfirmDelete() {
  if (!selectedBanner.value) return;

  loading.value = true;
  try {
    await deleteBanner(selectedBanner.value);
    localSearch.value = "";
    showSuccess("Banner berhasil dihapus.");
    closeDeleteModal();
  } catch (error) {
    showError(error);
  } finally {
    loading.value = false;
  }
}

async function handleToggleStatus(banner: Banner) {
  try {
    await toggleBannerStatus(banner);
  } catch (error) {
    showError(error);
    await fetchBanners();
  }
}

let searchTimeout: NodeJS.Timeout;

watch(localSearch, (val) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery.value = val;
    fetchBanners();
  }, 300);
});
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
      <div class="relative w-full max-w-sm">
        <input v-model="localSearch" type="text" placeholder="Cari banner" class="form-input" />

        <button
          @click="handleSearch"
          type="button"
          aria-label="Cari"
          class="absolute inset-y-0 left-0 flex items-center rounded-l-md pl-3 text-dark/60 transition-colors hover:text-dark focus:outline-none dark:text-base/70 dark:hover:text-base"
        >
          <Icon name="lucide:search" class="h-4 w-4" />
        </button>

        <button
          v-if="localSearch"
          @click="clearSearch"
          type="button"
          aria-label="Hapus pencarian"
          class="absolute inset-y-0 right-0 flex items-center rounded-r-md pr-3 text-dark/60 transition-colors hover:text-dark focus:outline-none dark:text-base/70 dark:hover:text-base"
        >
          <Icon name="lucide:x" class="h-4 w-4" />
        </button>
      </div>
      <div class="flex justify-end mb-4">
        <button
          @click="openAddModal"
          class="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-in-out-smooth hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <Icon name="lucide:plus" class="mr-2 h-5 w-5" />
          Banner Baru
        </button>
      </div>
    </div>

    <BannerTable :banners="banners" :loading="loading" @edit="openEditModal" @delete="openDeleteModal" @toggle-status="handleToggleStatus" />

    <div v-if="!loading && (banners.length > 0 || currentPage > 1)" class="mt-4 flex items-center justify-between">
      <div>
        <span class="text-sm text-muted dark:text-gray-400"> Halaman {{ currentPage }} </span>
      </div>
      <div class="flex space-x-3">
        <button
          @click="fetchPrevPage"
          :disabled="currentPage <= 1 || loading"
          class="inline-flex items-center rounded-md border border-muted/50 bg-white px-4 py-2 text-sm font-medium text-dark/80 shadow-sm transition-all hover:bg-secondary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-muted/30 dark:bg-gray-800 dark:text-base/80 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
        >
          <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
          Previous
        </button>
        <button
          @click="fetchNextPage"
          :disabled="!hasNextPage || loading"
          class="inline-flex items-center rounded-md border border-muted/50 bg-white px-4 py-2 text-sm font-medium text-dark/80 shadow-sm transition-all hover:bg-secondary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-muted/30 dark:bg-gray-800 dark:text-base/80 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
        >
          Next
          <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>

    <BannerFormModal v-model="isFormModalOpen" :banner-to-edit="selectedBanner" :loading="loading" @save="handleSaveBanner" />
    <BannerDeleteModal v-model="isDeleteModalOpen" :banner-name="selectedBanner?.name || ''" :loading="loading" @confirm="handleConfirmDelete" />
    <Toast />
  </div>
</template>
