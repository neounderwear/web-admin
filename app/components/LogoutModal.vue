<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Menggunakan props & emits standar (Kompatibel semua versi Vue 3)
const props = defineProps<{
  modelValue: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
}>();

// State untuk memastikan DOM browser sudah siap sebelum Teleport
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

function close() {
  if (!props.loading) {
    emit("update:modelValue", false);
  }
}

function confirm() {
  emit("confirm");
}
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <transition name="fade" appear>
        <div 
          v-if="modelValue && isMounted" 
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 font-sans"
        >
          <div 
            class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            @click="close"
          ></div>

          <transition name="zoom" appear>
            <div 
              class="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10"
              role="dialog"
              aria-modal="true"
            >
              <div class="text-center">
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <Icon name="lucide:log-out" class="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>

                <div class="mt-4">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                    Keluar Aplikasi?
                  </h3>
                  <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Apakah Anda yakin ingin mengakhiri sesi ini?
                  </p>
                </div>
              </div>

              <div class="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
                <button
                  type="button"
                  @click="confirm"
                  :disabled="loading"
                  class="inline-flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed dark:bg-red-600 dark:hover:bg-red-500 sm:w-auto sm:flex-1"
                >
                  <span v-if="!loading">Ya, Keluar</span>
                  <span v-else class="flex items-center gap-2">
                    <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                    <span>Proses...</span>
                  </span>
                </button>
                
                <button
                  type="button"
                  @click="close"
                  :disabled="loading"
                  class="inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600 sm:w-auto sm:flex-1"
                >
                  Batal
                </button>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.zoom-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.zoom-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.zoom-enter-from, .zoom-leave-to { opacity: 0; transform: scale(0.95); }
</style>