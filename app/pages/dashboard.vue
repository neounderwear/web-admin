<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from "firebase/firestore";
import { useNuxtApp } from "#app";
import DashboardCard from "~/components/dashboard/DashboardCard.vue";
import { usePageTitle } from "~/composables/usePageTitles";

// Setup
const pageTitle = usePageTitle();
const { $firestore } = useNuxtApp();
const firestore = $firestore as any;

onMounted(() => {
  pageTitle.value = "Beranda";
});

useHead({ title: "Beranda" });

// State
const loading = ref(true);
const stats = ref({
  revenue: 0,
  ordersCount: 0,
  customersCount: 0, 
  productsSold: 0,
});

const recentOrders = ref<any[]>([]);
const lowStockProducts = ref<any[]>([]);

// Chart data reactive
const revenueSeries = ref([{ name: "Pendapatan", data: [0, 0, 0, 0, 0, 0] }]);
const chartCategories = ref<string[]>(["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"]);

// Fetch data
const fetchData = async () => {
  loading.value = true;
  try {
    // Ambil pesanan terbaru
    const ordersQuery = query(collection(firestore, "orders"), orderBy("createdAt", "desc"), limit(50)); 
    const ordersSnap = await getDocs(ordersQuery);

    const orders = ordersSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        totalAmount: data.payment?.totalAmount || 0,
        status: data.status || 'pending',
        itemsCount: Array.isArray(data.items) ? data.items.length : 0,
        customerName: data.customerName || 'Guest'
      };
    });

    recentOrders.value = orders.slice(0, 5);

    // Hitung statistik sederhana
    const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalSold = orders.reduce((acc, curr) => acc + curr.itemsCount, 0);

    stats.value = {
      revenue: totalRevenue,
      ordersCount: ordersSnap.size,
      customersCount: new Set(orders.map(o => o.customerName)).size,
      productsSold: totalSold
    };

    // Ambil data produk dengan stok rendah
    const productsQuery = query(collection(firestore, "products"), where("totalStock", "<=", 10), limit(5));
    const productsSnap = await getDocs(productsQuery);
    
    lowStockProducts.value = productsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Grafik data
    const monthlyRevenue = new Array(6).fill(0);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const currentMonth = new Date().getMonth(); 
    
    const labels: string[] = [];
    for(let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      labels.push(months[d.getMonth()] || "");
    }
    chartCategories.value = labels;
    
    orders.forEach(order => {
        const orderMonth = order.createdAt.getMonth();
        const diff = currentMonth - orderMonth;
        if(diff >= 0 && diff < 6) {
            monthlyRevenue[5 - diff] += order.totalAmount;
        }
    });
    
    revenueSeries.value = [{ name: "Pendapatan", data: monthlyRevenue }];

  } catch (e) {
    console.error("Gagal memuat dashboard:", e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// Grafik
const chartOptions = computed(() => ({
  chart: {
    type: "area",
    height: 350,
    fontFamily: "inherit",
    toolbar: { show: false },
    animations: { enabled: true }
  },
  colors: ["#3b82f6"], 
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 90, 100]
    }
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2 },
  xaxis: {
    categories: chartCategories.value,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#9ca3af' } }
  },
  yaxis: {
    labels: { 
      style: { colors: '#9ca3af' },
      formatter: (val: number) => val >= 1000000 ? `Rp ${(val/1000000).toFixed(1)}Jt` : val 
    }
  },
  grid: {
    borderColor: "rgba(107, 114, 128, 0.1)",
    strokeDashArray: 4,
  },
  tooltip: {
    theme: "light",
    y: { formatter: (val: number) => "Rp " + val.toLocaleString("id-ID") }
  }
}));

const toIDR = (num: number) => num.toLocaleString("id-ID");
</script>

<template>
  <div class="p-6 sm:p-8 space-y-8">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardCard 
        title="Total Pendapatan" 
        :value="`Rp ${toIDR(stats.revenue)}`" 
        icon="lucide:wallet" 
        variant="success" 
        trend="+12%" 
        :trend-up="true"
        :loading="loading" 
      />
      
      <DashboardCard 
        title="Pesanan Baru" 
        :value="stats.ordersCount" 
        icon="lucide:shopping-cart" 
        variant="primary" 
        trend="+5%" 
        :trend-up="true"
        :loading="loading" 
      />
      
      <DashboardCard 
        title="Pelanggan Aktif" 
        :value="stats.customersCount" 
        icon="lucide:users" 
        variant="info"
        :loading="loading" 
      />
      
      <DashboardCard 
        title="Produk Terjual" 
        :value="stats.productsSold" 
        icon="lucide:package" 
        variant="warning" 
        trend="-2%" 
        :trend-up="false"
        :loading="loading" 
      />
    </div>
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div class="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Analisis Penjualan</h3>
            <p class="text-sm text-gray-500">Performa pendapatan 6 bulan terakhir</p>
          </div>
        </div>
        <div class="h-80 w-full">
          <ClientOnly>
            <div v-if="loading" class="h-full w-full bg-gray-100 animate-pulse rounded-lg dark:bg-gray-700"></div>
            <apexchart v-else width="100%" height="100%" type="area" :options="chartOptions" :series="revenueSeries"></apexchart>
          </ClientOnly>
        </div>
      </div>

      <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col">
        <h3 class="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <Icon name="lucide:alert-triangle" class="text-red-500 h-5 w-5" /> Stok Menipis
        </h3>
        
        <div class="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
          <div v-if="loading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex gap-3 animate-pulse">
               <div class="h-10 w-10 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
               <div class="flex-1 space-y-2">
                 <div class="h-3 w-2/3 bg-gray-200 rounded dark:bg-gray-700"></div>
                 <div class="h-2 w-1/2 bg-gray-200 rounded dark:bg-gray-700"></div>
               </div>
            </div>
          </div>

          <div v-else-if="lowStockProducts.length === 0" class="flex h-full flex-col items-center justify-center text-center text-gray-400">
            <Icon name="lucide:check-circle" class="h-12 w-12 text-green-500 mb-2 opacity-50" />
            <p class="text-sm">Stok aman! Tidak ada produk yang menipis.</p>
          </div>

          <div v-else v-for="prod in lowStockProducts" :key="prod.id" class="group flex items-center gap-3 rounded-lg border border-gray-100 p-2 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
            <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200 dark:border-gray-600">
              <img :src="prod.thumbnailUrl || 'https://via.placeholder.com/40'" class="h-full w-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="truncate text-sm font-semibold text-gray-900 dark:text-white" :title="prod.name">{{ prod.name }}</p>
              <p class="text-xs text-gray-500">{{ prod.categoryName || 'Uncategorized' }}</p>
            </div>
            <span class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {{ prod.totalStock }} Pcs
            </span>
          </div>
        </div>

        <NuxtLink to="/products/manage" class="mt-4 flex w-full items-center justify-center rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
          Kelola Inventaris
        </NuxtLink>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div class="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-700">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Pesanan Terbaru</h3>
        <NuxtLink to="/orders" class="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
          Lihat Semua <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
            <tr>
              <th class="px-6 py-4 font-semibold">Order ID</th>
              <th class="px-6 py-4 font-semibold">Pelanggan</th>
              <th class="px-6 py-4 font-semibold">Total</th>
              <th class="px-6 py-4 font-semibold text-center">Status</th>
              <th class="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-if="loading" v-for="n in 5" :key="n" class="animate-pulse">
               <td class="px-6 py-4"><div class="h-4 w-24 bg-gray-200 rounded dark:bg-gray-700"></div></td>
               <td class="px-6 py-4"><div class="h-4 w-32 bg-gray-200 rounded dark:bg-gray-700"></div></td>
               <td class="px-6 py-4"><div class="h-4 w-20 bg-gray-200 rounded dark:bg-gray-700"></div></td>
               <td class="px-6 py-4"><div class="h-6 w-20 mx-auto bg-gray-200 rounded-full dark:bg-gray-700"></div></td>
               <td class="px-6 py-4"><div class="h-8 w-8 ml-auto bg-gray-200 rounded dark:bg-gray-700"></div></td>
            </tr>

            <tr v-else v-for="order in recentOrders" :key="order.id" class="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-mono font-medium text-primary group-hover:underline">#{{ order.id.slice(0, 8).toUpperCase() }}</span>
                  <span class="text-[10px] text-gray-400 mt-0.5">
                    {{ order.createdAt ? new Date(order.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : "-" }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="font-semibold text-gray-900 dark:text-white">{{ order.customerName }}</div>
                <div class="text-xs text-gray-500">{{ order.itemsCount }} Item</div>
              </td>
              <td class="px-6 py-4 font-bold text-gray-900 dark:text-white">
                Rp {{ (order.totalAmount || 0).toLocaleString("id-ID") }}
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border"
                  :class="{
                    'bg-yellow-50 text-yellow-700 border-yellow-200': order.status === 'pending_payment' || order.status === 'pending',
                    'bg-blue-50 text-blue-700 border-blue-200': order.status === 'processing',
                    'bg-purple-50 text-purple-700 border-purple-200': order.status === 'shipped',
                    'bg-green-50 text-green-700 border-green-200': order.status === 'delivered' || order.status === 'completed',
                    'bg-red-50 text-red-700 border-red-200': order.status === 'cancelled',
                  }"
                >
                  {{ order.status?.replace(/_/g, " ") }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <NuxtLink :to="`/orders/${order.id}`" class="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-primary hover:shadow-sm ring-1 ring-transparent hover:ring-gray-200 dark:hover:bg-gray-700 dark:hover:ring-gray-600">
                  <Icon name="lucide:eye" class="h-4 w-4" />
                </NuxtLink>
              </td>
            </tr>

            <tr v-if="!loading && recentOrders.length === 0">
               <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  Belum ada pesanan terbaru.
               </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}
</style>