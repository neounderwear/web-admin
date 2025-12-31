<script setup lang="ts">
import { ref, watch, computed } from "vue";
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
const isDragging = ref(false);

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
    description: formData.value.description,
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
                {{ isEditing ? "Edit Brand" : "Tambah Brand Baru" }}
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
                <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Brand
                </label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon name="lucide:tag" class="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    v-model="formData.name"
                    id="name"
                    type="text"
                    required
                    placeholder="Contoh: Nike"
                    class="block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Deskripsi
                </label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-start pt-3 pl-3">
                    <Icon name="lucide:file-text" class="h-4 w-4 text-gray-400" />
                  </div>
                  <textarea
                    v-model="formData.description"
                    id="description"
                    rows="3"
                    required
                    placeholder="Deskripsi singkat brand..."
                    class="block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 resize-none"
                  ></textarea>
                </div>
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
                  Logo Brand
                </label>
                
                <div 
                  class="relative mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 transition-colors dark:border-gray-600"
                  :class="{ 'border-primary bg-primary/5 dark:bg-primary/10': isDragging }"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                >
                  <div class="text-center">
                    <div v-if="previewUrl || (isEditing && brandToEdit?.logoUrl)" class="mx-auto mb-4 relative group">
                      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg"></div>
                      <img 
                        :src="previewUrl || brandToEdit?.logoUrl" 
                        class="mx-auto h-32 w-auto object-contain rounded-lg shadow-sm" 
                        alt="Preview" 
                      />
                    </div>
                    <div v-else class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                      <Icon name="lucide:image-plus" class="h-6 w-6 text-gray-400" />
                    </div>
                    
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
                    <p class="text-xs leading-5 text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 2MB</p>
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
                {{ loading ? 'Menyimpan...' : 'Simpan Brand' }}
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