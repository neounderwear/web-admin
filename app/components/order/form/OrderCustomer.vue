<script setup lang="ts">
import { ref, watch } from "vue";
import { useCustomers } from "~/composables/useCustomers";
import type { Customer } from "~/types/customer";

const selectedCustomer = defineModel<Customer | null>();

const { customers, fetchCustomers, searchQuery, loading } = useCustomers();
const showDropdown = ref(false);

// Search handler
let timeout: NodeJS.Timeout;
const onSearch = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  searchQuery.value = val;
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    fetchCustomers();
    showDropdown.value = true;
  }, 300);
};

const selectCustomer = (cust: Customer) => {
  selectedCustomer.value = cust;
  showDropdown.value = false;
  searchQuery.value = ""; // Reset search
};

const removeCustomer = () => {
  selectedCustomer.value = null;
};
</script>

<template>
  <div class="rounded-lg border border-muted/30 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
    <h3 class="mb-4 text-lg font-bold text-dark dark:text-white flex items-center gap-2">
      <Icon name="lucide:user" class="h-5 w-5 text-primary" />
      Data Pelanggan
    </h3>

    <div v-if="selectedCustomer" class="relative flex items-start gap-4 rounded-md border border-primary/20 bg-primary/5 p-4">
      <div class="h-10 w-10 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
        {{ selectedCustomer.name.charAt(0) }}
      </div>
      <div class="flex-1">
        <p class="font-bold text-dark dark:text-white">{{ selectedCustomer.name }}</p>
        <p class="text-sm text-muted">{{ selectedCustomer.email }}</p>
        <p class="text-sm text-muted">{{ selectedCustomer.phone }}</p>
      </div>
      <button @click="removeCustomer" class="text-red-500 hover:text-red-700">
        <Icon name="lucide:x" class="h-5 w-5" />
      </button>
    </div>

    <div v-else class="relative">
      <input
        type="text"
        placeholder="Cari nama pelanggan..."
        class="w-full rounded-md border-muted/50 bg-gray-50 px-4 py-2.5 pl-10 text-sm focus:border-primary focus:ring-primary dark:bg-gray-900"
        @input="onSearch"
        @focus="showDropdown = true"
      />
      <Icon name="lucide:search" class="absolute left-3 top-3 h-4 w-4 text-muted" />

      <div v-if="showDropdown && searchQuery" class="absolute z-10 mt-1 w-full rounded-md border border-muted/20 bg-white shadow-lg dark:bg-gray-800">
        <div v-if="loading" class="p-3 text-center text-sm text-muted">Mencari...</div>
        <div v-else-if="customers.length === 0" class="p-3 text-center text-sm text-muted">Tidak ditemukan. <NuxtLink to="/customers" class="text-primary hover:underline">Buat Baru?</NuxtLink></div>
        <ul v-else class="max-h-60 overflow-auto py-1">
          <li v-for="cust in customers" :key="cust.id" @click="selectCustomer(cust)" class="cursor-pointer px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
            <p class="text-sm font-medium text-dark dark:text-white">{{ cust.name }}</p>
            <p class="text-xs text-muted">{{ cust.email }} • {{ cust.phone }}</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
