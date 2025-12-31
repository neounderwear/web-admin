<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Vue3Lottie } from "vue3-lottie";
import { useAuth } from "~/composables/useAuth";
import { useToast } from "~/composables/useToast";
import warehouseAnim from "~/assets/animation/warehouse.json";
import analyticsAnim from "~/assets/animation/analytics.json";
import shippingAnim from "~/assets/animation/shipping.json";

definePageMeta({
  layout: "empty",
});

const router = useRouter();
const { login } = useAuth();
const { showSuccess, showError } = useToast();

// Tema
const colorMode = useColorMode();
const toggleTheme = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};

const email = ref("");
const password = ref("");
const loading = ref(false);
const showPassword = ref(false);

// Login
const handleLogin = async () => {
  if (!email.value || !password.value) return;

  loading.value = true;
  try {
    await login(email.value, password.value);
    showSuccess("Berhasil masuk! Mengalihkan...");
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  } catch (e: any) {
    let msg = "Gagal login.";
    if (e.code === "auth/invalid-credential" || e.code === "auth/user-not-found" || e.code === "auth/wrong-password") {
      msg = "Email atau password salah.";
    } else if (e.code === "auth/too-many-requests") {
      msg = "Terlalu banyak percobaan. Silakan coba lagi nanti.";
    }
    showError(msg);
    loading.value = false;
  }
};

// Slider ilustrasi
const activeSlide = ref(0);
let slideInterval: NodeJS.Timeout;

const slides = [
  { id: 1, text: "Manajemen Gudang Terpusat", subtext: "Kelola stok, varian, dan inventaris pakaian dalam dengan mudah dari satu dashboard.", lottieData: warehouseAnim },
  { id: 2, text: "Analisis Bisnis Real-time", subtext: "Pantau performa penjualan dan tren pasar melalui grafik yang interaktif.", lottieData: analyticsAnim },
  { id: 3, text: "Pengiriman Terintegrasi", subtext: "Lacak status pengiriman pesanan pelanggan secara otomatis dan akurat.", lottieData: shippingAnim },
];

onMounted(() => {
  slideInterval = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % slides.length;
  }, 6000);
});

onUnmounted(() => {
  clearInterval(slideInterval);
});
</script>

<template>
  <div class="flex min-h-screen w-full bg-white dark:bg-gray-950 transition-colors duration-500">
    <!-- Toggle tema -->
    <div class="fixed top-6 right-6 z-50">
      <button
        @click="toggleTheme"
        class="group flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-gray-600 shadow-lg backdrop-blur-md ring-1 ring-gray-900/5 transition-all hover:scale-110 hover:bg-white hover:text-primary dark:bg-gray-800/50 dark:text-gray-300 dark:ring-white/10 dark:hover:bg-gray-800 dark:hover:text-white"
        aria-label="Ganti Tema"
      >
        <ClientOnly>
          <Icon 
            :name="colorMode.value === 'dark' ? 'lucide:moon' : 'lucide:sun'" 
            class="h-5 w-5 transition-transform duration-500 group-hover:rotate-12" 
          />
        </ClientOnly>
      </button>
    </div>

    <!-- Form login -->
    <div class="flex w-full flex-col justify-center px-6 py-12 lg:w-[480px] xl:w-[550px] bg-white dark:bg-gray-950 z-10 relative">
      <div class="mx-auto w-full max-w-sm">
        <div class="mb-10">
          <div class="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 mb-6 shadow-lg shadow-primary/20 p-2.5">
            <img 
              src="~/assets/images/logo.png" 
              alt="Logo Aplikasi" 
              class="h-full w-full object-contain" 
            />
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Halo!</h1>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Silakan login buat lanjut</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-1.5">
            <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</label>
            <div class="group relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon name="lucide:mail" class="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary" />
              </div>
              <input
                v-model="email"
                id="email"
                type="email"
                required
                class="block w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-950"
                placeholder="nama@email.com"
              />
            </div>
          </div>
          <div class="space-y-1.5">
            <div class="flex justify-between items-center">
               <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Password</label>
            </div>
            <div class="group relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon name="lucide:lock" class="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary" />
              </div>
              <input
                v-model="password"
                id="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="block w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-950"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none"
                tabindex="-1"
              >
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin" />
            </span>
            <span v-else>Login</span>
          </button>
        </form>

        <p class="mt-12 text-center text-xs text-gray-400 dark:text-gray-600">
          &copy; {{ new Date().getFullYear() }} | CV GUDANG PAKAIAN DALAM
        </p>
      </div>
    </div>

    <!-- Ilustrasi -->
    <div class="relative hidden w-0 flex-1 lg:flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-500">
      <div class="absolute inset-0 bg-primary/5 dark:bg-primary/10"></div>
      <div class="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl opacity-50 dark:opacity-30"></div>
      <div class="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl opacity-50 dark:opacity-20"></div>
      <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div class="relative w-full max-w-lg text-center p-12 z-10">
        <transition-group name="slide-up" tag="div" class="relative h-[500px] w-full flex items-center justify-center">
          <div 
            v-for="(slide, index) in slides" 
            :key="slide.id" 
            v-show="activeSlide === index" 
            class="absolute inset-0 flex flex-col items-center justify-center"
          >
            <div class="h-80 w-80 mb-8 drop-shadow-2xl transition-all duration-500 transform hover:scale-105">
              <ClientOnly>
                <Vue3Lottie :animationData="slide.lottieData" :height="320" :width="320" />
              </ClientOnly>
            </div>

            <h3 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
              {{ slide.text }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto text-base">
              {{ slide.subtext }}
            </p>
          </div>
        </transition-group>
        <div class="flex justify-center space-x-2 mt-8">
          <button
            v-for="(_, index) in slides"
            :key="index"
            @click="activeSlide = index"
            class="h-2 rounded-full transition-all duration-500 ease-out"
            :class="activeSlide === index ? 'w-8 bg-primary shadow-sm shadow-primary/50' : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'"
            :aria-label="`Go to slide ${index + 1}`"
          ></button>
        </div>
      </div>
    </div>
    <Toast />
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  position: absolute;
  width: 100%;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
  filter: blur(4px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-40px) scale(1.05);
  filter: blur(4px);
}

.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
}
</style>