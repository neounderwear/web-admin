import { useAuth } from "~/composables/useAuth";

export default defineNuxtPlugin(async (nuxtApp) => {
  const { initAuth } = useAuth();

  await initAuth();
});
