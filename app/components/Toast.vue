<script setup lang="ts">
import { useToast } from "~/composables/useToast";
import type { ToastMessage } from "~/composables/useToast";

const { toasts, dismissToast } = useToast();

function getIconName(type: ToastMessage["type"]): string {
  switch (type) {
    case "success":
      return "lucide:check-circle-2";
    case "error":
      return "lucide:alert-octagon";
    case "warning":
      return "lucide:alert-triangle";
    case "info":
      return "lucide:info";
    default:
      return "lucide:bell";
  }
}

function getIconClass(type: ToastMessage["type"]): string {
  switch (type) {
    case "success":
      return "text-green-500";
    case "error":
      return "text-red-500 dark:text-red-400";
    case "warning":
      return "text-yellow-500";
    case "info":
      return "text-primary dark:text-accent";
    default:
      return "text-muted";
  }
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 w-full max-w-sm space-y-3">
    <transition-group name="list" tag="div" class="relative">
      <div v-for="toast in toasts" :key="toast.id" class="flex w-full items-start space-x-3 rounded-lg border bg-white p-4 shadow-lg transition-all dark:border-gray-700 dark:bg-gray-800">
        <div class="flex-shrink-0">
          <Icon :name="getIconName(toast.type)" class="h-6 w-6" :class="getIconClass(toast.type)" />
        </div>

        <div class="flex-1 pt-0.5">
          <p class="text-sm font-semibold text-dark dark:text-base">{{ toast.title }}</p>
          <p class="mt-1 text-sm text-dark dark:text-gray-300">{{ toast.message }}</p>
        </div>

        <div class="flex-shrink-0">
          <button @click="dismissToast(toast.id)" class="rounded-md p-1 text-muted transition-colors hover:bg-secondary/30 hover:text-dark dark:text-muted/70 dark:hover:bg-dark dark:hover:text-base">
            <span class="sr-only">Tutup</span>
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active,
.list-move {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.list-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
