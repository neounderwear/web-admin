<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { useNuxtApp } from "#app";
import type { Order } from "~/types/order";
import { useOrders } from "~/composables/useOrders";
import { useToast } from "~/composables/useToast";
import ShippingLabel from "~/components/order/ShippingLabel.vue";

const route = useRoute();
const router = useRouter();
const { $firestore } = useNuxtApp();
const { updateResi, updateOrderStatus, deleteOrder } = useOrders();
const { showSuccess, showError } = useToast();

const orderId = route.params.id as string;
const order = ref<Order | null>(null);
const loading = ref(true);
const isUpdatingStatus = ref(false);

// State Modals
const showResiModal = ref(false);
const showDeleteModal = ref(false);
const resiInput = ref("");
const loadingResi = ref(false);
const isDeleting = ref(false);

// Status Options
const statusOptions = [
  { value: 'pending_payment', label: 'Menunggu Pembayaran', class: 'bg-yellow-100 text-yellow-800' },
  { value: 'payment_verified', label: 'Pembayaran Diterima', class: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Sedang Diproses', class: 'bg-indigo-100 text-indigo-800' },
  { value: 'shipped', label: 'Dikirim', class: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Selesai / Diterima', class: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Dibatalkan', class: 'bg-red-100 text-red-800' },
  { value: 'refunded', label: 'Refund', class: 'bg-gray-100 text-gray-800' },
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
          shipping: { ...data.shipping, shippedAt: data.shipping.shippedAt?.toDate() },
          payment: { ...data.payment, paidAt: data.payment.paidAt?.toDate() }
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

// --- HANDLERS ---
async function handleStatusChange(event: Event) {
  if (!order.value) return;
  const newStatus = (event.target as HTMLSelectElement).value;
  isUpdatingStatus.value = true;
  try {
    await updateOrderStatus(order.value.id, newStatus);
    order.value.status = newStatus as any;
    showSuccess(`Status diperbarui: ${newStatus.replace('_', ' ')}`);
  } catch (e) { showError("Gagal update status"); } 
  finally { isUpdatingStatus.value = false; }
}

async function submitResi() {
  if (!resiInput.value) return;
  loadingResi.value = true;
  try {
    await updateResi(orderId, resiInput.value);
    showResiModal.value = false;
    resiInput.value = ""; 
    await fetchOrder(); 
    showSuccess("Nomor resi berhasil disimpan");
  } catch (e) { console.error(e); } 
  finally { loadingResi.value = false; }
}

async function confirmDeleteOrder() {
  isDeleting.value = true;
  try {
    await deleteOrder(orderId);
    showSuccess("Pesanan berhasil dihapus");
    router.push("/orders");
  } catch (e) {
    showError("Gagal menghapus pesanan");
    isDeleting.value = false;
    showDeleteModal.value = false;
  }
}

// --- UTILS ---
function copyText(text: string) {
  navigator.clipboard.writeText(text);
  showSuccess("Disalin ke clipboard!");
}

function printLabel() {
  window.print();
}

const whatsappLink = computed(() => {
  if (!order.value) return "";
  const customerName = order.value.customerName;
  const total = order.value.payment.totalAmount.toLocaleString('id-ID');
  let message = `Halo Kak *${customerName}*, info pesanan di GudangPD.\n`;
  message += `No Order: #${order.value.id.slice(0,5).toUpperCase()}\n`;

  if (order.value.status === 'pending_payment' && order.value.payment.method === 'midtrans') {
     const pay = order.value.payment as any;
     if (pay.vaNumber) {
        message += `Mohon transfer Rp ${total} ke Virtual Account ${pay.bank.toUpperCase()}:\n*${pay.vaNumber}*\n`;
     } else if (pay.qrUrl) {
        message += `Link QRIS: ${pay.qrUrl}\n`;
     }
  } else if (order.value.status === 'shipped') {
    message += `Resi: *${order.value.shipping.trackingNumber}*\n`;
  }

  const phone = order.value.customerPhone.replace(/^0/, '62').replace(/\D/g, ''); 
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
});
</script>

<template>
  <div class="container mx-auto p-4 sm:p-6 max-w-7xl relative min-h-screen" v-if="order">
    
    <div class="hidden print:block">
        <ShippingLabel :order="order" />
    </div>

    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
      <div class="flex items-center gap-4">
        <button 
          @click="router.push('/orders')" 
          class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white"
          title="Kembali"
        >
          <Icon name="lucide:arrow-left" class="h-5 w-5" />
        </button>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Order #{{ order.id.slice(0,8).toUpperCase() }}
            </h1>
            <Icon v-if="isUpdatingStatus" name="lucide:loader-2" class="h-5 w-5 animate-spin text-primary" />
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Dibuat pada {{ new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <select 
            :value="order.status" 
            @change="handleStatusChange" 
            :disabled="isUpdatingStatus" 
            class="appearance-none rounded-lg border-0 py-2.5 pl-4 pr-10 text-sm font-bold shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary disabled:opacity-70 dark:ring-gray-600"
            :class="{
              'bg-yellow-50 text-yellow-700 ring-yellow-600/20': order.status === 'pending_payment',
              'bg-green-50 text-green-700 ring-green-600/20': order.status === 'payment_verified' || order.status === 'delivered',
              'bg-blue-50 text-blue-700 ring-blue-700/20': order.status === 'processing',
              'bg-purple-50 text-purple-700 ring-purple-700/20': order.status === 'shipped',
              'bg-red-50 text-red-700 ring-red-600/20': order.status === 'cancelled',
            }"
          >
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
            <Icon name="lucide:chevron-down" class="h-4 w-4 opacity-50" />
          </div>
        </div>

        <div class="flex items-center gap-2 border-l border-gray-200 pl-3 dark:border-gray-700">
            <button @click="printLabel" class="btn-action" title="Cetak Label">
              <Icon name="lucide:printer" class="h-5 w-5" />
            </button>

            <button @click="showDeleteModal = true" class="btn-action text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20" title="Hapus Pesanan">
              <Icon name="lucide:trash-2" class="h-5 w-5" />
            </button>

            <a :href="whatsappLink" target="_blank" class="flex h-10 items-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#128C7E] transition-all">
              <Icon name="lucide:message-circle" class="h-5 w-5" />
              <span class="hidden sm:inline">WhatsApp</span>
            </a>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
      
      <div class="space-y-6 lg:col-span-2">
        
        <div v-if="order.payment.method === 'midtrans' && order.status === 'pending_payment'" 
             class="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-900/10">
            <div class="flex items-center justify-between border-b border-blue-100 bg-blue-50/50 px-6 py-4 dark:border-blue-900/30 dark:bg-blue-900/20">
               <h3 class="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-100">
                 <Icon name="lucide:credit-card" class="h-5 w-5" /> 
                 Pembayaran {{ (order.payment as any).paymentType === 'qris' ? 'QRIS' : 'Virtual Account' }}
               </h3>
               <span class="rounded bg-blue-100 px-2.5 py-1 text-xs font-bold uppercase text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                 {{ (order.payment as any).bank || 'Gopay' }}
               </span>
            </div>
            
            <div class="p-6 text-center">
                <div v-if="(order.payment as any).vaNumber">
                    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">Nomor Virtual Account</p>
                    <div class="mb-4 flex items-center justify-center gap-3">
                        <span class="text-3xl font-mono font-bold tracking-wider text-gray-900 dark:text-white">{{ (order.payment as any).vaNumber }}</span>
                        <button @click="copyText((order.payment as any).vaNumber)" class="rounded-full p-2 text-primary hover:bg-primary/10 transition-colors" title="Salin">
                            <Icon name="lucide:copy" class="h-5 w-5" />
                        </button>
                    </div>
                    <p class="text-xs text-gray-500">Lakukan pembayaran melalui ATM, M-Banking, atau Internet Banking.</p>
                </div>

                <div v-else-if="(order.payment as any).qrUrl">
                    <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Scan QRIS untuk membayar</p>
                    <div class="flex justify-center gap-4">
                        <a :href="(order.payment as any).qrUrl" target="_blank" class="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90 transition-colors">
                           <Icon name="lucide:external-link" class="h-4 w-4" /> Buka Pembayaran
                        </a>
                        <button @click="copyText((order.payment as any).qrUrl)" class="rounded-lg border border-gray-300 px-6 py-3 font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                           Salin Link
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div class="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
                <h3 class="font-bold text-gray-900 dark:text-white">Rincian Produk</h3>
            </div>
            <div class="p-6">
                <div class="space-y-6">
                    <div v-for="item in order.items" :key="item.productId" class="flex gap-4">
                        <div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700">
                            <img :src="item.thumbnailUrl || 'https://via.placeholder.com/80'" class="h-full w-full object-cover" />
                        </div>
                        <div class="flex flex-1 flex-col justify-between">
                            <div>
                                <h4 class="font-bold text-gray-900 dark:text-white">{{ item.productName }}</h4>
                                <p v-if="item.variantName" class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ item.variantName }}</p>
                            </div>
                            <div class="flex justify-between items-end">
                                <span class="text-sm text-gray-600 dark:text-gray-400">{{ item.quantity }} x Rp {{ item.price.toLocaleString('id-ID') }}</span>
                                <span class="font-bold text-gray-900 dark:text-white">Rp {{ item.totalPrice.toLocaleString('id-ID') }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-8 space-y-3 border-t border-gray-100 pt-6 dark:border-gray-700">
                    <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Subtotal Produk</span>
                        <span>Rp {{ order.subtotal.toLocaleString('id-ID') }}</span>
                    </div>
                    <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Ongkos Kirim ({{ (order.shipping.weightTotal / 1000).toFixed(1) }} kg)</span>
                        <span>Rp {{ (order.shipping.cost || 0).toLocaleString('id-ID') }}</span>
                    </div>
                    <div class="flex justify-between items-center border-t border-dashed border-gray-200 pt-4 mt-4 dark:border-gray-700">
                        <span class="text-base font-bold text-gray-900 dark:text-white">Total Tagihan</span>
                        <span class="text-xl font-bold text-primary">Rp {{ order.payment.totalAmount.toLocaleString('id-ID') }}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div class="space-y-6">
         <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 class="mb-4 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                <Icon name="lucide:user" class="h-5 w-5 text-gray-400" />
                Info Pelanggan
            </h3>
            <div class="space-y-3 text-sm">
                <div>
                    <p class="text-xs font-medium uppercase text-gray-500">Nama</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ order.customerName }}</p>
                </div>
                <div>
                    <p class="text-xs font-medium uppercase text-gray-500">Kontak</p>
                    <p class="text-gray-600 dark:text-gray-300">{{ order.customerPhone }}</p>
                    <p class="text-gray-600 dark:text-gray-300">{{ order.customerEmail || '-' }}</p>
                </div>
            </div>
         </div>

         <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 class="mb-4 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                <Icon name="lucide:truck" class="h-5 w-5 text-gray-400" />
                Pengiriman
            </h3>
            <div class="space-y-4">
                <div class="text-sm">
                    <p class="text-xs font-medium uppercase text-gray-500">Penerima</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ order.shipping.recipientName }}</p>
                    <p class="text-gray-600 dark:text-gray-300">{{ order.shipping.recipientPhone }}</p>
                </div>
                <div class="text-sm">
                    <p class="text-xs font-medium uppercase text-gray-500">Alamat</p>
                    <p class="leading-relaxed text-gray-600 dark:text-gray-300">{{ order.shipping.fullAddress }}</p>
                </div>
                
                <div class="border-t border-gray-100 pt-4 dark:border-gray-700">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold uppercase text-gray-500">Kurir</span>
                        <span v-if="order.shipping.courier" class="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            {{ order.shipping.courier }} - {{ order.shipping.service }}
                        </span>
                    </div>
                    
                    <div v-if="order.shipping.trackingNumber" class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                        <div>
                            <p class="text-[10px] uppercase text-gray-500">No. Resi</p>
                            <p class="font-mono font-bold tracking-wide text-gray-900 dark:text-white">{{ order.shipping.trackingNumber }}</p>
                        </div>
                        <button @click="showResiModal = true" class="rounded p-1.5 text-gray-500 hover:bg-white hover:text-primary hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-600">
                            <Icon name="lucide:edit-2" class="h-4 w-4" />
                        </button>
                    </div>
                    <div v-else>
                        <button @click="showResiModal = true" class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                            <Icon name="lucide:plus" class="h-4 w-4" /> Input Resi
                        </button>
                    </div>
                </div>
            </div>
         </div>
         
         <div v-if="order.notes" class="rounded-xl border border-yellow-100 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900/30 dark:bg-yellow-900/10 dark:text-yellow-200">
             <p class="font-bold mb-1 flex items-center gap-2"><Icon name="lucide:sticky-note" class="h-4 w-4" /> Catatan:</p>
             <p>{{ order.notes }}</p>
         </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="showDeleteModal = false"></div>
        <div class="relative w-full max-w-sm overflow-hidden rounded-xl bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
          <div class="mb-4 flex items-center gap-3 text-red-600">
             <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                 <Icon name="lucide:alert-triangle" class="h-5 w-5" />
             </div>
             <h3 class="text-lg font-bold">Hapus Pesanan?</h3>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Tindakan ini tidak dapat dibatalkan. Data pesanan ini akan hilang permanen dari database.</p>
          <div class="mt-6 flex justify-end gap-3">
            <button @click="showDeleteModal = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Batal</button>
            <button @click="confirmDeleteOrder" :disabled="isDeleting" class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-70">
              <Icon v-if="isDeleting" name="lucide:loader-2" class="h-4 w-4 animate-spin" /> Hapus Permanen
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showResiModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="showResiModal = false"></div>
        <div class="relative w-full max-w-md overflow-hidden rounded-xl bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Update Resi Pengiriman</h3>
            <button @click="showResiModal = false" class="text-gray-400 hover:text-gray-600"><Icon name="lucide:x" class="h-5 w-5" /></button>
          </div>
          
          <input v-model="resiInput" type="text" class="block w-full rounded-lg border-gray-300 bg-gray-50 p-3 text-lg font-mono uppercase tracking-wide text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-white" placeholder="CONTOH: JP123456" />
          
          <div class="mt-6 flex justify-end gap-3">
            <button @click="showResiModal = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Batal</button>
            <button @click="submitResi" :disabled="!resiInput || loadingResi" class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-70">
              <Icon v-if="loadingResi" name="lucide:loader-2" class="h-4 w-4 animate-spin" /> Simpan Resi
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.btn-action {
  @apply flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>