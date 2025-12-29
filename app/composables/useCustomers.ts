import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, limit, startAfter, startAt, endAt, type DocumentData, type QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import type { Customer, CustomerDocument } from "~/types/customer";
import { useToast } from "./useToast";

export const useCustomers = () => {
  const { $firestore } = useNuxtApp();
  const { showError } = useToast();
  const firestore = $firestore as any;
  const colRef = collection(firestore, "customers");
  const customers = ref<Customer[]>([]);
  const loading = ref(false);
  const itemsPerPage = ref(10);
  const currentPage = ref(1);
  const lastDocSnapshot = ref<QueryDocumentSnapshot<DocumentData> | null>(null);
  const firstDocSnapshots = ref<QueryDocumentSnapshot<DocumentData>[]>([]);
  const hasNextPage = ref(true);
  const searchQuery = ref("");

  // ambil query dasar dengan atau tanpa pencarian
  const getBaseQuery = () => {
    if (searchQuery.value) {
      return query(colRef, orderBy("name"), startAt(searchQuery.value), endAt(searchQuery.value + "\uf8ff"));
    }
    return query(colRef, orderBy("createdAt", "desc"));
  };

  // konversi dokumen Firestore ke tipe Customer
  const docToCustomer = (doc: QueryDocumentSnapshot<DocumentData>): Customer => {
    const data = doc.data() as CustomerDocument;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate(),
    };
  };

  const fetchCustomers = async () => {
    loading.value = true;
    try {
      currentPage.value = 1;
      firstDocSnapshots.value = [];
      lastDocSnapshot.value = null;
      hasNextPage.value = false;

      const q = query(getBaseQuery(), limit(itemsPerPage.value));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        customers.value = [];
        return;
      }

      const firstDoc = snapshot.docs[0];
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      firstDocSnapshots.value = firstDoc ? [firstDoc] : [];
      lastDocSnapshot.value = lastDoc || null;

      customers.value = snapshot.docs.map(docToCustomer);
      await checkForNextPage();
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  const checkForNextPage = async () => {
    if (!lastDocSnapshot.value) {
      hasNextPage.value = false;
      return;
    }
    const nextQuery = query(getBaseQuery(), startAfter(lastDocSnapshot.value), limit(1));
    const nextSnapshot = await getDocs(nextQuery);
    hasNextPage.value = !nextSnapshot.empty;
  };

  const fetchNextPage = async () => {
    if (!lastDocSnapshot.value || !hasNextPage.value || loading.value) return;
    loading.value = true;
    try {
      const q = query(getBaseQuery(), startAfter(lastDocSnapshot.value), limit(itemsPerPage.value));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        hasNextPage.value = false;
        return;
      }

      const firstDoc = snapshot.docs[0];
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      if (firstDoc) {
        firstDocSnapshots.value.push(firstDoc);
      }
      lastDocSnapshot.value = lastDoc || null;

      customers.value = snapshot.docs.map(docToCustomer);
      currentPage.value++;
      await checkForNextPage();
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  const fetchPrevPage = async () => {
    if (currentPage.value <= 1 || loading.value) return;
    loading.value = true;
    try {
      firstDocSnapshots.value.pop();
      const prevPageFirstDoc = firstDocSnapshots.value[firstDocSnapshots.value.length - 1];

      if (!prevPageFirstDoc) {
        loading.value = false;
        return await fetchCustomers();
      }

      const q = query(getBaseQuery(), startAt(prevPageFirstDoc), limit(itemsPerPage.value));
      const snapshot = await getDocs(q);

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      lastDocSnapshot.value = lastDoc || null;

      customers.value = snapshot.docs.map(docToCustomer);
      currentPage.value--;
      hasNextPage.value = true;
    } catch (e) {
      showError(e);
    } finally {
      loading.value = false;
    }
  };

  const addCustomer = async (data: { name: string; email?: string; phone: string }) => {
    if (!data.name || !data.email) throw new Error("Nama dan Email wajib diisi");

    const newDoc: any = {
      ...data,
      addresses: [],
      source: "manual",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(colRef, newDoc);
    searchQuery.value = "";
    await fetchCustomers();
  };

  const updateCustomer = async (id: string, data: { name: string; email: string; phone: string }) => {
    const docRef = doc(firestore, "customers", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    await fetchCustomers();
  };

  const deleteCustomer = async (id: string) => {
    const docRef = doc(firestore, "customers", id);
    await deleteDoc(docRef);
    await fetchCustomers();
  };

  return {
    customers,
    loading,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    currentPage,
    hasNextPage,
    fetchNextPage,
    fetchPrevPage,
    searchQuery,
  };
};
