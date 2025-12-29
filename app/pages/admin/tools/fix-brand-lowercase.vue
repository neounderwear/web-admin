<script setup lang="ts">
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const { $firestore } = useNuxtApp();

const loading = ref(true);
const updatedCount = ref(0);
const skippedCount = ref(0);

async function fixBrands() {
  try {
    const colRef = collection($firestore, "brands");
    const snapshot = await getDocs(colRef);

    for (const d of snapshot.docs) {
      const data = d.data();

      // Jika field sudah ada → skip
      if (data.nameLowerCase) {
        skippedCount.value++;
        continue;
      }

      // Update dokumen
      await updateDoc(doc($firestore, "brands", d.id), {
        nameLowerCase: data.name.toLowerCase(),
      });

      updatedCount.value++;
    }
  } catch (error) {
    console.error(error);
    alert("Terjadi error, cek console");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fixBrands();
});
</script>

<template>
  <div class="p-10 space-y-4 text-lg">
    <h1 class="text-2xl font-bold">Fix Brand Lowercase</h1>

    <p v-if="loading">Processing data merek...</p>

    <div v-else>
      <p>✔ Jumlah dokumen diperbarui: {{ updatedCount }}</p>
      <p>⏭ Dokumen yang sudah punya field: {{ skippedCount }}</p>
      <p class="text-green-600 font-semibold mt-4">Selesai! Kamu boleh menutup halaman ini.</p>
    </div>
  </div>
</template>
