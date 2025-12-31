import { useAuth } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware((to, from) => {
  // Middleware Auth sebaiknya hanya jalan di Client Side untuk Firebase
  if (process.server) return;

  const { user, authLoading } = useAuth();
  
  // Daftar route yang boleh diakses tanpa login
  // Tambahkan '/login' jika halaman login Anda url-nya '/login', bukan '/'
  const publicRoutes = ["/", "/login"]; 

  // 1. Jika Auth masih loading, jangan lakukan apa-apa dulu (tunggu plugin auth-init selesai)
  if (authLoading.value) return;

  // 2. Jika USER BELUM LOGIN & mencoba akses halaman Private -> Lempar ke Login
  if (!user.value && !publicRoutes.includes(to.path)) {
    return navigateTo("/");
  }

  // 3. Jika USER SUDAH LOGIN & mencoba akses halaman Login -> Lempar ke Dashboard
  if (user.value && publicRoutes.includes(to.path)) {
    return navigateTo("/dashboard");
  }
});