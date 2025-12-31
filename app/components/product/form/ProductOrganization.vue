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
  <ProductCard title="Organisasi Produk" description="Atur kategori, brand, dan label untuk memudahkan pencarian.">
    <div class="space-y-6">
      
      <div>
        <label for="product-category" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Kategori
        </label>
        <div class="relative">
          <select 
            v-model="categoryId" 
            id="product-category" 
            required 
            class="form-select" 
            :disabled="loadingCategoryList"
          >
            <option value="" disabled>
              {{ loadingCategoryList ? "Memuat data..." : "Pilih Kategori" }}
            </option>
            <option v-for="category in categoryList" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <Icon v-if="loadingCategoryList" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
            <Icon v-else name="lucide:chevron-down" class="h-4 w-4" />
          </div>
        </div>
      </div>

      <div>
        <label for="product-brand" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Brand
        </label>
        <div class="relative">
          <select 
            v-model="brandId" 
            id="product-brand" 
            required 
            class="form-select" 
            :disabled="loadingBrandList"
          >
            <option value="" disabled>
              {{ loadingBrandList ? "Memuat data..." : "Pilih Brand" }}
            </option>
            <option v-for="brand in brandList" :key="brand.id" :value="brand.id">
              {{ brand.name }}
            </option>
          </select>

          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <Icon v-if="loadingBrandList" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
            <Icon v-else name="lucide:chevron-down" class="h-4 w-4" />
          </div>
        </div>
      </div>

      <div>
        <label for="product-tags" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Tag / Label
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Icon name="lucide:hash" class="h-4 w-4" />
          </div>
          <input 
            v-model="currentTag" 
            @keydown.enter.prevent="addTag" 
            @keydown.prevent.comma="addTag" 
            id="product-tags" 
            type="text" 
            placeholder="Ketik tag lalu tekan Enter..." 
            class="form-input pl-9" 
          />
        </div>

        <transition-group 
          name="list" 
          tag="div" 
          class="mt-3 flex flex-wrap gap-2"
          v-if="tags.length > 0"
        >
          <span 
            v-for="(tag, index) in tags" 
            :key="tag" 
            class="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 dark:bg-primary/20 dark:text-primary-300 transition-all hover:bg-primary/20"
          >
            {{ tag }}
            <button 
              @click="removeTag(index)" 
              type="button" 
              class="ml-2 -mr-1 rounded-md p-0.5 text-primary/60 hover:bg-primary/20 hover:text-primary focus:outline-none"
            >
              <Icon name="lucide:x" class="h-3 w-3" />
            </button>
          </span>
        </transition-group>
        <p v-else class="mt-2 text-xs text-gray-400 italic">Belum ada tag ditambahkan.</p>
      </div>

    </div>
  </ProductCard>
</template>

<style scoped>
.form-select {
  @apply block w-full appearance-none rounded-lg border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-900 focus:border-primary focus:bg-white focus:ring-primary disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-all shadow-sm;
}

.form-input {
  @apply block w-full rounded-lg border-gray-200 bg-white py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:bg-white focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm;
}

/* List Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>