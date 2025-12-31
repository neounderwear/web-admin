<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { Order } from "~/types/order";
import { useSearch } from "~/composables/useSearch";
import { usePageTitle } from "~/composables/usePageTitles";
import { useToast } from "~/composables/useToast";
import OrderTable from "~/components/order/OrderTable.vue";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNuxtApp } from "#app";

// --- SETUP ---
const pageTitle = usePageTitle();
const { showError } = useToast();
const { $firestore } = useNuxtApp();

onMounted(() => {
  pageTitle.value = "Pesanan Masuk";
});

useHead({ title: "Pesanan" });

// --- STATE ---
const isLoading = ref(true);
const allOrders = ref<Order[]>([]); 
const localSearch = ref("");

// --- SEARCH CANGGIH (FUSE.JS) ---
const { searchQuery: fuseQuery, filteredData: displayedOrders } = useSearch(allOrders, {
  keys: [
    'id', 
    'customerName', 
    'customerEmail', 
    'shipping.trackingNumber'
  ],
  threshold: 0.3,
});

// --- LOAD DATA ---
onMounted(() => {
  fetchAllOrders();
});

async function fetchAllOrders() {
  isLoading.value = true;
  try {
    const q = query(collection($firestore, "orders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    
    allOrders.value = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
      };
    }) as Order[];
    
  } catch (e) {
    console.error("Gagal load order:", e);
    showError("Gagal memuat data pesanan");
  } finally {
    isLoading.value = false;
  }
}

// --- SEARCH LOGIC ---
function clearSearch() {
  localSearch.value = "";
  fuseQuery.value = ""; 
}

watch(localSearch, (val) => {
  fuseQuery.value = val; 
});
</script>

<template>
  <div class="container mx-auto p-4 sm:p-6 max-w-7xl">
    
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      
      <div class="relative w-full sm:max-w-md">
        <div class="relative">
          <input 
            v-model="localSearch" 
            type="text" 
            placeholder="Cari ID, Nama, Email, atau Resi..." 
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
        <NuxtLink 
          to="/orders/add" 
          class="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:w-auto"
        >
          <Icon name="lucide:plus" class="mr-2 h-5 w-5" />
          Buat Pesanan Baru
        </NuxtLink>
      </div>
    </div>

    <OrderTable :orders="displayedOrders" :loading="isLoading" />

    <div v-if="!isLoading" class="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
       <span>Menampilkan <span class="font-medium text-gray-900 dark:text-white">{{ displayedOrders.length }}</span> dari total <span class="font-medium text-gray-900 dark:text-white">{{ allOrders.length }}</span> pesanan.</span>
    </div>

  </div>
</template>