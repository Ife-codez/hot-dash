// @tailwind utilities;
export default {
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './nuxt.config.ts'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E63946',
        accent: '#F4A261',
        success: '#2A9D8F',
        background: '#FFA500',
        textLight: '#222222',
      }
    },

  }
}
