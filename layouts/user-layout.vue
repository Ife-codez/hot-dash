<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-10">
      <userNav />
    </header>
    
    <main class="flex-1 pb-[16px]"> 
      <slot />
    </main>
    
    <footer class="w-full bg-white border-t py-4 text-center">
      <footerNav />
    </footer>
  </div>
</template>

<script setup>
import footerNav from '~/components/footerNav.vue'
import userNav from '~/components/userNav.vue';
</script>

<style scoped>
/* You'll need to define the height of your footer here if you don't use fixed px values in Tailwind */
/* For example, if py-4 makes your footer roughly 64px tall, use pb-16 (or more specific value) */
/* Or, if you prefer, you can use a CSS variable as discussed previously */
</style>