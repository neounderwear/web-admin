import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, Timestamp, Firestore, limit, startAfter, startAt, type DocumentData, type QueryDocumentSnapshot, endAt } from "firebase/firestore";

// Firebase Storage
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject, type FirebaseStorage } from "firebase/storage";

// Types
import type { Banner, BannerDocument } from "~/types/banner";

// Composables
import { useToast } from "./useToast";

// Composable utama untuk mengelola banner
export const useBanners = () => {
  // Inisialisasi Firebase dan Toast
  const { $firestore, $storage } = useNuxtApp();
  const { showToast, showError } = useToast();

  // Firebase instances
  const firestore = $firestore as Firestore;
  const storage = $storage as FirebaseStorage;

  // State
  const banners = ref<Banner[]>([]);
  const loading = ref(false);

  // Firestore collection reference
  const colRef = collection(firestore, "banners");

  // Pagination state
  const itemsPerPage = ref(10);
  const currentPage = ref(1);
  const lastDocSnapshot = ref<QueryDocumentSnapshot<DocumentData> | null>(null);
  const firstDocSnapshots = ref<QueryDocumentSnapshot<DocumentData>[]>([]);
  const hasNextPage = ref(true);

  // Search query
  const searchQuery = ref("");
  const getBaseQuery = () => {
    if (searchQuery.value) {
      return query(colRef, orderBy("nameLowerCase"), startAt(searchQuery.value.toLowerCase()), endAt(searchQuery.value.toLowerCase() + "\uf8ff"));
    } else {
      return query(colRef, orderBy("createdAt", "desc"));
    }
  };

  // Konversi dokumen Firestore ke tipe Banner
  const docToBanner = (doc: any): Banner => {
    const data = doc.data() as BannerDocument;
    return {
      id: doc.id,
      name: data.name,
      nameLowerCase: data.nameLowerCase,
      photoUrl: data.photoUrl,
      isActive: data.isActive,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  };

  // upload gambar banner ke Firebase Storage
  const uploadBannerImage = async (file: File): Promise<string> => {
    const filePath = `banners/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, filePath);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  // ambil data banner dengan pagination
  const fetchBanners = async () => {
    loading.value = true;
    try {
      currentPage.value = 1;
      firstDocSnapshots.value = [];
      lastDocSnapshot.value = null;
      hasNextPage.value = false;

      const q = query(getBaseQuery(), limit(itemsPerPage.value));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        banners.value = [];
        loading.value = false;
        return;
      }

      const firstDoc = snapshot.docs[0];
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      firstDocSnapshots.value = firstDoc ? [firstDoc] : [];
      lastDocSnapshot.value = lastDoc || null;
      banners.value = snapshot.docs.map(docToBanner);

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
      banners.value = snapshot.docs.map(docToBanner);
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
        return await fetchBanners();
      }

      const q = query(getBaseQuery(), startAt(prevPageFirstDoc), limit(itemsPerPage.value));
      const snapshot = await getDocs(q);

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      lastDocSnapshot.value = lastDoc || null;

      banners.value = snapshot.docs.map(docToBanner);
      currentPage.value--;
      hasNextPage.value = true;
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  // tambah banner
  const addBanner = async (name: string, isActive: boolean, file: File) => {
    loading.value = true;
    try {
      const photoUrl = await uploadBannerImage(file);
      const newDoc: Omit<BannerDocument, "id"> = {
        name,
        nameLowerCase: name.toLowerCase(),
        photoUrl,
        isActive,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };
      await addDoc(colRef, newDoc);
      searchQuery.value = "";
      await fetchBanners();
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  // update banner
  const updateBanner = async (id: string, newData: { name: string; isActive: boolean }, newFile: File | null) => {
    loading.value = true;
    try {
      const docRef = doc(firestore, "banners", id);
      let newPhotoUrl: string | undefined = undefined;
      if (newFile) {
        newPhotoUrl = await uploadBannerImage(newFile);
        let oldBanner = banners.value.find((b) => b.id === id);
        if (oldBanner?.photoUrl) {
          try {
            const oldRef = storageRef(storage, oldBanner.photoUrl);
            await deleteObject(oldRef);
          } catch (storageError) {
            console.warn("Gagal hapus foto lama:", storageError);
          }
        }
      }

      const updateData: any = {
        ...newData,
        nameLowerCase: newData.name.toLowerCase(),
        updatedAt: serverTimestamp(),
      };
      if (newPhotoUrl) updateData.photoUrl = newPhotoUrl;
      await updateDoc(docRef, updateData);
      searchQuery.value = "";
      await fetchBanners();
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  // toggle status banner
  const toggleBannerStatus = async (banner: Banner) => {
    loading.value = true;
    try {
      const docRef = doc(firestore, "banners", banner.id);
      const newStatus = !banner.isActive;
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      const bannerToUpdate = banners.value.find((b) => b.id === banner.id);
      if (bannerToUpdate) {
        bannerToUpdate.isActive = newStatus;
        bannerToUpdate.updatedAt = new Date();
      }
      showToast(`Status banner ${banner.name} diperbarui`);
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  // hapus banner
  const deleteBanner = async (banner: Banner) => {
    loading.value = true;
    try {
      const docRef = doc(firestore, "banners", banner.id);
      await deleteDoc(docRef);

      try {
        const fileRef = storageRef(storage, banner.photoUrl);
        await deleteObject(fileRef);
      } catch (storageError) {
        console.warn("Gagal hapus foto dari storage:", storageError);
      }

      searchQuery.value = "";
      await fetchBanners();
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  // kembalikan state dan fungsi yang dibutuhkan
  return {
    banners,
    loading,
    fetchBanners,
    addBanner,
    updateBanner,
    toggleBannerStatus,
    deleteBanner,
    currentPage,
    hasNextPage,
    fetchNextPage,
    fetchPrevPage,
    searchQuery,
  };
};
