<script setup lang="ts">
import type { Customer } from "~/types/customer";
import { Vue3Lottie } from "vue3-lottie";
import notfoundAnim from "~/assets/animation/notfound.json";

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
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th scope="col" class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pelanggan
            </th>
            <th scope="col" class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Kontak
            </th>
            <th scope="col" class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Sumber
            </th>
            <th scope="col" class="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Tgl Daftar
            </th>
            <th scope="col" class="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          
          <template v-if="loading">
            <tr v-for="n in 5" :key="n" class="animate-pulse">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div class="ml-3 h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="space-y-2">
                  <div class="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div class="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="mx-auto h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="mx-auto h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-3">
                  <div class="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div class="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </td>
            </tr>
          </template>

          <tr v-else-if="customers.length === 0">
            <td colspan="5" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center justify-center">
                <ClientOnly>
                  <Vue3Lottie :animationData="notfoundAnim" :height="160" :width="160" />
                </ClientOnly>
                <p class="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Belum ada data pelanggan.</p>
              </div>
            </td>
          </tr>

          <template v-else>
            <tr 
              v-for="customer in customers" 
              :key="customer.id" 
              class="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-700/50"
            >
              <td class="px-6 py-4 whitespace-nowrap align-middle">
                <div class="flex items-center">
                  <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-bold text-primary dark:bg-primary/20 dark:text-primary-400">
                    {{ getInitial(customer.name) }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ customer.name }}</div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap align-middle">
                <div class="flex flex-col">
                  <div class="flex items-center text-sm text-gray-900 dark:text-gray-300">
                    <Icon name="lucide:mail" class="mr-2 h-3.5 w-3.5 text-gray-400" />
                    {{ customer.email }}
                  </div>
                  <div class="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Icon name="lucide:phone" class="mr-2 h-3.5 w-3.5 text-gray-400" />
                    {{ customer.phone || "-" }}
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 text-center align-middle whitespace-nowrap">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                  :class="customer.source === 'web' 
                    ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30' 
                    : 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-900/30 dark:text-orange-400 dark:ring-orange-400/30'"
                >
                  <span class="mr-1.5 h-1.5 w-1.5 rounded-full" :class="customer.source === 'web' ? 'bg-blue-500' : 'bg-orange-500'"></span>
                  {{ customer.source === "web" ? "Website" : "Manual" }}
                </span>
              </td>

              <td class="px-6 py-4 text-center align-middle whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ new Date(customer.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) }}
              </td>

              <td class="px-6 py-4 text-right align-middle whitespace-nowrap">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="emit('edit', customer)" 
                    class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                    title="Edit Pelanggan"
                  >
                    <Icon name="lucide:edit-2" class="h-4 w-4" />
                  </button>
                  <button 
                    @click="emit('delete', customer)" 
                    class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    title="Hapus Pelanggan"
                  >
                    <Icon name="lucide:trash-2" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>