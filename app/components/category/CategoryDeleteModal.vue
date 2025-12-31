<script setup lang="ts">
import { watch, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  categoryName: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
}>();

function close() {
  if (!props.loading) {
    emit("update:modelValue", false);
  }
}

// Prevent body scroll when modal is open
watch(() => props.modelValue, (isOpen) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
});

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});
</script>

<template>
  <transition name="fade" appear>
    <div 
      v-if="modelValue" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div 
        class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        @click="close"
      ></div>

      <transition name="zoom" appear>
        <div 
          v-if="modelValue" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-title" 
          aria-describedby="modal-desc" 
          class="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10"
        >
          <div class="absolute right-4 top-4">
            <button 
              type="button" 
              @click="close" 
              :disabled="loading"
              class="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <span class="sr-only">Tutup</span>
              <Icon name="lucide:x" class="h-5 w-5" />
            </button>
          </div>

          <div class="text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Icon name="lucide:alert-triangle" class="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>

            <div class="mt-4">
              <h3 id="modal-title" class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                Hapus Kategori?
              </h3>
              <div id="modal-desc" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <p>Apakah Anda yakin ingin menghapus kategori <span class="font-semibold text-gray-900 dark:text-gray-200">"{{ categoryName }}"</span>?</p>
                <p class="mt-1 text-xs text-red-500/80">Data yang dihapus tidak dapat dikembalikan.</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="button"
              @click="emit('confirm')"
              :disabled="loading"
              class="inline-flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-red-600 dark:hover:bg-red-500 dark:focus:ring-offset-gray-800 sm:w-auto sm:flex-1"
            >
              <span v-if="!loading">Hapus Permanen</span>
              <span v-else class="flex items-center gap-2">
                <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                <span>Menghapus...</span>
              </span>
            </button>
            
            <button
              type="button"
              @click="close"
              :disabled="loading"
              class="inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600 sm:w-auto sm:flex-1"
            >
              Batal
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<style scoped>
/* Backdrop Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal Zoom/Pop */
.zoom-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.zoom-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>