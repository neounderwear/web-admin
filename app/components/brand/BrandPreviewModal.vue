<script setup lang="ts">
import { watch, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  logoUrl: string | undefined;
  brandName: string | null;
  brandDescription: string | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

function close() {
  emit("update:modelValue", false);
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
          class="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10"
        >
          <div class="absolute right-3 top-3 z-10">
            <button 
              @click="close" 
              class="rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-all hover:bg-black/70 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50" 
              aria-label="Tutup preview"
            >
              <Icon name="lucide:x" class="h-5 w-5" />
            </button>
          </div>

          <div class="relative flex h-64 items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div class="absolute inset-0 opacity-[0.04]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 16px 16px;"></div>
            
            <img 
              :src="logoUrl" 
              :alt="brandName || 'Brand Preview'" 
              class="relative h-40 w-40 object-contain drop-shadow-md transition-transform duration-500 hover:scale-110"
              loading="lazy"
            />
          </div>

          <div class="border-t border-gray-100 bg-white px-6 py-5 text-center dark:border-gray-700 dark:bg-gray-800">
            <h3 v-if="brandName" class="text-xl font-bold text-gray-900 dark:text-white">
              {{ brandName }}
            </h3>
            <p v-if="brandDescription" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {{ brandDescription }}
            </p>
            <p v-else class="mt-2 text-xs italic text-gray-400">
              Tidak ada deskripsi tersedia.
            </p>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<style scoped>
/* Backdrop Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal Zoom/Pop Transition */
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