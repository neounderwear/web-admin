<script setup lang="ts">
import { ref, watchEffect } from "vue";
import ProductCard from "~/components/product/form/ProductCard.vue";
import type { ProductVariant, ProductVariantValue } from "~/types/product";

const variants = defineModel<ProductVariant[]>("variants", { required: true });
const totalStock = defineModel<number>("totalStock", { required: true });
const newVariantType = ref("");
const newValues = ref<{ [typeIndex: number]: string }>({});

function addVariantType() {
  if (!newVariantType.value) return;
  variants.value.push({
    type: newVariantType.value,
    typeLowerCase: newVariantType.value.toLowerCase(),
    values: [],
  });
  newVariantType.value = "";
}

function removeVariantType(index: number) {
  variants.value.splice(index, 1);
}

function addVariantValue(typeIndex: number) {
  const value = newValues.value[typeIndex];
  if (!value) return;

  const variant = variants.value[typeIndex];
  if (variant) {
    variant.values.push({
      value: value,
      sku: "",
      stock: 0,
    });
    newValues.value[typeIndex] = "";
  }
}

function removeVariantValue(typeIndex: number, valueIndex: number) {
  const variant = variants.value[typeIndex];
  if (variant) {
    variant.values.splice(valueIndex, 1);
  }
}

watchEffect(() => {
  let stock = 0;
  if (variants.value.length === 0) {
    stock = 0;
  } else {
    variants.value.forEach((type) => {
      type.values.forEach((val) => {
        stock += Number(val.stock) || 0;
      });
    });
  }
  totalStock.value = stock;
});

function updateStock(e: Event, val: ProductVariantValue) {
  val.stock = parseInt((e.target as HTMLInputElement).value) || 0;
}
</script>

<template>
  <ProductCard title="Varian & Stok" description="Kelola varian dan inventaris produk.">
    <div class="mb-4 rounded-md border border-yellow-300 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/30">
      <p class="text-sm text-yellow-800 dark:text-yellow-200"><strong class="font-semibold">Stok Keseluruhan</strong> (di tabel produk) dihitung otomatis dari total stok semua varian di bawah.</p>
      <p class="mt-2 text-sm text-yellow-800 dark:text-yellow-200">Kalo produk nggak punya varian (hanya 1 SKU), buat satu tipe varian (mis: "Ukuran") dengan satu nilai (mis: "Freesize") dan masukkin SKU serta stok di sana.</p>
    </div>

    <div class="space-y-6">
      <div v-for="(variant, typeIndex) in variants" :key="typeIndex" class="space-y-6 rounded-lg border border-muted/50 p-6">
        <div class="flex justify-between items-center">
          <h4 class="font-semibold text-lg text-dark dark:text-base">{{ variant.type }}</h4>
          <button @click="removeVariantType(typeIndex)" type="button" class="rounded-md p-1 text-red-500 transition-colors hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
            <Icon name="lucide:trash" class="h-4 w-4" />
          </button>
        </div>

        <div class="overflow-x-auto rounded-md border dark:border-gray-700">
          <table class="min-w-full">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Nilai Varian</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">SKU</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Stok</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Hapus</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-secondary/20 dark:divide-gray-700 dark:bg-gray-800">
              <tr>
                <td class="px-6 py-4">
                  <input v-model="newValues[typeIndex]" @keyup.enter="addVariantValue(typeIndex)" type="text" :placeholder="`Mis: Merah, Biru...`" class="form-input w-full" />
                </td>
                <td class="px-6 py-4" colspan="2"></td>
                <td class="px-6 py-4 text-center">
                  <button @click="addVariantValue(typeIndex)" type="button" class="btn-primary w-full">Tambah</button>
                </td>
              </tr>
              <tr v-for="(val, valIndex) in variant.values" :key="valIndex" class="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                <td class="px-6 py-4 text-sm font-medium text-dark dark:text-base">{{ val.value }}</td>
                <td class="px-6 py-4">
                  <input v-model="val.sku" type="text" placeholder="SKU-UNIK" class="form-input w-full" />
                </td>
                <td class="px-6 py-4">
                  <input :value="val.stock" @input="updateStock($event, val)" type="number" min="0" class="form-input w-24 text-right" />
                </td>
                <td class="px-6 py-4 text-center">
                  <button @click="removeVariantValue(typeIndex, valIndex)" type="button" class="rounded-md p-1 text-red-400 transition-colors hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                    <Icon name="lucide:x" class="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex space-x-2 pt-6 border-t border-gray-200 dark:border-gray-700">
        <input v-model="newVariantType" @keyup.enter="addVariantType" type="text" placeholder="Mis: Warna, Ukuran..." class="flex-1 form-input" />
        <button @click="addVariantType" type="button" class="btn-primary">
          <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
          Tambah Tipe Varian
        </button>
      </div>
    </div>
  </ProductCard>
</template>

<style scoped>
.form-input {
  @apply block w-full rounded-md border-muted/50 bg-secondary/20 px-4 py-2.5 text-sm text-dark placeholder:text-muted/50 dark:border-gray-600 dark:bg-gray-700 dark:text-sm dark:text-base dark:placeholder:text-muted/70 focus:border-primary focus:ring-1 focus:ring-primary;
}
.btn-primary {
  @apply inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/80;
}
</style>
