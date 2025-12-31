// plugins/auth-init.client.ts
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default defineNuxtPlugin((nuxtApp) => {
  const auth = getAuth();
  
  // Kita gunakan useState untuk menyimpan status loading auth secara global
  const isAuthResolved = useState<boolean>('auth-resolved', () => false);

  // Hook ini akan dijalankan saat Nuxt mulai mounting
  nuxtApp.hook('app:created', async () => {
    // Bungkus onAuthStateChanged dalam Promise agar kita bisa menunggu
    await new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        isAuthResolved.value = true;
        resolve();
        unsubscribe(); // Kita hanya butuh cek pertama kali saja
      });
    });
  });
});