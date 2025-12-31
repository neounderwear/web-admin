<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { Category } from "~/types/category";
import { useCategories } from "~/composables/useCategories";
import { useSearch } from "~/composables/useSearch"; // Import Fuse Search
import { usePageTitle } from "~/composables/usePageTitles";
import { useToast } from "~/composables/useToast";

// Components
import CategoryTable from "~/components/category/CategoryTable.vue";
import CategoryFormModal from "~/components/category/CategoryFormModal.vue";
import CategoryDeleteModal from "~/components/category/CategoryDeleteModal.vue";
import Toast from "~/components/Toast.vue";

// --- SETUP ---
const pageTitle = usePageTitle();
const { showSuccess, showError } = useToast();

onMounted(() => {
  pageTitle.value = "Kelola Kategori";
});

useHead({
  title: "Kategori Produk",
});

// --- DATA FETCHING ---
const { 
  categories, 
  loading, 
  fetchCategories, 
  addCategory, 
  updateCategory, 
  toggleCategoryStatus, 
  deleteCategory, 
  currentPage, 
  hasNextPage, 
  fetchNextPage, 
  fetchPrevPage,
  searchQuery: backendSearchQuery 
} = useCategories();

// --- SEARCH IMPLEMENTATION (Client-Side Fuse.js) ---
const { searchQuery: fuseSearchQuery, filteredData: displayedCategories } = useSearch(categories, {
  keys: ['name', 'description'],
  threshold: 0.3,
});

// --- STATE ---
const isFormModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedCategory = ref<Category | null>(null);
const localSearch = ref("");

// Initialize
onMounted(() => {
  localSearch.value = "";
  fetchCategories();
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
  selectedCategory.value = null;
  isFormModalOpen.value = true;
}

function openEditModal(category: Category) {
  selectedCategory.value = category;
  isFormModalOpen.value = true;
}

function openDeleteModal(category: Category) {
  selectedCategory.value = category;
  isDeleteModalOpen.value = true;
}

function closeFormModal() {
  isFormModalOpen.value = false;
  selectedCategory.value = null;
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false;
  selectedCategory.value = null;
}

// --- ACTION HANDLERS ---
async function handleSaveCategory(data: { name: string; description: string; isActive: boolean }) {
  // loading.value = true; // Optional: force UI loading
  try {
    if (selectedCategory.value) {
      await updateCategory(selectedCategory.value.id, data);
      showSuccess("Kategori berhasil diperbarui!");
    } else {
      await addCategory(data.name, data.description, data.isActive);
      showSuccess("Kategori baru berhasil dibuat!");
    }
    closeFormModal();
  } catch (e) {
    showError(e);
  }
}

async function handleConfirmDelete() {
  if (!selectedCategory.value) return;
  // loading.value = true;
  try {
    await deleteCategory(selectedCategory.value);
    showSuccess("Kategori berhasil dihapus.");
    closeDeleteModal();
  } catch (e) {
    showError(e);
  }
}

async function handleToggleStatus(category: Category) {
  try {
    await toggleCategoryStatus(category);
    // showSuccess(`Status kategori ${category.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
  } catch (e) {
    showError(e);
    await fetchCategories(); // Revert UI
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
            placeholder="Cari kategori..." 
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
          Kategori Baru
        </button>
      </div>
    </div>

    <CategoryTable 
      :categories="displayedCategories" 
      :loading="loading" 
      @edit="openEditModal" 
      @delete="openDeleteModal" 
      @toggle-status="handleToggleStatus" 
    />

    <div v-if="!loading && (categories.length > 0 || currentPage > 1)" class="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 dark:border-gray-700 sm:flex-row">
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

    <CategoryFormModal 
      v-model="isFormModalOpen" 
      :category-to-edit="selectedCategory" 
      :loading="loading" 
      @save="handleSaveCategory" 
    />
    
    <CategoryDeleteModal 
      v-model="isDeleteModalOpen" 
      :category-name="selectedCategory?.name || ''" 
      :loading="loading" 
      @confirm="handleConfirmDelete" 
    />
    
    <Toast />
  </div>
</template>