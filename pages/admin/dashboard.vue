<template>
  <div>
    <div class="mt-4 px-4 pb-4">
      <p class="text-2xl font-bold text-gray-800">Manage Your Restaurant</p>
    </div>

    <div ref="categorySection" class="bg-white p-6 rounded-xl shadow-md mb-6">
      <h2 class="text-xl font-bold mb-4">Categories</h2>
      <addCategories />
    </div>

    <div ref="menuManagerSection" class="bg-white p-6 rounded-xl shadow-md mb-6">
      <h2 class="text-xl font-bold mb-4">Menu Items</h2>
      <menuManager />
    </div>

    </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth-check'],
  layout: 'admin-layout', // <-- CRITICAL: Use the new layout here
});

import addCategories from '@/components/admin/addCategories.vue';
import menuManager from '@/components/admin/menuManager.vue';

// The scrollToSection and toggleHeader are no longer needed
// as the new layout provides the drawer navigation
</script>

<style scoped>
/* No scoped styles needed here, as the new layout handles the overall structure */
</style>