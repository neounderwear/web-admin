export default {
  darkMode: "class",
  content: ["./components/**/*.{vue,js,ts}", "./layouts/**/*.vue", "./pages/**/*.vue", "./plugins/**/*.{js,ts}", "./app.vue"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
      },
      colors: {
        primary: "#A67A4D",
        secondary: "#D9C7B3",
        accent: "#CAAC8D",
        base: "#F0E3D1",
        muted: "#B0A498",
        dark: "#594838",
      },
      transitionTimingFunction: {
        "in-out-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
