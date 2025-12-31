<script setup lang="ts">
import ProductCard from "~/components/product/form/ProductCard.vue";

const status = defineModel<boolean>("status", { required: true });
const visibility = defineModel<"public" | "hidden" | "draft">("visibility", { required: true });
const isFeatured = defineModel<boolean>("isFeatured", { required: true });
const isNew = defineModel<boolean>("isNew", { required: true });
</script>

<template>
  <ProductCard title="Status & Visibilitas" description="Atur ketersediaan dan penandaan khusus produk.">
    <div class="space-y-6">
      
      <div>
        <label for="product-visibility" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Visibilitas
        </label>
        <div class="relative">
          <select 
            v-model="visibility" 
            id="product-visibility" 
            class="form-select"
          >
            <option value="public">Publik (Terlihat di Toko)</option>
            <option value="hidden">Tersembunyi (Hanya via Link)</option>
            <option value="draft">Draft (Disimpan, Belum Rilis)</option>
          </select>
          
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <Icon name="lucide:chevron-down" class="h-4 w-4" />
          </div>
        </div>
        <p class="mt-1.5 text-xs text-gray-400">
          *Draft tidak akan muncul di katalog toko sampai Anda mengubahnya menjadi Publik.
        </p>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white">Status Penjualan</label>
            <p class="text-xs text-gray-500 dark:text-gray-400">Jika nonaktif, tombol beli akan dimatikan (Stok Habis).</p>
          </div>
          
          <button
            type="button"
            @click="status = !status"
            :class="status ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            role="switch"
            :aria-checked="status"
          >
            <span 
              aria-hidden="true" 
              :class="status ? 'translate-x-5' : 'translate-x-0'" 
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            ></span>
          </button>
        </div>
      </div>

      <hr class="border-gray-100 dark:border-gray-700" />

      <div>
        <label class="mb-3 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Atribut Tambahan
        </label>
        <div class="space-y-4">
          
          <div class="relative flex items-start">
            <div class="flex h-6 items-center">
              <input 
                v-model="isFeatured" 
                id="product-featured" 
                type="checkbox" 
                class="form-checkbox" 
              />
            </div>
            <div class="ml-3 text-sm leading-6">
              <label for="product-featured" class="font-medium text-gray-900 dark:text-white">Produk Unggulan</label>
              <p class="text-xs text-gray-500 dark:text-gray-400">Produk akan ditampilkan di bagian 'Featured' atau banner utama.</p>
            </div>
          </div>

          <div class="relative flex items-start">
            <div class="flex h-6 items-center">
              <input 
                v-model="isNew" 
                id="product-new" 
                type="checkbox" 
                class="form-checkbox" 
              />
            </div>
            <div class="ml-3 text-sm leading-6">
              <label for="product-new" class="font-medium text-gray-900 dark:text-white">Tandai sebagai 'Baru'</label>
              <p class="text-xs text-gray-500 dark:text-gray-400">Menambahkan lencana "New Arrival" pada kartu produk.</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  </ProductCard>
</template>

<style scoped>
.form-select {
  @apply block w-full appearance-none rounded-lg border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-900 focus:border-primary focus:bg-white focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-all shadow-sm;
}

.form-checkbox {
  @apply h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-primary transition-all cursor-pointer;
}
</style>