<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import draggable from "vuedraggable";
import ProductCard from "~/components/product/form/ProductCard.vue";

interface ImageItem {
  url: string;
  source: File | string;
  type: "existing" | "new";
}

const images = defineModel<(File | string)[]>("images", { required: true });
const videoUrl = defineModel<string | null>("videoUrl");

const internalList = ref<ImageItem[]>([]);
const isDragging = ref(false);

// Sync model -> internal list
watch(
  () => images.value,
  (newImages) => {
    if (newImages.length === internalList.value.length) {
      const isSame = newImages.every((img, i) => img === internalList.value[i]?.source);
      if (isSame) return;
    }

    // Cleanup old URLs
    internalList.value.forEach((item) => {
      if (item.type === "new") URL.revokeObjectURL(item.url);
    });

    // Create new list
    internalList.value = newImages.map((img) => {
      if (typeof img === "string") {
        return { url: img, source: img, type: "existing" };
      } else {
        return { url: URL.createObjectURL(img), source: img, type: "new" };
      }
    });
  },
  { immediate: true, deep: true }
);

// Sync internal list -> model (for drag reordering)
watch(
  internalList,
  (newList) => {
    images.value = newList.map((item) => item.source);
  },
  { deep: true }
);

function addFilesToList(files: FileList) {
  const newItems: (File | string)[] = [...images.value];
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    newItems.push(file);
  }
  images.value = newItems;
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    addFilesToList(input.files);
    input.value = "";
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files) {
    addFilesToList(event.dataTransfer.files);
  }
}

function removeImage(index: number) {
  const newImages = [...images.value];
  newImages.splice(index, 1);
  images.value = newImages;
}

onUnmounted(() => {
  internalList.value.forEach((item) => {
    if (item.type === "new") {
      URL.revokeObjectURL(item.url);
    }
  });
});
</script>

<template>
  <ProductCard title="Media Produk" description="Upload gambar produk. Gambar pertama akan menjadi thumbnail utama.">
    <div class="space-y-6">
      
      <div>
        <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Upload Gambar
        </label>
        
        <label
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          :class="[
            'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors',
            isDragging 
              ? 'border-primary bg-primary/5 dark:bg-primary/10' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:bg-gray-800'
          ]"
        >
          <div class="space-y-2 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <Icon name="lucide:image-plus" class="h-6 w-6 text-gray-400" />
            </div>
            <div class="flex text-sm text-gray-600 dark:text-gray-400">
              <span class="relative font-semibold text-primary hover:underline">
                Pilih File
                <input 
                  id="file-upload" 
                  name="file-upload" 
                  type="file" 
                  class="sr-only" 
                  multiple 
                  accept="image/*" 
                  @change="handleFileChange"
                />
              </span>
              <p class="pl-1">atau drag and drop</p>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 5MB</p>
          </div>
        </label>
      </div>

      <div v-if="internalList.length > 0">
        <div class="mb-2 flex items-center justify-between">
          <label class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Preview ({{ internalList.length }})</label>
          <span class="text-xs text-primary font-medium flex items-center gap-1">
            <Icon name="lucide:move" class="h-3 w-3" /> Geser untuk urutkan
          </span>
        </div>

        <draggable 
          v-model="internalList" 
          item-key="url" 
          class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" 
          ghost-class="opacity-50"
          animation="200"
        >
          <template #item="{ element: item, index }">
            <div class="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm dark:border-gray-700 dark:bg-gray-800 cursor-move">
              
              <img 
                :src="item.url" 
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                alt="Product Preview" 
              />

              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>

              <button
                @click="removeImage(index)"
                type="button"
                class="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white shadow-md opacity-0 transition-all hover:bg-red-600 group-hover:opacity-100 focus:opacity-100"
                title="Hapus Gambar"
              >
                <Icon name="lucide:trash-2" class="h-3.5 w-3.5" />
              </button>

              <div v-if="index === 0" class="absolute bottom-2 left-2 right-2 flex justify-center">
                <span class="rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
                  Thumbnail Utama
                </span>
              </div>
              <div v-else class="absolute bottom-2 left-2 right-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="rounded-md bg-black/50 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
                  #{{ index + 1 }}
                </span>
              </div>

            </div>
          </template>
        </draggable>
      </div>

      <div>
        <label for="product-video" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Video URL (Opsional)
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Icon name="lucide:youtube" class="h-4 w-4" />
          </div>
          <input
            v-model="videoUrl"
            id="product-video"
            type="text"
            placeholder="https://youtu.be/..."
            class="block w-full rounded-lg border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:bg-white focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm"
          />
        </div>
      </div>

    </div>
  </ProductCard>
</template>