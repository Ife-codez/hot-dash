<template>
  <div class="px-4 mt-4">
    <div class="flex items-center bg-gray-100 rounded-lg px-3 py-2">
      <!-- Search Icon -->
      <Icon name="mdi:magnify" class="text-orange-500 w-6 h-6" />

      <!-- Input Field -->
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search Food"
        class="bg-transparent flex-1 px-3 outline-none text-sm text-gray-800"
      />

      <!-- Filter Button -->
      <button class="bg-orange-500 p-2 rounded-md flex items-center justify-center">
        <Icon name="mdi:filter-variant" class="text-white w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
const searchQuery = ref('')
</script>
