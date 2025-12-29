<script setup lang="ts">
import { computed } from "vue";
import ProductCard from "~/components/product/form/ProductCard.vue";

const metaTitle = defineModel<string>("metaTitle", { required: true });
const metaDescription = defineModel<string>("metaDescription", { required: true });
const slug = defineModel<string>("slug", { required: true });
const baseUrl = "https://www.tokosaya.com/product/";
const truncate = (text: string, length: number) => {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

const previewUrl = computed(() => baseUrl + slug.value);
const previewTitle = computed(() => metaTitle.value || "Judul Halaman Produk - Toko Anda");
const previewDescription = computed(() => metaDescription.value || "Deskripsi meta ini akan muncul di hasil pencarian Google. Tulis deskripsi yang menarik untuk meningkatkan rasio klik.");

const titleMaxLength = 60;
const descriptionMaxLength = 160;
</script>

<template>
  <ProductCard title="SEO (Search Engine Optimization)" description="Atur bagaimana produk Anda muncul di hasil pencarian.">
    <div class="space-y-6">
      <div>
        <div class="flex justify-between">
          <label for="meta-title" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Meta Title </label>
          <span class="text-xs" :class="metaTitle.length > titleMaxLength ? 'text-red-500 font-bold' : 'text-muted'"> {{ metaTitle.length }} / {{ titleMaxLength }} </span>
        </div>
        <input v-model="metaTitle" id="meta-title" type="text" :maxlength="titleMaxLength + 10" class="form-input mt-1" />
      </div>

      <div>
        <div class="flex justify-between">
          <label for="meta-description" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Meta Description </label>
          <span class="text-xs" :class="metaDescription.length > descriptionMaxLength ? 'text-red-500 font-bold' : 'text-muted'"> {{ metaDescription.length }} / {{ descriptionMaxLength }} </span>
        </div>
        <textarea v-model="metaDescription" id="meta-description" rows="3" :maxlength="descriptionMaxLength + 20" class="form-input mt-1"></textarea>
      </div>

      <div>
        <label for="seo-slug" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Slug (URL) </label>
        <input :value="slug" id="seo-slug" type="text" readonly class="form-input mt-1 !bg-gray-100 !text-muted dark:!bg-gray-700/50 dark:!text-muted/70" />
      </div>

      <div>
        <label class="block text-sm font-medium text-dark/80 dark:text-base/80"> Pratinjau Google </label>
        <div class="mt-2 rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-black/20">
          <div class="flex items-center space-x-2">
            <div class="h-7 w-7 rounded-full bg-gray-100 p-1 dark:bg-gray-800">
              <Icon name="lucide:shopping-bag" class="h-full w-full text-gray-400" />
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-dark dark:text-gray-300">Tokosaya.com</span>
              <span class="text-xs text-gray-500 dark:text-gray-500">{{ truncate(previewUrl, 45) }}</span>
            </div>
          </div>
          <h3 class="mt-2 block truncate text-xl font-medium text-[#1a0dab] hover:underline dark:text-[#8ab4f8]">
            {{ previewTitle }}
          </h3>
          <p class="mt-1 text-sm leading-snug text-[#4d5156] dark:text-gray-300">
            {{ truncate(previewDescription, 160) }}
          </p>
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
