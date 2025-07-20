<template>
  <div>
    <toggleHeader @navigate="scrollToSection" />
    
    <div class="mt-4 px-4">
      <h2 class="text-lg font-semibold text-orange-500">
        Hi HotDash Admin
      </h2>
      <p class="text-2xl font-semibold">Manage Your Restaurant</p>
    </div>

    <div ref="categorySection" class="mt-6">
      <addCategories />
    </div>

    <div ref="menuManagerSection" class="mt-6">
      <menuManager />
    </div>

    <!-- Add more sections here if needed -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import addCategories from '@/components/admin/addCategories.vue'
import menuManager from '@/components/admin/menuManager.vue'
import toggleHeader from '@/components/admin/toggleHeader.vue'

const categorySection = ref(null)
const menuManagerSection = ref(null)

const scrollToSection = (section) => {
  const sections = {
    category: categorySection,
    menu: menuManagerSection,
  }
  const target = sections[section]?.value
  if (target) target.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>

</style>
