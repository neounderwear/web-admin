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

watch(
  () => images.value,
  (newImages) => {
    if (newImages.length === internalList.value.length) {
      const isSame = newImages.every((img, i) => img === internalList.value[i]?.source);
      if (isSame) return;
    }

    internalList.value.forEach((item) => {
      if (item.type === "new") URL.revokeObjectURL(item.url);
    });

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
  <ProductCard title="Media" description="Upload gambar dan video produk.">
    <div class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-dark/80 dark:text-base/80"> Gambar Produk </label>
        <label
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          :class="isDragging ? 'border-primary ring-2 ring-primary/50' : 'border-muted/50'"
          class="mt-1 flex justify-center rounded-md border-2 border-dashed bg-secondary/20 px-6 pt-5 pb-6 transition-all cursor-pointer hover:bg-secondary/30 dark:bg-dark/50"
        >
          <div class="space-y-1 text-center">
            <Icon name="lucide:upload-cloud" class="mx-auto h-12 w-12 text-muted/70" />
            <div class="flex text-sm text-gray-600 dark:text-gray-400">
              <span class="font-semibold text-primary">Upload file</span>
              <input @change="handleFileChange" id="file-upload" name="file-upload" type="file" class="sr-only" multiple accept="image/*" />
              <p class="pl-1">atau drag and drop</p>
            </div>
            <p class="text-xs text-gray-500">PNG, JPG, GIF (Max 2MB)</p>
          </div>
        </label>
      </div>

      <div v-if="internalList.length > 0">
        <label class="block text-sm font-medium text-dark/80 dark:text-base/80"> Preview Gambar </label>
        <p class="mt-1 text-xs text-muted dark:text-gray-400">Gambar pertama akan menjadi Thumbnail. Drag untuk ubah urutan.</p>

        <draggable v-model="internalList" item-key="url" class="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-5" ghost-class="opacity-50" animation="150">
          <template #item="{ element: item, index }">
            <div class="relative rounded-md border border-muted/30 overflow-hidden shadow-sm aspect-square bg-white group">
              <img :src="item.url" :alt="'Preview ' + index" class="h-full w-full object-contain" />

              <button
                @click="removeImage(index)"
                type="button"
                class="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-600 p-1 text-white shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <span class="sr-only">Hapus</span>
                <Icon name="lucide:x" class="h-4 w-4" />
              </button>

              <div v-if="index === 0" class="absolute bottom-0 w-full bg-black/70 px-2 py-0.5 text-center text-xs font-medium text-white">Thumbnail</div>
            </div>
          </template>
        </draggable>
      </div>

      <div>
        <label for="product-video" class="block text-sm font-medium text-dark/80 dark:text-base/80"> Video URL (Opsional) </label>
        <input
          v-model="videoUrl"
          id="product-video"
          type="text"
          placeholder="https://www.youtube.com/watch?v=..."
          class="mt-1 block w-full rounded-md border-muted/50 bg-secondary/20 px-4 py-2.5 text-sm text-dark placeholder:text-muted/50 dark:border-gray-600 dark:bg-gray-700 dark:text-sm dark:text-base dark:placeholder:text-muted/70 focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  </ProductCard>
</template>
