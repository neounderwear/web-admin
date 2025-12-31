<script setup lang="ts">
import { ref, watchEffect } from "vue";
import ProductCard from "~/components/product/form/ProductCard.vue";
import type { ProductVariant, ProductVariantValue } from "~/types/product";

const variants = defineModel<ProductVariant[]>("variants", { required: true });
const totalStock = defineModel<number>("totalStock", { required: true });

const newVariantType = ref("");
const newValues = ref<{ [typeIndex: number]: string }>({});

// --- LOGIKA VARIAN ---
function addVariantType() {
  if (!newVariantType.value.trim()) return;
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
  const value = newValues.value[typeIndex]?.trim();
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

// --- LOGIKA STOK ---
// Hitung total stok otomatis setiap ada perubahan di sub-stok varian
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
  const inputVal = parseInt((e.target as HTMLInputElement).value);
  val.stock = isNaN(inputVal) || inputVal < 0 ? 0 : inputVal;
}
</script>

<template>
  <ProductCard title="Varian & Stok" description="Kelola varian produk (Warna, Ukuran) dan stok masing-masing.">
    
    <div class="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
      <div class="flex gap-3">
        <Icon name="lucide:info" class="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
        <div class="text-sm text-blue-800 dark:text-blue-200">
          <p class="font-semibold mb-1">Catatan Penting:</p>
          <ul class="list-disc pl-4 space-y-1">
            <li><strong>Stok Total</strong> akan dihitung otomatis dari penjumlahan stok semua varian di bawah ini.</li>
            <li>Jika produk ini <strong>tidak memiliki varian</strong> (Single SKU), cukup buat satu tipe varian (contoh: "Standard") dengan satu nilai (contoh: "All Size").</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="space-y-8">
      
      <div v-for="(variant, typeIndex) in variants" :key="typeIndex" class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        
        <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-3 dark:border-gray-700 dark:bg-gray-800/50">
          <h4 class="font-bold text-gray-900 dark:text-white">{{ variant.type }}</h4>
          <button 
            @click="removeVariantType(typeIndex)" 
            type="button" 
            class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors"
            title="Hapus Tipe Varian"
          >
            <Icon name="lucide:trash-2" class="h-4 w-4" />
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nama Varian</th>
                <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">SKU (Unik)</th>
                <th class="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Stok</th>
                <th class="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              
              <tr class="bg-gray-50/30 dark:bg-gray-800/30">
                <td class="px-5 py-3">
                  <div class="relative">
                    <input 
                      v-model="newValues[typeIndex]" 
                      @keyup.enter="addVariantValue(typeIndex)" 
                      type="text" 
                      :placeholder="`Contoh: Merah, XL...`" 
                      class="form-input" 
                    />
                  </div>
                </td>
                <td class="px-5 py-3" colspan="2">
                  <p class="text-xs text-gray-400 italic">Isi nama varian lalu tekan Enter atau tombol Tambah.</p>
                </td>
                <td class="px-5 py-3 text-center">
                  <button 
                    @click="addVariantValue(typeIndex)" 
                    type="button" 
                    class="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-all"
                  >
                    <Icon name="lucide:plus" class="h-3 w-3 mr-1" /> Tambah
                  </button>
                </td>
              </tr>

              <tr v-for="(val, valIndex) in variant.values" :key="valIndex" class="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-5 py-3">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ val.value }}</span>
                </td>
                <td class="px-5 py-3">
                  <input 
                    v-model="val.sku" 
                    type="text" 
                    placeholder="SKU-CODE" 
                    class="form-input font-mono uppercase text-xs" 
                  />
                </td>
                <td class="px-5 py-3 text-center">
                  <input 
                    :value="val.stock" 
                    @input="updateStock($event, val)" 
                    type="number" 
                    min="0" 
                    class="form-input w-24 text-center mx-auto" 
                  />
                </td>
                <td class="px-5 py-3 text-center">
                  <button 
                    @click="removeVariantValue(typeIndex, valIndex)" 
                    type="button" 
                    class="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Icon name="lucide:x-circle" class="h-5 w-5" />
                  </button>
                </td>
              </tr>

              <tr v-if="variant.values.length === 0">
                <td colspan="4" class="px-5 py-6 text-center text-sm text-gray-400 italic">
                  Belum ada nilai varian. Silakan tambahkan di atas.
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-800/50">
        <label class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Buat Tipe Varian Baru</label>
        <div class="flex gap-3">
          <input 
            v-model="newVariantType" 
            @keyup.enter="addVariantType" 
            type="text" 
            placeholder="Contoh: Warna, Ukuran, Material..." 
            class="form-input flex-1" 
          />
          <button 
            @click="addVariantType" 
            type="button" 
            class="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-black transition-all dark:bg-gray-700 dark:hover:bg-gray-600"
            :disabled="!newVariantType"
          >
            <Icon name="lucide:plus-circle" class="h-4 w-4 mr-2" />
            Buat Tipe
          </button>
        </div>
      </div>

    </div>
  </ProductCard>
</template>

<style scoped>
.form-input {
  @apply block w-full rounded-lg border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:bg-white focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm;
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