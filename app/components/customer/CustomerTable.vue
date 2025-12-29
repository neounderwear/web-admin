<script setup lang="ts">
import type { Customer } from "~/types/customer";

defineProps<{
  customers: Customer[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "edit", customer: Customer): void;
  (e: "delete", customer: Customer): void;
}>();

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
    <table class="min-w-full">
      <thead class="bg-gray-50 dark:bg-gray-900">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase text-muted">Pelanggan</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase text-muted">Kontak</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase text-muted">Sumber</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase text-muted">Tgl Daftar</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase text-muted">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        <template v-if="loading">
          <tr v-for="n in 5" :key="n">
            <td class="px-6 py-4"><div class="h-4 w-32 rounded bg-gray-200 animate-pulse"></div></td>
            <td class="px-6 py-4"><div class="h-4 w-24 rounded bg-gray-200 animate-pulse"></div></td>
            <td class="px-6 py-4 text-center"><div class="mx-auto h-4 w-12 rounded bg-gray-200 animate-pulse"></div></td>
            <td class="px-6 py-4 text-center"><div class="mx-auto h-4 w-20 rounded bg-gray-200 animate-pulse"></div></td>
            <td class="px-6 py-4 text-center"><div class="mx-auto h-4 w-16 rounded bg-gray-200 animate-pulse"></div></td>
          </tr>
        </template>

        <tr v-else-if="customers.length === 0">
          <td colspan="5" class="px-6 py-8 text-center text-muted">Belum ada data pelanggan.</td>
        </tr>

        <template v-else>
          <tr v-for="customer in customers" :key="customer.id" class="group hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                  {{ getInitial(customer.name) }}
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium text-dark dark:text-white">{{ customer.name }}</div>
                </div>
              </div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-dark dark:text-gray-300">{{ customer.email }}</div>
              <div class="text-xs text-muted">{{ customer.phone || "-" }}</div>
            </td>

            <td class="px-6 py-4 text-center whitespace-nowrap">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                :class="customer.source === 'web' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300'"
              >
                {{ customer.source === "web" ? "Website" : "Manual" }}
              </span>
            </td>

            <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-muted">
              {{ new Date(customer.createdAt).toLocaleDateString("id-ID") }}
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
              <button @click="emit('edit', customer)" class="text-accent hover:text-primary transition-colors p-1">
                <Icon name="lucide:edit" class="h-4 w-4" />
              </button>
              <button @click="emit('delete', customer)" class="text-red-400 hover:text-red-600 transition-colors p-1">
                <Icon name="lucide:trash" class="h-4 w-4" />
              </button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
