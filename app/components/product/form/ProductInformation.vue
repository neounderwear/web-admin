<script setup lang="ts">
import { watch } from "vue";
import ProductCard from "~/components/product/form/ProductCard.vue";

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const name = defineModel<string>("name", { required: true });
const description = defineModel<string>("description", { required: true });
const slug = defineModel<string>("slug", { required: true });

// Auto-generate slug from name
watch(name, (newName) => {
  slug.value = slugify(newName);
});
</script>

<template>
  <ProductCard title="Informasi Produk" description="Isi detail dasar produk, nama, deskripsi, dan URL.">
    <div class="space-y-5">
      
      <div>
        <label for="product-name" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Nama Produk
        </label>
        <div class="relative">
          <input 
            v-model="name" 
            id="product-name" 
            type="text" 
            required 
            placeholder="Contoh: Kaos Polos Hitam"
            class="form-input" 
          />
        </div>
      </div>

      <div>
        <label for="product-description" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Deskripsi
        </label>
        <div class="relative">
          <textarea 
            v-model="description" 
            id="product-description" 
            rows="6" 
            placeholder="Jelaskan fitur dan keunggulan produk Anda..."
            class="form-input resize-none"
          ></textarea>
        </div>
      </div>

      <div>
        <label for="product-slug" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Slug (URL)
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <span class="text-xs">/products/</span>
          </div>
          <input 
            v-model="slug" 
            id="product-slug" 
            type="text" 
            required 
            class="form-input pl-20 bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300" 
          />
        </div>
        <p class="mt-1.5 text-xs text-gray-400">
          *Otomatis diisi berdasarkan nama produk. Bisa diedit jika perlu.
        </p>
      </div>

    </div>
  </ProductCard>
</template>

<style scoped>
.form-input {
  @apply block w-full rounded-lg border-gray-200 bg-white py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:bg-white focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm;
}
</style>