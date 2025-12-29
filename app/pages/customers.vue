<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { Customer } from "~/types/customer";
import { useCustomers } from "~/composables/useCustomers";
import { usePageTitle } from "~/composables/usePageTitles";
import { useToast } from "~/composables/useToast";

// Components
import CustomerTable from "~/components/customer/CustomerTable.vue";
import CustomerFormModal from "~/components/customer/CustomerFormModal.vue";
import CustomerDeleteModal from "~/components/customer/CustomerDeleteModal.vue";
import Toast from "~/components/Toast.vue";

const pageTitle = usePageTitle();
const { showSuccess, showError } = useToast();

onMounted(() => {
  pageTitle.value = "Manajemen Pelanggan";
});

useHead({ title: "Pelanggan" });

const { customers, loading, fetchCustomers, addCustomer, updateCustomer, deleteCustomer, currentPage, hasNextPage, fetchNextPage, fetchPrevPage, searchQuery } = useCustomers();

const isFormModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedCustomer = ref<Customer | null>(null);
const localSearch = ref("");

onMounted(() => {
  localSearch.value = searchQuery.value;
  fetchCustomers();
});

// --- Search Logic ---
function clearSearch() {
  localSearch.value = "";
  // watch akan handle fetch
}

let searchTimeout: NodeJS.Timeout;
watch(localSearch, (val) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery.value = val;
    fetchCustomers();
  }, 400);
});

// --- Modal Logic ---
function openAddModal() {
  selectedCustomer.value = null;
  isFormModalOpen.value = true;
}

function openEditModal(customer: Customer) {
  selectedCustomer.value = customer;
  isFormModalOpen.value = true;
}

function openDeleteModal(customer: Customer) {
  selectedCustomer.value = customer;
  isDeleteModalOpen.value = true;
}

// --- Handlers ---
async function handleSaveCustomer(data: { name: string; email: string; phone: string }) {
  loading.value = true;
  try {
    if (selectedCustomer.value) {
      await updateCustomer(selectedCustomer.value.id, data);
      showSuccess("Data pelanggan diperbarui.");
    } else {
      await addCustomer(data);
      showSuccess("Pelanggan baru ditambahkan.");
    }
    isFormModalOpen.value = false;
  } catch (e) {
    showError(e);
  } finally {
    loading.value = false;
  }
}

async function handleConfirmDelete() {
  if (!selectedCustomer.value) return;
  loading.value = true;
  try {
    await deleteCustomer(selectedCustomer.value.id);
    showSuccess("Pelanggan dihapus.");
    isDeleteModalOpen.value = false;
  } catch (e) {
    showError(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="relative w-full md:max-w-sm">
        <input v-model="localSearch" type="text" placeholder="Cari nama pelanggan" class="form-input" />
        <Icon name="lucide:search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <button v-if="localSearch" @click="clearSearch" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark">
          <Icon name="lucide:x" class="h-4 w-4" />
        </button>
      </div>

      <button @click="openAddModal" class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90">
        <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
        Pelanggan Baru
      </button>
    </div>

    <CustomerTable :customers="customers" :loading="loading" @edit="openEditModal" @delete="openDeleteModal" />

    <div v-if="!loading && (customers.length > 0 || currentPage > 1)" class="mt-4 flex items-center justify-between">
      <span class="text-sm text-muted">Halaman {{ currentPage }}</span>
      <div class="flex space-x-2">
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

    <CustomerFormModal v-model="isFormModalOpen" :customer-to-edit="selectedCustomer" :loading="loading" @save="handleSaveCustomer" />

    <CustomerDeleteModal v-model="isDeleteModalOpen" :customer-name="selectedCustomer?.name || ''" :loading="loading" @confirm="handleConfirmDelete" />

    <Toast />
  </div>
</template>
