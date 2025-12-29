import { collection, getDocs, query, orderBy, where, type Firestore } from "firebase/firestore";

// Tipe data untuk opsi brand
interface BrandOption {
  id: string;
  name: string;
}

// State untuk menyimpan daftar brand
const brandListState = () => useState<BrandOption[] | null>("brandList", () => null);

export const useBrandList = () => {
  // Inisialisasi Firestore
  const { $firestore } = useNuxtApp();

  // Firestore instance
  const firestore = $firestore as Firestore;

  // State dan loading indicator
  const brands = brandListState();
  const loading = ref(false);

  // ambil daftar brand
  const fetchBrandList = async () => {
    // Jika data sudah ada, tidak perlu mengambil ulang
    if (brands.value !== null) {
      return;
    }

    // Mulai proses pengambilan data
    loading.value = true;
    try {
      const colRef = collection(firestore, "brands");
      const q = query(colRef, where("isActive", "==", true), orderBy("nameLowerCase", "asc"));

      const snapshot = await getDocs(q);
      const brandData: BrandOption[] = [];
      snapshot.forEach((doc) => {
        brandData.push({
          id: doc.id,
          name: doc.data().name,
        });
      });
      brands.value = brandData;
    } catch (e) {
      console.error("Gagal mengambil daftar brand: ", e);
      brands.value = [];
    } finally {
      loading.value = false;
    }
  };

  return {
    brandList: brands,
    loadingBrandList: loading,
    fetchBrandList,
  };
};
