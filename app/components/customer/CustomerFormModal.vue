<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { Customer } from "~/types/customer";

const props = defineProps<{
  modelValue: boolean;
  customerToEdit: Customer | null;
  loading: boolean;
}>();

const emit = defineEmits(["update:modelValue", "save"]);

const isEditing = computed(() => !!props.customerToEdit);
const formData = ref({ name: "", email: "", phone: "" });

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (props.customerToEdit) {
        formData.value = {
          name: props.customerToEdit.name,
          email: props.customerToEdit.email,
          phone: props.customerToEdit.phone,
        };
      } else {
        formData.value = { name: "", email: "", phone: "" };
      }
    }
  }
);

function close() {
  emit("update:modelValue", false);
}

function handleSubmit() {
  emit("save", { ...formData.value });
}
</script>

<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-dark/50 p-4 backdrop-blur-sm" @click.self="close">
      <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-dark dark:text-white">
            {{ isEditing ? "Edit Pelanggan" : "Tambah Pelanggan Manual" }}
          </h2>
          <button @click="close" class="text-muted hover:text-dark"><Icon name="lucide:x" class="h-5 w-5" /></button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-dark/80 dark:text-gray-300 mb-1">Nama Lengkap</label>
            <input v-model="formData.name" type="text" required class="form-input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-dark/80 dark:text-gray-300 mb-1">Email</label>
            <input v-model="formData.email" type="email" required class="form-input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-dark/80 dark:text-gray-300 mb-1">No. Telepon / WA</label>
            <input v-model="formData.phone" type="tel" required class="form-input w-full" placeholder="08..." />
          </div>

          <div class="flex justify-end space-x-2 pt-2">
            <button type="button" @click="close" class="btn-secondary">Batal</button>
            <button type="submit" :disabled="loading" class="btn-primary">
              <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
              {{ loading ? "Menyimpan..." : "Simpan" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.form-input {
  @apply rounded-md border-muted/40 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white;
}
.btn-primary {
  @apply inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50;
}
.btn-secondary {
  @apply rounded-md border border-muted/30 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300;
}
/* Fade Transisi */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
