<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { Product } from "~/types/product";
import { useProducts } from "~/composables/useProducts";
import { useSearch } from "~/composables/useSearch"; 
import ProductTable from "~/components/product/ProductTable.vue";
import ProductDeleteModal from "~/components/product/ProductDeleteModal.vue";
import Toast from "~/components/Toast.vue";
import { usePageTitle } from "~/composables/usePageTitles";
import { useToast } from "~/composables/useToast";
import { useRouter } from "vue-router";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNuxtApp } from "#app";

// --- SETUP ---
const pageTitle = usePageTitle();
const { showSuccess, showError } = useToast();
const router = useRouter();
const { $firestore } = useNuxtApp();

onMounted(() => {
  pageTitle.value = "Kelola Produk";
});

useHead({
  title: "Produk",
});

const { 
  loading: composableLoading, 
  toggleProductStatus, 
  deleteProduct, 
} = useProducts();

// --- STATE ---
const allProducts = ref<Product[]>([]);
const isLoading = ref(true);
const localSearch = ref("");
const isDeleteModalOpen = ref(false);
const selectedProduct = ref<Product | null>(null);

// --- SEARCH ENGINE (FUSE.JS) ---
const { searchQuery: fuseQuery, filteredData: displayedProducts } = useSearch(allProducts, {
  keys: ['name', 'sku', 'category', 'brand'],
  threshold: 0.3,
});

// --- LOAD DATA ---
onMounted(() => {
  fetchAllProducts();
});

async function fetchAllProducts() {
  isLoading.value = true;
  try {
    const q = query(collection($firestore, "products"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    
    allProducts.value = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    
  } catch (e) {
    console.error("Gagal load produk:", e);
    showError("Gagal memuat data produk");
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

// --- ACTIONS ---
function goToAddPage() { router.push("/products/new"); }
function goToEditPage(product: Product) { router.push(`/products/${product.id}/edit`); }

function openDeleteModal(product: Product) {
  selectedProduct.value = product;
  isDeleteModalOpen.value = true;
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false;
  selectedProduct.value = null;
}

async function handleConfirmDelete() {
  if (!selectedProduct.value) return;
  isLoading.value = true;
  try {
    await deleteProduct(selectedProduct.value);
    // Update local state agar tidak perlu fetch ulang
    allProducts.value = allProducts.value.filter(p => p.id !== selectedProduct.value?.id);
    showSuccess("Produk berhasil dihapus.");
    closeDeleteModal();
  } catch (error) {
    showError(error);
  } finally {
    isLoading.value = false;
  }
}

async function handleToggleStatus(product: Product) {
  try {
    await toggleProductStatus(product);
  } catch (error) {
    showError("Gagal mengubah status produk");
  }
}
</script>

<template>
  <div class="container mx-auto p-4 sm:p-6 max-w-7xl">
    
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      
      <div class="relative w-full sm:max-w-md">
        <div class="relative">
          <input 
            v-model="localSearch" 
            type="text" 
            placeholder="Cari nama, SKU, kategori..." 
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
          @click="goToAddPage" 
          class="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:w-auto"
        >
          <Icon name="lucide:plus" class="mr-2 h-5 w-5" />
          Produk Baru
        </button>
      </div>
    </div>

    <ProductTable 
      :products="displayedProducts" 
      :loading="isLoading" 
      @edit="goToEditPage" 
      @delete="openDeleteModal" 
      @toggle-status="handleToggleStatus" 
    />

    <div v-if="!isLoading" class="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
       <span>Menampilkan <span class="font-medium text-gray-900 dark:text-white">{{ displayedProducts.length }}</span> dari total <span class="font-medium text-gray-900 dark:text-white">{{ allProducts.length }}</span> produk.</span>
    </div>

    <ProductDeleteModal 
      v-model="isDeleteModalOpen" 
      :product-name="selectedProduct?.name || ''" 
      :loading="isLoading" 
      @confirm="handleConfirmDelete" 
    />
    
    <Toast />
  </div>
</template>