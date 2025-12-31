<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { Banner } from "~/types/banner";

interface EmittedData {
  name: string;
  isActive: boolean;
  file: File | null;
}

const props = defineProps<{
  modelValue: boolean;
  bannerToEdit: Banner | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", data: EmittedData): void;
}>();

const isEditing = computed(() => !!props.bannerToEdit);
const initialFormData = { name: "", isActive: true };
const formData = ref({ ...initialFormData });
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const isDragging = ref(false);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (props.bannerToEdit) {
        formData.value = {
          name: props.bannerToEdit.name,
          isActive: props.bannerToEdit.isActive,
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
      // Cleanup when closed
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
    processFile(input.files[0]);
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false;
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    processFile(e.dataTransfer.files[0]);
  }
}

function processFile(file: File) {
  if (!file.type.startsWith('image/')) return;
  
  selectedFile.value = file;
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  previewUrl.value = URL.createObjectURL(file);
}

function close() {
  emit("update:modelValue", false);
}

function handleSubmit() {
  emit("save", {
    name: formData.value.name,
    isActive: formData.value.isActive,
    file: selectedFile.value,
  });
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
                {{ isEditing ? "Edit Banner" : "Tambah Banner Baru" }}
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
                <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nama Banner
                </label>
                <input
                  v-model="formData.name"
                  id="name"
                  type="text"
                  required
                  placeholder="Contoh: Promo Lebaran"
                  class="mt-1 block w-full rounded-lg border-gray-600 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                />
              </div>

              <div>
                <div class="flex items-center justify-between">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status Aktif</label>
                  <button
                    type="button"
                    @click="formData.isActive = !formData.isActive"
                    :class="formData.isActive ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'"
                    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    role="switch"
                    :aria-checked="formData.isActive"
                  >
                    <span 
                      aria-hidden="true" 
                      :class="formData.isActive ? 'translate-x-5' : 'translate-x-0'" 
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    ></span>
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Foto Banner
                </label>
                
                <div 
                  class="relative mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 transition-colors dark:border-gray-600"
                  :class="{ 'border-primary bg-primary/5 dark:bg-primary/10': isDragging }"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                >
                  <div class="text-center">
                    <div v-if="previewUrl || (isEditing && bannerToEdit?.photoUrl)" class="mx-auto mb-4">
                      <img 
                        :src="previewUrl || bannerToEdit?.photoUrl" 
                        class="mx-auto h-32 w-auto rounded-lg object-cover shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10" 
                        alt="Preview" 
                      />
                    </div>
                    <Icon v-else name="lucide:image-plus" class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-500" />
                    
                    <div class="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400 justify-center">
                      <label 
                        for="file-upload" 
                        class="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:underline"
                      >
                        <span>Upload file</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          class="sr-only" 
                          accept="image/*"
                          @change="handleFileChange"
                          :required="!isEditing"
                        />
                      </label>
                      <p class="pl-1">atau drag and drop</p>
                    </div>
                    <p class="text-xs leading-5 text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
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
                {{ loading ? 'Menyimpan...' : 'Simpan Banner' }}
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