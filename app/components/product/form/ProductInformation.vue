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

watch(name, (newName) => {
  slug.value = slugify(newName);
});
</script>

<template>
  <ProductCard title="Informasi Produk" description="Informasi dasar mengenai produk Anda.">
    <div class="space-y-6">
      <div>
        <label for="product-name" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Nama Produk </label>
        <input v-model="name" id="product-name" type="text" required class="form-input mt-1" />
      </div>

      <div>
        <label for="product-description" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Deskripsi </label>
        <textarea v-model="description" id="product-description" rows="8" class="form-input mt-1"></textarea>
      </div>

      <div>
        <label for="product-slug" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Slug (URL) </label>
        <input v-model="slug" id="product-slug" type="text" required class="form-input mt-1 !bg-gray-100 !text-muted dark:!bg-gray-700/50 dark:!text-muted/70" />
        <p class="mt-2 text-xs text-muted dark:text-gray-400">Akan di-generate otomatis dari nama produk.</p>
      </div>
    </div>
  </ProductCard>
</template>

<style scoped>
.form-input {
  @apply block w-full rounded-md border-muted/50 bg-secondary/20 px-4 py-2.5 text-sm text-dark placeholder:text-muted/50 dark:border-gray-600 dark:bg-gray-700 dark:text-sm dark:text-base dark:placeholder:text-muted/70 focus:border-primary focus:ring-1 focus:ring-primary;
}
</style>
