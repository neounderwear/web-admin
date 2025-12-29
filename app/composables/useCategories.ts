import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, Timestamp, Firestore, limit, startAfter, startAt, type DocumentData, type QueryDocumentSnapshot, endAt } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import type { Category, CategoryDocument } from "~/types/category";
import { useToast } from "./useToast";

export const useCategories = () => {
  const { $firestore, $storage } = useNuxtApp();
  const { showToast, showError } = useToast();

  const firestore = $firestore as Firestore;
  const storage = $storage as FirebaseStorage;

  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const colRef = collection(firestore, "categories");

  const itemsPerPage = ref(10);
  const currentPage = ref(1);
  const lastDocSnapshot = ref<QueryDocumentSnapshot<DocumentData> | null>(null);
  const firstDocSnapshots = ref<QueryDocumentSnapshot<DocumentData>[]>([]);
  const hasNextPage = ref(true);

  const searchQuery = ref("");
  const getBaseQuery = () => {
    if (searchQuery.value) {
      return query(colRef, orderBy("nameLowerCase"), startAt(searchQuery.value.toLowerCase()), endAt(searchQuery.value.toLowerCase() + "\uf8ff"));
    } else {
      return query(colRef, orderBy("createdAt", "desc"));
    }
  };

  // doc to category
  const docToCategory = (doc: any): Category => {
    const data = doc.data() as CategoryDocument;
    return {
      id: doc.id,
      name: data.name,
      nameLowerCase: data.nameLowerCase,
      description: data.description,
      isActive: data.isActive,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  };

  // ambil data kategori
  const fetchCategories = async () => {
    loading.value = true;
    try {
      currentPage.value = 1;
      firstDocSnapshots.value = [];
      lastDocSnapshot.value = null;
      hasNextPage.value = false;

      const q = query(getBaseQuery(), limit(itemsPerPage.value));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        categories.value = [];
        loading.value = false;
        return;
      }

      const firstDoc = snapshot.docs[0];
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      categories.value = snapshot.docs.map(docToCategory);

      await checkForNextPage();
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  // cek apakah ada halaman selanjutnya
  const checkForNextPage = async () => {
    if (!lastDocSnapshot.value) {
      hasNextPage.value = false;
      return;
    }

    const nextQuery = query(getBaseQuery(), startAfter(lastDocSnapshot.value), limit(1));
    const nextSnapshot = await getDocs(nextQuery);
    hasNextPage.value = !nextSnapshot.empty;
  };

  // ambil data halaman selanjutnya
  const fetchNextPage = async () => {
    if (!lastDocSnapshot.value || !hasNextPage.value || loading.value) return;
    loading.value = false;

    try {
      const q = query(getBaseQuery(), startAfter(lastDocSnapshot.value), limit(itemsPerPage.value));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        hasNextPage.value = false;
        loading.value = false;
        return;
      }

      const firstDoc = snapshot.docs[0];
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      if (firstDoc) {
        firstDocSnapshots.value.push(firstDoc);
      }
      lastDocSnapshot.value = lastDoc || null;
      categories.value = snapshot.docs.map(docToCategory);
      currentPage.value++;
      await checkForNextPage();
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  // ambil data halaman sebelumnya
  const fetchPrevPage = async () => {
    if (currentPage.value <= 1 || loading.value) return;
    loading.value = true;

    try {
      firstDocSnapshots.value.pop();
      const prevPageFirstDoc = firstDocSnapshots.value;
      [firstDocSnapshots.value.length - 1];

      if (!prevPageFirstDoc) {
        loading.value = false;
        return await fetchCategories();
      }

      const q = query(getBaseQuery(), startAt(prevPageFirstDoc), limit(itemsPerPage.value));
      const snapshot = await getDocs(q);

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      lastDocSnapshot.value = lastDoc || null;

      categories.value = snapshot.docs.map(docToCategory);
      currentPage.value--;
      hasNextPage.value = true;
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  // tambah kategori baru
  const addCategory = async (name: string, description: string, isActive: boolean) => {
    loading.value = true;

    try {
      const newDoc: Omit<CategoryDocument, "id"> = {
        name,
        nameLowerCase: name.toLowerCase(),
        description,
        isActive,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };
      await addDoc(colRef, newDoc);
      searchQuery.value = "";
      await fetchCategories();
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  // ubah kategori
  const updateCategory = async (id: string, newData: { name: string; description: string; isActive: boolean }) => {
    loading.value = true;

    try {
      const docRef = doc(firestore, "categories", id);
      const updateData: any = {
        ...newData,
        nameLowerCase: newData.name.toLowerCase(),
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, updateData);
      searchQuery.value = "";
      await fetchCategories();
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  // toggle status kategori
  const toggleCategoryStatus = async (category: Category) => {
    loading.value = true;

    try {
      const docRef = doc(firestore, "categories", category.id);
      const newStatus = !category.isActive;
      await updateDoc(docRef, { isActive: newStatus, updatedAt: serverTimestamp() });
      const categoryToUpdate = categories.value.find((b) => b.id === category.id);
      if (categoryToUpdate) {
        categoryToUpdate.isActive = newStatus;
        categoryToUpdate.updatedAt = new Date();
      }
      showToast(`Status kategori ${category.name} diperbarui`);
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  // hapus kategori
  const deleteCategory = async (category: Category) => {
    loading.value = true;

    try {
      const docRef = doc(firestore, "categories", category.id);
      await deleteDoc(docRef);
      searchQuery.value = "";
      await fetchCategories();
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  return {
    categories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    toggleCategoryStatus,
    deleteCategory,
    currentPage,
    hasNextPage,
    fetchNextPage,
    fetchPrevPage,
    searchQuery,
  };
};
