<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useOrders } from "~/composables/useOrders";
import { usePageTitle } from "~/composables/usePageTitles";
import OrderTable from "~/components/order/OrderTable.vue";

const pageTitle = usePageTitle();
onMounted(() => {
  pageTitle.value = "Pesanan Masuk";
});
useHead({ title: "Pesanan" });

const { orders, loading, fetchOrders, currentPage, hasNextPage, fetchNextPage, fetchPrevPage, searchQuery } = useOrders();

const localSearch = ref("");

onMounted(() => {
  fetchOrders();
});

// Search Debounce
let searchTimeout: NodeJS.Timeout;
watch(localSearch, (val) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery.value = val;
    fetchOrders();
  }, 400);
});
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="relative w-full md:max-w-sm">
        <input v-model="localSearch" type="text" placeholder="Cari ID pesanan atau nama pelanggan" class="form-input" />
        <Icon name="lucide:search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </div>

      <NuxtLink to="/orders/add" class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
        <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
        Buat Pesanan Baru
      </NuxtLink>
    </div>

    <OrderTable :orders="orders" :loading="loading" />

    <div v-if="!loading && (orders.length > 0 || currentPage > 1)" class="mt-4 flex items-center justify-between">
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
  </div>
</template>
