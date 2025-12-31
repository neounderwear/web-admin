<script setup lang="ts">
import { ref, computed, watch, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "~/composables/useToast";
import { useOrders } from "~/composables/useOrders";
import type { OrderItem, ShippingInfo, PaymentInfo } from "~/types/order";
import type { Customer } from "~/types/customer";
import { doc, updateDoc } from "firebase/firestore";
import { useNuxtApp } from "#app";

// Components
import OrderCustomer from "~/components/order/form/OrderCustomer.vue";
import OrderCart from "~/components/order/form/OrderCart.vue";
import OrderShipping from "~/components/order/form/OrderShipping.vue";

const { $firestore } = useNuxtApp();
const router = useRouter();
const { createOrder, chargePayment, loading } = useOrders(); 
const { showSuccess, showError } = useToast();

useHead({ title: "Buat Pesanan Baru" });

// --- STATE ---
const customer = ref<Customer | null>(null);
const items = ref<OrderItem[]>([]);
const notes = ref("");

const shipping = ref<Partial<ShippingInfo>>({
  recipientName: "",
  recipientPhone: "",
  fullAddress: "",
  cityId: "",
  courier: "",
  service: "",
  cost: 0,
  weightTotal: 0,
});

const payment = ref<Partial<PaymentInfo>>({
  method: "cash",
  status: "unpaid",
  totalAmount: 0,
  paymentType: "", // 'bca', 'bri', 'qris'
});

// --- COMPUTED & WATCHERS ---
const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.totalPrice, 0));
const totalWeight = computed(() => items.value.reduce((sum, item) => sum + item.weight * item.quantity, 0));

// Isi otomatis data penerima jika customer dipilih
watch(customer, (newCustomer) => {
  if (newCustomer) {
    if (!shipping.value.recipientName) shipping.value.recipientName = newCustomer.name;
    if (!shipping.value.recipientPhone) shipping.value.recipientPhone = newCustomer.phone;
  }
});

// Hitung total bayar otomatis
watchEffect(() => {
  shipping.value.weightTotal = totalWeight.value;
  payment.value.totalAmount = subtotal.value + (shipping.value.cost || 0);
});

// --- SUBMIT ---
async function handleSubmit() {
  // 1. Validasi Input Dasar
  if (!customer.value) return showError("Mohon pilih pelanggan.");
  if (items.value.length === 0) return showError("Keranjang belanja kosong.");
  if (!shipping.value.recipientName || !shipping.value.recipientPhone) return showError("Data penerima wajib diisi.");
  if (!shipping.value.fullAddress) return showError("Alamat lengkap wajib diisi.");
  
  // 2. Validasi Pembayaran
  if (payment.value.method === 'midtrans' && !payment.value.paymentType) {
    return showError("Mohon pilih tipe pembayaran Midtrans (BCA/BRI/QRIS).");
  }

  // 3. Validasi Pengiriman (Kurir)
  // Jika courier terisi, wajib pilih kecamatan (cityId)
  if (shipping.value.courier && !shipping.value.cityId) {
    return showError("Mohon pilih Kecamatan tujuan untuk pengiriman ekspedisi.");
  }

  try {
    loading.value = true;

    // A. Siapkan Data Order Awal
    const orderData = {
      customerId: customer.value.id,
      customerName: customer.value.name,
      customerEmail: customer.value.email || "",
      customerPhone: customer.value.phone,
      items: items.value,
      subtotal: subtotal.value,
      discountAmount: 0,
      shipping: { ...shipping.value },
      payment: payment.value,
      status: "pending_payment",
      notes: notes.value,
      source: "manual",
    };

    // B. Buat Dokumen di Firestore (Dapat ID)
    const newOrderId = await createOrder(orderData);

    // C. Logika Midtrans Core API (Server-to-Server)
    if (payment.value.method === "midtrans") {
      try {
        const chargePayload = {
          payment_type: payment.value.paymentType === 'qris' ? 'qris' : 'bank_transfer',
          bank: payment.value.paymentType !== 'qris' ? payment.value.paymentType : undefined,
          order_data: {
             orderId: newOrderId,
             grossAmount: payment.value.totalAmount,
             customer: {
                 first_name: customer.value.name,
                 email: customer.value.email || "noemail@example.com", // Fallback email
                 phone: customer.value.phone,
             },
             items: items.value,
          }
        };

        // Panggil Server API
        const res: any = await chargePayment(chargePayload);

        // Siapkan data update untuk Firestore
        // Gunakan dot notation untuk update nested fields di Firestore
        const updateData: any = {
           "payment.transactionId": res.transaction_id,
           "payment.paymentType": res.payment_type,
           "payment.redirectUrl": "", 
        };

        // Mapping response Midtrans ke Database
        if (res.va_numbers && res.va_numbers.length > 0) {
           // Bank Transfer (BCA, BRI, BNI)
           updateData["payment.vaNumber"] = res.va_numbers[0].va_number;
           updateData["payment.bank"] = res.va_numbers[0].bank;
        } 
        else if (res.permata_va_number) {
           // Permata
           updateData["payment.vaNumber"] = res.permata_va_number;
           updateData["payment.bank"] = "permata";
        } 
        else if (res.actions && res.payment_type === 'qris') {
           // QRIS (Simpan URL Gambar QR)
           const qrAction = res.actions.find((a: any) => a.name === 'generate-qr-code');
           if (qrAction) {
             updateData["payment.qrUrl"] = qrAction.url;
             updateData["payment.redirectUrl"] = qrAction.url; 
           }
        }

        // Update Order dengan Data Midtrans
        const orderRef = doc($firestore, "orders", newOrderId);
        await updateDoc(orderRef, updateData);

        showSuccess("Order dibuat & Pembayaran Otomatis siap!");
        router.push(`/orders/${newOrderId}`);
        return;

      } catch (mtError: any) {
        console.error("Midtrans Charge Error:", mtError);
        showError(`Gagal request ke Midtrans: ${mtError.message || 'Cek console'}`);
        // Tetap redirect ke detail agar data tidak hilang
        router.push(`/orders/${newOrderId}`);
        return;
      }
    }

    // D. Jika Cash / Manual Transfer
    showSuccess("Pesanan berhasil dibuat!");
    router.push(`/orders/${newOrderId}`);

  } catch (e) {
    showError(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container mx-auto p-4 sm:p-6 max-w-7xl">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Buat Pesanan Baru</h1>
      <button 
        @click="router.back()" 
        class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        Batal
      </button>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      
      <div class="space-y-8 lg:col-span-2">
        <OrderCustomer v-model="customer" />
        
        <OrderCart v-model="items" />
        
        <OrderShipping v-model="shipping" :weight="totalWeight" />

        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <label class="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
            Catatan Order
          </label>
          <textarea 
            v-model="notes" 
            rows="2" 
             class="w-full rounded-lg border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm transition-all focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="Instruksi khusus untuk pesanan ini..."
          ></textarea>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-6 space-y-6">
          
          <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div class="border-b border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
               <h3 class="font-bold text-gray-900 dark:text-white">Ringkasan Pesanan</h3>
            </div>

            <div class="p-6">
              <div class="space-y-3 border-b border-gray-100 pb-6 text-sm dark:border-gray-700">
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span class="font-medium text-gray-900 dark:text-white">Rp {{ subtotal.toLocaleString("id-ID") }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">Berat Total</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ totalWeight }} gram</span>
                </div>
                <div class="flex justify-between items-start">
                  <span class="text-gray-500 dark:text-gray-400">Ongkos Kirim</span>
                  <div class="text-right">
                    <span class="font-medium text-gray-900 dark:text-white block">Rp {{ (shipping.cost || 0).toLocaleString("id-ID") }}</span>
                    <span v-if="shipping.courier" class="text-xs text-primary font-medium bg-primary/10 px-1.5 rounded">{{ shipping.courier }} - {{ shipping.service }}</span>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex justify-between items-center">
                <span class="text-lg font-bold text-gray-900 dark:text-white">Total Bayar</span>
                <span class="text-xl font-bold text-primary">Rp {{ (payment.totalAmount || 0).toLocaleString("id-ID") }}</span>
              </div>

              <div class="mt-8">
                <label class="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Metode Pembayaran
                </label>
                
                <div class="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    @click="payment.method = 'cash'; payment.paymentType = ''" 
                    class="flex items-center justify-center rounded-lg border p-3 text-sm font-medium transition-all duration-200" 
                    :class="payment.method === 'cash' 
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary dark:bg-primary/10' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'"
                  >
                    Tunai / COD
                  </button>
                  
                  <button 
                    type="button" 
                    @click="payment.method = 'manual_transfer'; payment.paymentType = ''"
                    class="flex items-center justify-center rounded-lg border p-3 text-sm font-medium transition-all duration-200" 
                    :class="payment.method === 'manual_transfer' 
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary dark:bg-primary/10' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'"
                  >
                    Transfer Manual
                  </button>

                  <div class="col-span-2 mt-2 flex items-center gap-2">
                    <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                    <span class="text-[10px] font-bold uppercase text-gray-400">Otomatis (Midtrans)</span>
                    <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                  </div>

                  <button 
                    type="button" 
                    @click="payment.method = 'midtrans'; payment.paymentType = 'bca'"
                    class="flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all duration-200" 
                    :class="payment.paymentType === 'bca' 
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary dark:bg-primary/10' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'"
                  >
                    <span class="font-bold">BCA</span>
                  </button>

                  <button 
                    type="button" 
                    @click="payment.method = 'midtrans'; payment.paymentType = 'bri'"
                    class="flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all duration-200" 
                    :class="payment.paymentType === 'bri' 
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary dark:bg-primary/10' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'"
                  >
                    <span class="font-bold">BRI</span>
                  </button>

                  <button 
                    type="button" 
                    @click="payment.method = 'midtrans'; payment.paymentType = 'qris'"
                    class="col-span-2 flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all duration-200" 
                    :class="payment.paymentType === 'qris' 
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary dark:bg-primary/10' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'"
                  >
                    <Icon name="lucide:qr-code" class="h-4 w-4" /> 
                    <span>QRIS (Gopay/Shopee/Dana)</span>
                  </button>
                </div>
              </div>

              <button
                @click="handleSubmit"
                :disabled="loading"
                class="mt-8 flex w-full items-center justify-center rounded-lg bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-gray-900"
              >
                <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-5 w-5 animate-spin" />
                {{ loading ? "Memproses Pesanan..." : "Buat Pesanan Sekarang" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>