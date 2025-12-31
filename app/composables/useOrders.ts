import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    type DocumentData,
    endAt,
    getDocs,
    limit,
    orderBy,
    query,
    type QueryDocumentSnapshot,
    serverTimestamp,
    startAfter,
    startAt,
    updateDoc
} from "firebase/firestore";
import type {Order, OrderDocument} from "~/types/order";

export const useOrders = () => {
    const {$firestore} = useNuxtApp();
    const {showError, showToast} = useToast();

    const firestore = $firestore as any;
    const colRef = collection(firestore, "orders");

    const orders = ref<Order[]>([]);
    const loading = ref(false);

    const itemsPerPage = ref(10);
    const currentPage = ref(1);
    const lastDocSnapshot = ref<QueryDocumentSnapshot<DocumentData> | null>(null);
    const firstDocSnapshots = ref<QueryDocumentSnapshot<DocumentData>[]>([]);
    const hasNextPage = ref(true);
    const searchQuery = ref("");

    const docToOrder = (doc: QueryDocumentSnapshot<DocumentData>): Order => {
        const data = doc.data() as OrderDocument;
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            shipping: {
                ...data.shipping,
                shippedAt: data.shipping.shippedAt ? data.shipping.shippedAt.toDate() : undefined,
            },
            payment: {
                ...data.payment,
                paidAt: data.payment.paidAt ? data.payment.paidAt.toDate() : undefined,
            },
        };
    };

    const getProvinces = async () => {
        return await $fetch("/api/shipping/location", {params: {type: "province"}});
    };

    const getCities = async (provinceId: string) => {
        return await $fetch("/api/shipping/location", {params: {type: "city", id: provinceId}});
    };

    const getSubdistricts = async (cityId: string) => {
        return await $fetch("/api/shipping/location", {
            params: {type: "subdistrict", id: cityId},
        });
    };

    const checkRates = async (destinationDistrictId: string, weight: number) => {
        return await $fetch("/api/shipping/cost", {
            method: "POST",
            body: {
                destination: destinationDistrictId,
                weight: weight,
            },
        });
    };

    const createShippingOrder = async (shippingData: any) => {
        return await $fetch("/api/shipping/order", {
            method: "POST",
            body: shippingData,
        });
    };

    const printLabel = async (shipmentId: string) => {
        return await $fetch("/api/shipping/label", {
            method: "POST",
            body: {id: shipmentId},
        });
    };

    const getMidtransToken = async (orderData: any) => {
        return await $fetch("/api/payment/token", {
            method: "POST",
            body: orderData,
        });
    };

    const chargePayment = async (chargeData: any) => {
    try {
      const data = await $fetch("/api/payment/charge", {
        method: "POST",
        body: chargeData,
      });
      return data;
    } catch (error) {
      console.error("Charge Error:", error);
      throw error;
    }
  };

    const getBaseQuery = () => {
        if (searchQuery.value) {
            return query(colRef, orderBy("customerName"), startAt(searchQuery.value), endAt(searchQuery.value + "\uf8ff"));
        }
        return query(colRef, orderBy("createdAt", "desc"));
    };

    const fetchOrders = async () => {
        loading.value = true;
        try {
            currentPage.value = 1;
            firstDocSnapshots.value = [];
            lastDocSnapshot.value = null;
            hasNextPage.value = false;

            const q = query(getBaseQuery(), limit(itemsPerPage.value));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                orders.value = [];
                return;
            }

            const firstDoc = snapshot.docs[0];
            const lastDoc = snapshot.docs[snapshot.docs.length - 1];
            firstDocSnapshots.value = firstDoc ? [firstDoc] : [];
            lastDocSnapshot.value = lastDoc || null;

            orders.value = snapshot.docs.map(docToOrder);
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
            if (firstDoc) firstDocSnapshots.value.push(firstDoc);
            lastDocSnapshot.value = lastDoc || null;
            orders.value = snapshot.docs.map(docToOrder);
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
                return await fetchOrders();
            }
            const q = query(getBaseQuery(), startAt(prevPageFirstDoc), limit(itemsPerPage.value));
            const snapshot = await getDocs(q);
            const lastDoc = snapshot.docs[snapshot.docs.length - 1];
            lastDocSnapshot.value = lastDoc || null;
            orders.value = snapshot.docs.map(docToOrder);
            currentPage.value--;
            hasNextPage.value = true;
        } catch (e) {
            showError(e);
        } finally {
            loading.value = false;
        }
    };

    const createOrder = async (orderData: any) => {
        const newDoc = {
            ...orderData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        const ref = await addDoc(colRef, newDoc);
        return ref.id;
    };

    const updateOrderStatus = async (id: string, status: string) => {
        const docRef = doc(firestore, "orders", id);
        await updateDoc(docRef, {status, updatedAt: serverTimestamp()});
        await fetchOrders();
    };

    // hapus data order
    const deleteOrder = async (id: string) => {
        loading.value = true
        try {
            const docRef = doc(firestore, "orders", id);
            await deleteDoc(docRef);
        } catch (e: any) {
            throw e;
        } finally {
            loading.value = false;
        }
    }

    // Update Resi Manual
    const updateResi = async (orderId: string, trackingNumber: string) => {
        loading.value = true;
        try {
            const orderRef = doc(firestore, "orders", orderId);
            await updateDoc(orderRef, {
                status: "shipped",
                "shipping.trackingNumber": trackingNumber,
                "shipping.shippedAt": serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            showToast("Resi disimpan & status diupdate!");
        } catch (e) {
            console.error(e);
            showError("Gagal update resi");
        } finally {
            loading.value = false;
        }
    };

    return {
        orders,
        loading,
        fetchOrders,
        createOrder,
        deleteOrder,
        updateOrderStatus,
        updateResi,
        getProvinces,
        getCities,
        getSubdistricts,
        checkRates,
        createShippingOrder,
        printLabel,
        getMidtransToken,
        currentPage,
        hasNextPage,
        fetchNextPage,
        fetchPrevPage,
        searchQuery,
        chargePayment,
    };
};
