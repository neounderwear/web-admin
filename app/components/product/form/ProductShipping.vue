<script setup lang="ts">
import { ref, watch } from "vue";
import ProductCard from "~/components/product/form/ProductCard.vue";
import type { ProductDimensions } from "~/types/product";

const weight = defineModel<number | null>("weight");
const dimensions = defineModel<ProductDimensions | null>("dimensions");
const material = defineModel<string | null>("material");

// Local states untuk handling input string sebelum convert ke number
const localLength = ref(dimensions.value?.length ? String(dimensions.value.length) : "");
const localWidth = ref(dimensions.value?.width ? String(dimensions.value.width) : "");
const localHeight = ref(dimensions.value?.height ? String(dimensions.value.height) : "");
const localWeight = ref(weight.value ? String(weight.value) : "");

const parsePositiveNumber = (val: string): number => {
  const num = parseInt(val, 10);
  return num > 0 ? num : 0;
};

// Watchers untuk Dimensi
watch([localLength, localWidth, localHeight], ([l, w, h]) => {
  const length = parsePositiveNumber(l);
  const width = parsePositiveNumber(w);
  const height = parsePositiveNumber(h);

  if (length > 0 || width > 0 || height > 0) {
    dimensions.value = { length, width, height };
  } else {
    dimensions.value = null;
  }
});

watch(dimensions, (newDims) => {
    localLength.value = newDims?.length ? String(newDims.length) : "";
    localWidth.value = newDims?.width ? String(newDims.width) : "";
    localHeight.value = newDims?.height ? String(newDims.height) : "";
  }, { deep: true }
);

// Watchers untuk Berat
watch(localWeight, (newVal) => {
  weight.value = parsePositiveNumber(newVal);
});

watch(weight, (newVal) => {
  localWeight.value = newVal ? String(newVal) : "";
});
</script>

<template>
  <ProductCard title="Pengiriman & Spesifikasi" description="Atur berat, dimensi paket, dan informasi bahan.">
    <div class="space-y-6">
      
      <div>
        <label for="product-weight" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Berat Produk
        </label>
        <div class="relative">
          <input 
            v-model="localWeight" 
            id="product-weight" 
            type="number" 
            min="0" 
            placeholder="0" 
            class="form-input pr-16" 
          />
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <span class="text-xs font-bold text-gray-400">GRAM</span>
          </div>
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Dimensi Paket (cm)
        </label>
        <div class="grid grid-cols-3 gap-4">
          
          <div class="relative">
            <input v-model="localLength" type="number" min="0" placeholder="0" class="form-input pr-8 text-center" />
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span class="text-xs font-bold text-gray-400">P</span>
            </div>
          </div>

          <div class="relative">
            <input v-model="localWidth" type="number" min="0" placeholder="0" class="form-input pr-8 text-center" />
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span class="text-xs font-bold text-gray-400">L</span>
            </div>
          </div>

          <div class="relative">
            <input v-model="localHeight" type="number" min="0" placeholder="0" class="form-input pr-8 text-center" />
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span class="text-xs font-bold text-gray-400">T</span>
            </div>
          </div>

        </div>
      </div>

      <div>
        <label for="product-material" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Bahan / Material (Opsional)
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Icon name="lucide:layers" class="h-4 w-4" />
          </div>
          <input 
            v-model="material" 
            id="product-material" 
            type="text" 
            placeholder="Contoh: Katun Combed 30s" 
            class="form-input pl-10" 
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

/* Hide Spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>