<script setup lang="ts">
import ProductCard from "~/components/product/form/ProductCard.vue";

const status = defineModel<boolean>("status", { required: true });
const visibility = defineModel<"public" | "hidden" | "draft">("visibility", { required: true });
const isFeatured = defineModel<boolean>("isFeatured", { required: true });
const isNew = defineModel<boolean>("isNew", { required: true });
</script>

<template>
  <ProductCard title="Status & Visibilitas" description="Atur ketersediaan produk Anda.">
    <div class="space-y-6">
      <div>
        <label for="product-visibility" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Visibilitas </label>
        <select v-model="visibility" id="product-visibility" class="form-input mt-1">
          <option value="public">Publik (Terlihat di toko)</option>
          <option value="hidden">Tersembunyi (Hanya via link)</option>
          <option value="draft">Draft (Tersimpan, tidak publish)</option>
        </select>
        <p class="mt-2 text-xs text-muted dark:text-gray-400">'Draft' akan menyembunyikan produk sampai kamu siap. 'Publik' akan menampilkannya di toko.</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-dark/80 dark:text-base/80"> Status Produk </label>
        <button
          type="button"
          @click="status = !status"
          :class="status ? 'bg-primary' : 'bg-muted/50 dark:bg-muted/30'"
          class="relative mt-1 inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out-smooth focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <span class="sr-only">Ubah status</span>
          <span :class="status ? 'translate-x-5' : 'translate-x-0'" class="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out-smooth"></span>
        </button>
        <span class="ml-3 text-sm text-dark/80 dark:text-base/80">
          {{ status ? "Aktif" : "Nonaktif" }}
        </span>
        <p class="mt-2 text-xs text-muted dark:text-gray-400">Jika 'Nonaktif', pelanggan nggak bisa beli produk ini (ditandai "Stok Habis").</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-dark/80 dark:text-base/80"> Atribut </label>
        <div class="mt-2 space-y-4">
          <div class="relative flex items-start">
            <div class="flex h-5 items-center">
              <input v-model="isFeatured" id="product-featured" type="checkbox" class="form-checkbox" />
            </div>
            <div class="ml-3 text-sm">
              <label for="product-featured" class="font-medium text-dark dark:text-base"> Produk Unggulan </label>
              <p class="text-xs text-muted dark:text-gray-400">Tandai biar tampil di halaman depan.</p>
            </div>
          </div>

          <div class="relative flex items-start">
            <div class="flex h-5 items-center">
              <input v-model="isNew" id="product-new" type="checkbox" class="form-checkbox" />
            </div>
            <div class="ml-3 text-sm">
              <label for="product-new" class="font-medium text-dark dark:text-base"> Produk Baru </label>
              <p class="text-xs text-muted dark:text-gray-400">Tandai sebagai "Baru" (biasanya 30 hari).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ProductCard>
</template>

<style scoped>
.form-input {
  @apply block w-full rounded-md border-muted/50 bg-secondary/20 px-4 py-2.5 text-sm text-dark placeholder:text-muted/50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-sm dark:text-base dark:placeholder:text-muted/70 focus:border-primary focus:ring-1 focus:ring-primary;
}
.form-checkbox {
  @apply h-4 w-4 rounded border-muted/50 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-primary;
}
</style>
