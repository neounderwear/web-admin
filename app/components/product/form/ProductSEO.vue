<script setup lang="ts">
import { computed } from "vue";
import ProductCard from "~/components/product/form/ProductCard.vue";

const metaTitle = defineModel<string>("metaTitle", { required: true });
const metaDescription = defineModel<string>("metaDescription", { required: true });
const slug = defineModel<string>("slug", { required: true });

const baseUrl = "https://www.tokosaya.com/product/"; // Ganti dengan domain asli Anda

const truncate = (text: string, length: number) => {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

const previewUrl = computed(() => baseUrl + (slug.value || 'nama-produk'));
const previewTitle = computed(() => metaTitle.value || "Judul Halaman Produk - Toko Anda");
const previewDescription = computed(() => metaDescription.value || "Deskripsi meta ini akan muncul di hasil pencarian Google. Tulis deskripsi yang menarik untuk meningkatkan rasio klik (CTR).");

const titleMaxLength = 60;
const descriptionMaxLength = 160;
</script>

<template>
  <ProductCard title="SEO (Search Engine Optimization)" description="Optimalkan tampilan produk Anda di hasil pencarian Google.">
    <div class="space-y-6">
      
      <div>
        <div class="mb-1.5 flex justify-between">
          <label for="meta-title" class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"> 
            Meta Title 
          </label>
          <span class="text-xs font-medium" :class="metaTitle.length > titleMaxLength ? 'text-red-500' : 'text-gray-400'"> 
            {{ metaTitle.length }} / {{ titleMaxLength }} 
          </span>
        </div>
        <div class="relative">
          <input 
            v-model="metaTitle" 
            id="meta-title" 
            type="text" 
            :maxlength="titleMaxLength + 10" 
            placeholder="Contoh: Jual Kaos Polos Bahan Adem - TokoSaya"
            class="form-input" 
          />
        </div>
        <p class="mt-1.5 text-xs text-gray-400">Judul yang muncul di tab browser dan link biru Google.</p>
      </div>

      <div>
        <div class="mb-1.5 flex justify-between">
          <label for="meta-description" class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"> 
            Meta Description 
          </label>
          <span class="text-xs font-medium" :class="metaDescription.length > descriptionMaxLength ? 'text-red-500' : 'text-gray-400'"> 
            {{ metaDescription.length }} / {{ descriptionMaxLength }} 
          </span>
        </div>
        <div class="relative">
          <textarea 
            v-model="metaDescription" 
            id="meta-description" 
            rows="3" 
            :maxlength="descriptionMaxLength + 20" 
            placeholder="Jelaskan produk Anda secara singkat dan menarik..."
            class="form-input resize-none"
          ></textarea>
        </div>
      </div>

      <div>
        <label for="seo-slug" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"> 
          Slug (URL) 
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Icon name="lucide:link" class="h-4 w-4" />
          </div>
          <input 
            :value="slug" 
            id="seo-slug" 
            type="text" 
            readonly 
            class="form-input pl-10 bg-gray-50 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400" 
          />
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <label class="mb-3 block text-xs font-bold uppercase text-gray-500 dark:text-gray-400"> 
          Pratinjau di Google 
        </label>
        
        <div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-[#202124] dark:ring-gray-700">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2 text-sm text-[#202124] dark:text-[#dadce0]">
              <div class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Icon name="lucide:shopping-bag" class="h-3.5 w-3.5 text-gray-500" />
              </div>
              <div class="flex flex-col leading-tight">
                <span class="text-xs font-normal">Tokosaya.com</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ truncate(previewUrl, 60) }}</span>
              </div>
              <div class="ml-auto">
                 <Icon name="lucide:more-vertical" class="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <h3 class="mt-1 text-xl font-normal text-[#1a0dab] hover:underline dark:text-[#8ab4f8]">
              {{ previewTitle }}
            </h3>

            <p class="text-sm leading-normal text-[#4d5156] dark:text-[#bdc1c6]">
              {{ truncate(previewDescription, 160) }}
            </p>
          </div>
        </div>
      </div>

    </div>
  </ProductCard>
</template>

<style scoped>
.form-input {
  @apply block w-full rounded-lg border-gray-200 bg-white py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:bg-white focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm;
}
</style>