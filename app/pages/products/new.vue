<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
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
const { addProduct, loading } = useProducts();
const { showSuccess, showError } = useToast();

const { brandList } = useBrandList();
const { categoryList } = useCategoryList();

useHead({ title: "Tambah Produk Baru" });

const productData = reactive<Omit<Product, "id" | "createdAt" | "updatedAt">>({
  name: "",
  description: "",
  brandId: "",
  categoryId: "",
  images: [],
  wholesalePrice: 0,
  resellerPrice: 0,
  retailPrice: 0,
  discountPrice: 0,
  status: true,
  variants: [],
  videoUrl: null,
  slug: "",
  nameLowerCase: "",
  brandName: "",
  categoryName: "",
  tags: [],
  searchKeywords: [],
  soldCount: 0,
  isFeatured: false,
  isNew: true,
  isPopular: false,
  thumbnailUrl: "",
  imageAltTexts: [],
  discountPercent: null,
  discountStart: null,
  discountEnd: null,
  totalStock: 0,
  outOfStock: true,
  visibility: "public",
  metaTitle: "",
  metaDescription: "",
  weight: null,
  material: null,
  dimensions: null,
  minOrder: 1,
  isLimitedEdition: false,
  views: 0,
});

function validateForm(): boolean {
  if (!productData.name || productData.name.trim() === "") {
    showError("Nama produk wajib diisi.");
    return false;
  }
  if (!productData.categoryId) {
    showError("Kategori wajib dipilih.");
    return false;
  }
  if (!productData.brandId) {
    showError("Brand wajib dipilih.");
    return false;
  }
  if (!Array.isArray(productData.images) || productData.images.length === 0) {
    showError("Minimal satu gambar produk wajib di-upload.");
    return false;
  }
  if (productData.retailPrice <= 0) {
    showError("Harga retail harus lebih besar dari 0.");
    return false;
  }
  if (productData.variants && productData.variants.length > 0 && productData.totalStock <= 0) {
    showError("Stok varian tidak boleh 0 jika menggunakan varian.");
    return false;
  }
  return true;
}

async function handleSaveProduct() {
  if (!validateForm()) return;

  loading.value = true;
  try {
    const pd = productData;
    pd.nameLowerCase = (pd.name || "").toLowerCase();
    const category = categoryList.value?.find((c) => c.id === pd.categoryId);
    const brand = brandList.value?.find((b) => b.id === pd.brandId);
    pd.categoryName = category?.name || "";
    pd.brandName = brand?.name || "";
    const keywordSources: string[] = [
      ...(pd.name ? pd.name.split(/\s+/) : []),
      ...(pd.tags || []).map((t) => String(t).toLowerCase()),
      ...(pd.categoryName ? pd.categoryName.split(/\s+/) : []),
      ...(pd.brandName ? pd.brandName.split(/\s+/) : []),
    ].map((k) => String(k).toLowerCase().trim());
    pd.searchKeywords = Array.from(new Set(keywordSources.filter((k) => k && k.length > 1)));
    pd.outOfStock = (pd.totalStock ?? 0) <= 0;

    if (!pd.metaTitle || pd.metaTitle.trim() === "") pd.metaTitle = pd.name;

    if (!pd.metaDescription || pd.metaDescription.trim() === "") {
      pd.metaDescription = (pd.description || "").substring(0, 160);
    }

    if (pd.discountPrice > 0 && pd.retailPrice > 0 && pd.discountPrice < pd.retailPrice) {
      pd.discountPercent = Math.round(((pd.retailPrice - pd.discountPrice) / pd.retailPrice) * 100);
    } else {
      pd.discountPercent = null;
    }

    await addProduct(pd as any, (pd.images as unknown as File[]) || []);

    showSuccess("Produk berhasil ditambahkan!");
    await router.push("/products/manage");
  } catch (e: any) {
    showError(e?.message ? String(e.message) : String(e));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="handleSaveProduct">
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-dark dark:text-base">Tambah Produk Baru</h1>
        <div class="flex space-x-2">
          <button type="button" @click="router.push('/products/manage')" class="btn-secondary">Batal</button>
          <button type="submit" :disabled="loading" class="btn-primary">
            <span v-if="!loading"> Simpan Produk </span>
            <span v-else class="flex items-center">
              <Icon name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
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

      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700 flex justify-end space-x-2">
        <button type="button" @click="router.push('/products/manage')" class="btn-secondary">Batal</button>
        <button type="submit" :disabled="loading" class="btn-primary">
          <span v-if="!loading"> Simpan Produk </span>
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
