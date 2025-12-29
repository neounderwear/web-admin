import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.firebase as FirebaseOptions;

  if (!config.apiKey) {
    return;
  }

  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  return {
    provide: {
      firebaseApp: app,
      auth: auth,
      firestore: db,
      storage: storage,
    },
  };
});
