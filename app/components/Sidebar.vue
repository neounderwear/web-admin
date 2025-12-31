<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { MenuItem } from "~/types/menuItems";
import { useAuth } from "~/composables/useAuth";
import LogoutModal from "~/components/LogoutModal.vue";

const props = defineProps({
  sidebarOpen: Boolean,
});

defineEmits(["toggle"]);

const route = useRoute();
const { user, logout } = useAuth();

// Logout State
const isLogoutModalOpen = ref(false);
const isLoadingLogout = ref(false);

const menuItems = ref<MenuItem[]>([
  { label: "Beranda", path: "/dashboard", icon: "lucide:layout-dashboard" },
  { label: "Banner", path: "/banners", icon: "lucide:image" },
  {
    label: "Produk",
    icon: "lucide:package",
    path: "/products",
    expanded: false,
    children: [
      { label: "Kategori", path: "/products/categories", icon: "lucide:layers" },
      { label: "Brand", path: "/products/brands", icon: "lucide:tag" },
      { label: "Produk Baru", path: "/products/new", icon: "lucide:plus-circle" },
      { label: "Kelola Produk", path: "/products/manage", icon: "lucide:box" },
    ],
  },
  { label: "Pelanggan", path: "/customers", icon: "lucide:users" },
  { label: "Pesanan", path: "/orders", icon: "lucide:shopping-cart" },
]);

// Auto-expand menu
watch(
  () => route.path,
  (newPath) => {
    menuItems.value.forEach((item) => {
      if (item.children && item.path && newPath.startsWith(item.path)) {
        item.expanded = true;
      }
    });
  },
  { immediate: true }
);

// Handler Logout
function confirmLogout() {
  isLogoutModalOpen.value = true;
}

async function handleLogoutProcess() {
  isLoadingLogout.value = true;
  try {
    await logout();
  } catch (error) {
    console.error("Logout failed", error);
  } finally {
    isLoadingLogout.value = false;
    isLogoutModalOpen.value = false;
  }
}
</script>

<template>
  <aside 
    class="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900"
    :class="sidebarOpen ? 'w-64' : 'w-[72px]'"
  >
    <div class="flex h-16 items-center justify-between border-b border-gray-100 px-4 dark:border-gray-800">
      <div v-if="sidebarOpen" class="flex items-center gap-3 overflow-hidden">
        <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20 p-1.5">
          <img 
            src="~/assets/images/logo.png" 
            alt="Logo Aplikasi" 
            class="h-full w-full object-contain" 
          />
        </div>
        
        <span class="truncate text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          Admin
        </span>
      </div>

      <button 
        @click="$emit('toggle')" 
        class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        :class="{ 'mx-auto': !sidebarOpen }"
      >
        <Icon v-if="sidebarOpen" name="lucide:chevrons-left" class="h-5 w-5" />
        <Icon v-else name="lucide:menu" class="h-5 w-5" />
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
      <template v-for="item in menuItems" :key="item.label">
        
        <div v-if="item.children">
          <button
            @click="sidebarOpen ? (item.expanded = !item.expanded) : $emit('toggle')"
            class="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
            :class="[
              !sidebarOpen ? 'justify-center' : '',
              item.expanded 
                ? 'bg-gray-50 text-primary dark:bg-gray-800 dark:text-white' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
            ]"
          >
            <div class="flex items-center gap-3">
              <Icon 
                :name="item.icon" 
                class="h-5 w-5 transition-colors" 
                :class="item.expanded ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'" 
              />
              <span v-if="sidebarOpen">{{ item.label }}</span>
            </div>
            
            <Icon 
              v-if="sidebarOpen" 
              name="lucide:chevron-down" 
              class="h-4 w-4 transition-transform duration-300" 
              :class="[
                item.expanded ? 'rotate-180 text-primary' : 'text-gray-400'
              ]" 
            />
          </button>

          <div 
            class="overflow-hidden transition-all duration-300 ease-in-out"
            :style="{ maxHeight: item.expanded && sidebarOpen ? '500px' : '0px', opacity: item.expanded && sidebarOpen ? 1 : 0 }"
          >
            <div class="mt-1 space-y-1 pl-3">
              <div class="border-l-2 border-gray-100 py-1 pl-2 dark:border-gray-800">
                <NuxtLink
                  v-for="sub in item.children"
                  :key="sub.path"
                  :to="sub.path"
                  class="group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  active-class="bg-primary/10 text-primary font-semibold"
                >
                  <span 
                    class="h-1.5 w-1.5 rounded-full transition-colors"
                    :class="route.path === sub.path ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400'"
                  ></span>
                  <span class="truncate">{{ sub.label }}</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <NuxtLink
          v-else
          :to="item.path"
          class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          :class="{ 'justify-center': !sidebarOpen }"
          active-class="bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
        >
          <Icon 
            :name="item.icon" 
            class="h-5 w-5 transition-colors" 
            :class="route.path === item.path ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500'" 
          />
          <span v-if="sidebarOpen">{{ item.label }}</span>
        </NuxtLink>

      </template>
    </nav>

    <div class="border-t border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
      
      <div v-if="sidebarOpen" class="flex items-center justify-between">
        <NuxtLink to="/profile" class="group flex items-center gap-3 overflow-hidden rounded-lg p-1 hover:bg-white hover:shadow-sm dark:hover:bg-gray-800 transition-all">
          <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-sm font-bold text-white shadow-md group-hover:ring-2 group-hover:ring-primary/20">
            {{ user?.email?.charAt(0).toUpperCase() || "A" }}
          </div>
          <div class="min-w-0 text-left">
            <p class="truncate text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
              {{ user?.displayName || "Admin" }}
            </p>
            <p class="truncate text-xs text-gray-500 dark:text-gray-400">
              Edit Profil
            </p>
          </div>
        </NuxtLink>

        <button 
          @click="confirmLogout" 
          class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          title="Keluar"
        >
          <Icon name="lucide:log-out" class="h-4 w-4" />
        </button>
      </div>

      <div v-else class="flex flex-col items-center gap-3">
        <NuxtLink 
          to="/profile" 
          class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary ring-1 ring-primary/20 hover:bg-primary hover:text-white transition-all"
          title="Profil Saya"
        >
          {{ user?.email?.charAt(0).toUpperCase() || "A" }}
        </NuxtLink>
        <button 
          @click="confirmLogout" 
          class="text-gray-400 hover:text-red-500 transition-colors" 
          title="Keluar"
        >
          <Icon name="lucide:log-out" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <ClientOnly>
      <LogoutModal 
        v-model="isLogoutModalOpen" 
        :loading="isLoadingLogout" 
        @confirm="handleLogoutProcess" 
      />
    </ClientOnly>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>