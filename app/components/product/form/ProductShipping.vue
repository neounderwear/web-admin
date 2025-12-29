<script setup lang="ts">
import { ref, watch } from "vue";
import ProductCard from "~/components/product/form/ProductCard.vue";
import type { ProductDimensions } from "~/types/product";

const weight = defineModel<number | null>("weight");
const dimensions = defineModel<ProductDimensions | null>("dimensions");
const material = defineModel<string | null>("material");
const localLength = ref(dimensions.value?.length ? String(dimensions.value.length) : "");
const localWidth = ref(dimensions.value?.width ? String(dimensions.value.width) : "");
const localHeight = ref(dimensions.value?.height ? String(dimensions.value.height) : "");
const parsePositiveNumber = (val: string): number => {
  const num = parseInt(val, 10);
  return num > 0 ? num : 0;
};

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

watch(
  dimensions,
  (newDims) => {
    localLength.value = newDims?.length ? String(newDims.length) : "";
    localWidth.value = newDims?.width ? String(newDims.width) : "";
    localHeight.value = newDims?.height ? String(newDims.height) : "";
  },
  { deep: true }
);

const localWeight = ref(weight.value ? String(weight.value) : "");

watch(localWeight, (newVal) => {
  weight.value = parsePositiveNumber(newVal);
});

watch(weight, (newVal) => {
  localWeight.value = newVal ? String(newVal) : "";
});
</script>

<template>
  <ProductCard title="Pengiriman & Spesifikasi" description="Atur berat, dimensi, dan bahan produk.">
    <div class="space-y-6">
      <div>
        <label for="product-weight" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Berat (gram) </label>
        <div class="relative mt-1">
          <input v-model="localWeight" id="product-weight" type="number" min="0" placeholder="0" class="form-input pr-16" />
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <span class="text-sm text-muted dark:text-gray-400">gram</span>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-dark/80 dark:text-base/80"> Dimensi (cm) </label>
        <div class="mt-1 grid grid-cols-3 gap-4">
          <div class="relative">
            <input v-model="localLength" type="number" min="0" placeholder="Panjang" class="form-input pr-10" />
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted">P</span>
          </div>
          <div class="relative">
            <input v-model="localWidth" type="number" min="0" placeholder="Lebar" class="form-input pr-10" />
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted">L</span>
          </div>
          <div class="relative">
            <input v-model="localHeight" type="number" min="0" placeholder="Tinggi" class="form-input pr-10" />
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted">T</span>
          </div>
        </div>
      </div>

      <div>
        <label for="product-material" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Bahan (Opsional) </label>
        <input v-model="material" id="product-material" type="text" placeholder="Mis: Katun, Microfiber, Rayon" class="form-input mt-1" />
      </div>
    </div>
  </ProductCard>
</template>

<style scoped>
.form-input {
  @apply block w-full rounded-md border-muted/50 bg-secondary/20 px-4 py-2.5 text-sm text-dark placeholder:text-muted/50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-sm dark:text-base dark:placeholder:text-muted/70 focus:border-primary focus:ring-1 focus:ring-primary;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
