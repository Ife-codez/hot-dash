// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  // css: ['@/assets/css/tailwind.css'],
  modules: ['nuxt-mongoose', '@pinia/nuxt', '@nuxt/icon', '@nuxtjs/tailwindcss'],
  mongoose: {
    uri: process.env.MONGO_URI,
  },
  runtimeConfig: {
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    public: {
      appUrl: process.env.APP_URL
    },
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  }
  // tailwindcss:{
  //   configPath: "~/tailwind.config.ts",
  // }
})
