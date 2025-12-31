<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from "vue";
import type { Customer } from "~/types/customer";

const props = defineProps<{
  modelValue: boolean;
  customerToEdit: Customer | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", data: { name: string; email: string; phone: string }): void;
}>();

const isEditing = computed(() => !!props.customerToEdit);
const formData = ref({ name: "", email: "", phone: "" });

// Watcher to populate form or reset it
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (props.customerToEdit) {
        // FIX: Tambahkan fallback || "" untuk mencegah error undefined
        formData.value = {
          name: props.customerToEdit.name || "",
          email: props.customerToEdit.email || "",
          phone: props.customerToEdit.phone || "",
        };
      } else {
        formData.value = { name: "", email: "", phone: "" };
      }
      // Lock body scroll
      if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
    } else {
      // Unlock body scroll
      if (typeof document !== 'undefined') document.body.style.overflow = '';
    }
  }
);

onUnmounted(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = '';
});

function close() {
  emit("update:modelValue", false);
}

function handleSubmit() {
  emit("save", { ...formData.value });
}
</script>

<template>
  <transition name="fade">
    <div 
      v-if="modelValue" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div 
        class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        @click="close"
      ></div>

      <transition name="zoom">
        <div 
          v-if="modelValue" 
          role="dialog" 
          aria-modal="true" 
          class="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10"
        >
          <div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ isEditing ? "Edit Pelanggan" : "Tambah Pelanggan Manual" }}
              </h2>
              <button 
                type="button" 
                @click="close" 
                class="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <Icon name="lucide:x" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="p-6">
            <div class="space-y-5">
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Lengkap</label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon name="lucide:user" class="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    v-model="formData.name" 
                    type="text" 
                    required 
                    placeholder="Nama Pelanggan"
                    class="block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500" 
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon name="lucide:mail" class="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    v-model="formData.email" 
                    type="email" 
                    required 
                    placeholder="nama@email.com"
                    class="block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500" 
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">No. Telepon / WA</label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon name="lucide:phone" class="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    v-model="formData.phone" 
                    type="tel" 
                    required 
                    placeholder="08..."
                    class="block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500" 
                  />
                </div>
              </div>

            </div>

            <div class="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-700">
              <button
                type="button"
                @click="close"
                class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
              >
                <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                {{ loading ? "Menyimpan..." : "Simpan" }}
              </button>
            </div>
          </form>
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