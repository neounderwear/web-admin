<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useToast } from "~/composables/useToast";
import { usePageTitle } from "~/composables/usePageTitles";

const pageTitle = usePageTitle();
onMounted(() => {
  pageTitle.value = "Profil Saya";
});
useHead({ title: "Profil" });

const { user, updateUserProfile } = useAuth();
const { showSuccess, showError } = useToast();

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
  <div class="container mx-auto max-w-2xl p-6">
    <div class="rounded-xl border border-muted/20 bg-white p-8 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div class="flex flex-col items-center mb-8">
        <div class="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary mb-4 border-4 border-white shadow-lg dark:border-gray-700">
          {{ user?.email?.charAt(0).toUpperCase() }}
        </div>
        <h2 class="text-xl font-bold text-dark dark:text-white">{{ user?.displayName || "Admin" }}</h2>
        <p class="text-muted">{{ user?.email }}</p>
        <span class="mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium dark:bg-green-900/30 dark:text-green-300"> Administrator </span>
      </div>

      <form @submit.prevent="handleUpdateProfile" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-dark/80 dark:text-gray-300 mb-1">Nama Tampilan</label>
          <input v-model="displayName" type="text" class="w-full rounded-md border-muted/50 bg-gray-50 p-3 text-sm focus:ring-primary focus:border-primary dark:bg-gray-900 dark:text-white" />
        </div>

        <div class="pt-4 border-t border-muted/20 dark:border-gray-700 flex justify-end">
          <button type="submit" :disabled="loading" class="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {{ loading ? "Menyimpan..." : "Simpan Perubahan" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
