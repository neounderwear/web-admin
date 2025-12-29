<script setup lang="ts">
import { ref } from "vue";
import type { MenuItem } from "~/types/menuItems";
import { useAuth } from "~/composables/useAuth";

defineProps({
  sidebarOpen: Boolean,
});

defineEmits(["toggle"]);

const { user, logout } = useAuth();

const menuItems = ref<MenuItem[]>([
  { label: "Beranda", path: "/dashboard", icon: "lucide:layout-dashboard" },
  { label: "Banner", path: "/banners", icon: "lucide:image" },
  {
    label: "Produk",
    icon: "lucide:package",
    expanded: true,
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
</script>

<template>
  <aside :class="['fixed inset-y-0 left-0 z-30 flex flex-col border-r border-muted/20 transition-all duration-300', 'bg-white text-dark dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800', sidebarOpen ? 'w-64' : 'w-[70px]']">
    <div class="flex h-16 items-center justify-between px-5 border-b border-muted/10 dark:border-gray-800">
      <div v-if="sidebarOpen" class="flex items-center gap-2 overflow-hidden">
        <div class="h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-white">
          <Icon name="lucide:box" class="h-5 w-5" />
        </div>
        <span class="text-lg font-bold tracking-tight text-dark dark:text-white">Admin</span>
      </div>

      <button @click="$emit('toggle')" class="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-100 hover:text-dark dark:hover:bg-gray-800 dark:text-gray-400" :class="{ 'mx-auto': !sidebarOpen }">
        <Icon v-if="sidebarOpen" name="lucide:panel-left-close" class="h-5 w-5" />
        <Icon v-else name="lucide:panel-left-open" class="h-5 w-5" />
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
      <template v-for="item in menuItems" :key="item.label">
        <div v-if="item.children">
          <button
            class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group"
            :class="[!sidebarOpen ? 'justify-center' : '', item.expanded ? 'text-dark dark:text-white' : 'text-muted hover:bg-gray-50 hover:text-dark dark:hover:bg-gray-800']"
            @click="sidebarOpen ? (item.expanded = !item.expanded) : $emit('toggle')"
          >
            <div class="flex items-center gap-3">
              <Icon :name="item.icon" class="h-5 w-5 transition-colors" :class="item.expanded ? 'text-primary' : 'text-muted group-hover:text-dark dark:group-hover:text-gray-200'" />
              <span v-if="sidebarOpen">{{ item.label }}</span>
            </div>

            <Icon v-if="sidebarOpen" name="lucide:chevron-down" class="h-4 w-4 text-muted transition-transform duration-200" :class="{ '-rotate-90': !item.expanded }" />
          </button>

          <transition
            enter-active-class="transition-all duration-300 ease-in-out"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-96 opacity-100"
            leave-active-class="transition-all duration-200 ease-in-out"
            leave-from-class="max-h-96 opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div v-if="item.expanded && sidebarOpen" class="ml-[1.35rem] mt-1 border-l border-muted/20 pl-3 space-y-1 overflow-hidden">
              <NuxtLink
                v-for="sub in item.children"
                :key="sub.path"
                :to="sub.path"
                class="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200 relative"
                active-class="text-primary font-semibold bg-primary/5"
                class-active="text-muted hover:text-dark hover:bg-gray-50"
              >
                <span v-if="$route.path === sub.path" class="absolute -left-[13px] top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary"></span>

                <span class="truncate">{{ sub.label }}</span>
              </NuxtLink>
            </div>
          </transition>
        </div>

        <NuxtLink
          v-else
          :to="item.path"
          class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
          :class="{ 'justify-center': !sidebarOpen }"
          active-class="bg-primary/10 text-primary"
          class-active="text-muted hover:bg-gray-50 hover:text-dark dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <Icon :name="item.icon" class="h-5 w-5 transition-colors" :class="$route.path === item.path ? 'text-primary' : 'text-muted group-hover:text-dark dark:group-hover:text-gray-200'" />
          <span v-if="sidebarOpen">{{ item.label }}</span>
        </NuxtLink>
      </template>
    </nav>

    <div class="border-t border-muted/10 p-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
      <div v-if="sidebarOpen" class="flex items-center justify-between">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-sm">
            {{ user?.email?.charAt(0).toUpperCase() || "A" }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-dark dark:text-white">
              {{ user?.displayName || "Admin" }}
            </p>
            <NuxtLink to="/profile" class="block truncate text-xs text-muted hover:text-primary transition-colors"> Edit Profil </NuxtLink>
          </div>
        </div>
        <button @click="logout" class="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-red-50 hover:text-red-500 transition-all dark:hover:bg-red-900/20" title="Keluar">
          <Icon name="lucide:log-out" class="h-4 w-4" />
        </button>
      </div>

      <div v-else class="flex flex-col items-center gap-4">
        <NuxtLink to="/profile" class="h-9 w-9 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs hover:ring-2 hover:ring-primary/30 transition-all">
          {{ user?.email?.charAt(0).toUpperCase() || "A" }}
        </NuxtLink>
        <button @click="logout" class="text-muted hover:text-red-500" title="Keluar">
          <Icon name="lucide:log-out" class="h-5 w-5" />
        </button>
      </div>
    </div>
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
</style>
