<template>
  <div class="relative">
    <div class="flex justify-between items-center px-4 py-3 bg-white shadow-sm">
      <button @click="showMenu = !showMenu" class="bg-orange-500 w-8 h-8 rounded-md flex items-center justify-center">
        <Icon name="mdi:menu" class="text-white w-5 h-5" />
      </button>
    </div>

    <div v-if="showMenu" class="absolute bg-white shadow-lg p-4 w-52 rounded-md top-12 left-4 z-10 space-y-3">
      <p @click="$emit('navigate', 'category')" class="text-sm font-medium cursor-pointer text-gray-700 hover:text-orange-500">Add/Edit Categories</p>
      <p @click="$emit('navigate', 'menu')" class="text-sm font-medium cursor-pointer text-gray-700 hover:text-orange-500">Manage Menu Items</p>
    </div>
  </div>
</template>

<script setup>

const showMenu = ref(false)
</script>

<style lang="scss" scoped>

</style>