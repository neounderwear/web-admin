<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { Brand } from "~/types/brand";

interface EmittedData {
  name: string;
  description: string;
  isActive: boolean;
  file: File | null;
}

const props = defineProps<{
  modelValue: boolean;
  brandToEdit: Brand | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", data: EmittedData): void;
}>();

const isEditing = computed(() => !!props.brandToEdit);
const initialFormData = { name: "", description: "", isActive: true };
const formData = ref({ ...initialFormData });
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (props.brandToEdit) {
        formData.value = {
          name: props.brandToEdit.name,
          description: props.brandToEdit.description,
          isActive: props.brandToEdit.isActive,
        };
      } else {
        formData.value = { ...initialFormData };
      }
      selectedFile.value = null;

      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = null;
      }
    } else {
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = null;
      }
    }
  }
);

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    selectedFile.value = file;
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = URL.createObjectURL(file);
  }
}

function close() {
  emit("update:modelValue", false);
}

function handleSubmit() {
  emit("save", {
    name: formData.value.name,
    description: formData.value.description,
    isActive: formData.value.isActive,
    file: selectedFile.value,
  });
}
</script>

<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-40 flex items-center justify-center bg-dark/50 p-4 transition-opacity duration-300 ease-in-out-smooth dark:bg-black/70" @click.self="close">
      <transition name="pop">
        <div v-if="modelValue" role="dialog" aria-modal="true" aria-labelledby="modal-title" class="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <button type="button" @click="close" class="absolute top-4 right-4 rounded-full p-1 text-muted transition-colors hover:bg-secondary/30 hover:text-dark dark:text-muted/70 dark:hover:bg-dark dark:hover:text-base">
            <span class="sr-only">Tutup modal</span>
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>

          <h2 id="modal-title" class="text-xl font-bold mb-4 text-dark dark:text-base">
            {{ isEditing ? "Edit Brand" : "Tambah Brand Baru" }}
          </h2>

          <form @submit.prevent="handleSubmit">
            <div class="mb-4">
              <label for="name" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Nama Brand </label>
              <input
                v-model="formData.name"
                id="name"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-muted/50 bg-secondary/20 px-4 py-2.5 text-sm text-dark transition-all duration-150 ease-in-out-smooth placeholder:text-muted/50 dark:border-gray-600 dark:bg-gray-700 dark:text-sm dark:text-base dark:placeholder:text-muted/70 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div class="mb-4">
              <label for="description" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Deskripsi </label>
              <input
                v-model="formData.description"
                id="description"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-muted/50 bg-secondary/20 px-4 py-2.5 text-sm text-dark transition-all duration-150 ease-in-out-smooth placeholder:text-muted/50 dark:border-gray-600 dark:bg-gray-700 dark:text-sm dark:text-base dark:placeholder:text-muted/70 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-dark/80 dark:text-base/80"> Status </label>
              <button
                type="button"
                @click="formData.isActive = !formData.isActive"
                :class="formData.isActive ? 'bg-primary' : 'bg-muted/50 dark:bg-muted/30'"
                class="relative mt-1 inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out-smooth focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <span class="sr-only">Ubah status</span>
                <span :class="formData.isActive ? 'translate-x-5' : 'translate-x-0'" class="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out-smooth"></span>
              </button>
              <span class="ml-3 text-sm text-dark/80 dark:text-base/80">
                {{ formData.isActive ? "Aktif" : "Nonaktif" }}
              </span>
            </div>

            <div class="mb-4">
              <label for="file-upload" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Logo Brand </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                @change="handleFileChange"
                :required="!isEditing"
                class="mt-1 block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-primary transition-colors hover:file:bg-primary/20 dark:file:bg-primary/20 dark:file:text-accent dark:hover:file:bg-primary/30"
              />
            </div>

            <div v-if="previewUrl || (isEditing && brandToEdit?.logoUrl)" class="mb-4">
              <p class="text-sm font-medium text-dark/80 dark:text-base/80">Preview:</p>
              <img :src="previewUrl || brandToEdit?.logoUrl" alt="Logo preview" class="mt-2 h-32 w-auto rounded border border-muted/20 object-cover" />
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="close"
                class="rounded-md border border-muted/50 bg-white px-4 py-2 text-sm font-medium text-dark/80 shadow-sm transition-all duration-150 ease-in-out-smooth hover:bg-secondary/20 dark:border-muted/30 dark:bg-gray-800 dark:text-base/80 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-in-out-smooth hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted/50 dark:focus:ring-offset-gray-800"
              >
                <span v-if="!loading"> Simpan </span>
                <span v-else class="flex items-center">
                  <Icon name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </span>
              </button>
            </div>
          </form>
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
