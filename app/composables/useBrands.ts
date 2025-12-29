import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, Timestamp, Firestore, limit, startAfter, startAt, type DocumentData, type QueryDocumentSnapshot, endAt } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject, type FirebaseStorage } from "firebase/storage";
import type { Brand, BrandDocument } from "~/types/brand";
import { useToast } from "./useToast";

export const useBrands = () => {
  const { $firestore, $storage } = useNuxtApp();
  const { showError, showToast } = useToast();
  const firestore = $firestore as Firestore;
  const storage = $storage as FirebaseStorage;
  const brands = ref<Brand[]>([]);
  const loading = ref(false);
  const colRef = collection(firestore, "brands");
  const itemsPerPage = ref(8);
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

  // doc to brand
  const docToBrand = (doc: any): Brand => {
    const data = doc.data() as BrandDocument;
    return {
      id: doc.id,
      name: data.name,
      nameLowerCase: data.nameLowerCase,
      description: data.description,
      logoUrl: data.logoUrl,
      isActive: data.isActive,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  };

  // upload logo brand
  const uploadBrandLogo = async (file: File): Promise<string> => {
    const filePath = `brands/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, filePath);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  // ambil data brand
  const fetchBrands = async () => {
    loading.value = true;
    try {
      currentPage.value = 1;
      firstDocSnapshots.value = [];
      lastDocSnapshot.value = null;
      hasNextPage.value = false;
      const q = query(getBaseQuery(), limit(itemsPerPage.value));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        brands.value = [];
        loading.value = false;
        return;
      }
      const firstDoc = snapshot.docs[0];
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      firstDocSnapshots.value = firstDoc ? [firstDoc] : [];
      lastDocSnapshot.value = lastDoc || null;
      brands.value = snapshot.docs.map(docToBrand);
      await checkForNextPage();
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  // cek halaman berikutnya
  const checkForNextPage = async () => {
    if (!lastDocSnapshot.value) {
      hasNextPage.value = false;
      return;
    }
    const nextQuery = query(getBaseQuery(), startAfter(lastDocSnapshot.value), limit(1));
    const nextSnapshot = await getDocs(nextQuery);
    hasNextPage.value = !nextSnapshot.empty;
  };

  // ambil data halaman berikutnya
  const fetchNextPage = async () => {
    if (!lastDocSnapshot.value || !hasNextPage.value || loading.value) return;
    loading.value = true;
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
      brands.value = snapshot.docs.map(docToBrand);
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
      const prevPageFirstDoc = firstDocSnapshots.value[firstDocSnapshots.value.length - 1];
      if (!prevPageFirstDoc) {
        loading.value = false;
        return await fetchBrands();
      }
      const q = query(getBaseQuery(), startAt(prevPageFirstDoc), limit(itemsPerPage.value));
      const snapshot = await getDocs(q);
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      lastDocSnapshot.value = lastDoc || null;
      brands.value = snapshot.docs.map(docToBrand);
      currentPage.value--;
      hasNextPage.value = true;
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  // tambah brand baru
  const addBrand = async (name: string, description: string, isActive: boolean, file: File) => {
    const logoUrl = await uploadBrandLogo(file);
    const newDoc: Omit<BrandDocument, "id"> = {
      name,
      nameLowerCase: name.toLowerCase(),
      description,
      logoUrl,
      isActive,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    await addDoc(colRef, newDoc);
    searchQuery.value = "";
    await fetchBrands();
  };

  // ubah data brand
  const updateBrand = async (id: string, newData: { name: string; description: string; isActive: boolean }, newFile: File | null) => {
    const docRef = doc(firestore, "brands", id);
    let newLogoUrl: string | undefined = undefined;
    if (newFile) {
      newLogoUrl = await uploadBrandLogo(newFile);
      let oldbrand = brands.value.find((b) => b.id === id);
      if (oldbrand?.logoUrl) {
        try {
          const oldRef = storageRef(storage, oldbrand.logoUrl);
          await deleteObject(oldRef);
        } catch (storageError) {
          console.warn("Gagal menghapus logo lama: ", storageError);
        }
      }
    }

    const updateData: any = {
      ...newData,
      nameLowerCase: newData.name.toLowerCase(),
      updatedAt: serverTimestamp(),
    };
    if (newLogoUrl) updateData.logoUrl = newLogoUrl;
    await updateDoc(docRef, updateData);
    searchQuery.value = "";
    await fetchBrands();
  };

  // toggle status brand
  const toggleBrandStatus = async (brand: Brand) => {
    loading.value = true;
    try {
      const docRef = doc(firestore, "brands", brand.id);
      const newStatus = !brand.isActive;
      await updateDoc(docRef, {
        isActive: newStatus,
        updatedAt: serverTimestamp(),
      });
      const brandToUpdate = brands.value.find((b) => b.id === brand.id);
      if (brandToUpdate) {
        brandToUpdate.isActive = newStatus;
        brandToUpdate.updatedAt = new Date();
      }
      showToast(`Status brand ${brand.name} diperbarui`);
    } catch (e) {
      showError(e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // hapus data brand
  const deleteBrand = async (brand: Brand) => {
    const docRef = doc(firestore, "brands", brand.id);
    await deleteDoc(docRef);
    try {
      const fileRef = storageRef(storage, brand.logoUrl);
      await deleteObject(fileRef);
    } catch (storageError) {
      console.warn("Gagal menghapus logo dari storage: ", storageError);
    }
    searchQuery.value = "";
    await fetchBrands();
  };

  return {
    brands,
    loading,
    fetchBrands,
    addBrand,
    updateBrand,
    toggleBrandStatus,
    deleteBrand,
    currentPage,
    hasNextPage,
    fetchNextPage,
    fetchPrevPage,
    searchQuery,
  };
};
