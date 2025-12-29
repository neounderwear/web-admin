<script setup lang="ts">
import { ref } from "vue";
import { useProducts } from "~/composables/useProducts";
import type { Product, ProductVariantValue } from "~/types/product";
import type { OrderItem } from "~/types/order";

// Model Cart dari Parent (add.vue)
const cart = defineModel<OrderItem[]>({ required: true });

const { products, fetchProducts, searchQuery, loading } = useProducts();
const showDropdown = ref(false);

// --- STATE UNTUK MODAL VARIAN ---
const showVariantModal = ref(false);
const tempProduct = ref<Product | null>(null);
const selectedVariantOptions = ref<Record<string, ProductVariantValue>>({});

// --- LOGIC PENCARIAN ---
let timeout: NodeJS.Timeout;
const onSearch = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  searchQuery.value = val;
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    fetchProducts();
    showDropdown.value = true;
  }, 300);
};

// --- LOGIC MEMILIH PRODUK ---
const initiateAddToCart = (product: Product) => {
  if (product.totalStock <= 0) return;

  // 1. Jika Produk Memiliki Varian -> Buka Modal
  if (product.variants && product.variants.length > 0) {
    tempProduct.value = product;
    selectedVariantOptions.value = {};

    // FIX TYPESCRIPT ERROR DI SINI
    // Kita pastikan value[0] ada sebelum dimasukkan ke state
    product.variants.forEach((v) => {
      if (v.values && v.values.length > 0) {
        const firstOption = v.values[0];
        // Guard clause: hanya assign jika tidak undefined
        if (firstOption) {
          selectedVariantOptions.value[v.type] = firstOption;
        }
      }
    });

    showVariantModal.value = true;
    showDropdown.value = false;
  }
  // 2. Jika Produk Simple -> Langsung Masuk
  else {
    addItemToCartList(product, 1);
    showDropdown.value = false;
    searchQuery.value = "";
  }
};

const confirmVariantSelection = () => {
  if (!tempProduct.value) return;

  // Buat string nama varian, contoh: "Warna: Merah, Ukuran: XL"
  const variantLabel = Object.keys(selectedVariantOptions.value)
    .map((key) => `${key}: ${selectedVariantOptions.value[key]?.value}`)
    .join(", ");

  const selectedValues = Object.values(selectedVariantOptions.value);

  // Ambil SKU (prioritas dari varian terakhir yang punya SKU)
  const finalSku = selectedValues.find((v) => v.sku)?.sku || "";

  // Ambil Stok spesifik (dari pilihan terakhir)
  // FIX: Pastikan array tidak kosong sebelum akses index terakhir
  const lastValue = selectedValues.length > 0 ? selectedValues[selectedValues.length - 1] : null;
  const specificStock = lastValue ? lastValue.stock : 0;

  addItemToCartList(tempProduct.value, 1, variantLabel, finalSku, specificStock);

  showVariantModal.value = false;
  tempProduct.value = null;
  searchQuery.value = "";
};

const addItemToCartList = (product: Product, qty: number, variantName?: string, variantSku?: string, maxStock?: number) => {
  // Cek duplikasi item di keranjang
  const existingItemIndex = cart.value.findIndex((item) => item.productId === product.id && item.variantName === variantName);

  if (existingItemIndex !== -1) {
    // Update Qty jika sudah ada
    const existingItem = cart.value[existingItemIndex];
    if (existingItem) {
      const newQty = existingItem.quantity + qty;
      const limit = maxStock !== undefined ? maxStock : product.totalStock;

      if (newQty > limit) {
        alert(`Stok tidak mencukupi. Maksimal: ${limit}`);
        return;
      }
      existingItem.quantity = newQty;
      existingItem.totalPrice = existingItem.price * newQty;
    }
  } else {
    // Tambah Item Baru
    cart.value.push({
      productId: product.id,
      productName: product.name,
      price: product.discountPrice || product.retailPrice,
      quantity: qty,
      thumbnailUrl: product.thumbnailUrl,
      weight: product.weight || 1000,
      totalPrice: (product.discountPrice || product.retailPrice) * qty,
      variantName: variantName,
      variantSku: variantSku,
    });
  }
};

const updateQty = (index: number, change: number) => {
  const item = cart.value[index];
  if (!item) return;
  const newQty = item.quantity + change;
  if (newQty < 1) return;

  item.quantity = newQty;
  item.totalPrice = item.price * newQty;
};

const removeItem = (index: number) => {
  cart.value.splice(index, 1);
};
</script>

<template>
  <div class="rounded-lg border border-muted/30 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700 relative">
    <h3 class="mb-4 text-lg font-bold text-dark dark:text-white flex items-center gap-2">
      <Icon name="lucide:shopping-cart" class="h-5 w-5 text-primary" />
      Produk Pesanan
    </h3>

    <div class="relative mb-6">
      <input
        type="text"
        placeholder="Cari produk (Ketik nama)..."
        class="w-full rounded-md border-muted/50 bg-gray-50 px-4 py-2.5 pl-10 text-sm focus:border-primary focus:ring-primary dark:bg-gray-900 transition-all"
        @input="onSearch"
        @focus="showDropdown = true"
      />
      <Icon name="lucide:search" class="absolute left-3 top-3 h-4 w-4 text-muted" />

      <button v-if="showDropdown" @click="showDropdown = false" class="absolute right-3 top-2.5 text-muted hover:text-dark">
        <Icon name="lucide:x" class="h-4 w-4" />
      </button>

      <div v-if="showDropdown && searchQuery" class="absolute z-20 mt-1 w-full rounded-md border border-muted/20 bg-white shadow-xl dark:bg-gray-800 max-h-80 overflow-auto">
        <div v-if="loading" class="p-4 text-center text-sm text-muted flex items-center justify-center gap-2"><Icon name="lucide:loader-2" class="h-4 w-4 animate-spin" /> Mencari...</div>
        <div v-else-if="products.length === 0" class="p-4 text-center text-sm text-muted">Produk tidak ditemukan.</div>
        <ul v-else class="divide-y divide-muted/10">
          <li
            v-for="prod in products"
            :key="prod.id"
            @click="initiateAddToCart(prod)"
            class="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors dark:hover:bg-gray-700 group"
            :class="{ 'opacity-50 cursor-not-allowed pointer-events-none': prod.totalStock <= 0 }"
          >
            <img :src="prod.thumbnailUrl" class="h-10 w-10 rounded object-cover border border-muted/20" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-dark dark:text-white truncate">{{ prod.name }}</p>
              <div class="flex items-center gap-2 text-xs mt-0.5">
                <span :class="prod.totalStock > 0 ? 'text-green-600 bg-green-50 px-1.5 rounded' : 'text-red-500 bg-red-50 px-1.5 rounded'"> Stok: {{ prod.totalStock }} </span>
                <span v-if="prod.variants?.length" class="bg-gray-100 px-1.5 py-0.5 rounded text-muted dark:bg-gray-700"> {{ prod.variants.length }} Varian </span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-primary">Rp {{ (prod.discountPrice || prod.retailPrice).toLocaleString("id-ID") }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="cart.length > 0" class="space-y-4">
      <div v-for="(item, index) in cart" :key="index" class="flex items-start gap-4 border-b border-muted/10 pb-4 last:border-0 last:pb-0 animate-fade-in">
        <img :src="item.thumbnailUrl" class="h-14 w-14 rounded-md object-cover border border-muted/20 bg-gray-50" />

        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-dark dark:text-white truncate">{{ item.productName }}</p>
          <div v-if="item.variantName" class="mt-1 inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {{ item.variantName }}
          </div>
          <p class="mt-1 text-xs text-muted">@ Rp {{ item.price.toLocaleString("id-ID") }}</p>
        </div>

        <div class="flex flex-col items-end gap-2">
          <p class="text-sm font-bold text-dark dark:text-white">Rp {{ item.totalPrice.toLocaleString("id-ID") }}</p>

          <div class="flex items-center rounded-md border border-muted/30 bg-gray-50 dark:bg-gray-900">
            <button @click="updateQty(index, -1)" class="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-md text-muted hover:text-dark">
              <Icon name="lucide:minus" class="h-3 w-3" />
            </button>
            <span class="w-8 text-center text-sm font-medium">{{ item.quantity }}</span>
            <button @click="updateQty(index, 1)" class="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-md text-muted hover:text-dark">
              <Icon name="lucide:plus" class="h-3 w-3" />
            </button>
          </div>

          <button @click="removeItem(index)" class="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center gap-1"><Icon name="lucide:trash-2" class="h-3 w-3" /> Hapus</button>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-10 text-muted border-2 border-dashed border-muted/20 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
      <Icon name="lucide:shopping-bag" class="h-12 w-12 mb-3 opacity-20" />
      <p class="text-sm font-medium">Keranjang masih kosong</p>
      <p class="text-xs">Cari produk di atas untuk memulai.</p>
    </div>

    <transition name="fade">
      <div v-if="showVariantModal && tempProduct" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
          <div class="flex items-start gap-4 mb-6">
            <img :src="tempProduct.thumbnailUrl" class="h-16 w-16 rounded-md object-cover border border-muted/20" />
            <div>
              <h3 class="font-bold text-lg text-dark dark:text-white line-clamp-2">{{ tempProduct.name }}</h3>
              <p class="text-sm text-primary font-semibold">Rp {{ (tempProduct.discountPrice || tempProduct.retailPrice).toLocaleString("id-ID") }}</p>
            </div>
          </div>

          <div class="space-y-4 mb-6">
            <div v-for="(variant, idx) in tempProduct.variants" :key="idx">
              <label class="block text-sm font-medium text-muted mb-1.5">{{ variant.type }}</label>
              <select v-model="selectedVariantOptions[variant.type]" class="w-full rounded-md border-muted/40 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:ring-primary dark:bg-gray-700">
                <option v-for="val in variant.values" :key="val.sku" :value="val">{{ val.value }} (Stok: {{ val.stock }})</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button @click="showVariantModal = false" class="px-4 py-2 text-sm font-medium text-muted hover:text-dark bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300">Batal</button>
            <button @click="confirmVariantSelection" class="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-md shadow-md">Masukan Keranjang</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
