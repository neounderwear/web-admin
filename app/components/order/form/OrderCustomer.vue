<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Customer } from "~/types/customer";
import { useSearch } from "~/composables/useSearch"; 
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNuxtApp } from "#app";

// Props & Emits
const props = defineProps<{
  modelValue: Customer | null;
}>();

const emit = defineEmits(["update:modelValue"]);

const { $firestore } = useNuxtApp();

// --- STATE ---
const allCustomers = ref<Customer[]>([]);
const isLoadingData = ref(false);
const showDropdown = ref(false);

// --- SEARCH ENGINE (FUSE.JS) ---
const { searchQuery, filteredData: displayedCustomers } = useSearch(allCustomers, {
  keys: ["name", "phone", "email"],
  threshold: 0.3,
});

// --- LOAD ALL CUSTOMERS ---
onMounted(async () => {
  isLoadingData.value = true;
  try {
    const q = query(collection($firestore, "customers"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    
    allCustomers.value = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Customer[];
    
  } catch (e) {
    console.error("Gagal load customers:", e);
  } finally {
    isLoadingData.value = false;
  }
});

// --- HANDLERS ---
function selectCustomer(customer: Customer) {
  emit("update:modelValue", customer);
  showDropdown.value = false;
  searchQuery.value = ""; 
}

function onFocusSearch() {
  showDropdown.value = true;
}

function closeDropdown() {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
}

function getInitial(name: string) {
  return name ? name.charAt(0).toUpperCase() : "?";
}
</script>

<template>
  <div class="relative rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    
    <div class="rounded-t-xl border-b border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <h3 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
        <Icon name="lucide:users" class="h-4 w-4" />
        Data Pelanggan
      </h3>
    </div>

    <div class="p-4">
      <div v-if="!modelValue">
        <div class="relative">
          <div class="relative">
            <input
              v-model="searchQuery"
              @focus="onFocusSearch"
              @blur="closeDropdown"
              type="text"
              placeholder="Cari nama, no. HP, atau email..."
              class="w-full rounded-lg border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Icon name="lucide:search" class="h-4 w-4" />
            </div>
          </div>

          <transition name="fade">
            <div 
              v-if="showDropdown" 
              class="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-800 dark:ring-white/10"
              @mousedown.prevent
            >
              <div class="max-h-60 overflow-y-auto">
                <div v-if="isLoadingData && allCustomers.length === 0" class="flex items-center justify-center p-4 text-sm text-gray-500">
                  <Icon name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                  Memuat Data...
                </div>

                <div v-else-if="displayedCustomers.length === 0" class="p-4 text-center text-sm text-gray-500">
                  <p>Tidak ditemukan.</p>
                  <NuxtLink to="/customers" class="mt-1 inline-block text-primary hover:underline font-medium">
                    + Buat Baru di Menu Pelanggan
                  </NuxtLink>
                </div>

                <ul v-else class="divide-y divide-gray-100 dark:divide-gray-700">
                  <li
                    v-for="cust in displayedCustomers"
                    :key="cust.id"
                    @click="selectCustomer(cust)"
                    class="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20">
                      {{ getInitial(cust.name) }}
                    </div>
                    
                    <div class="flex-1 min-w-0">
                      <p class="truncate text-sm font-semibold text-gray-900 dark:text-white">{{ cust.name }}</p>
                      <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span class="flex items-center gap-1"><Icon name="lucide:phone" class="h-3 w-3" /> {{ cust.phone || '-' }}</span>
                        <span>•</span>
                        <span class="truncate">{{ cust.email || '-' }}</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </transition>
        </div>
        
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          *Cari pelanggan lama untuk mengisi data otomatis.
        </p>
      </div>

      <div v-else class="rounded-lg border border-primary/20 bg-primary/5 p-4 dark:border-primary/10 dark:bg-primary/10">
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-primary shadow-sm dark:bg-gray-800 dark:text-primary-400">
              {{ getInitial(modelValue.name) }}
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900 dark:text-white">{{ modelValue.name }}</h4>
              <div class="mt-1 space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
                <div class="flex items-center gap-1.5">
                  <Icon name="lucide:phone" class="h-3 w-3 opacity-70" />
                  {{ modelValue.phone || 'Tanpa No. HP' }}
                </div>
                <div class="flex items-center gap-1.5">
                  <Icon name="lucide:mail" class="h-3 w-3 opacity-70" />
                  {{ modelValue.email || 'Tanpa Email' }}
                </div>
              </div>
            </div>
          </div>
          
          <button 
            @click="emit('update:modelValue', null)" 
            class="rounded-md p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            title="Ganti Pelanggan"
          >
            <Icon name="lucide:x" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>