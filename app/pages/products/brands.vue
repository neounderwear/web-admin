<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { Brand } from "~/types/brand";
import { useBrands } from "~/composables/useBrands";
import { useSearch } from "~/composables/useSearch"; // Import Fuse Search
import { usePageTitle } from "~/composables/usePageTitles";
import { useToast } from "~/composables/useToast";

// Components
import BrandTable from "~/components/brand/BrandTable.vue";
import BrandFormModal from "~/components/brand/BrandFormModal.vue";
import BrandDeleteModal from "~/components/brand/BrandDeleteModal.vue";
import Toast from "~/components/Toast.vue";

// --- SETUP ---
const pageTitle = usePageTitle();
const { showSuccess, showError } = useToast();

onMounted(() => {
  pageTitle.value = "Kelola Brand";
});

useHead({
  title: "Brand Produk",
});

// --- DATA FETCHING ---
const { 
  brands, 
  loading, 
  fetchBrands, 
  addBrand, 
  updateBrand, 
  toggleBrandStatus, 
  deleteBrand, 
  currentPage, 
  hasNextPage, 
  fetchNextPage, 
  fetchPrevPage,
  searchQuery: backendSearchQuery 
} = useBrands();

// --- SEARCH IMPLEMENTATION (Client-Side Fuse.js) ---
const { searchQuery: fuseSearchQuery, filteredData: displayedBrands } = useSearch(brands, {
  keys: ['name', 'description'],
  threshold: 0.3,
});

// --- STATE ---
const isFormModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedBrand = ref<Brand | null>(null);
const localSearch = ref("");

// Initialize
onMounted(() => {
  localSearch.value = "";
  fetchBrands();
});

// --- SEARCH LOGIC ---
function clearSearch() {
  localSearch.value = "";
  fuseSearchQuery.value = "";
}

watch(localSearch, (val) => {
  fuseSearchQuery.value = val;
  // Jika ingin menggunakan pencarian backend, uncomment baris di bawah:
  // backendSearchQuery.value = val;
});

// --- MODAL HANDLERS ---
function openAddModal() {
  selectedBrand.value = null;
  isFormModalOpen.value = true;
}

function openEditModal(brand: Brand) {
  selectedBrand.value = brand;
  isFormModalOpen.value = true;
}

function openDeleteModal(brand: Brand) {
  selectedBrand.value = brand;
  isDeleteModalOpen.value = true;
}

function closeFormModal() {
  isFormModalOpen.value = false;
  selectedBrand.value = null;
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false;
  selectedBrand.value = null;
}

// --- ACTION HANDLERS ---
async function handleSaveBrand(data: { name: string; description: string; isActive: boolean; file: File | null }) {
  // loading.value = true; // Optional: force UI loading
  try {
    if (selectedBrand.value) {
      await updateBrand(selectedBrand.value.id, { name: data.name, description: data.description, isActive: data.isActive }, data.file);
      showSuccess("Brand berhasil diperbarui!");
    } else {
      if (data.file) {
        await addBrand(data.name, data.description, data.isActive, data.file);
        showSuccess("Brand baru berhasil ditambahkan!");
      } else {
        throw new Error("File logo wajib diisi untuk brand baru.");
      }
    }
    closeFormModal();
  } catch (error) {
    showError(error);
  }
}

async function handleConfirmDelete() {
  if (!selectedBrand.value) return;
  // loading.value = true;
  try {
    await deleteBrand(selectedBrand.value);
    showSuccess("Brand berhasil dihapus.");
    closeDeleteModal();
  } catch (error) {
    showError(error);
  }
}

async function handleToggleStatus(brand: Brand) {
  try {
    await toggleBrandStatus(brand);
    // showSuccess(`Status brand ${brand.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
  } catch (error) {
    showError(error);
    await fetchBrands(); // Revert UI
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
            placeholder="Cari brand..." 
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
          Brand Baru
        </button>
      </div>
    </div>

    <BrandTable 
      :brands="displayedBrands" 
      :loading="loading" 
      @edit="openEditModal" 
      @delete="openDeleteModal" 
      @toggle-status="handleToggleStatus" 
    />

    <div v-if="!loading && (brands.length > 0 || currentPage > 1)" class="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 dark:border-gray-700 sm:flex-row">
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

    <BrandFormModal 
      v-model="isFormModalOpen" 
      :brand-to-edit="selectedBrand" 
      :loading="loading" 
      @save="handleSaveBrand" 
    />
    
    <BrandDeleteModal 
      v-model="isDeleteModalOpen" 
      :brand-name="selectedBrand?.name || ''" 
      :brand-description="selectedBrand?.description || ''" 
      :loading="loading" 
      @confirm="handleConfirmDelete" 
    />
    
    <Toast />
  </div>
</template>