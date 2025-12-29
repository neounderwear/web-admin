import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, Timestamp, Firestore, limit, startAfter, startAt, type DocumentData, type QueryDocumentSnapshot, endAt, getDoc } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject, type FirebaseStorage } from "firebase/storage";
import type { Product, ProductDocument, ProductVariant } from "~/types/product";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "./useToast";

export const useProducts = () => {
  const { $firestore, $storage } = useNuxtApp();
  const { showToast, showError } = useToast();
  const firestore = $firestore as Firestore;
  const storage = $storage as FirebaseStorage;
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const colRef = collection(firestore, "products");
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

  // doc to product
  const docToProduct = (doc: QueryDocumentSnapshot<DocumentData>): Product => {
    const data = doc.data() as ProductDocument;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      discountStart: data.discountStart ? data.discountStart.toDate() : null,
      discountEnd: data.discountEnd ? data.discountEnd.toDate() : null,
    };
  };

  // upload gambar produk
  const uploadProductImage = async (image: File | string, productId: string): Promise<string> => {
    if (typeof image === "string") return image;
    const file = image;
    const filePath = `products/${productId}/${uuidv4()}-${file.name}`;
    const fileRef = storageRef(storage, filePath);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  // ambil data produk
  const fetchProducts = async () => {
    loading.value = true;
    try {
      currentPage.value = 1;
      firstDocSnapshots.value = [];
      lastDocSnapshot.value = null;
      hasNextPage.value = false;
      const q = query(getBaseQuery(), limit(itemsPerPage.value));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        products.value = [];
        loading.value = false;
        return;
      }
      const firstDoc = snapshot.docs[0];
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      firstDocSnapshots.value = firstDoc ? [firstDoc] : [];
      lastDocSnapshot.value = lastDoc || null;
      products.value = snapshot.docs.map(docToProduct);
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
      if (firstDoc) firstDocSnapshots.value.push(firstDoc);
      lastDocSnapshot.value = lastDoc || null;
      products.value = snapshot.docs.map(docToProduct);
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
        return await fetchProducts();
      }
      const q = query(getBaseQuery(), startAt(prevPageFirstDoc), limit(itemsPerPage.value));
      const snapshot = await getDocs(q);
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      lastDocSnapshot.value = lastDoc || null;
      products.value = snapshot.docs.map(docToProduct);
      currentPage.value--;
      hasNextPage.value = true;
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  // ambil data produk berdasarkan id
  const fetchProductById = async (id: string): Promise<Product | null> => {
    loading.value = true;
    try {
      const docRef = doc(firestore, "products", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return docToProduct(snapshot as QueryDocumentSnapshot<DocumentData>);
      } else {
        showError("Produk tidak ditemukan.");
        return null;
      }
    } catch (e) {
      showError(e);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // tambah data produk baru
  const addProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">, imagesToUpload: File[]) => {
    const newProductId = uuidv4();
    const imageUrls = await Promise.all(imagesToUpload.map((file) => uploadProductImage(file, newProductId)));
    const thumbnailUrl = imageUrls[0] || "";
    const newDoc: ProductDocument = {
      ...productData,
      images: imageUrls,
      thumbnailUrl: thumbnailUrl,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      discountStart: productData.discountStart ? Timestamp.fromDate(productData.discountStart) : null,
      discountEnd: productData.discountEnd ? Timestamp.fromDate(productData.discountEnd) : null,
    };
    await addDoc(colRef, newDoc);
  };

  // ubah data produk
  const updateProduct = async (id: string, productData: Omit<Product, "id" | "createdAt" | "updatedAt" | "images"> & { images: (string | File)[] }) => {
    const existingImageUrls: string[] = [];
    const newImageFiles: File[] = [];

    for (const img of productData.images) {
      if (typeof img === "string") {
        existingImageUrls.push(img);
      } else {
        newImageFiles.push(img);
      }
    }

    const newImageUrls = await Promise.all(newImageFiles.map((file) => uploadProductImage(file, id)));
    const allImageUrls = [...existingImageUrls, ...newImageUrls];
    const thumbnailUrl = allImageUrls[0] || "";
    const docRef = doc(firestore, "products", id);
    const { images: _images, ...restOfProductData } = productData;
    const updateData: Partial<ProductDocument> = {
      ...restOfProductData,
      images: allImageUrls,
      thumbnailUrl: thumbnailUrl,
      updatedAt: serverTimestamp() as Timestamp,
      discountStart: productData.discountStart ? Timestamp.fromDate(productData.discountStart) : null,
      discountEnd: productData.discountEnd ? Timestamp.fromDate(productData.discountEnd) : null,
    };

    await updateDoc(docRef, updateData as DocumentData);
  };

  // toggles status produk
  const toggleProductStatus = async (product: Product) => {
    loading.value = true;
    try {
      const docRef = doc(firestore, "products", product.id);
      const newStatus = !product.status;
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      const productToUpdate = products.value.find((p) => p.id === product.id);
      if (productToUpdate) {
        productToUpdate.status = newStatus;
        productToUpdate.updatedAt = new Date();
      }
      showToast(`Status produk ${product.name} diperbarui`);
    } catch (e) {
      showError(e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // hapus data produk
  const deleteProduct = async (product: Product) => {
    const docRef = doc(firestore, "products", product.id);
    await deleteDoc(docRef);
    try {
      for (const imageUrl of product.images) {
        const fileRef = storageRef(storage, imageUrl);
        await deleteObject(fileRef);
      }
      if (product.thumbnailUrl) {
        const thumbRef = storageRef(storage, product.thumbnailUrl);
        await deleteObject(thumbRef);
      }
    } catch (storageError) {
      console.warn("Gagal hapus gambar dari storage:", storageError);
    }

    searchQuery.value = "";
    await fetchProducts();
  };

  return {
    products,
    loading,
    fetchProducts,
    fetchProductById,
    addProduct,
    updateProduct,
    toggleProductStatus,
    deleteProduct,
    currentPage,
    hasNextPage,
    fetchNextPage,
    fetchPrevPage,
    searchQuery,
  };
};
