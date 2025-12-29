<script setup lang="ts">
import { ref, onMounted } from "vue";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { useNuxtApp } from "#app";
import DashboardCard from "~/components/dashboard/DashboardCard.vue";

// Judul Halaman
import { usePageTitle } from "~/composables/usePageTitles";
const pageTitle = usePageTitle();
onMounted(() => {
  pageTitle.value = "Dashboard Ringkasan";
});
useHead({ title: "Dashboard" });

const { $firestore } = useNuxtApp();
const firestore = $firestore as any;

// --- STATE ---
const loading = ref(true);
const stats = ref({
  revenue: 0,
  ordersCount: 0,
  customersCount: 0,
  productsSold: 0,
});
const recentOrders = ref<any[]>([]);
const lowStockProducts = ref<any[]>([]);

// --- CHART OPTIONS (ApexCharts) ---
const chartSeries = ref([
  {
    name: "Pendapatan",
    data: [30, 40, 35, 50, 49, 60, 70, 91, 125], // Dummy Data dulu
  },
]);

const chartOptions = ref({
  chart: {
    type: "area",
    height: 350,
    toolbar: { show: false },
    fontFamily: "inherit",
  },
  colors: ["#A67A4D"], // Warna Primary Anda
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2 },
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep"],
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  grid: {
    borderColor: "rgba(100, 100, 100, 0.1)",
    strokeDashArray: 4,
  },
  theme: { mode: "light" }, // Nanti bisa dibuat dinamis dark/light
});

// --- FETCH DATA ---
const fetchData = async () => {
  loading.value = true;
  try {
    // 1. Pesanan Terbaru (5 Terakhir)
    const ordersQuery = query(collection(firestore, "orders"), orderBy("createdAt", "desc"), limit(5));
    const ordersSnap = await getDocs(ordersQuery);

    recentOrders.value = ordersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));

    // 2. Hitung Statistik Sederhana (Idealnya pakai Cloud Function Aggregation utk data besar)
    // Disini kita hitung manual dari data yg diambil (Sample) atau query count
    // Untuk demo, kita pakai data dummy + data real recent
    stats.value.revenue = recentOrders.value.reduce((acc, curr) => acc + (curr.payment?.totalAmount || 0), 0);
    stats.value.ordersCount = recentOrders.value.length; // Seharusnya count() dari server

    // 3. Cek Stok Menipis (Stok < 10)
    // Note: Query "totalStock < 10" butuh index di Firestore
    const productsQuery = query(collection(firestore, "products"), where("totalStock", "<", 20), limit(5));
    const productsSnap = await getDocs(productsQuery);
    lowStockProducts.value = productsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (e) {
    console.error("Error fetching dashboard:", e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// Helper Format Rupiah
const toIDR = (num: number) => num.toLocaleString("id-ID");
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardCard title="Total Pendapatan" :value="`Rp ${toIDR(stats.revenue)}`" icon="lucide:wallet" colorClass="bg-primary" trend="+12.5%" :trendUp="true" />
      <DashboardCard title="Pesanan Baru" :value="stats.ordersCount" icon="lucide:shopping-bag" colorClass="bg-blue-500" trend="+5%" :trendUp="true" />
      <DashboardCard title="Pelanggan Aktif" value="1,240" icon="lucide:users" colorClass="bg-green-500" />
      <DashboardCard title="Produk Terjual" value="843" icon="lucide:box" colorClass="bg-orange-500" trend="-2%" :trendUp="false" />
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2 rounded-xl border border-muted/20 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-lg font-bold text-dark dark:text-white">Analisis Penjualan</h3>
          <select class="rounded-md border border-muted/30 bg-gray-50 px-3 py-1 text-sm dark:bg-gray-700">
            <option>7 Hari Terakhir</option>
            <option>Bulan Ini</option>
            <option>Tahun Ini</option>
          </select>
        </div>
        <div class="h-80">
          <ClientOnly>
            <apexchart width="100%" height="100%" type="area" :options="chartOptions" :series="chartSeries"></apexchart>
          </ClientOnly>
        </div>
      </div>

      <div class="rounded-xl border border-muted/20 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 class="mb-4 text-lg font-bold text-dark dark:text-white flex items-center gap-2"><Icon name="lucide:alert-circle" class="text-red-500" /> Stok Menipis</h3>
        <div class="space-y-4">
          <div v-if="lowStockProducts.length === 0" class="text-sm text-muted text-center py-4">Aman! Tidak ada stok menipis.</div>
          <div v-for="prod in lowStockProducts" :key="prod.id" class="flex items-center gap-3 border-b border-muted/10 pb-3 last:border-0 last:pb-0">
            <img :src="prod.thumbnailUrl" class="h-10 w-10 rounded-md object-cover bg-gray-100" />
            <div class="flex-1 min-w-0">
              <p class="truncate text-sm font-medium text-dark dark:text-white">{{ prod.name }}</p>
              <p class="text-xs text-muted">{{ prod.categoryName }}</p>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400"> Sisa {{ prod.totalStock }} </span>
            </div>
          </div>
        </div>
        <button class="mt-4 w-full rounded-lg border border-muted/30 py-2 text-sm text-muted hover:bg-gray-50 dark:hover:bg-gray-700">Lihat Semua Inventaris</button>
      </div>
    </div>

    <div class="rounded-xl border border-muted/20 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
      <div class="border-b border-muted/20 p-6 flex justify-between items-center">
        <h3 class="text-lg font-bold text-dark dark:text-white">Pesanan Terbaru</h3>
        <NuxtLink to="/orders" class="text-sm text-primary hover:underline">Lihat Semua</NuxtLink>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50 text-muted uppercase text-xs">
            <tr>
              <th class="px-6 py-3 font-semibold">Order ID</th>
              <th class="px-6 py-3 font-semibold">Pelanggan</th>
              <th class="px-6 py-3 font-semibold">Total</th>
              <th class="px-6 py-3 font-semibold text-center">Status</th>
              <th class="px-6 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-muted/10">
            <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td class="px-6 py-4 font-mono text-primary font-medium">
                #{{ order.id.slice(0, 8).toUpperCase() }}
                <div class="text-[10px] text-muted mt-0.5">
                  {{ order.createdAt ? new Date(order.createdAt).toLocaleDateString("id-ID") : "-" }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium text-dark dark:text-white">{{ order.customerName }}</div>
                <div class="text-xs text-muted">{{ order.items?.length }} Item</div>
              </td>
              <td class="px-6 py-4 font-bold text-dark dark:text-white">Rp {{ (order.payment?.totalAmount || 0).toLocaleString("id-ID") }}</td>
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase"
                  :class="{
                    'bg-yellow-100 text-yellow-700': order.status === 'pending_payment',
                    'bg-blue-100 text-blue-700': order.status === 'processing',
                    'bg-purple-100 text-purple-700': order.status === 'shipped',
                    'bg-green-100 text-green-700': order.status === 'delivered',
                  }"
                >
                  {{ order.status?.replace("_", " ") }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <NuxtLink :to="`/orders/${order.id}`" class="rounded p-2 text-muted hover:bg-gray-100 hover:text-primary dark:hover:bg-gray-700">
                  <Icon name="lucide:eye" class="h-4 w-4" />
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
