<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useSearch } from "~/composables/useSearch"; 
import type { Product, ProductVariantValue } from "~/types/product";
import type { OrderItem } from "~/types/order";
import { collection, getDocs } from "firebase/firestore"; // Hapus query kompleks untuk hindari error index
import { useNuxtApp } from "#app";

// Model Cart dari Parent (add.vue)
const cart = defineModel<OrderItem[]>({ required: true });

const { $firestore } = useNuxtApp();

// --- STATE DATA ---
const allProducts = ref<Product[]>([]);
const loadingProducts = ref(false);

// --- CLIENT-SIDE SEARCH (FUSE.JS) ---
const { searchQuery, filteredData: displayedProducts } = useSearch(allProducts, {
  keys: ['name', 'sku', 'brand', 'category'],
  threshold: 0.3,
});

// --- COMPUTED: HASIL AKHIR ---
// Logic: Jika search kosong, tampilkan 10 produk teratas. Jika ada ketikan, pakai hasil Fuse.js
const finalList = computed(() => {
  if (!searchQuery.value) {
    return allProducts.value.slice(0, 20); // Tampilkan 20 produk pertama saat kosong
  }
  return displayedProducts.value;
});

// --- UI STATE ---
const showDropdown = ref(false);
const showVariantModal = ref(false);
const tempProduct = ref<Product | null>(null);
const selectedVariantOptions = ref<Record<string, ProductVariantValue>>({});

// --- LOAD DATA ---
onMounted(async () => {
  loadingProducts.value = true;
  try {
    // 1. Ambil SEMUA data tanpa filter 'where'/'orderBy' (hindari error index firestore)
    const snap = await getDocs(collection($firestore, "products"));
    
    // 2. Mapping & Sorting Client-Side (Terbaru di atas)
    const rawData = snap.docs.map(doc => {
        const d = doc.data();
        return { 
            id: doc.id, 
            ...d 
        } as Product;
    });

    // Sort manual: CreatedAt desc (pastikan field createdAt ada, jika tidak pakai fallback)
    allProducts.value = rawData.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA; 
    });
    
    console.log("OrderCart: Loaded", allProducts.value.length, "products");
    
  } catch (e) {
    console.error("Gagal load produk cart:", e);
    alert("Gagal memuat data produk. Cek koneksi internet.");
  } finally {
    loadingProducts.value = false;
  }
});

// --- UI HANDLERS ---
const onFocusSearch = () => {
  showDropdown.value = true;
};

const closeDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};

// --- LOGIC MEMILIH PRODUK ---
const initiateAddToCart = (product: Product) => {
  if (product.totalStock <= 0) {
      // Optional: block jika stok 0
      // return; 
  }

  if (product.variants && product.variants.length > 0) {
    tempProduct.value = product;
    selectedVariantOptions.value = {};

    product.variants.forEach((v) => {
      if (v.values && v.values.length > 0) {
        const firstOption = v.values[0];
        if (firstOption) {
          selectedVariantOptions.value[v.type] = firstOption;
        }
      }
    });

    showVariantModal.value = true;
    showDropdown.value = false;
  } else {
    addItemToCartList(product, 1);
    showDropdown.value = false;
    searchQuery.value = "";
  }
};

const confirmVariantSelection = () => {
  if (!tempProduct.value) return;

  const variantKeys = tempProduct.value.variants.map(v => v.type);
  const selectedKeys = Object.keys(selectedVariantOptions.value);
  
  if (variantKeys.length !== selectedKeys.length) {
    alert("Mohon pilih semua opsi varian.");
    return;
  }

  const variantLabel = Object.keys(selectedVariantOptions.value)
    .map((key) => `${key}: ${selectedVariantOptions.value[key]?.value}`)
    .join(", ");

  const selectedValues = Object.values(selectedVariantOptions.value);

  const baseSku = (tempProduct.value as any).sku || "";
  const finalSku = selectedValues.reverse().find((v) => v.sku)?.sku || baseSku;

  const lastValue = selectedValues.length > 0 ? selectedValues[0] : null; 
  const specificStock = lastValue ? lastValue.stock : 0;

  addItemToCartList(tempProduct.value, 1, variantLabel, finalSku, specificStock);

  showVariantModal.value = false;
  tempProduct.value = null;
  searchQuery.value = "";
};

const addItemToCartList = (product: Product, qty: number, variantName?: string, variantSku?: string, maxStock?: number) => {
  const currentCart = [...cart.value];
  
  const existingItemIndex = currentCart.findIndex((item) => 
    item.productId === product.id && item.variantName === variantName
  );

  if (existingItemIndex !== -1) {
    const existingItem = currentCart[existingItemIndex];
    if (!existingItem) return;

    const newQty = existingItem.quantity + qty;
    const limit = maxStock !== undefined ? maxStock : product.totalStock;

    if (newQty > limit) {
      alert(`Stok tidak mencukupi. Maksimal: ${limit}`);
      return;
    }
    
    currentCart[existingItemIndex] = {
      ...existingItem,
      quantity: newQty,
      totalPrice: existingItem.price * newQty
    };
  } else {
    currentCart.push({
      productId: product.id || "", 
      productName: product.name,
      price: product.discountPrice || product.retailPrice,
      quantity: qty,
      thumbnailUrl: product.thumbnailUrl || "",
      weight: product.weight || 250, 
      totalPrice: (product.discountPrice || product.retailPrice) * qty,
      variantName: variantName || "",
      variantSku: variantSku || (product as any).sku || "",
    });
  }
  
  cart.value = currentCart;
};

const updateQty = (index: number, change: number) => {
  const currentCart = [...cart.value];
  const item = currentCart[index];
  if (!item) return;
  
  const newQty = item.quantity + change;
  if (newQty < 1) return;

  currentCart[index] = {
    ...item,
    quantity: newQty,
    totalPrice: item.price * newQty
  };
  cart.value = currentCart;
};

const removeItem = (index: number) => {
  const currentCart = [...cart.value];
  currentCart.splice(index, 1);
  cart.value = currentCart;
};
</script>

<template>
  <div class="relative rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="border-b border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <h3 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
        <Icon name="lucide:shopping-cart" class="h-4 w-4" />
        Produk Pesanan
      </h3>
    </div>

    <div class="p-4">
      <div class="relative mb-6">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari produk (Nama, SKU, Brand)..."
            class="w-full rounded-lg border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm transition-all focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            @focus="onFocusSearch"
            @blur="closeDropdown"
          />
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Icon name="lucide:search" class="h-4 w-4" />
          </div>
          
          <button 
            v-if="searchQuery" 
            @click="searchQuery = ''; showDropdown = false" 
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <Icon name="lucide:x" class="h-4 w-4" />
          </button>
        </div>

        <transition name="fade">
          <div 
            v-if="showDropdown" 
            class="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-800 dark:ring-white/10"
            @mousedown.prevent
          >
            <div class="max-h-80 overflow-y-auto">
              <div v-if="loadingProducts && allProducts.length === 0" class="flex items-center justify-center p-6 text-sm text-gray-500">
                <Icon name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Memuat Data...
              </div>
              
              <div v-else-if="finalList.length === 0" class="p-6 text-center text-sm text-gray-500">
                <div class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                  <Icon name="lucide:search-x" class="h-5 w-5 text-gray-400" />
                </div>
                Produk tidak ditemukan.
              </div>
              
              <ul v-else class="divide-y divide-gray-100 dark:divide-gray-700">
                <li
                  v-for="prod in finalList"
                  :key="prod.id"
                  @click="initiateAddToCart(prod)"
                  class="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  :class="{ 'opacity-50 cursor-not-allowed pointer-events-none': prod.totalStock <= 0 }"
                >
                  <img :src="prod.thumbnailUrl || 'https://via.placeholder.com/40'" class="h-10 w-10 rounded-lg border border-gray-200 object-cover dark:border-gray-600" />
                  <div class="flex-1 min-w-0">
                    <p class="truncate text-sm font-semibold text-gray-900 dark:text-white">{{ prod.name }}</p>
                    <div class="mt-0.5 flex items-center gap-2 text-xs">
                      <span 
                        class="inline-flex items-center rounded-full px-1.5 py-0.5 font-medium"
                        :class="prod.totalStock > 0 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                      >
                        Stok: {{ prod.totalStock }}
                      </span>
                      <span v-if="prod.variants?.length" class="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {{ prod.variants.length }} Varian
                      </span>
                      <span v-if="(prod as any).sku" class="text-gray-400">SKU: {{ (prod as any).sku }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-bold text-primary">Rp {{ (prod.discountPrice || prod.retailPrice).toLocaleString("id-ID") }}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </transition>
      </div>

      <div v-if="cart.length > 0" class="space-y-4">
        <transition-group name="list">
          <div v-for="(item, index) in cart" :key="item.productId + item.variantName" class="flex items-start gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:border-gray-200 hover:bg-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750">
            <div class="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700">
              <img :src="item.thumbnailUrl || 'https://via.placeholder.com/64'" class="h-full w-full object-cover" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="text-sm font-bold text-gray-900 line-clamp-1 dark:text-white" :title="item.productName">{{ item.productName }}</h4>
                  <div v-if="item.variantName" class="mt-1 inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400">
                    {{ item.variantName }}
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">@ Rp {{ item.price.toLocaleString("id-ID") }}</p>
                </div>
                <p class="text-sm font-bold text-primary whitespace-nowrap">Rp {{ item.totalPrice.toLocaleString("id-ID") }}</p>
              </div>

              <div class="mt-3 flex items-center justify-between">
                <div class="flex h-8 items-center rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-700">
                  <button @click="updateQty(index, -1)" class="flex h-full w-8 items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200"><Icon name="lucide:minus" class="h-3 w-3" /></button>
                  <span class="flex h-full min-w-[2rem] items-center justify-center border-x border-gray-200 bg-gray-50 px-2 text-xs font-semibold text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white">{{ item.quantity }}</span>
                  <button @click="updateQty(index, 1)" class="flex h-full w-8 items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200"><Icon name="lucide:plus" class="h-3 w-3" /></button>
                </div>
                <button @click="removeItem(index)" class="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"><Icon name="lucide:trash-2" class="h-3.5 w-3.5" /> Hapus</button>
              </div>
            </div>
          </div>
        </transition-group>
      </div>

      <div v-else class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-10 dark:border-gray-700 dark:bg-gray-800/50">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <Icon name="lucide:shopping-bag" class="h-6 w-6 text-gray-400" />
        </div>
        <p class="mt-3 text-sm font-medium text-gray-900 dark:text-white">Keranjang kosong</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Cari produk di atas untuk memulai.</p>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showVariantModal && tempProduct" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="showVariantModal = false"></div>
        <transition name="zoom">
          <div class="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
            <div class="border-b border-gray-100 p-6 pb-4 dark:border-gray-700">
              <div class="flex items-start gap-4">
                <img :src="tempProduct.thumbnailUrl || 'https://via.placeholder.com/60'" class="h-16 w-16 rounded-lg object-cover ring-1 ring-gray-900/5" />
                <div>
                  <h3 class="line-clamp-2 text-base font-bold text-gray-900 dark:text-white">{{ tempProduct.name }}</h3>
                  <p class="mt-1 text-sm font-bold text-primary">Rp {{ (tempProduct.discountPrice || tempProduct.retailPrice).toLocaleString("id-ID") }}</p>
                </div>
              </div>
            </div>
            <div class="p-6 pt-4">
              <div class="space-y-4">
                <div v-for="(variant, idx) in tempProduct.variants" :key="idx">
                  <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ variant.type }}</label>
                  <div class="relative">
                    <select v-model="selectedVariantOptions[variant.type]" class="block w-full appearance-none rounded-lg border-gray-200 bg-gray-50 py-2.5 pl-4 pr-10 text-sm font-medium text-gray-900 focus:border-primary focus:bg-white focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                      <option v-for="val in variant.values" :key="val.sku" :value="val">{{ val.value }} (Stok: {{ val.stock }})</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"><Icon name="lucide:chevron-down" class="h-4 w-4" /></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <button @click="showVariantModal = false" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Batal</button>
              <button @click="confirmVariantSelection" class="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800">Masukan Keranjang</button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-20px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.zoom-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.zoom-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.zoom-enter-from, .zoom-leave-to { opacity: 0; transform: scale(0.95) translateY(10px); }
</style>