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
import OrderCart from "~/components/order/form/OrderCart.vue"; // Ini menggunakan file di atas
import OrderShipping from "~/components/order/form/OrderShipping.vue";

const { $firestore } = useNuxtApp();
const router = useRouter();
const { createOrder, getMidtransToken, loading } = useOrders();
const { showSuccess, showError } = useToast();

useHead({ title: "Buat Pesanan Baru" });

// --- STATE ---
const customer = ref<Customer | null>(null);
const items = ref<OrderItem[]>([]); // Ini akan diisi oleh OrderCart
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
});

// --- COMPUTED & WATCHERS ---
const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.totalPrice, 0));
const totalWeight = computed(() => items.value.reduce((sum, item) => sum + item.weight * item.quantity, 0));

watch(customer, (newCustomer) => {
  if (newCustomer) {
    if (!shipping.value.recipientName) shipping.value.recipientName = newCustomer.name;
    if (!shipping.value.recipientPhone) shipping.value.recipientPhone = newCustomer.phone;
  }
});

watchEffect(() => {
  shipping.value.weightTotal = totalWeight.value;
  payment.value.totalAmount = subtotal.value + (shipping.value.cost || 0);
});

// --- SUBMIT ---
async function handleSubmit() {
  if (!customer.value) return showError("Mohon pilih pelanggan.");
  if (items.value.length === 0) return showError("Keranjang belanja kosong.");
  if (!shipping.value.recipientName || !shipping.value.recipientPhone) return showError("Data penerima wajib diisi.");
  if (!shipping.value.fullAddress) return showError("Alamat lengkap wajib diisi.");

  // Validasi area hanya jika menggunakan kurir ekspedisi
  if (!shipping.value.cityId && shipping.value.courier) return showError("Mohon pilih Kecamatan tujuan.");

  try {
    loading.value = true;

    const orderData = {
      customerId: customer.value.id,
      customerName: customer.value.name,
      customerEmail: customer.value.email,
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

    const newOrderId = await createOrder(orderData);

    // Midtrans Logic
    if (payment.value.method === "midtrans") {
      try {
        const midtransPayload = {
          orderId: newOrderId,
          grossAmount: payment.value.totalAmount,
          customer: {
            name: customer.value.name,
            email: customer.value.email,
            phone: customer.value.phone,
          },
          items: items.value,
          shippingCost: shipping.value.cost || 0,
        };

        const res: any = await getMidtransToken(midtransPayload);

        const orderRef = doc($firestore, "orders", newOrderId);
        await updateDoc(orderRef, {
          "payment.snapToken": res.token,
          "payment.redirectUrl": res.redirect_url,
        });

        showSuccess("Order dibuat & Link pembayaran siap!");
        router.push(`/orders/${newOrderId}`);
        return;
      } catch (mtError) {
        console.error(mtError);
        showError("Order tersimpan, tapi gagal generate Midtrans.");
        router.push(`/orders/${newOrderId}`);
        return;
      }
    }

    showSuccess("Pesanan berhasil dibuat!");
    router.push("/orders");
  } catch (e) {
    showError(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-dark dark:text-white">Buat Pesanan Baru</h1>
      <button @click="router.back()" class="text-sm text-muted hover:text-dark hover:underline">Batal</button>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div class="space-y-8 lg:col-span-2">
        <OrderCustomer v-model="customer" />
        <OrderCart v-model="items" />
        <OrderShipping v-model="shipping" :weight="totalWeight" />

        <div class="rounded-lg border border-muted/30 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <label class="mb-2 block text-sm font-medium text-dark dark:text-white">Catatan Order</label>
          <textarea v-model="notes" rows="2" class="w-full rounded-md border-muted/50 bg-gray-50 p-3 text-sm dark:bg-gray-900" placeholder="Instruksi khusus..."></textarea>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-24 space-y-6">
          <div class="rounded-lg border border-muted/30 bg-white p-6 shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <h3 class="mb-6 text-lg font-bold text-dark dark:text-white">Ringkasan</h3>

            <div class="space-y-3 border-b border-muted/20 pb-6 text-sm">
              <div class="flex justify-between">
                <span class="text-muted">Subtotal</span>
                <span class="font-medium text-dark dark:text-white">Rp {{ subtotal.toLocaleString("id-ID") }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Berat</span>
                <span class="font-medium text-dark dark:text-white">{{ totalWeight }} gram</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-muted">Ongkos Kirim</span>
                <div class="text-right">
                  <span class="font-medium text-dark dark:text-white block">Rp {{ (shipping.cost || 0).toLocaleString("id-ID") }}</span>
                  <span v-if="shipping.courier" class="text-[10px] text-muted uppercase">{{ shipping.courier }} - {{ shipping.service }}</span>
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-between text-xl font-bold text-primary">
              <span>Total Bayar</span>
              <span>Rp {{ (payment.totalAmount || 0).toLocaleString("id-ID") }}</span>
            </div>

            <div class="mt-8">
              <label class="mb-3 block text-xs font-bold uppercase text-muted">Metode Pembayaran</label>

              <div class="grid grid-cols-1 gap-2">
                <div
                  @click="payment.method = 'midtrans'"
                  class="cursor-pointer rounded-lg border p-3 transition-all flex items-center gap-3"
                  :class="payment.method === 'midtrans' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted/30 hover:border-primary/50'"
                >
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Icon name="lucide:credit-card" class="h-4 w-4" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-dark dark:text-white">Payment Link</p>
                    <p class="text-[10px] text-muted">Virtual Account, QRIS, E-Wallet (Otomatis)</p>
                  </div>
                </div>

                <div
                  @click="payment.method = 'manual_transfer'"
                  class="cursor-pointer rounded-lg border p-3 transition-all flex items-center gap-3"
                  :class="payment.method === 'manual_transfer' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted/30 hover:border-primary/50'"
                >
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <Icon name="lucide:banknote" class="h-4 w-4" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-dark dark:text-white">Transfer Manual</p>
                    <p class="text-[10px] text-muted">Transfer ke Rekening Toko (Verifikasi Manual)</p>
                  </div>
                </div>

                <div
                  @click="payment.method = 'cash'"
                  class="cursor-pointer rounded-lg border p-3 transition-all flex items-center gap-3"
                  :class="payment.method === 'cash' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted/30 hover:border-primary/50'"
                >
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Icon name="lucide:hand-coins" class="h-4 w-4" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-dark dark:text-white">Tunai / COD</p>
                    <p class="text-[10px] text-muted">Bayar saat barang diterima</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              @click="handleSubmit"
              :disabled="loading"
              class="mt-8 flex w-full items-center justify-center rounded-lg bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 disabled:opacity-70"
            >
              <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-5 w-5 animate-spin" />
              {{ loading ? "Memproses..." : "Buat Pesanan" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
