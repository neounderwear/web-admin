<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { Customer } from "~/types/customer";
import { useCustomers } from "~/composables/useCustomers";
import { useSearch } from "~/composables/useSearch"; 
import { usePageTitle } from "~/composables/usePageTitles";
import { useToast } from "~/composables/useToast";

// Components
import CustomerTable from "~/components/customer/CustomerTable.vue";
import CustomerFormModal from "~/components/customer/CustomerFormModal.vue";
import CustomerDeleteModal from "~/components/customer/CustomerDeleteModal.vue";
import Toast from "~/components/Toast.vue";

// --- SETUP ---
const pageTitle = usePageTitle();
const { showSuccess, showError } = useToast();

onMounted(() => {
  pageTitle.value = "Manajemen Pelanggan";
});

useHead({ title: "Pelanggan" });

// --- DATA FETCHING ---
const { 
  customers, 
  loading, 
  fetchCustomers, 
  addCustomer, 
  updateCustomer, 
  deleteCustomer, 
  currentPage, 
  hasNextPage, 
  fetchNextPage, 
  fetchPrevPage, 
} = useCustomers();

// --- SEARCH IMPLEMENTATION (Client-Side Fuse.js) ---
const { searchQuery: fuseSearchQuery, filteredData: displayedCustomers } = useSearch(customers, {
  keys: ['name', 'email', 'phone'], // Pencarian berdasarkan Nama, Email, dan No HP
  threshold: 0.3,
});

// --- STATE ---
const isFormModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedCustomer = ref<Customer | null>(null);
const localSearch = ref("");

onMounted(() => {
  localSearch.value = "";
  fetchCustomers();
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

// --- ACTION HANDLERS ---
async function handleSaveCustomer(data: { name: string; email: string; phone: string }) {
  // loading.value = true; // Optional: handle manual loading if useCustomers doesn't cover it
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
  }
}

async function handleConfirmDelete() {
  if (!selectedCustomer.value) return;
  try {
    await deleteCustomer(selectedCustomer.value.id);
    showSuccess("Pelanggan dihapus.");
    isDeleteModalOpen.value = false;
  } catch (e) {
    showError(e);
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
            placeholder="Cari nama, email, hp..." 
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
          Pelanggan Baru
        </button>
      </div>
    </div>

    <CustomerTable 
      :customers="displayedCustomers" 
      :loading="loading" 
      @edit="openEditModal" 
      @delete="openDeleteModal" 
    />

    <div v-if="!loading && (customers.length > 0 || currentPage > 1)" class="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 dark:border-gray-700 sm:flex-row">
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

    <CustomerFormModal 
      v-model="isFormModalOpen" 
      :customer-to-edit="selectedCustomer" 
      :loading="loading" 
      @save="handleSaveCustomer" 
    />

    <CustomerDeleteModal 
      v-model="isDeleteModalOpen" 
      :customer-name="selectedCustomer?.name || ''" 
      :loading="loading" 
      @confirm="handleConfirmDelete" 
    />

    <Toast />
  </div>
</template>