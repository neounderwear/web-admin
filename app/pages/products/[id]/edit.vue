<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useProducts } from "~/composables/useProducts";
import { useToast } from "~/composables/useToast";
import type { Product } from "~/types/product";
import { useBrandList } from "~/composables/useBrandList";
import { useCategoryList } from "~/composables/useCategoryList";

// Sub-components
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

// --- INITIAL DATA FETCH ---
onMounted(async () => {
  try {
    await Promise.all([fetchBrandList(), fetchCategoryList()]);
    const fetchedProduct = await fetchProductById(productId);
    
    if (fetchedProduct) {
      productData.value = fetchedProduct;
    } else {
      showError("Gagal memuat produk. Mengalihkan...");
      router.push("/products/manage");
    }
  } catch (error) {
    showError("Terjadi kesalahan saat memuat data.");
  } finally {
    pageLoading.value = false;
  }
});

// --- VALIDATION ---
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
  if (!productData.value.images || productData.value.images.length === 0) {
    showError("Minimal satu gambar produk wajib ada.");
    return false;
  }
  return true;
}

// --- SUBMIT HANDLER ---
async function handleSaveProduct() {
  if (!productData.value || !validateForm()) return;

  loading.value = true;
  try {
    const pd = productData.value;
    
    // Auto-update derived fields
    pd.nameLowerCase = pd.name.toLowerCase();
    
    const category = categoryList.value?.find((c) => c.id === pd.categoryId);
    const brand = brandList.value?.find((b) => b.id === pd.brandId);
    
    pd.categoryName = category?.name || "";
    pd.brandName = brand?.name || "";
    
    // Refresh Keywords
    const keywordSources = [
        pd.name, 
        ...(pd.tags || []), 
        pd.categoryName, 
        pd.brandName
    ].map(s => s?.toLowerCase()).filter(Boolean);
    
    // Unique keywords logic (simplified)
    const keywordsSet = new Set<string>();
    keywordSources.forEach(s => s.split(/\s+/).forEach(w => { if(w.length > 1) keywordsSet.add(w) }));
    pd.searchKeywords = Array.from(keywordsSet);

    pd.outOfStock = (pd.totalStock || 0) <= 0;

    // SEO Fallbacks
    if (!pd.metaTitle) pd.metaTitle = pd.name;
    if (!pd.metaDescription) pd.metaDescription = (pd.description || "").substring(0, 160);

    // Discount Calculation
    if (pd.discountPrice > 0 && pd.retailPrice > 0 && pd.discountPrice < pd.retailPrice) {
      pd.discountPercent = Math.round(((pd.retailPrice - pd.discountPrice) / pd.retailPrice) * 100);
    } else {
      pd.discountPercent = null;
    }

    await updateProduct(productId, pd);

    showSuccess("Produk berhasil diperbarui!");
    router.push("/products/manage");
  } catch (e: any) {
    showError(e?.message || "Gagal menyimpan produk.");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="handleSaveProduct">
    <div class="container mx-auto p-4 sm:p-6 max-w-7xl">
      
      <div v-if="pageLoading" class="flex h-96 items-center justify-center">
        <Icon name="lucide:loader-2" class="h-10 w-10 animate-spin text-primary" />
      </div>

      <div v-else-if="productData">
        
        <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Edit Produk</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">Perbarui informasi produk ID: <span class="font-mono text-xs">{{ productId }}</span></p>
          </div>
          <div class="flex items-center gap-3">
            <button 
              type="button" 
              @click="router.push('/products/manage')" 
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="loading" 
              class="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 dark:focus:ring-offset-gray-900"
            >
              <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
              {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          <div class="space-y-8 lg:col-span-2">
            <ProductInformation 
              v-model:name="productData.name" 
              v-model:description="productData.description" 
              v-model:slug="productData.slug" 
            />

            <ProductMedia 
              v-model:images="productData.images" 
              v-model:videoUrl="productData.videoUrl" 
            />

            <ProductPricing 
              v-model:retailPrice="productData.retailPrice" 
              v-model:wholesalePrice="productData.wholesalePrice" 
              v-model:resellerPrice="productData.resellerPrice" 
              v-model:discountPrice="productData.discountPrice" 
            />
            
            <ProductVariants 
              v-model:variants="productData.variants" 
              v-model:totalStock="productData.totalStock" 
            />
            
            <ProductShipping 
              v-model:weight="productData.weight" 
              v-model:dimensions="productData.dimensions" 
              v-model:material="productData.material" 
            />
          </div>

          <div class="space-y-8 lg:col-span-1">
            <div class="sticky top-6 space-y-8">
              <ProductStatus 
                v-model:status="productData.status" 
                v-model:visibility="productData.visibility" 
                v-model:isFeatured="productData.isFeatured" 
                v-model:isNew="productData.isNew" 
              />
              
              <ProductOrganization 
                v-model:categoryId="productData.categoryId" 
                v-model:brandId="productData.brandId" 
                v-model:tags="productData.tags" 
              />
              
              <ProductSEO 
                v-model:metaTitle="productData.metaTitle" 
                v-model:metaDescription="productData.metaDescription" 
                v-model:slug="productData.slug" 
              />

              <div class="block lg:hidden pt-4 border-t border-gray-200 dark:border-gray-700">
                 <button 
                  type="submit" 
                  :disabled="loading" 
                  class="w-full inline-flex justify-center items-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-70"
                >
                  <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                  {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </form>
</template>