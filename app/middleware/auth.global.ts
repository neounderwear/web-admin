import { useAuth } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware((to, from) => {
  const { user, authLoading } = useAuth();
  const publicRoutes = ["/"];

  if (!user.value && !publicRoutes.includes(to.path)) {
    return navigateTo("/");
  }

  if (user.value && to.path === "/") {
    return navigateTo("/dashboard");
  }
});
