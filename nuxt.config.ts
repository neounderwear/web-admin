export default defineNuxtConfig({
  compatibilityDate: "2024-11-19",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/icon", "@nuxtjs/color-mode"],
  nitro: {
    preset: "firebase",
    firebase: {
      gen: 2,
    },
  },
  colorMode: {
    classSuffix: "",
    preference: "system",
    fallback: "light",
  },
  runtimeConfig: {
    // Rajaongkir
    komerceUrl: process.env.NUXT_RAJAONGKIR_BASE_URL,
    komerceApiKey: process.env.NUXT_RAJAONGKIR_API_KEY,
    originCityId: process.env.NUXT_ORIGIN_CITY_ID,
    originDistrictId: process.env.NUXT_ORIGIN_DISTRICT_ID,
    // Midtrans
    midtransServerKey: process.env.NUXT_MIDTRANS_SERVER_KEY,
    midtransIsProduction: process.env.NUXT_MIDTRANS_IS_PRODUCTION,
    public: {
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
      },
    },
  },
  css: ["~/assets/css/main.css"],
  tailwindcss: {
    configPath: "tailwind.config.ts",
    exposeConfig: false,
    viewer: true,
  },
});
