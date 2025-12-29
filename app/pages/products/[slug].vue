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
  <div class="container mx-auto max-w-7xl p-6">
    <div v-if="loading" class="flex h-96 items-center justify-center">
      <Icon name="lucide:loader-2" class="h-10 w-10 animate-spin text-primary" />
    </div>
    <div v-else-if="error" class="flex h-96 items-center justify-center text-center text-red-500">
      <p>{{ error.message }}</p>
    </div>

    <div v-else-if="product" class="animate-fade-in">
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div class="text-sm text-muted">
          <NuxtLink to="/products" class="hover:text-primary hover:underline">Produk</NuxtLink>
          <Icon name="lucide:chevron-right" class="mx-2 inline-block h-3 w-3 opacity-50" />
          <span class="font-medium text-dark dark:text-gray-200">{{ product.name }}</span>
        </div>
        <button @click="goToEdit" class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90">
          <Icon name="lucide:edit" class="mr-2 h-4 w-4" />
          Edit Produk
        </button>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div class="space-y-6 lg:col-span-5">
          <div class="group relative aspect-square overflow-hidden rounded-2xl border border-muted/20 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <img :src="selectedImage || product.thumbnailUrl" :alt="product.name" class="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
            <div class="absolute left-4 top-4 flex flex-col gap-2">
              <span v-if="product.isNew" class="rounded-md bg-green-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">BARU</span>
              <span v-if="product.isFeatured" class="rounded-md bg-yellow-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">UNGGULAN</span>
            </div>
          </div>

          <div v-if="product.images && product.images.length > 0" class="custom-scrollbar flex gap-3 overflow-x-auto pb-2">
            <button
              v-for="(img, index) in product.images"
              :key="index"
              @click="selectedImage = img"
              class="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all bg-white dark:bg-gray-800"
              :class="selectedImage === img ? 'border-primary ring-2 ring-primary/30' : 'border-muted/20 hover:border-primary/50'"
            >
              <img :src="img" class="h-full w-full object-cover" />
            </button>
          </div>

          <div v-if="product.variants && product.variants.length > 0" class="rounded-xl border border-muted/20 bg-white p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h3 class="mb-4 flex items-center gap-2 text-sm font-bold uppercase text-dark dark:text-white"><Icon name="lucide:layers" class="h-4 w-4" /> Stok Varian</h3>
            <div class="overflow-hidden rounded-lg border border-muted/20">
              <table class="min-w-full divide-y divide-muted/20">
                <thead class="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th class="px-3 py-2 text-left text-[10px] font-semibold uppercase text-muted">Tipe</th>
                    <th class="px-3 py-2 text-left text-[10px] font-semibold uppercase text-muted">Nilai</th>
                    <th class="px-3 py-2 text-left text-[10px] font-semibold uppercase text-muted">SKU</th>
                    <th class="px-3 py-2 text-right text-[10px] font-semibold uppercase text-muted">Stok</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-muted/20 bg-white dark:bg-gray-800">
                  <template v-for="variant in product.variants" :key="variant.type">
                    <tr v-for="val in variant.values" :key="val.value" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td class="px-3 py-2 text-xs text-dark dark:text-gray-300">{{ variant.type }}</td>
                      <td class="px-3 py-2 text-xs font-medium text-dark dark:text-white">{{ val.value }}</td>
                      <td class="px-3 py-2 text-xs font-mono text-muted">{{ val.sku || "-" }}</td>
                      <td class="px-3 py-2 text-right text-xs font-bold" :class="val.stock > 0 ? 'text-green-600' : 'text-red-500'">
                        {{ val.stock }}
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>

          <div class="rounded-lg border border-dashed border-muted/40 bg-gray-50 p-4 dark:bg-gray-800/50 dark:border-gray-600">
            <h3 class="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-muted"><Icon name="lucide:search" class="h-3 w-3" /> SEO Metadata</h3>
            <div class="space-y-1 opacity-75">
              <p class="truncate text-sm font-medium text-blue-700 dark:text-blue-400">{{ product.metaTitle || product.name }}</p>
              <p class="truncate text-xs text-green-700 dark:text-green-400">.../product/{{ product.slug }}</p>
              <p class="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{{ product.metaDescription || product.description }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-8 lg:col-span-7">
          <div>
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <span v-if="product.categoryName" class="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-purple-900/30 dark:text-purple-300">
                {{ product.categoryName }}
              </span>
              <span v-if="product.brandName" class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-300">
                {{ product.brandName }}
              </span>

              <span
                class="ml-auto rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                :class="product.visibility === 'public' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'"
              >
                {{ product.visibility }}
              </span>
            </div>

            <h1 class="text-3xl font-bold leading-tight text-dark dark:text-white">{{ product.name }}</h1>

            <div class="mt-4 flex items-baseline gap-3">
              <div v-if="product.discountPrice > 0 && product.discountPrice < product.retailPrice" class="flex items-baseline gap-3">
                <span class="text-4xl font-bold text-primary">Rp {{ product.discountPrice.toLocaleString("id-ID") }}</span>
                <span class="text-lg text-muted line-through decoration-2">Rp {{ product.retailPrice.toLocaleString("id-ID") }}</span>
                <span class="rounded-md bg-red-100 px-2 py-1 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">-{{ product.discountPercent }}%</span>
              </div>
              <div v-else class="text-4xl font-bold text-dark dark:text-white">Rp {{ product.retailPrice.toLocaleString("id-ID") }}</div>
            </div>
          </div>

          <hr class="border-muted/20 dark:border-gray-700" />

          <div class="grid grid-cols-3 gap-4">
            <div class="rounded-lg border border-muted/20 bg-gray-50 p-4 text-center dark:bg-gray-800/50 dark:border-gray-700">
              <p class="text-xs font-semibold uppercase text-muted">Total Stok</p>
              <p class="text-xl font-bold" :class="product.totalStock > 0 ? 'text-green-600' : 'text-red-500'">{{ product.totalStock }}</p>
            </div>
            <div class="rounded-lg border border-muted/20 bg-gray-50 p-4 text-center dark:bg-gray-800/50 dark:border-gray-700">
              <p class="text-xs font-semibold uppercase text-muted">Terjual</p>
              <p class="text-xl font-bold text-dark dark:text-white">{{ product.soldCount }}</p>
            </div>
            <div class="rounded-lg border border-muted/20 bg-gray-50 p-4 text-center dark:bg-gray-800/50 dark:border-gray-700">
              <p class="text-xs font-semibold uppercase text-muted">Dilihat</p>
              <p class="text-xl font-bold text-dark dark:text-white">{{ product.views }}</p>
            </div>
          </div>

          <div class="rounded-xl border border-muted/20 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div class="mb-4 flex items-center gap-2 border-b border-muted/10 pb-3">
              <Icon name="lucide:align-left" class="h-5 w-5 text-primary" />
              <h3 class="text-lg font-bold text-dark dark:text-white">Deskripsi Produk</h3>
            </div>
            <div class="prose prose-sm max-w-none text-dark/80 dark:text-gray-300 dark:prose-invert">
              <p v-if="product.description" class="whitespace-pre-wrap leading-relaxed">{{ product.description }}</p>
              <p v-else class="italic text-muted">Tidak ada deskripsi.</p>
            </div>
          </div>

          <div class="rounded-xl border border-muted/20 bg-gray-50/50 p-6 dark:bg-gray-800/50 dark:border-gray-700">
            <div class="mb-4 flex items-center gap-2 border-b border-muted/10 pb-3">
              <Icon name="lucide:list" class="h-5 w-5 text-primary" />
              <h3 class="text-lg font-bold text-dark dark:text-white">Spesifikasi Teknis</h3>
            </div>
            <dl class="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              <div class="relative border-l-2 border-primary/20 pl-4">
                <dt class="text-xs font-medium uppercase text-muted">Berat</dt>
                <dd class="mt-1 text-sm font-semibold text-dark dark:text-gray-200">{{ product.weight ? `${product.weight} gram` : "-" }}</dd>
              </div>
              <div class="relative border-l-2 border-primary/20 pl-4">
                <dt class="text-xs font-medium uppercase text-muted">Dimensi (PxLxT)</dt>
                <dd class="mt-1 text-sm font-semibold text-dark dark:text-gray-200">
                  {{ product.dimensions ? `${product.dimensions.length} x ${product.dimensions.width} x ${product.dimensions.height} cm` : "-" }}
                </dd>
              </div>
              <div class="relative border-l-2 border-primary/20 pl-4">
                <dt class="text-xs font-medium uppercase text-muted">Bahan</dt>
                <dd class="mt-1 text-sm font-semibold text-dark dark:text-gray-200">{{ product.material || "-" }}</dd>
              </div>
              <div class="relative border-l-2 border-primary/20 pl-4">
                <dt class="text-xs font-medium uppercase text-muted">Min. Order</dt>
                <dd class="mt-1 text-sm font-semibold text-dark dark:text-gray-200">{{ product.minOrder }} Pcs</dd>
              </div>
            </dl>
          </div>

          <div v-if="product.tags && product.tags.length">
            <h3 class="mb-2 text-xs font-bold uppercase text-muted">Tags</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in product.tags" :key="tag" class="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"> #{{ tag }} </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
