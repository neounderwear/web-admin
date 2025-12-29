<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  bannerName: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
}>();

function close() {
  emit("update:modelValue", false);
}
</script>

<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-dark/50 p-4 transition-opacity duration-300 ease-in-out-smooth dark:bg-black/70" @click.self="close">
      <transition name="pop">
        <div v-if="modelValue" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc" class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <button type="button" @click="close" class="absolute top-4 right-4 rounded-full p-1 text-muted transition-colors hover:bg-secondary/30 hover:text-dark dark:text-muted/70 dark:hover:bg-dark dark:hover:text-base">
            <span class="sr-only">Tutup</span>
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>

          <div class="flex justify-center">
            <div class="rounded-full bg-red-100 p-3 dark:bg-red-900/50">
              <Icon name="lucide:alert-triangle" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div class="mt-4 text-center">
            <h2 id="modal-title" class="text-xl font-bold text-dark dark:text-base">Konfirmasi Hapus</h2>
            <p id="modal-desc" class="mt-2 text-sm text-muted dark:text-gray-300">
              Yakin mau hapus banner
              <strong class="font-medium text-dark dark:text-base/90">"{{ bannerName }}"</strong>?
              <br />
              Banner bakal dihapus permanen
            </p>
          </div>

          <div class="mt-6 flex justify-center space-x-3">
            <button
              type="button"
              @click="close"
              class="rounded-md border border-muted/50 bg-white px-4 py-2 text-sm font-medium text-dark/80 shadow-sm transition-all duration-150 ease-in-out-smooth hover:bg-secondary/20 dark:border-muted/30 dark:bg-gray-800 dark:text-base/80 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Batal
            </button>

            <button
              type="button"
              @click="emit('confirm')"
              :disabled="loading"
              class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-in-out-smooth hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted/50 dark:bg-red-500 dark:hover:bg-red-400 dark:focus:ring-offset-gray-800"
            >
              <span v-if="!loading"> Ya, Hapus </span>
              <span v-else class="flex items-center">
                <Icon name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </span>
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.pop-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
