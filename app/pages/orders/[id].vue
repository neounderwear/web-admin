<script lang="ts" setup>
import {computed, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {doc, getDoc} from "firebase/firestore";
import {useNuxtApp} from "#app";
import type {Order} from "~/types/order";
import {useOrders} from "~/composables/useOrders";
import {useToast} from "~/composables/useToast";

const route = useRoute();
const router = useRouter();
const {$firestore} = useNuxtApp();
// Ambil updateOrderStatus dan deleteOrder dari composable
const {updateResi, updateOrderStatus, deleteOrder} = useOrders();
const {showSuccess, showError} = useToast();

const orderId = route.params.id as string;
const order = ref<Order | null>(null);
const loading = ref(true);
const isUpdatingStatus = ref(false);
const isDeleting = ref(false);

// State Modal Resi
const showResiModal = ref(false);
const resiInput = ref("");
const loadingResi = ref(false);

// Pilihan Status untuk Dropdown
const statusOptions = [
  {value: 'pending_payment', label: 'Menunggu Pembayaran'},
  {value: 'payment_verified', label: 'Pembayaran Diterima'},
  {value: 'processing', label: 'Sedang Diproses'},
  {value: 'shipped', label: 'Dikirim'},
  {value: 'delivered', label: 'Selesai / Diterima'},
  {value: 'cancelled', label: 'Dibatalkan'},
  {value: 'refunded', label: 'Dikembalikan (Refund)'},
];

onMounted(async () => {
  await fetchOrder();
});

async function fetchOrder() {
  try {
    const snap = await getDoc(doc($firestore, "orders", orderId));
    if (snap.exists()) {
      const data = snap.data() as any;
      order.value = {
        id: snap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        shipping: {...data.shipping, shippedAt: data.shipping.shippedAt?.toDate()},
        payment: {...data.payment, paidAt: data.payment.paidAt?.toDate()}
      } as Order;
    } else {
      showError("Order tidak ditemukan");
      router.push('/orders');
    }
  } catch (e) {
    console.error(e);
    showError("Gagal memuat order");
  } finally {
    loading.value = false;
  }
}

// --- HANDLER STATUS ---
async function handleStatusChange(event: Event) {
  if (!order.value) return;
  const newStatus = (event.target as HTMLSelectElement).value;

  isUpdatingStatus.value = true;
  try {
    await updateOrderStatus(order.value.id, newStatus);
    order.value.status = newStatus as any; // Update tampilan lokal
    showSuccess(`Status diubah menjadi: ${newStatus.replace('_', ' ')}`);
  } catch (e) {
    showError("Gagal update status");
  } finally {
    isUpdatingStatus.value = false;
  }
}

// --- HANDLER HAPUS ---
async function handleDeleteOrder() {
  if (!confirm("Apakah Anda yakin ingin menghapus pesanan ini permanen?")) return;

  isDeleting.value = true;
  try {
    await deleteOrder(orderId);
    showSuccess("Pesanan berhasil dihapus");
    router.push("/orders");
  } catch (e) {
    showError("Gagal menghapus pesanan");
    isDeleting.value = false;
  }
}

// --- FITUR WHATSAPP ---
const whatsappLink = computed(() => {
  if (!order.value) return "";
  const customerName = order.value.customerName;
  const total = order.value.payment.totalAmount.toLocaleString('id-ID');
  let message = `Halo Kak *${customerName}*, pesanan Anda di GudangPD.\n\n`;
  message += `📋 *Order ID: #${order.value.id.slice(0, 5).toUpperCase()}*\n`;
  message += `📦 Status: *${order.value.status.replace('_', ' ').toUpperCase()}*\n\n`;

  if (order.value.status === 'pending_payment' && order.value.payment.method === 'midtrans') {
    message += `Link Bayar: ${(order.value as any).payment.redirectUrl}\n`;
  } else if (order.value.status === 'shipped') {
    message += `Resi Pengiriman: *${order.value.shipping.trackingNumber}*\n`;
  }

  const phone = order.value.customerPhone.replace(/^0/, '62').replace(/\D/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
});

// --- HANDLER RESI ---
async function submitResi() {
  if (!resiInput.value) return;
  loadingResi.value = true;
  try {
    await updateResi(orderId, resiInput.value);
    showResiModal.value = false;
    resiInput.value = "";
    await fetchOrder();
    showSuccess("Resi berhasil diupdate");
  } catch (e) {
    console.error(e);
  } finally {
    loadingResi.value = false;
  }
}
</script>

<template>
  <div v-if="order" class="container mx-auto p-6 max-w-7xl">

    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-4">
        <button
            class="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-muted/20 text-muted hover:text-dark hover:border-dark transition-all dark:bg-gray-800 dark:border-gray-700 dark:hover:text-white shadow-sm"
            title="Kembali"
            @click="router.push('/orders')"
        >
          <Icon class="h-5 w-5" name="lucide:arrow-left"/>
        </button>

        <div>
          <h1 class="text-2xl font-bold text-dark dark:text-white flex items-center gap-2">
            Order #{{ order.id.slice(0, 8).toUpperCase() }}
            <Icon v-if="isUpdatingStatus" class="h-4 w-4 animate-spin text-primary" name="lucide:loader-2"/>
          </h1>
          <span class="text-sm text-muted">{{
              new Date(order.createdAt).toLocaleString('id-ID', {
                dateStyle: 'full',
                timeStyle: 'short'
              })
            }}</span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <select
              :class="{
              'text-yellow-600': order.status === 'pending_payment',
              'text-blue-600': order.status === 'processing' || order.status === 'payment_verified',
              'text-purple-600': order.status === 'shipped',
              'text-green-600': order.status === 'delivered',
              'text-red-600': order.status === 'cancelled',
            }"
              :disabled="isUpdatingStatus"
              :value="order.status"
              class="appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-muted/30 bg-white text-sm font-bold shadow-sm cursor-pointer focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all hover:border-primary/50"
              @change="handleStatusChange"
          >
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <Icon class="absolute right-3 top-3 h-4 w-4 text-muted pointer-events-none" name="lucide:chevron-down"/>
        </div>

        <button
            :disabled="isDeleting"
            class="flex items-center justify-center h-[42px] w-[42px] rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all dark:bg-red-900/20 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900"
            title="Hapus Pesanan"
            @click="handleDeleteOrder"
        >
          <Icon v-if="isDeleting" class="h-5 w-5 animate-spin" name="lucide:loader-2"/>
          <Icon v-else class="h-5 w-5" name="lucide:trash-2"/>
        </button>

        <a
            :href="whatsappLink"
            class="inline-flex h-[42px] items-center justify-center rounded-lg bg-green-500 px-4 text-sm font-bold text-white shadow-sm hover:bg-green-600 transition-all"
            target="_blank"
        >
          <Icon class="mr-2 h-5 w-5" name="lucide:message-circle"/>
          WhatsApp
        </a>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div class="lg:col-span-2 space-y-6">
        <div v-if="order.payment.method === 'midtrans' && order.status === 'pending_payment'"
             class="bg-blue-50 border border-blue-200 p-5 rounded-xl dark:bg-blue-900/20 dark:border-blue-800">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-blue-900 dark:text-blue-200">Menunggu Pembayaran</h3>
            <span class="bg-white px-2 py-1 rounded text-xs font-bold text-blue-600">Midtrans</span>
          </div>
          <div class="mt-3 flex gap-2">
            <input :value="(order as any).payment.redirectUrl" class="flex-1 p-2 text-xs border border-blue-200 rounded bg-white text-gray-600" readonly
                   type="text"/>
            <a :href="(order as any).payment.redirectUrl" class="bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-blue-700"
               target="_blank">Buka Link</a>
          </div>
        </div>

        <div class="bg-white border border-muted/20 rounded-xl p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h3 class="font-bold text-lg mb-4 border-b border-muted/10 pb-3">Rincian Produk</h3>
          <div class="space-y-4">
            <div v-for="item in order.items" :key="item.productId" class="flex items-start gap-4">
              <img :src="item.thumbnailUrl"
                   class="h-16 w-16 rounded-md object-cover border border-muted/20 bg-gray-50"/>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-dark dark:text-white">{{ item.productName }}</p>
                <p v-if="item.variantName" class="text-sm text-muted">{{ item.variantName }}</p>
                <p class="text-sm text-muted">{{ item.quantity }} x Rp {{ item.price.toLocaleString('id-ID') }}</p>
              </div>
              <p class="font-bold text-dark dark:text-white">Rp {{ item.totalPrice.toLocaleString('id-ID') }}</p>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-muted/10 space-y-2 text-sm">
            <div class="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>Rp {{ order.subtotal.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between text-muted">
              <span>Ongkos Kirim ({{ order.shipping.courier?.toUpperCase() }})</span>
              <span>Rp {{ (order.shipping.cost || 0).toLocaleString('id-ID') }}</span>
            </div>
            <div
                class="flex justify-between text-lg font-bold text-primary pt-2 border-t border-dashed border-muted/20 mt-2">
              <span>Total Tagihan</span>
              <span>Rp {{ order.payment.totalAmount.toLocaleString('id-ID') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white border border-muted/20 rounded-xl p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h3 class="font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
            <Icon class="h-5 w-5 text-primary" name="lucide:user"/>
            Pelanggan
          </h3>
          <div class="text-sm space-y-1">
            <p class="font-medium">{{ order.customerName }}</p>
            <p class="text-muted">{{ order.customerEmail }}</p>
            <p class="text-muted">{{ order.customerPhone }}</p>
          </div>
        </div>

        <div class="bg-white border border-muted/20 rounded-xl p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h3 class="font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
            <Icon class="h-5 w-5 text-primary" name="lucide:truck"/>
            Pengiriman
          </h3>

          <div class="space-y-4 text-sm">
            <div>
              <p class="text-xs font-bold uppercase text-muted">Alamat</p>
              <p class="text-dark dark:text-gray-300 leading-relaxed mt-1">{{ order.shipping.fullAddress }}</p>
            </div>

            <div class="pt-3 border-t border-muted/10">
              <p class="text-xs font-bold uppercase text-muted mb-1">Nomor Resi</p>
              <div v-if="order.shipping.trackingNumber">
                <div
                    class="flex items-center justify-between bg-gray-100 p-2.5 rounded border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                  <span class="font-mono font-bold text-primary text-lg tracking-wide">{{
                      order.shipping.trackingNumber
                    }}</span>
                  <button class="p-1 hover:bg-gray-200 rounded dark:hover:bg-gray-600" @click="showResiModal = true">
                    <Icon class="h-4 w-4" name="lucide:edit-2"/>
                  </button>
                </div>
              </div>
              <div v-else>
                <button
                    class="w-full py-2.5 bg-dark text-white rounded-lg text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                    @click="showResiModal = true"
                >
                  <Icon class="h-3 w-3" name="lucide:plus"/>
                  Input Resi Manual
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showResiModal"
           class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div class="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl dark:bg-gray-800 border dark:border-gray-700">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">Update Resi</h3>
            <button @click="showResiModal = false">
              <Icon class="h-5 w-5" name="lucide:x"/>
            </button>
          </div>
          <p class="text-sm text-muted mb-4">Masukkan nomor resi yang valid untuk pesanan ini.</p>

          <input
              v-model="resiInput"
              class="w-full border rounded-lg p-3 mb-4 bg-gray-50 text-lg font-mono focus:ring-primary focus:border-primary dark:bg-gray-900 dark:border-gray-700 uppercase"
              placeholder="Contoh: JP1234567890"
              type="text"
          />

          <div class="flex justify-end gap-2">
            <button class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
                    @click="showResiModal = false">
              Batal
            </button>
            <button
                :disabled="!resiInput || loadingResi"
                class="px-4 py-2 text-sm bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center"
                @click="submitResi"
            >
              <Icon v-if="loadingResi" class="animate-spin mr-2 h-4 w-4" name="lucide:loader-2"/>
              Simpan Resi
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>