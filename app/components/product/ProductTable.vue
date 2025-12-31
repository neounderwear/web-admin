<script setup lang="ts">
import { onMounted } from "vue";
import type { Product } from "~/types/product";
import { useBrandList } from "~/composables/useBrandList";
import { useCategoryList } from "~/composables/useCategoryList";
import { Vue3Lottie } from "vue3-lottie";
import notfoundAnim from "~/assets/animation/notfound.json";

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
      return { 
        label: "Publik", 
        class: "bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400", 
        dot: "bg-blue-500" 
      };
    case "draft":
      return { 
        label: "Draft", 
        class: "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/30 dark:text-yellow-400", 
        dot: "bg-yellow-500" 
      };
    case "hidden":
      return { 
        label: "Tersembunyi", 
        class: "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400", 
        dot: "bg-gray-500" 
      };
    default:
      return { 
        label: visibility, 
        class: "bg-gray-50 text-gray-600 ring-gray-500/10", 
        dot: "bg-gray-500" 
      };
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
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th scope="col" class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Thumbnail</th>
            <th scope="col" class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nama Produk</th>
            <th scope="col" class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Kategori/Brand</th>
            <th scope="col" class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Harga</th>
            <th scope="col" class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Stok</th>
            <th scope="col" class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
            <th scope="col" class="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          
          <template v-if="loading">
            <tr v-for="n in 5" :key="'skeleton-' + n" class="animate-pulse">
              <td class="px-6 py-4"><div class="h-12 w-12 rounded bg-gray-200 dark:bg-gray-700"></div></td>
              <td class="px-6 py-4"><div class="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700"></div></td>
              <td class="px-6 py-4">
                <div class="space-y-2">
                  <div class="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div class="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </td>
              <td class="px-6 py-4"><div class="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div></td>
              <td class="px-6 py-4 text-center"><div class="mx-auto h-4 w-8 rounded bg-gray-200 dark:bg-gray-700"></div></td>
              <td class="px-6 py-4 text-center"><div class="mx-auto h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div></td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <div class="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div class="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </td>
            </tr>
          </template>

          <tr v-else-if="products.length === 0">
            <td colspan="7" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center justify-center">
                <ClientOnly>
                  <Vue3Lottie :animationData="notfoundAnim" :height="160" :width="160" />
                </ClientOnly>
                <p class="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Belum ada produk yang ditemukan.</p>
              </div>
            </td>
          </tr>

          <template v-else>
            <tr 
              v-for="product in products" 
              :key="product.id" 
              class="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-700/50"
            >
              <td class="px-6 py-4 align-middle">
                <div class="relative h-12 w-12 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                  <img :src="product.thumbnailUrl || 'https://via.placeholder.com/48'" :alt="product.name" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
                  <a 
                    :href="getPreviewUrl(product.slug)" 
                    target="_blank" 
                    class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" 
                    title="Lihat di toko"
                  >
                    <Icon name="lucide:eye" class="h-5 w-5 text-white drop-shadow-md" />
                  </a>
                </div>
              </td>

              <td class="px-6 py-4 align-middle">
                <div class="max-w-xs truncate text-sm font-semibold text-gray-900 dark:text-white" :title="product.name">
                  {{ product.name }}
                </div>
                <div v-if="product.variants?.length" class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ product.variants.length }} Varian
                </div>
              </td>

              <td class="px-6 py-4 align-middle">
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ getCategoryName(product) }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ getBrandName(product) }}</div>
              </td>

              <td class="px-6 py-4 align-middle whitespace-nowrap">
                <div v-if="product.discountPrice > 0 && product.discountPrice < product.retailPrice">
                  <div class="text-xs text-gray-500 line-through dark:text-gray-400">Rp {{ product.retailPrice.toLocaleString("id-ID") }}</div>
                  <div class="text-sm font-bold text-red-600 dark:text-red-400">Rp {{ product.discountPrice.toLocaleString("id-ID") }}</div>
                </div>
                <div v-else class="text-sm font-bold text-gray-900 dark:text-white">Rp {{ product.retailPrice.toLocaleString("id-ID") }}</div>
              </td>

              <td class="px-6 py-4 text-center align-middle">
                <div 
                  class="text-sm font-medium" 
                  :class="product.totalStock <= 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'"
                >
                  {{ product.totalStock }}
                </div>
                <div v-if="product.totalStock <= 0" class="text-[10px] font-medium text-red-500">Habis</div>
              </td>

              <td class="px-6 py-4 text-center align-middle">
                <div class="flex flex-col items-center gap-2">
                  <span 
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                    :class="getVisibilityBadge(product.visibility).class"
                  >
                    <span class="mr-1.5 h-1.5 w-1.5 rounded-full" :class="getVisibilityBadge(product.visibility).dot"></span>
                    {{ getVisibilityBadge(product.visibility).label }}
                  </span>

                  <button
                    @click="emit('toggleStatus', product)"
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    :class="product.status 
                      ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'"
                    title="Klik untuk mengubah status aktif"
                  >
                    {{ product.status ? "Aktif" : "Nonaktif" }}
                  </button>
                </div>
              </td>

              <td class="px-6 py-4 text-right align-middle whitespace-nowrap">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="emit('edit', product)" 
                    class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                    title="Edit Produk"
                  >
                    <Icon name="lucide:edit-2" class="h-4 w-4" />
                  </button>
                  <button 
                    @click="emit('delete', product)" 
                    class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    title="Hapus Produk"
                  >
                    <Icon name="lucide:trash-2" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>