<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNuxtApp, useAsyncData, createError } from "#app";
import { collection, query, where, getDocs, limit, type Firestore, type DocumentData, type QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import type { Product, ProductDocument } from "~/types/product";

const route = useRoute();
const router = useRouter();
const { $firestore } = useNuxtApp();
const firestore = $firestore as Firestore;

const slug = route.params.slug as string;
const selectedImage = ref<string>("");

const docToProduct = (doc: QueryDocumentSnapshot<DocumentData>): Product => {
  const data = doc.data() as ProductDocument;
  return {
    id: doc.id,
    ...data,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
    discountStart: data.discountStart ? (data.discountStart as Timestamp).toDate() : null,
    discountEnd: data.discountEnd ? (data.discountEnd as Timestamp).toDate() : null,
  };
};

const {
  data: product,
  pending: loading,
  error,
} = await useAsyncData(`product-${slug}`, async () => {
  const colRef = collection(firestore, "products");
  const q = query(colRef, where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  const firstDoc = snapshot.docs[0];

  if (!firstDoc || snapshot.empty) {
    throw createError({ statusCode: 404, message: "Produk tidak ditemukan", fatal: true });
  }
  return docToProduct(firstDoc);
});

watchEffect(() => {
  if (product.value) {
    selectedImage.value = product.value.thumbnailUrl;
  }
});

function goToEdit() {
  if (product.value) router.push(`/products/${product.value.id}/edit`);
}
</script>

<template>
  <div class="container mx-auto max-w-7xl p-4 sm:p-6">
    
    <div v-if="loading" class="flex h-96 items-center justify-center">
      <Icon name="lucide:loader-2" class="h-10 w-10 animate-spin text-primary" />
    </div>

    <div v-else-if="error" class="flex h-96 flex-col items-center justify-center text-center">
      <div class="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
        <Icon name="lucide:alert-circle" class="h-10 w-10 text-red-500" />
      </div>
      <h2 class="mt-4 text-lg font-bold text-gray-900 dark:text-white">Terjadi Kesalahan</h2>
      <p class="text-gray-500">{{ error.message }}</p>
      <button @click="router.push('/products/manage')" class="mt-4 text-primary hover:underline">Kembali ke Daftar Produk</button>
    </div>

    <div v-else-if="product" class="animate-fade-in">
      
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <nav class="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <NuxtLink to="/products/manage" class="hover:text-primary hover:underline">Produk</NuxtLink>
          <Icon name="lucide:chevron-right" class="mx-2 h-4 w-4 opacity-50" />
          <span class="font-medium text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">{{ product.name }}</span>
        </nav>
        
        <button 
          @click="goToEdit" 
          class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Icon name="lucide:edit" class="mr-2 h-4 w-4" />
          Edit Produk
        </button>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        <div class="space-y-8 lg:col-span-5">
          
          <div class="space-y-4">
            <div class="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <img 
                :src="selectedImage || product.thumbnailUrl" 
                :alt="product.name" 
                class="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" 
              />
              
              <div class="absolute left-4 top-4 flex flex-col gap-2">
                <span v-if="product.isNew" class="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-900 dark:text-blue-300">Baru</span>
                <span v-if="product.isFeatured" class="rounded bg-yellow-100 px-2 py-1 text-[10px] font-bold uppercase text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Unggulan</span>
              </div>
            </div>

            <div v-if="product.images && product.images.length > 0" class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                v-for="(img, index) in product.images"
                :key="index"
                @click="selectedImage = img"
                class="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all bg-white dark:bg-gray-800"
                :class="selectedImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-primary/50 dark:border-gray-700'"
              >
                <img :src="img" class="h-full w-full object-cover" />
              </button>
            </div>
          </div>

          <div v-if="product.variants && product.variants.length > 0" class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div class="border-b border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
              <h3 class="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <Icon name="lucide:layers" class="h-4 w-4 text-gray-400" /> 
                Stok Varian
              </h3>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th class="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">Tipe</th>
                    <th class="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">Nilai</th>
                    <th class="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">SKU</th>
                    <th class="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500">Stok</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  <template v-for="variant in product.variants" :key="variant.type">
                    <tr v-for="val in variant.values" :key="val.value" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td class="px-4 py-2 text-xs text-gray-900 dark:text-white">{{ variant.type }}</td>
                      <td class="px-4 py-2 text-xs text-gray-600 dark:text-gray-300">{{ val.value }}</td>
                      <td class="px-4 py-2 text-xs font-mono text-gray-500">{{ val.sku || "-" }}</td>
                      <td class="px-4 py-2 text-right text-xs font-bold" :class="val.stock > 0 ? 'text-green-600' : 'text-red-500'">
                        {{ val.stock }}
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>

          <div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800/50">
            <h3 class="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-gray-500">
              <Icon name="lucide:search" class="h-3 w-3" /> Preview SEO
            </h3>
            <div class="space-y-1">
              <p class="truncate text-sm font-medium text-[#1a0dab] dark:text-[#8ab4f8]">{{ product.metaTitle || product.name }}</p>
              <p class="truncate text-xs text-[#006621] dark:text-[#34a853]">tokosaya.com/product/{{ product.slug }}</p>
              <p class="line-clamp-2 text-xs text-[#545454] dark:text-[#bdc1c6]">{{ product.metaDescription || product.description }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-8 lg:col-span-7">
          
          <div>
            <div class="mb-4 flex flex-wrap items-center gap-2">
              <span v-if="product.categoryName" class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {{ product.categoryName }}
              </span>
              <span v-if="product.brandName" class="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:border-gray-600 dark:text-gray-400">
                {{ product.brandName }}
              </span>
              <span 
                class="ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider"
                :class="product.visibility === 'public' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'"
              >
                {{ product.visibility }}
              </span>
            </div>

            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ product.name }}</h1>

            <div class="mt-4 flex items-baseline gap-3">
              <div v-if="product.discountPrice > 0 && product.discountPrice < product.retailPrice" class="flex items-baseline gap-3">
                <span class="text-4xl font-bold text-primary">Rp {{ product.discountPrice.toLocaleString("id-ID") }}</span>
                <span class="text-lg text-gray-400 line-through decoration-2">Rp {{ product.retailPrice.toLocaleString("id-ID") }}</span>
                <span class="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">-{{ product.discountPercent }}%</span>
              </div>
              <div v-else class="text-4xl font-bold text-gray-900 dark:text-white">Rp {{ product.retailPrice.toLocaleString("id-ID") }}</div>
            </div>
          </div>

          <hr class="border-gray-100 dark:border-gray-700" />

          <div class="grid grid-cols-3 gap-4">
            <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <p class="text-xs font-bold uppercase text-gray-500">Stok Total</p>
              <p class="mt-1 text-xl font-bold" :class="product.totalStock > 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'">{{ product.totalStock }}</p>
            </div>
            <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <p class="text-xs font-bold uppercase text-gray-500">Terjual</p>
              <p class="mt-1 text-xl font-bold text-gray-900 dark:text-white">{{ product.soldCount }}</p>
            </div>
            <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <p class="text-xs font-bold uppercase text-gray-500">Dilihat</p>
              <p class="mt-1 text-xl font-bold text-gray-900 dark:text-white">{{ product.views }}</p>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 class="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Icon name="lucide:align-left" class="h-5 w-5 text-gray-400" /> Deskripsi
            </h3>
            <div class="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 dark:prose-invert">
              <p v-if="product.description" class="whitespace-pre-wrap leading-relaxed">{{ product.description }}</p>
              <p v-else class="italic text-gray-400">Tidak ada deskripsi.</p>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 class="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Icon name="lucide:list" class="h-5 w-5 text-gray-400" /> Spesifikasi
            </h3>
            
            <dl class="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              <div class="border-l-2 border-primary/20 pl-4">
                <dt class="text-xs font-bold uppercase text-gray-500">Berat</dt>
                <dd class="mt-1 text-sm font-medium text-gray-900 dark:text-white">{{ product.weight ? `${product.weight} gram` : "-" }}</dd>
              </div>
              
              <div class="border-l-2 border-primary/20 pl-4">
                <dt class="text-xs font-bold uppercase text-gray-500">Dimensi</dt>
                <dd class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {{ product.dimensions ? `${product.dimensions.length} x ${product.dimensions.width} x ${product.dimensions.height} cm` : "-" }}
                </dd>
              </div>
              
              <div class="border-l-2 border-primary/20 pl-4">
                <dt class="text-xs font-bold uppercase text-gray-500">Bahan</dt>
                <dd class="mt-1 text-sm font-medium text-gray-900 dark:text-white">{{ product.material || "-" }}</dd>
              </div>
              
              <div class="border-l-2 border-primary/20 pl-4">
                <dt class="text-xs font-bold uppercase text-gray-500">Min. Order</dt>
                <dd class="mt-1 text-sm font-medium text-gray-900 dark:text-white">{{ product.minOrder }} Pcs</dd>
              </div>
            </dl>
          </div>

          <div v-if="product.tags && product.tags.length">
            <h3 class="mb-2 text-xs font-bold uppercase text-gray-500">Tags</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in product.tags" :key="tag" class="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                #{{ tag }}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>