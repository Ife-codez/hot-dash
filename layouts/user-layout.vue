<template>
  <div>
    <slot />
    <footer class="fixed bottom-0 w-full bg-white border-t py-4 text-center">
      <footerNav />
    </footer>
  </div>
</template>
<script setup>
import footerNav from '~/components/footerNav.vue'

</script>
