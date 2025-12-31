<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
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
const { addProduct, loading } = useProducts();
const { showSuccess, showError } = useToast();

const { brandList } = useBrandList();
const { categoryList } = useCategoryList();

useHead({ title: "Tambah Produk Baru" });

// Initialize Data
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

// Validation
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
  // Optional: Validasi stok jika varian ada
  if (productData.variants && productData.variants.length > 0 && productData.totalStock <= 0) {
    showError("Stok total varian tidak boleh 0.");
    return false;
  }
  return true;
}

// Submit Handler
async function handleSaveProduct() {
  if (!validateForm()) return;

  loading.value = true;
  try {
    const pd = { ...productData };
    
    // Auto-fill logic
    pd.nameLowerCase = (pd.name || "").toLowerCase();
    
    const category = categoryList.value?.find((c) => c.id === pd.categoryId);
    const brand = brandList.value?.find((b) => b.id === pd.brandId);
    
    pd.categoryName = category?.name || "";
    pd.brandName = brand?.name || "";

    // Generate Keywords
    const keywordSources: string[] = [
      ...(pd.name ? pd.name.split(/\s+/) : []),
      ...(pd.tags || []).map((t) => String(t).toLowerCase()),
      ...(pd.categoryName ? pd.categoryName.split(/\s+/) : []),
      ...(pd.brandName ? pd.brandName.split(/\s+/) : []),
    ].map((k) => String(k).toLowerCase().trim());
    pd.searchKeywords = Array.from(new Set(keywordSources.filter((k) => k && k.length > 1)));

    pd.outOfStock = (pd.totalStock ?? 0) <= 0;

    // Default Meta
    if (!pd.metaTitle || pd.metaTitle.trim() === "") pd.metaTitle = pd.name;
    if (!pd.metaDescription || pd.metaDescription.trim() === "") {
      pd.metaDescription = (pd.description || "").substring(0, 160);
    }

    // Discount Calculation
    if (pd.discountPrice > 0 && pd.retailPrice > 0 && pd.discountPrice < pd.retailPrice) {
      pd.discountPercent = Math.round(((pd.retailPrice - pd.discountPrice) / pd.retailPrice) * 100);
    } else {
      pd.discountPercent = null;
    }

    // Add Product Call
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
    <div class="container mx-auto p-4 sm:p-6 max-w-7xl">
      
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tambah Produk Baru</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Lengkapi form di bawah ini untuk menambahkan produk ke katalog.</p>
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
            {{ loading ? 'Menyimpan...' : 'Simpan Produk' }}
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
                {{ loading ? 'Menyimpan...' : 'Simpan Produk' }}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  </form>
</template>