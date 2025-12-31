<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useToast } from "~/composables/useToast";
import { usePageTitle } from "~/composables/usePageTitles";

const pageTitle = usePageTitle();
const { user, updateUserProfile } = useAuth();
const { showSuccess, showError } = useToast();

onMounted(() => {
  pageTitle.value = "Profil Saya";
});

useHead({ title: "Profil Pengguna" });

const displayName = ref("");
const loading = ref(false);

// Init data
if (user.value) {
  displayName.value = user.value.displayName || "";
}

const handleUpdateProfile = async () => {
  loading.value = true;
  try {
    await updateUserProfile(displayName.value);
    showSuccess("Profil berhasil diperbarui");
  } catch (e) {
    showError("Gagal update profil");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto p-4 sm:p-6 max-w-4xl">
    
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Akun</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Kelola informasi profil dan tampilan akun Anda.</p>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      
      <div class="md:col-span-1">
        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div class="flex flex-col items-center text-center">
            
            <div class="relative mb-4">
              <div class="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-4xl font-bold text-white shadow-lg ring-4 ring-white dark:ring-gray-700">
                {{ user?.email?.charAt(0).toUpperCase() }}
              </div>
              <div class="absolute bottom-0 right-0 rounded-full bg-green-500 p-1.5 ring-2 ring-white dark:ring-gray-800" title="Online"></div>
            </div>

            <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ user?.displayName || "User" }}</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ user?.email }}</p>
            
            <div class="mt-4 flex flex-wrap justify-center gap-2">
              <span class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                Administrator
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="md:col-span-2">
        <div class="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div class="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
            <h3 class="font-semibold text-gray-900 dark:text-white">Informasi Dasar</h3>
          </div>
          
          <div class="p-6">
            <form @submit.prevent="handleUpdateProfile" class="space-y-6">
              
              <div>
                <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Email Address
                </label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Icon name="lucide:mail" class="h-4 w-4" />
                  </div>
                  <input 
                    type="email" 
                    :value="user?.email" 
                    disabled 
                    class="block w-full rounded-lg border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-500 cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400" 
                  />
                </div>
                <p class="mt-1 text-xs text-gray-400">Email tidak dapat diubah.</p>
              </div>

              <div>
                <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Nama Tampilan
                </label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Icon name="lucide:user" class="h-4 w-4" />
                  </div>
                  <input 
                    v-model="displayName" 
                    type="text" 
                    placeholder="Masukkan nama lengkap"
                    class="block w-full rounded-lg border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div class="flex items-center justify-end border-t border-gray-100 pt-6 dark:border-gray-700">
                <button 
                  type="submit" 
                  :disabled="loading" 
                  class="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 dark:focus:ring-offset-gray-900"
                >
                  <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                  {{ loading ? "Menyimpan..." : "Simpan Perubahan" }}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>