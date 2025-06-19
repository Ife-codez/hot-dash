// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  // css: ['@/assets/css/tailwind.css'],
  modules: ['nuxt-mongoose', '@pinia/nuxt', '@nuxt/icon', '@nuxtjs/tailwindcss'],
  mongoose: {
    uri: process.env.MONGO_URI,
  },
  // tailwindcss:{
  //   configPath: "~/tailwind.config.ts",
  // }
})
