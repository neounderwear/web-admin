<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useOrders } from "~/composables/useOrders";
import type { ShippingInfo } from "~/types/order";

const shipping = defineModel<Partial<ShippingInfo>>({ required: true });
const props = defineProps<{ weight: number }>();

// Menggunakan getSubdistricts sesuai update composable terakhir
const { getProvinces, getCities, getSubdistricts, checkRates } = useOrders();

// State Data Wilayah
const provinces = ref<any[]>([]);
const cities = ref<any[]>([]);
const subdistricts = ref<any[]>([]);

// State Pilihan (ID)
const selectedProv = ref("");
const selectedCity = ref("");
const selectedSubdistrict = ref("");

// State Ongkir
const shippingCosts = ref<any[]>([]);
const isLoading = ref(false); // Loading wilayah
const isLoadingCost = ref(false); // Loading ongkir
const errorMessage = ref("");

// 1. Load Provinsi
onMounted(async () => {
  isLoading.value = true;
  try {
    provinces.value = await getProvinces();
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
});

// 2. Watch Provinsi -> Load Kota
watch(selectedProv, async (newVal) => {
  cities.value = [];
  subdistricts.value = [];
  selectedCity.value = "";
  selectedSubdistrict.value = "";

  if (!newVal) return;

  isLoading.value = true;
  try {
    cities.value = await getCities(newVal);
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
});

// 3. Watch Kota -> Load Kecamatan
watch(selectedCity, async (newVal) => {
  subdistricts.value = [];
  selectedSubdistrict.value = "";

  if (!newVal) return;

  isLoading.value = true;
  try {
    subdistricts.value = await getSubdistricts(newVal);
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
});

// 4. Watch Kecamatan -> Simpan & Cek Ongkir
watch(selectedSubdistrict, (newVal) => {
  if (!newVal) return;

  // Helper cari nama (handle variasi properti id/province_id)
  const provData = provinces.value.find((p) => (p.province_id || p.id) == selectedProv.value);
  const cityData = cities.value.find((c) => (c.city_id || c.id) == selectedCity.value);
  const distData = subdistricts.value.find((d) => (d.subdistrict_id || d.id) == newVal);

  const provName = provData?.province || provData?.name;
  const cityName = cityData?.city_name || cityData?.name;
  const distName = distData?.subdistrict_name || distData?.name;

  // Simpan ke model
  shipping.value.cityId = newVal.toString();
  shipping.value.fullAddress = `${distName}, ${cityName}, ${provName}`;

  handleCheckRates(newVal.toString());
});

// --- 3. Cek Ongkir (FIX PARSING) ---
const handleCheckRates = async (districtId: string) => {
  if (props.weight <= 0) {
    errorMessage.value = "Berat 0, isi keranjang dulu.";
    return;
  }

  isLoadingCost.value = true;
  shippingCosts.value = [];
  errorMessage.value = "";

  try {
    const res: any = await checkRates(districtId, props.weight);

    // --- DEBUGGING FRONTEND ---
    // Cek Console Browser (F12) untuk melihat struktur asli data
    console.log("📦 Data dari Backend:", res);

    const flatCosts: any[] = [];

    if (Array.isArray(res)) {
      // Loop setiap item dalam array
      res.forEach((item: any) => {
        // SKENARIO 1: Data sudah FLAT (Langsung layanan)
        // Ciri: Punya properti 'price' atau 'cost' di root item, dan TIDAK punya array 'costs'
        // Kemungkinan struktur Komerce: { name: "JNE", service: "REG", price: 20000, ... }
        if (item.costs === undefined) {
          flatCosts.push({
            name: item.name || item.code?.toUpperCase(), // Nama Kurir
            service: item.service, // Nama Layanan
            description: item.description || item.service,
            price: item.price || item.cost || 0, // Harga
            etd: item.etd || "-", // Estimasi
          });
        }

        // SKENARIO 2: Data masih NESTED (Standar RajaOngkir)
        // Ciri: Punya array 'costs'
        else if (item.costs && Array.isArray(item.costs)) {
          item.costs.forEach((service: any) => {
            flatCosts.push({
              name: item.name,
              service: service.service,
              description: service.description,
              // RajaOngkir standar: cost adalah array, ambil index 0
              price: service.cost[0].value,
              etd: service.cost[0].etd,
            });
          });
        }
      });
    }

    // Urutkan dari yang termurah
    flatCosts.sort((a, b) => a.price - b.price);

    shippingCosts.value = flatCosts;

    if (shippingCosts.value.length === 0) {
      errorMessage.value = "Tidak ada kurir tersedia.";
    }
  } catch (e) {
    console.error(e);
    errorMessage.value = "Gagal menampilkan ongkir.";
  } finally {
    isLoadingCost.value = false;
  }
};
// Pilih Layanan
const selectService = (rate: any) => {
  shipping.value = {
    ...shipping.value,
    courier: rate.name,
    service: rate.service,
    cost: rate.price,
    weightTotal: props.weight,
    description: rate.description,
  };
};

// Watch berat (re-calc)
watch(
  () => props.weight,
  (newVal) => {
    if (newVal > 0 && shipping.value.cityId) {
      handleCheckRates(shipping.value.cityId!);
    }
  }
);

const formatRp = (val: number) => val.toLocaleString("id-ID");
</script>

<template>
  <div class="rounded-lg border border-muted/30 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
    <h3 class="mb-4 text-lg font-bold text-dark dark:text-white flex items-center gap-2">
      <Icon name="lucide:truck" class="h-5 w-5 text-primary" />
      Pengiriman
    </h3>

    <div class="space-y-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="label-text">Nama Penerima</label>
          <input v-model="shipping.recipientName" type="text" class="form-input" placeholder="Nama Lengkap" />
        </div>
        <div>
          <label class="label-text">No. Telepon</label>
          <input v-model="shipping.recipientPhone" type="text" class="form-input" placeholder="08..." />
        </div>
      </div>

      <div>
        <label class="label-text">Alamat Lengkap (Jalan/RT/RW)</label>
        <textarea v-model="shipping.fullAddress" rows="2" class="form-input" placeholder="Detail alamat..."></textarea>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label class="label-text">Provinsi</label>
          <select v-model="selectedProv" class="form-input" :disabled="isLoading">
            <option value="" disabled>Pilih Provinsi</option>
            <option v-for="p in provinces" :key="p.province_id || p.id" :value="p.province_id || p.id">
              {{ p.province || p.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="label-text">Kota/Kab</label>
          <select v-model="selectedCity" class="form-input" :disabled="!selectedProv || isLoading">
            <option value="" disabled>Pilih Kota</option>
            <option v-for="c in cities" :key="c.city_id || c.id" :value="c.city_id || c.id">{{ c.type }} {{ c.city_name || c.name }}</option>
          </select>
        </div>

        <div>
          <label class="label-text">Kecamatan</label>
          <select v-model="selectedSubdistrict" class="form-input" :disabled="!selectedCity || isLoading">
            <option value="" disabled>Pilih Kecamatan</option>
            <option v-for="d in subdistricts" :key="d.subdistrict_id || d.id" :value="d.subdistrict_id || d.id">
              {{ d.subdistrict_name || d.name }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="shipping.cityId" class="pt-2">
        <div v-if="isLoadingCost" class="py-6 text-center border rounded-md border-dashed border-muted/30">
          <Icon name="lucide:loader-2" class="animate-spin h-5 w-5 text-muted mx-auto" />
          <p class="text-xs text-muted mt-2">Mengecek tarif kurir...</p>
        </div>

        <div v-else-if="errorMessage" class="p-3 text-center text-xs text-red-500 bg-red-50 rounded border border-red-100">
          {{ errorMessage }}
        </div>

        <div v-else-if="shippingCosts.length > 0" class="space-y-2">
          <div class="mb-2 flex items-center justify-between border-t border-muted/20 pt-4">
            <label class="block text-xs font-bold uppercase text-muted">Pilih Layanan ({{ shippingCosts.length }})</label>
            <span v-if="shipping.cost" class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded"> {{ shipping.courier }} - Rp {{ formatRp(shipping.cost) }} </span>
          </div>

          <div class="max-h-80 overflow-y-auto custom-scrollbar pr-1 space-y-2">
            <div
              v-for="(rate, i) in shippingCosts"
              :key="i"
              @click="selectService(rate)"
              class="cursor-pointer rounded-lg border p-3 transition-all hover:border-primary relative overflow-hidden"
              :class="shipping.service === rate.service && shipping.courier === rate.name ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted/30 bg-white dark:bg-gray-900'"
            >
              <div class="flex justify-between items-center relative z-10">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-12 items-center justify-center rounded bg-gray-100 text-dark dark:bg-gray-800 dark:text-gray-300 font-bold text-[10px] uppercase border border-muted/20">
                    {{ rate.code ? rate.code.slice(0, 3) : "EXP" }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-dark dark:text-white text-sm">{{ rate.name }}</span>
                      <span class="text-[10px] font-mono bg-gray-200 px-1.5 rounded dark:bg-gray-700 text-dark dark:text-gray-300">{{ rate.service }}</span>
                    </div>
                    <p class="text-xs text-muted mt-0.5">Estimasi: {{ rate.etd ? rate.etd.replace("HARI", "").replace("Hari", "") : "-" }} Hari</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-primary">Rp {{ formatRp(rate.price) }}</p>
                </div>
              </div>

              <div v-if="shipping.service === rate.service && shipping.courier === rate.name" class="absolute top-0 right-0 p-1 bg-primary rounded-bl-lg shadow-sm">
                <Icon name="lucide:check" class="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.label-text {
  @apply mb-1 block text-xs font-bold uppercase text-muted;
}
.form-input {
  @apply w-full rounded-md border-muted/50 bg-gray-50 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white;
}
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
