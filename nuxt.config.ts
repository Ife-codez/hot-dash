
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  // css: ['@/assets/css/tailwind.css'],
  modules: ['nuxt-mongoose', '@pinia/nuxt', '@nuxt/icon', '@nuxtjs/tailwindcss',],
  mongoose: {
    uri: process.env.MONGO_URI,
  },
  nitro: {
    experimental: {
      websocket: true // Enable experimental WebSocket support in Nitro
    }
  },
  runtimeConfig: {
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    public: {
      appUrl: process.env.APP_URL,
    },
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  // plugins: [
  //   '~/plugins/pinia-persisted.js', 
  // ],
  // tailwindcss:{
  //   configPath: "~/tailwind.config.ts",
  // }
})
