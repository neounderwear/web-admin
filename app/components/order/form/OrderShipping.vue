<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useOrders } from "~/composables/useOrders";
import type { ShippingInfo } from "~/types/order";

const shipping = defineModel<Partial<ShippingInfo>>({ required: true });
const props = defineProps<{ weight: number }>();

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
const isLoading = ref(false); 
const isLoadingCost = ref(false);
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

  const provData = provinces.value.find((p) => (p.province_id || p.id) == selectedProv.value);
  const cityData = cities.value.find((c) => (c.city_id || c.id) == selectedCity.value);
  const distData = subdistricts.value.find((d) => (d.subdistrict_id || d.id) == newVal);

  const provName = provData?.province || provData?.name;
  const cityName = cityData?.city_name || cityData?.name;
  const distName = distData?.subdistrict_name || distData?.name;

  shipping.value.cityId = newVal.toString();
  shipping.value.fullAddress = `${distName}, ${cityName}, ${provName}`;

  handleCheckRates(newVal.toString());
});

// --- Cek Ongkir ---
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
    const flatCosts: any[] = [];

    if (Array.isArray(res)) {
      res.forEach((item: any) => {
        if (item.costs === undefined) {
          flatCosts.push({
            name: item.name || item.code?.toUpperCase(),
            code: item.code,
            service: item.service,
            description: item.description || item.service,
            price: item.price || item.cost || 0,
            etd: item.etd || "-",
          });
        } else if (item.costs && Array.isArray(item.costs)) {
          item.costs.forEach((service: any) => {
            flatCosts.push({
              name: item.name,
              code: item.code,
              service: service.service,
              description: service.description,
              price: service.cost[0].value,
              etd: service.cost[0].etd,
            });
          });
        }
      });
    }

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
  <div class="relative overflow-visible rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="border-b border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50 rounded-t-xl">
      <h3 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
        <Icon name="lucide:truck" class="h-4 w-4" />
        Pengiriman
      </h3>
    </div>

    <div class="p-4 space-y-5">
      
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Nama Penerima
          </label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Icon name="lucide:user" class="h-4 w-4" />
            </div>
            <input 
              v-model="shipping.recipientName" 
              type="text" 
              class="w-full rounded-lg border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm transition-all focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Nama Lengkap" 
            />
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            No. Telepon
          </label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Icon name="lucide:phone" class="h-4 w-4" />
            </div>
            <input 
              v-model="shipping.recipientPhone" 
              type="text" 
             class="w-full rounded-lg border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm transition-all focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="08..." 
            />
          </div>
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Alamat Lengkap
        </label>
        <div class="relative">
          <textarea 
            v-model="shipping.fullAddress" 
            rows="2" 
            class="w-full rounded-lg border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm transition-all focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="Jalan, RT/RW, No. Rumah..."
          ></textarea>
          <div class="absolute left-3 top-3 text-gray-400">
            <Icon name="lucide:map-pin" class="h-4 w-4" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Provinsi</label>
          <div class="relative">
            <select v-model="selectedProv" class="form-select" :disabled="isLoading">
              <option value="" disabled>Pilih Provinsi</option>
              <option v-for="p in provinces" :key="p.province_id || p.id" :value="p.province_id || p.id">
                {{ p.province || p.name }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <Icon v-if="isLoading && provinces.length === 0" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
              <Icon v-else name="lucide:chevron-down" class="h-4 w-4" />
            </div>
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Kota/Kab</label>
          <div class="relative">
            <select v-model="selectedCity" class="form-select" :disabled="!selectedProv || isLoading">
              <option value="" disabled>Pilih Kota</option>
              <option v-for="c in cities" :key="c.city_id || c.id" :value="c.city_id || c.id">
                {{ c.type }} {{ c.city_name || c.name }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <Icon v-if="isLoading && cities.length === 0 && selectedProv" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
              <Icon v-else name="lucide:chevron-down" class="h-4 w-4" />
            </div>
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Kecamatan</label>
          <div class="relative">
            <select v-model="selectedSubdistrict" class="form-select" :disabled="!selectedCity || isLoading">
              <option value="" disabled>Pilih Kecamatan</option>
              <option v-for="d in subdistricts" :key="d.subdistrict_id || d.id" :value="d.subdistrict_id || d.id">
                {{ d.subdistrict_name || d.name }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <Icon v-if="isLoading && subdistricts.length === 0 && selectedCity" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
              <Icon v-else name="lucide:chevron-down" class="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="shipping.cityId" class="pt-2">
        <transition name="fade" mode="out-in">
          
          <div v-if="isLoadingCost" class="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 py-8 dark:border-gray-600 dark:bg-gray-800/50">
            <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin text-primary" />
            <p class="mt-2 text-xs font-medium text-gray-500">Mengecek tarif kurir...</p>
          </div>

          <div v-else-if="errorMessage" class="rounded-lg border border-red-100 bg-red-50 p-4 text-center dark:border-red-900/30 dark:bg-red-900/10">
            <p class="text-sm font-medium text-red-600 dark:text-red-400">{{ errorMessage }}</p>
          </div>

          <div v-else-if="shippingCosts.length > 0" class="space-y-3">
            <div class="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500">Pilih Layanan ({{ shippingCosts.length }})</label>
              <transition name="fade">
                <span v-if="shipping.cost" class="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary ring-1 ring-inset ring-primary/20">
                  {{ shipping.courier }} - Rp {{ formatRp(shipping.cost || 0) }}
                </span>
              </transition>
            </div>

            <div class="max-h-80 space-y-2 overflow-y-auto pr-1">
              <div
                v-for="(rate, i) in shippingCosts"
                :key="i"
                @click="selectService(rate)"
                class="group relative cursor-pointer overflow-hidden rounded-xl border p-3 transition-all duration-200 hover:border-primary hover:shadow-sm"
                :class="shipping.service === rate.service && shipping.courier === rate.name 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary dark:bg-primary/10' 
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'"
              >
                <div class="relative z-10 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-12 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-[10px] font-bold uppercase text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                      {{ rate.code ? rate.code.slice(0, 3) : "EXP" }}
                    </div>
                    
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-gray-900 dark:text-white">{{ rate.name }}</span>
                        <span class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {{ rate.service }}
                        </span>
                      </div>
                      <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        Estimasi: {{ rate.etd ? rate.etd.replace("HARI", "").replace("Hari", "") : "-" }} Hari
                      </p>
                    </div>
                  </div>

                  <div class="text-right">
                    <p class="text-sm font-bold text-primary">Rp {{ formatRp(rate.price) }}</p>
                  </div>
                </div>

                <div v-if="shipping.service === rate.service && shipping.courier === rate.name" class="absolute right-0 top-0 rounded-bl-lg bg-primary p-1 shadow-sm">
                  <Icon name="lucide:check" class="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom Styles for Inputs to match Theme */
.form-input {
  @apply block w-full rounded-lg border-gray-200 bg-white py-2.5 text-sm text-gray-900 focus:border-primary focus:bg-white focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all;
}

.form-select {
  @apply block w-full appearance-none rounded-lg border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-gray-900 focus:border-primary focus:bg-white focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>