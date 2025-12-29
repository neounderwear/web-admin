<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { Category } from "~/types/category";
import { useCategories } from "~/composables/useCategories";
import CategoryFormModal from "~/components/category/CategoryFormModal.vue";
import CategoryDeleteModal from "~/components/category/CategoryDeleteModal.vue";
import Toast from "~/components/Toast.vue";
import { usePageTitle } from "~/composables/usePageTitles";
import { useToast } from "~/composables/useToast";
import CategoryTable from "~/components/category/CategoryTable.vue";

const pageTitle = usePageTitle();

const { showSuccess, showError } = useToast();

onMounted(() => {
  pageTitle.value = "Kelola Kategori";
});

useHead({
  title: "Kategori",
});

const { categories, loading, fetchCategories, addCategory, updateCategory, toggleCategoryStatus, deleteCategory, currentPage, hasNextPage, fetchNextPage, fetchPrevPage, searchQuery } = useCategories();

const isFormModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedCategory = ref<Category | null>(null);

const localSearch = ref("");

onMounted(() => {
  localSearch.value = searchQuery.value;
  fetchCategories();
});

function clearSearch() {
  localSearch.value = "";
}

function openAddModal() {
  selectedCategory.value = null;
  isFormModalOpen.value = true;
}

function openEditModal(category: Category) {
  selectedCategory.value = category;
  isFormModalOpen.value = true;
}

function closeFormModal() {
  isFormModalOpen.value = false;
  selectedCategory.value = null;
}

async function handleSaveCategory(data: { name: string; description: string; isActive: boolean }) {
  loading.value = true;

  try {
    if (selectedCategory.value) {
      await updateCategory(selectedCategory.value.id, { name: data.name, description: data.description, isActive: data.isActive });
    } else {
      await addCategory(data.name, data.description, data.isActive);
    }
    localSearch.value = "";
    showSuccess("Kategori berhasil disimpan!");
    closeFormModal();
  } catch (e) {
    showError(e);
  } finally {
    loading.value = false;
  }
}

function openDeleteModal(category: Category) {
  selectedCategory.value = category;
  isDeleteModalOpen.value = true;
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false;
  selectedCategory.value = null;
}

async function handleConfirmDelete() {
  if (!selectedCategory.value) return;
  loading.value = true;
  try {
    await deleteCategory(selectedCategory.value);
    localSearch.value = "";
    showSuccess("Kategori berhasil dihapus.");
    closeDeleteModal();
  } catch (e) {
    showError(e);
  } finally {
    loading.value = false;
  }
}

async function handleToggleStatus(category: Category) {
  try {
    await toggleCategoryStatus(category);
  } catch (e) {
    showError(e);
    await fetchCategories();
  }
}

let searchTimeout: NodeJS.Timeout;

watch(localSearch, (val) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery.value = val;
    fetchCategories();
  }, 300);
});
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="mb-4 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div class="relative w-full md:max-w-sm">
        <input v-model="localSearch" type="text" placeholder="Cari kategori" class="form-input" />

        <button type="button" aria-label="Cari" class="absolute inset-y-0 left-0 flex items-center rounded-l-md pl-3 text-dark/60 focus:outline-none dark:text-base/70">
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
      <div class="flex w-full justify-end md:w-auto">
        <button
          @click="openAddModal"
          class="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-in-out-smooth hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <Icon name="lucide:plus" class="mr-2 h-5 w-5" />
          Kategori Baru
        </button>
      </div>
    </div>

    <CategoryTable :categories="categories" :loading="loading" @edit="openEditModal" @delete="openDeleteModal" @toggle-status="handleToggleStatus" />

    <div v-if="!loading && (categories.length > 0 || currentPage > 1)" class="mt-4 flex items-center justify-between">
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

    <CategoryFormModal v-model="isFormModalOpen" :category-to-edit="selectedCategory" :loading="loading" @save="handleSaveCategory" />
    <CategoryDeleteModal v-model="isDeleteModalOpen" :category-name="selectedCategory?.name || ''" :loading="loading" @confirm="handleConfirmDelete" />
    <Toast />
  </div>
</template>
