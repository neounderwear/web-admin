<script setup lang="ts">
import { onMounted } from "vue";
import type { Product } from "~/types/product";
import { useBrandList } from "~/composables/useBrandList";
import { useCategoryList } from "~/composables/useCategoryList";

const { brandList, fetchBrandList } = useBrandList();
const { categoryList, fetchCategoryList } = useCategoryList();

onMounted(() => {
  fetchBrandList();
  fetchCategoryList();
});

function getPreviewUrl(slug: string): string {
  return `/products/${slug}`;
}

function getBrandName(product: Product): string {
  if (product.brandName) return product.brandName;
  if (!brandList.value) return "...";
  const brand = brandList.value.find((b) => b.id === product.brandId);
  return brand ? brand.name : "(Data lama)";
}

function getCategoryName(product: Product): string {
  if (product.categoryName) return product.categoryName;
  if (!categoryList.value) return "...";
  const category = categoryList.value.find((c) => c.id === product.categoryId);
  return category ? category.name : "(Data lama)";
}

function getVisibilityBadge(visibility: string) {
  switch (visibility) {
    case "public":
      return { label: "Publik", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800" };
    case "draft":
      return { label: "Draft", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800" };
    case "hidden":
      return { label: "Tersembunyi", class: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700" };
    default:
      return { label: visibility, class: "bg-gray-100 text-gray-700" };
  }
}

defineProps<{
  products: Product[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "edit", product: Product): void;
  (e: "delete", product: Product): void;
  (e: "toggleStatus", product: Product): void;
}>();
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
    <table class="min-w-full">
      <thead class="bg-gray-50 dark:bg-gray-900">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Thumbnail</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Nama Produk</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Kategori/Brand</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Harga</th>
          <th scope="col" class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Stok</th>
          <th scope="col" class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status & Info</th>
          <th scope="col" class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        <template v-if="loading">
          <tr v-for="n in 5" :key="'skeleton-' + n">
            <td class="px-6 py-4"><div class="h-12 w-12 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div></td>
            <td class="px-6 py-4 whitespace-nowrap"><div class="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div></td>
            <td class="px-6 py-4 whitespace-nowrap"><div class="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div></td>
            <td class="px-6 py-4 whitespace-nowrap"><div class="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div></td>
            <td class="px-6 py-4 text-center"><div class="mx-auto h-4 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div></td>
            <td class="px-6 py-4 text-center"><div class="mx-auto h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div></td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
              <div class="flex justify-center space-x-3">
                <div class="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div class="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              </div>
            </td>
          </tr>
        </template>

        <tr v-else-if="products.length === 0" class="transition-colors duration-200 ease-in-out hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
          <td colspan="7" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
            <div class="flex flex-col items-center justify-center space-y-2">
              <p>Belum ada data produk.</p>
            </div>
          </td>
        </tr>

        <template v-else>
          <tr v-for="product in products" :key="product.id" class="transition-colors duration-200 ease-in-out hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
            <td class="px-6 py-4">
              <div class="group relative h-12 w-12 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                <img :src="product.thumbnailUrl" :alt="product.name" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />

                <a :href="getPreviewUrl(product.slug)" target="_blank" class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" title="Lihat di toko">
                  <Icon name="lucide:eye" class="h-5 w-5 text-white drop-shadow-md" />
                </a>
              </div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <div class="max-w-xs truncate text-sm font-medium text-dark dark:text-base" :title="product.name">
                {{ product.name }}
              </div>
              <div v-if="product.variants?.length" class="text-xs text-muted truncate">{{ product.variants.length }} Varian</div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-dark dark:text-base">{{ getCategoryName(product) }}</div>
              <div class="text-xs text-muted dark:text-gray-400">{{ getBrandName(product) }}</div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="product.discountPrice > 0 && product.discountPrice < product.retailPrice">
                <div class="text-xs text-muted line-through dark:text-gray-500">Rp {{ product.retailPrice.toLocaleString("id-ID") }}</div>
                <div class="text-sm font-bold text-red-600 dark:text-red-400">Rp {{ product.discountPrice.toLocaleString("id-ID") }}</div>
              </div>
              <div v-else class="text-sm text-dark dark:text-base">Rp {{ product.retailPrice.toLocaleString("id-ID") }}</div>
            </td>

            <td class="px-6 py-4 text-center">
              <div class="text-sm font-medium" :class="product.totalStock <= 0 ? 'text-red-500' : 'text-dark dark:text-base'">
                {{ product.totalStock }}
              </div>
              <div v-if="product.totalStock <= 0" class="text-[10px] text-red-400">Habis</div>
            </td>

            <td class="px-6 py-4 text-center">
              <div class="flex flex-col items-center space-y-2">
                <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium" :class="getVisibilityBadge(product.visibility).class">
                  {{ getVisibilityBadge(product.visibility).label }}
                </span>

                <button
                  @click="emit('toggleStatus', product)"
                  class="group relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <span class="sr-only">Ubah status</span>
                  <span aria-hidden="true" class="pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out" :class="product.status ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'"></span>
                  <span
                    aria-hidden="true"
                    class="pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out"
                    :class="product.status ? 'translate-x-5 border-green-500' : 'translate-x-0'"
                  ></span>
                </button>
              </div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
              <button @click="emit('edit', product)" class="rounded p-1.5 text-accent transition-all duration-200 hover:bg-accent/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/60" title="Edit">
                <Icon name="lucide:edit" class="h-4 w-4" />
              </button>
              <button
                @click="emit('delete', product)"
                class="rounded p-1.5 text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500/60"
                title="Hapus"
              >
                <Icon name="lucide:trash" class="h-4 w-4" />
              </button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
