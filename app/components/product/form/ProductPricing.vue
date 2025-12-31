<script setup lang="ts">
import { ref, watch } from "vue";
import ProductCard from "~/components/product/form/ProductCard.vue";

const retailPrice = defineModel<number>("retailPrice");
const wholesalePrice = defineModel<number>("wholesalePrice");
const resellerPrice = defineModel<number>("resellerPrice");
const discountPrice = defineModel<number>("discountPrice");

const formatCurrency = (value: number | undefined | null): string => {
  if (!value && value !== 0) return "";
  return value.toLocaleString("id-ID");
};

const parseCurrency = (value: string): number => {
  return parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
};

// Local state untuk display string (dengan titik)
const localRetail = ref(formatCurrency(retailPrice.value));
const localWholesale = ref(formatCurrency(wholesalePrice.value));
const localReseller = ref(formatCurrency(resellerPrice.value));
const localDiscount = ref(formatCurrency(discountPrice.value));

// --- WATCHERS: Local Input -> Update Model (Number) ---
watch(localRetail, (newVal) => { retailPrice.value = parseCurrency(newVal); });
watch(localWholesale, (newVal) => { wholesalePrice.value = parseCurrency(newVal); });
watch(localReseller, (newVal) => { resellerPrice.value = parseCurrency(newVal); });
watch(localDiscount, (newVal) => { discountPrice.value = parseCurrency(newVal); });

// --- WATCHERS: Model Change (API load) -> Update Local Input ---
watch(retailPrice, (newModelVal) => {
  const formatted = formatCurrency(newModelVal);
  if (localRetail.value !== formatted) localRetail.value = formatted;
});
watch(wholesalePrice, (newModelVal) => {
  const formatted = formatCurrency(newModelVal);
  if (localWholesale.value !== formatted) localWholesale.value = formatted;
});
watch(resellerPrice, (newModelVal) => {
  const formatted = formatCurrency(newModelVal);
  if (localReseller.value !== formatted) localReseller.value = formatted;
});
watch(discountPrice, (newModelVal) => {
  const formatted = formatCurrency(newModelVal);
  if (localDiscount.value !== formatted) localDiscount.value = formatted;
});
</script>

<template>
  <ProductCard title="Harga Produk" description="Atur strategi harga untuk berbagai tipe pelanggan.">
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      
      <div>
        <label for="retail-price" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Harga Marketplace (Umum)
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span class="text-sm font-bold text-gray-400">Rp</span>
          </div>
          <input 
            v-model="localRetail" 
            id="retail-price" 
            type="text" 
            placeholder="0" 
            class="form-input pl-10 text-right font-mono" 
          />
        </div>
      </div>

      <div>
        <label for="discount-price" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Harga Coret / Asli
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span class="text-sm font-bold text-gray-400">Rp</span>
          </div>
          <input 
            v-model="localDiscount" 
            id="discount-price" 
            type="text" 
            placeholder="0" 
            class="form-input pl-10 text-right font-mono" 
          />
        </div>
        <p class="mt-1 text-[10px] text-gray-400">*Isi lebih tinggi dari harga marketplace untuk efek diskon.</p>
      </div>

      <div>
        <label for="reseller-price" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Harga Reseller
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span class="text-sm font-bold text-gray-400">Rp</span>
          </div>
          <input 
            v-model="localReseller" 
            id="reseller-price" 
            type="text" 
            placeholder="0" 
            class="form-input pl-10 text-right font-mono" 
          />
        </div>
      </div>

      <div>
        <label for="wholesale-price" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Harga Grosir / Partai
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span class="text-sm font-bold text-gray-400">Rp</span>
          </div>
          <input 
            v-model="localWholesale" 
            id="wholesale-price" 
            type="text" 
            placeholder="0" 
            class="form-input pl-10 text-right font-mono" 
          />
        </div>
      </div>

    </div>
  </ProductCard>
</template>

<style scoped>
.form-input {
  @apply block w-full rounded-lg border-gray-200 bg-white py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:bg-white focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm;
}
</style>