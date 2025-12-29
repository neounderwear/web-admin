<script setup lang="ts">
import { ref, onMounted } from "vue";
import ProductCard from "~/components/product/form/ProductCard.vue";
import { useBrandList } from "~/composables/useBrandList";
import { useCategoryList } from "~/composables/useCategoryList";

const categoryId = defineModel<string>("categoryId", { required: true });
const brandId = defineModel<string>("brandId", { required: true });
const tags = defineModel<string[]>("tags", { required: true });
const { brandList, loadingBrandList, fetchBrandList } = useBrandList();
const { categoryList, loadingCategoryList, fetchCategoryList } = useCategoryList();

onMounted(() => {
  fetchBrandList();
  fetchCategoryList();
});

const currentTag = ref("");

function addTag() {
  const tag = currentTag.value.trim();
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag);
  }
  currentTag.value = "";
}

function removeTag(index: number) {
  tags.value.splice(index, 1);
}
</script>

<template>
  <ProductCard title="Organisasi Produk">
    <div class="space-y-6">
      <div>
        <label for="product-category" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Kategori </label>
        <select v-model="categoryId" id="product-category" required class="form-input mt-1" :disabled="loadingCategoryList">
          <option value="" disabled>
            {{ loadingCategoryList ? "Memuat kategori..." : "Pilih kategori" }}
          </option>
          <option v-for="category in categoryList" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div>
        <label for="product-brand" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Brand </label>
        <select v-model="brandId" id="product-brand" required class="form-input mt-1" :disabled="loadingBrandList">
          <option value="" disabled>
            {{ loadingBrandList ? "Memuat brand..." : "Pilih brand" }}
          </option>
          <option v-for="brand in brandList" :key="brand.id" :value="brand.id">
            {{ brand.name }}
          </option>
        </select>
      </div>

      <div>
        <label for="product-tags" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Tag (Opsional) </label>
        <input v-model="currentTag" @keydown.enter.prevent="addTag" @keydown.prevent.comma="addTag" id="product-tags" type="text" placeholder="Ketik tag lalu tekan Enter..." class="form-input mt-1" />

        <div v-if="tags.length > 0" class="mt-3 flex flex-wrap gap-2">
          <span v-for="(tag, index) in tags" :key="tag" class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary dark:bg-accent/20 dark:text-accent">
            {{ tag }}
            <button @click="removeTag(index)" type="button" class="ml-2 -mr-1 flex-shrink-0 rounded-full text-primary/70 hover:text-primary dark:text-accent/70 dark:hover:text-accent">
              <span class="sr-only">Hapus tag</span>
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </span>
        </div>
      </div>
    </div>
  </ProductCard>
</template>

<style scoped>
.form-input {
  @apply block w-full rounded-md border-muted/50 bg-secondary/20 px-4 py-2.5 text-sm text-dark placeholder:text-muted/50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-sm dark:text-base dark:placeholder:text-muted/70 focus:border-primary focus:ring-1 focus:ring-primary;
}
</style>
