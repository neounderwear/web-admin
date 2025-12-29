<script setup lang="ts">
import type { Order } from "~/types/order";

defineProps<{
  orders: Order[];
  loading: boolean;
}>();

// Helper status color
function getStatusColor(status: string) {
  switch (status) {
    case "pending_payment":
      return "bg-yellow-100 text-yellow-800";
    case "payment_verified":
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatPrice(num: number) {
  return num.toLocaleString("id-ID");
}
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
    <table class="min-w-full">
      <thead class="bg-gray-50 dark:bg-gray-900">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase text-muted">ID / Tanggal</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase text-muted">Pelanggan</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase text-muted">Total</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase text-muted">Pembayaran</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase text-muted">Status</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase text-muted">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        <template v-if="loading">
          <tr>
            <td colspan="6" class="p-4 text-center">Loading...</td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td class="px-6 py-4">
              <div class="font-mono text-xs text-primary font-bold">#{{ order.id.slice(0, 8).toUpperCase() }}</div>
              <div class="text-xs text-muted">{{ new Date(order.createdAt).toLocaleDateString("id-ID") }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-dark dark:text-white">{{ order.customerName }}</div>
              <div class="text-xs text-muted">{{ order.items.length }} Barang</div>
            </td>
            <td class="px-6 py-4 text-sm font-bold text-dark dark:text-white">Rp {{ formatPrice(order.payment.totalAmount) }}</td>
            <td class="px-6 py-4 text-center">
              <span class="text-xs uppercase font-semibold badge border px-2 py-1 rounded" :class="order.payment.method === 'cash' ? 'border-green-200 bg-green-50 text-green-700' : 'border-blue-200 bg-blue-50 text-blue-700'">
                {{ order.payment.method }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusColor(order.status)">
                {{ order.status.replace("_", " ") }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <NuxtLink :to="`/orders/${order.id}`" class="text-primary hover:underline text-sm font-medium"> Detail </NuxtLink>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
