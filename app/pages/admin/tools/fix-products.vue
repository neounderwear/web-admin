<script setup lang="ts">
import { ref } from "vue";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
const { $firestore } = useNuxtApp();

const loading = ref(false);
const logs = ref<string[]>([]);

const log = (text: string) => logs.value.push(text);

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const extractKeywords = (product: any) => {
  const base = [
    product.name,
    product.brandName,
    product.categoryName,
    ...(product.tags || []),
    ...(product.variants?.flatMap((v: any) => v.values.map((x: any) => x.value)) || []),
    ...(product.variants?.flatMap((v: any) => v.values.map((x: any) => x.sku)) || []),
  ];

  const unique = new Set(
    base
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, "")
      .split(" ")
      .filter((w) => w.length > 1)
  );

  return Array.from(unique);
};

const computeTotalStock = (product: any) =>
  product.variants?.reduce((sum: number, v: any) => {
    return sum + v.values.reduce((s: number, item: any) => s + item.stock, 0);
  }, 0) || 0;

const runMigration = async () => {
  loading.value = true;
  logs.value = [];

  log("Fetching products...");

  const snap = await getDocs(collection($firestore, "products"));

  log(`Found ${snap.size} products.`);

  for (const docSnap of snap.docs) {
    const product = docSnap.data();
    const id = docSnap.id;

    log(`Updating: ${product.name}`);

    const totalStock = computeTotalStock(product);
    const slug = product.slug || generateSlug(product.name);
    const keywords = extractKeywords(product);

    const updateData = {
      // Slug & search helpers
      slug,
      nameLowerCase: product.nameLowerCase || product.name.toLowerCase(),

      // Denormalized names (keep existing if present)
      brandName: product.brandName || "",
      categoryName: product.categoryName || "",

      // Tags & search
      tags: product.tags || [],
      searchKeywords: product.searchKeywords || keywords,
      soldCount: product.soldCount || 0,

      // Homepage flags
      isFeatured: product.isFeatured ?? false,
      isNew: product.isNew ?? false,
      isPopular: product.isPopular ?? false,

      // Thumbnail & alt text
      thumbnailUrl: product.thumbnailUrl || product.images?.[0] || "",
      imageAltTexts: product.imageAltTexts || [],

      // Promo fields
      discountPercent: product.discountPercent ?? null,
      discountStart: product.discountStart || null,
      discountEnd: product.discountEnd || null,

      // Stock
      totalStock,
      outOfStock: totalStock <= 0,

      // Visibility
      visibility: product.visibility || "public",

      // SEO Default
      metaTitle: product.metaTitle || product.name,
      metaDescription: product.metaDescription || product.description?.substring(0, 150) + "..." || "",

      // Optional Extra
      weight: product.weight ?? null,
      material: product.material ?? null,
      dimensions: product.dimensions ?? null,
      minOrder: product.minOrder ?? 1,
      isLimitedEdition: product.isLimitedEdition ?? false,
      views: product.views || 0,

      updatedAt: new Date(),
    };

    await updateDoc(doc($firestore, "products", id), updateData);

    log(`Updated: ${id}`);
  }

  log("Migration completed successfully!");
  loading.value = false;
};
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Fix Products Migration Tool</h1>

    <button @click="runMigration" :disabled="loading" class="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400">
      {{ loading ? "Processing..." : "Run Migration" }}
    </button>

    <div class="mt-6 bg-black text-green-400 p-4 rounded h-96 overflow-auto text-sm">
      <p v-for="(l, i) in logs" :key="i">{{ l }}</p>
    </div>
  </div>
</template>
