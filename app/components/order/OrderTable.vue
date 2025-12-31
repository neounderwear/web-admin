<script setup lang="ts">
import type { Order } from "~/types/order";
import { Vue3Lottie } from "vue3-lottie";
import notfoundAnim from "~/assets/animation/notfound.json";

defineProps<{
  orders: Order[];
  loading: boolean;
}>();

// Helper status styling
function getStatusConfig(status: string) {
  switch (status) {
    case "pending_payment":
      return { class: "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Menunggu Pembayaran", dot: "bg-yellow-500" };
    case "payment_verified":
      return { class: "bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400", label: "Terverifikasi", dot: "bg-blue-500" };
    case "processing":
      return { class: "bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400", label: "Diproses", dot: "bg-blue-500" };
    case "shipped":
      return { class: "bg-purple-50 text-purple-700 ring-purple-700/10 dark:bg-purple-900/30 dark:text-purple-400", label: "Dikirim", dot: "bg-purple-500" };
    case "delivered":
      return { class: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400", label: "Selesai", dot: "bg-green-500" };
    case "cancelled":
      return { class: "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-900/30 dark:text-red-400", label: "Dibatalkan", dot: "bg-red-500" };
    default:
      return { class: "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400", label: status, dot: "bg-gray-500" };
  }
}

function getPaymentBadge(payment: Order['payment']) {
  if (payment.method === 'midtrans') {
    return { 
      icon: 'lucide:credit-card', 
      label: payment.paymentType ? payment.paymentType.toUpperCase() : 'ONLINE',
      class: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800'
    };
  } else if (payment.method === 'manual_transfer') {
    return { 
      icon: 'lucide:arrow-right-left', 
      label: 'TRANSFER',
      class: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
    };
  } else {
    return { 
      icon: 'lucide:banknote', 
      label: 'CASH / COD',
      class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
    };
  }
}

function formatPrice(num: number) {
  return num.toLocaleString("id-ID");
}

function formatDate(date: any) {
  if (!date) return "-";
  // Handle Firestore Timestamp or JS Date
  const d = date.toDate ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
}

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th scope="col" class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              ID / Tanggal
            </th>
            <th scope="col" class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pelanggan
            </th>
            <th scope="col" class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total
            </th>
            <th scope="col" class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pembayaran
            </th>
            <th scope="col" class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Status
            </th>
            <th scope="col" class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          
          <template v-if="loading">
            <tr v-for="n in 5" :key="n" class="animate-pulse">
              <td class="px-6 py-4">
                <div class="space-y-2">
                  <div class="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div class="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div class="ml-3 space-y-2">
                    <div class="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div class="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="mx-auto h-6 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="mx-auto h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="mx-auto h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
              </td>
            </tr>
          </template>

          <tr v-else-if="orders.length === 0">
            <td colspan="6" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center justify-center">
                <ClientOnly>
                  <Vue3Lottie :animationData="notfoundAnim" :height="160" :width="160" />
                </ClientOnly>
                <p class="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Belum ada pesanan masuk.</p>
              </div>
            </td>
          </tr>

          <template v-else>
            <tr 
              v-for="order in orders" 
              :key="order.id" 
              class="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-700/50"
            >
              <td class="px-6 py-4 whitespace-nowrap align-middle">
                <div class="flex flex-col">
                  <span class="font-mono text-xs font-bold text-primary">#{{ order.id.slice(0, 8).toUpperCase() }}</span>
                  <span class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDate(order.createdAt) }}
                  </span>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap align-middle">
                <div class="flex items-center">
                  <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-xs font-bold text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {{ getInitial(order.customerName || 'G') }}
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ order.customerName || 'Guest' }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ order.items?.length || 0 }} Barang</div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap align-middle">
                <span class="text-sm font-bold text-gray-900 dark:text-white">
                  Rp {{ formatPrice(order.payment.totalAmount) }}
                </span>
              </td>

              <td class="px-6 py-4 text-center align-middle whitespace-nowrap">
                <span 
                  class="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium"
                  :class="getPaymentBadge(order.payment).class"
                >
                  <Icon :name="getPaymentBadge(order.payment).icon" class="mr-1.5 h-3 w-3" />
                  {{ getPaymentBadge(order.payment).label }}
                </span>
              </td>

              <td class="px-6 py-4 text-center align-middle whitespace-nowrap">
                <span 
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                  :class="getStatusConfig(order.status).class"
                >
                  <span class="mr-1.5 h-1.5 w-1.5 rounded-full" :class="getStatusConfig(order.status).dot"></span>
                  {{ getStatusConfig(order.status).label }}
                </span>
              </td>

              <td class="px-6 py-4 text-center align-middle whitespace-nowrap">
                <NuxtLink 
                  :to="`/orders/${order.id}`" 
                  class="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-primary-400"
                  title="Lihat Detail Pesanan"
                >
                  <Icon name="lucide:eye" class="h-4 w-4" />
                </NuxtLink>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>