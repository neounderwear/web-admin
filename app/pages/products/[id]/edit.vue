<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useProducts } from "~/composables/useProducts";
import { useToast } from "~/composables/useToast";
import type { Product } from "~/types/product";
import { useBrandList } from "~/composables/useBrandList";
import { useCategoryList } from "~/composables/useCategoryList";
import ProductInformation from "~/components/product/form/ProductInformation.vue";
import ProductVariants from "~/components/product/form/ProductVariants.vue";
import ProductPricing from "~/components/product/form/ProductPricing.vue";
import ProductMedia from "~/components/product/form/ProductMedia.vue";
import ProductOrganization from "~/components/product/form/ProductOrganization.vue";
import ProductStatus from "~/components/product/form/ProductStatus.vue";
import ProductShipping from "~/components/product/form/ProductShipping.vue";
import ProductSEO from "~/components/product/form/ProductSEO.vue";

const router = useRouter();
const route = useRoute();
const { updateProduct, fetchProductById, loading } = useProducts();
const { showSuccess, showError } = useToast();
const { brandList, fetchBrandList } = useBrandList();
const { categoryList, fetchCategoryList } = useCategoryList();
const productId = route.params.id as string;
const productData = ref<(Omit<Product, "images"> & { images: (File | string)[] }) | null>(null);
const pageLoading = ref(true);

useHead({ title: "Edit Produk" });

onMounted(async () => {
  await fetchBrandList();
  await fetchCategoryList();

  const fetchedProduct = await fetchProductById(productId);
  if (fetchedProduct) {
    productData.value = fetchedProduct;
  } else {
    showError("Gagal memuat produk. Mengalihkan...");
    router.push("/products");
  }
  pageLoading.value = false;
});

function validateForm(): boolean {
  if (!productData.value) return false;
  if (!productData.value.name) {
    showError("Nama produk wajib diisi.");
    return false;
  }
  if (!productData.value.categoryId) {
    showError("Kategori wajib dipilih.");
    return false;
  }
  return true;
}

async function handleSaveProduct() {
  if (!productData.value || !validateForm()) return;

  loading.value = true;
  try {
    const pd = productData.value;
    pd.nameLowerCase = pd.name.toLowerCase();
    const category = categoryList.value?.find((c) => c.id === pd.categoryId);
    const brand = brandList.value?.find((b) => b.id === pd.brandId);
    pd.categoryName = category?.name || "";
    pd.brandName = brand?.name || "";
    pd.searchKeywords = [...pd.name.toLowerCase().split(" "), ...pd.tags, pd.categoryName.toLowerCase(), pd.brandName.toLowerCase()].filter((kw, index, self) => kw && self.indexOf(kw) === index);
    pd.outOfStock = pd.totalStock <= 0;
    if (!pd.metaTitle) pd.metaTitle = pd.name;
    if (!pd.metaDescription) pd.metaDescription = pd.description.substring(0, 160);
    if (pd.discountPrice > 0 && pd.retailPrice > 0 && pd.discountPrice < pd.retailPrice) {
      pd.discountPercent = Math.round(((pd.retailPrice - pd.discountPrice) / pd.retailPrice) * 100);
    } else {
      pd.discountPercent = null;
    }
    await updateProduct(productId, pd);

    showSuccess("Produk berhasil diperbarui!");
    router.push("/products/manage");
  } catch (e) {
    showError(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="handleSaveProduct">
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-dark dark:text-base">Edit Produk</h1>
        <div class="flex space-x-2">
          <button type="button" @click="router.push('/products/manage')" class="btn-secondary">Batal</button>
          <button type="submit" :disabled="loading || pageLoading" class="btn-primary">
            <span v-if="!loading"> Simpan Perubahan </span>
            <span v-else class="flex items-center">
              <Icon name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </span>
          </button>
        </div>
      </div>

      <div v-if="pageLoading" class="flex justify-center items-center h-96">
        <Icon name="lucide:loader-2" class="h-12 w-12 animate-spin text-primary" />
      </div>

      <div v-else-if="productData" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
          <ProductInformation v-model:name="productData.name" v-model:description="productData.description" v-model:slug="productData.slug" />

          <ProductMedia v-model:images="productData.images" v-model:videoUrl="productData.videoUrl" />

          <ProductPricing v-model:retailPrice="productData.retailPrice" v-model:wholesalePrice="productData.wholesalePrice" v-model:resellerPrice="productData.resellerPrice" v-model:discountPrice="productData.discountPrice" />
          <ProductVariants v-model:variants="productData.variants" v-model:totalStock="productData.totalStock" />
          <ProductShipping v-model:weight="productData.weight" v-model:dimensions="productData.dimensions" v-model:material="productData.material" />
        </div>

        <div class="lg:col-span-1 space-y-6">
          <ProductStatus v-model:status="productData.status" v-model:visibility="productData.visibility" v-model:isFeatured="productData.isFeatured" v-model:isNew="productData.isNew" />
          <ProductOrganization v-model:categoryId="productData.categoryId" v-model:brandId="productData.brandId" v-model:tags="productData.tags" />
          <ProductSEO v-model:metaTitle="productData.metaTitle" v-model:metaDescription="productData.metaDescription" v-model:slug="productData.slug" />
        </div>
      </div>

      <div v-if="productData" class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700 flex justify-end space-x-2">
        <button type="button" @click="router.push('/products/manage')" class="btn-secondary">Batal</button>
        <button type="submit" :disabled="loading || pageLoading" class="btn-primary">
          <span v-if="!loading"> Simpan Perubahan </span>
          <span v-else class="flex items-center">
            <Icon name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
            Menyimpan...
          </span>
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.btn-primary {
  @apply inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-in-out-smooth hover:bg-primary/80 disabled:cursor-not-allowed disabled:bg-muted/50;
}
.btn-secondary {
  @apply rounded-md border border-muted/50 bg-white px-4 py-2 text-sm font-medium text-dark/80 shadow-sm transition-all duration-150 ease-in-out-smooth hover:bg-secondary/20 dark:border-muted/30 dark:bg-gray-800 dark:text-base/80 dark:hover:bg-gray-700;
}
</style>
