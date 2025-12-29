<script setup lang="ts">
import { ref, watch } from "vue";
import ProductCard from "~/components/product/form/ProductCard.vue";

const retailPrice = defineModel<number>("retailPrice");
const wholesalePrice = defineModel<number>("wholesalePrice");
const resellerPrice = defineModel<number>("resellerPrice");
const discountPrice = defineModel<number>("discountPrice");

const formatCurrency = (value: number | undefined | null): string => {
  if (!value) return "";
  return value.toLocaleString("id-ID");
};

const parseCurrency = (value: string): number => {
  return parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
};

const localRetail = ref(formatCurrency(retailPrice.value));
const localWholesale = ref(formatCurrency(wholesalePrice.value));
const localReseller = ref(formatCurrency(resellerPrice.value));
const localDiscount = ref(formatCurrency(discountPrice.value));

watch(localRetail, (newVal) => {
  retailPrice.value = parseCurrency(newVal);
});
watch(localWholesale, (newVal) => {
  wholesalePrice.value = parseCurrency(newVal);
});
watch(localReseller, (newVal) => {
  resellerPrice.value = parseCurrency(newVal);
});
watch(localDiscount, (newVal) => {
  discountPrice.value = parseCurrency(newVal);
});
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
  <ProductCard title="Harga" description="Atur harga grosir, retail, dan diskon.">
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <label for="wholesale-price" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Harga Grosir (Group)</label>
        <div class="relative mt-1">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted">Rp</span>
          <input v-model="localWholesale" id="wholesale-price" type="text" placeholder="0" class="form-input pl-10 text-right" />
        </div>
      </div>

      <div>
        <label for="reseller-price" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Harga Reseller </label>
        <div class="relative mt-1">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted">Rp</span>
          <input v-model="localReseller" id="reseller-price" type="text" placeholder="0" class="form-input pl-10 text-right" />
        </div>
      </div>

      <div>
        <label for="retail-price" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Harga Marketplace </label>
        <div class="relative mt-1">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted">Rp</span>
          <input v-model="localRetail" id="retail-price" type="text" placeholder="0" class="form-input pl-10 text-right" />
        </div>
      </div>

      <div>
        <label for="discount-price" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Harga Retail </label>
        <div class="relative mt-1">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted">Rp</span>
          <input v-model="localDiscount" id="discount-price" type="text" placeholder="0" class="form-input pl-10 text-right" />
        </div>
      </div>
    </div>
  </ProductCard>
</template>

<style scoped>
.form-input {
  @apply block w-full rounded-md border-muted/50 bg-secondary/20 px-4 py-2.5 text-sm text-dark placeholder:text-muted/50 dark:border-gray-600 dark:bg-gray-700 dark:text-sm dark:text-base dark:placeholder:text-muted/70 focus:border-primary focus:ring-1 focus:ring-primary;
}
</style>
