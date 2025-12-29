<script setup lang="ts">
defineProps<{
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
</script>

<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-dark/50 p-4 transition-opacity duration-300 ease-in-out-smooth dark:bg-black/70" @click.self="close">
      <transition name="pop">
        <div v-if="modelValue" class="relative w-full max-w-xl">
          <button @click="close" class="absolute -top-10 right-0 rounded-full p-1 text-white/70 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white" aria-label="Tutup preview">
            <Icon name="lucide:x" class="h-6 w-6" />
          </button>

          <div class="overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
            <div class="bg-white aspect-square">
              <img :src="logoUrl" :alt="brandName || 'Brand Preview'" class="h-full w-full object-contain" />
            </div>

            <div class="border-t border-gray-200 p-4 dark:border-gray-700">
              <p v-if="brandName" class="text-center text-lg font-semibold text-dark dark:text-base">
                {{ brandName }}
              </p>
              <p v-if="brandDescription" class="mt-1 text-center text-sm text-muted dark:text-gray-400">
                {{ brandDescription }}
              </p>
            </div>
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
