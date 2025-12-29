import { collection, getDocs, query, orderBy, where, type Firestore } from "firebase/firestore";

interface CategoryOption {
  id: string;
  name: string;
}

const categoryListState = () => useState<CategoryOption[] | null>("categoryList", () => null);

export const useCategoryList = () => {
  const { $firestore } = useNuxtApp();
  const firestore = $firestore as Firestore;
  const categories = categoryListState();
  const loading = ref(false);

  const fetchCategoryList = async () => {
    if (categories.value !== null) {
      return;
    }

    loading.value = true;
    try {
      const colRef = collection(firestore, "categories");
      const q = query(colRef, where("isActive", "==", true), orderBy("name", "asc"));

      const snapshot = await getDocs(q);
      const categoryData: CategoryOption[] = [];
      snapshot.forEach((doc) => {
        categoryData.push({
          id: doc.id,
          name: doc.data().name,
        });
      });
      categories.value = categoryData;
    } catch (e) {
      console.error("Gagal mengambil daftar kategori: ", e);
      categories.value = [];
    } finally {
      loading.value = false;
    }
  };

  return {
    categoryList: categories,
    loadingCategoryList: loading,
    fetchCategoryList,
  };
};
