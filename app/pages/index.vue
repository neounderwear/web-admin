<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Vue3Lottie } from "vue3-lottie";
import { useAuth } from "~/composables/useAuth";
import { useToast } from "~/composables/useToast";

// Import Lottie Assets
import warehouseAnim from "~/assets/animation/warehouse.json";
import analyticsAnim from "~/assets/animation/analytics.json";
import shippingAnim from "~/assets/animation/shipping.json";

definePageMeta({
  layout: "empty",
});

const router = useRouter();
const { login } = useAuth();
const { showSuccess, showError } = useToast();

// --- LOGIKA TEMA (BARU) ---
const colorMode = useColorMode();
const toggleTheme = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};

const email = ref("");
const password = ref("");
const loading = ref(false);
const showPassword = ref(false);

// --- LOGIKA LOGIN ---
const handleLogin = async () => {
  if (!email.value || !password.value) return;

  loading.value = true;
  try {
    await login(email.value, password.value);
    showSuccess("Berhasil masuk!");
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  } catch (e: any) {
    let msg = "Gagal login.";
    if (e.code === "auth/invalid-credential" || e.code === "auth/user-not-found" || e.code === "auth/wrong-password") {
      msg = "Email atau password salah.";
    } else if (e.code === "auth/too-many-requests") {
      msg = "Terlalu banyak percobaan. Tunggu beberapa saat.";
    }
    showError(msg);
    loading.value = false;
  }
};

// --- LOGIKA SLIDER LOTTIE ---
const activeSlide = ref(0);
let slideInterval: NodeJS.Timeout;

const slides = [
  { id: 1, text: "Mudah", subtext: "Kelola stok, pesanan, dan lainnya dari satu tempat", lottieData: warehouseAnim },
  { id: 2, text: "Ringkas dan Tepat", subtext: "Dapatkan laporan bisnis secara ringkas dan tepat", lottieData: analyticsAnim },
  { id: 3, text: "Terintegrasi", subtext: "Dilengkapi dengan pembayaran dan pengiriman terintegrasi", lottieData: shippingAnim },
];

onMounted(() => {
  slideInterval = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % slides.length;
  }, 5000);
});

onUnmounted(() => {
  clearInterval(slideInterval);
});
</script>

<template>
  <div class="relative flex min-h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
    <div class="absolute top-6 right-6 z-50">
      <button
        @click="toggleTheme"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-dark shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:scale-110 dark:bg-gray-800/80 dark:text-white dark:hover:bg-gray-800"
        aria-label="Ganti Tema"
      >
        <ClientOnly>
          <Icon :name="colorMode.value === 'dark' ? 'lucide:moon' : 'lucide:sun'" class="h-5 w-5 transition-transform duration-500 rotate-0 dark:-rotate-180" />
        </ClientOnly>
      </button>
    </div>

    <div class="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 xl:w-5/12 bg-white dark:bg-gray-900 shadow-2xl z-10 transition-colors duration-500">
      <div class="mx-auto w-full max-w-sm">
        <div class="mb-8">
          <div class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white mb-4 shadow-lg shadow-primary/30">
            <Icon name="lucide:box" class="h-6 w-6" />
          </div>
          <h2 class="text-2xl font-bold text-dark dark:text-white">Halo, Admin!</h2>
          <p class="mt-1 text-sm text-muted">Masuk buat lanjut</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label for="email" class="mb-1.5 block text-xs font-bold uppercase text-muted tracking-wider">Email</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon name="lucide:mail" class="h-5 w-5 text-muted group-focus-within:text-primary transition-colors" />
              </div>
              <input
                v-model="email"
                id="email"
                type="email"
                required
                class="block w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 pl-10 text-sm text-dark placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900"
                placeholder="masukkan email kamu"
              />
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label for="password" class="block text-xs font-bold uppercase text-muted tracking-wider">Password</label>
            </div>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon name="lucide:lock" class="h-5 w-5 text-muted group-focus-within:text-primary transition-colors" />
              </div>

              <input
                v-model="password"
                id="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="block w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 pl-10 pr-10 text-sm text-dark placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900"
                placeholder="••••••••"
              />

              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-dark dark:hover:text-white transition-colors cursor-pointer focus:outline-none"
                tabindex="-1"
              >
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/50 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin" />
              Memverifikasi...
            </span>
            <span v-else>Masuk</span>
          </button>
        </form>

        <p class="mt-8 text-center text-xs text-muted opacity-60">&copy; 2025 Gudang Pakaian Dalam | Admin</p>
      </div>
    </div>

    <div class="relative hidden w-0 flex-1 lg:flex items-center justify-center bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-500">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
      <div class="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/5 blur-3xl"></div>

      <div class="relative w-full max-w-md text-center p-10">
        <transition-group name="slide-fade" tag="div" class="relative h-[450px] w-full">
          <div v-for="(slide, index) in slides" :key="slide.id" v-show="activeSlide === index" class="absolute inset-0 flex flex-col items-center justify-center">
            <div class="h-72 w-72 mb-8 drop-shadow-xl">
              <ClientOnly>
                <Vue3Lottie :animationData="slide.lottieData" :height="280" :width="280" />
              </ClientOnly>
            </div>

            <h3 class="text-2xl font-bold text-dark dark:text-white mb-2 transition-colors duration-500">{{ slide.text }}</h3>
            <p class="text-muted dark:text-gray-400 leading-relaxed transition-colors duration-500">{{ slide.subtext }}</p>
          </div>
        </transition-group>

        <div class="flex justify-center space-x-2 mt-4">
          <button
            v-for="(_, index) in slides"
            :key="index"
            @click="activeSlide = index"
            class="h-1.5 rounded-full transition-all duration-500"
            :class="activeSlide === index ? 'w-6 bg-primary' : 'w-1.5 bg-gray-300 dark:bg-gray-700'"
          ></button>
        </div>
      </div>
    </div>

    <Toast />
  </div>
</template>

<style scoped>
/* Animasi Slide yang lebih halus */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(1.05);
}

.slide-fade-leave-active {
  position: absolute;
  width: 100%;
}
</style>
