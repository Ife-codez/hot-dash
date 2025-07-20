<template>
  <div class="px-4 mt-4">
    <!-- Loading or Empty -->
    <div v-if="loading" class="text-sm text-gray-500">Loading categories...</div>
    <div v-else-if="!categoryStore.items.length" class="text-sm text-gray-400">No categories found.</div>

    <!-- Scrollable list -->
    <div
      v-else
      class="overflow-x-auto whitespace-nowrap no-scrollbar flex space-x-6"
    >
      <span
        v-for="cat in categoryStore.items"
        :key="cat._id"
        @click="selectCategory(cat._id)"
        class="cursor-pointer text-sm font-medium"
        :class="{
          'text-orange-600 font-semibold': activeCategory === cat._id,
        }"
      >
        {{ cat.name }}
      </span>
    </div>
    <!-- Filtered Menu Items -->
  <div v-if="filteredItems.length" class="mt-4 grid grid-cols-2 gap-4">
    <div
  v-for="item in filteredItems"
  :key="item._id"
  class="border rounded-lg p-2 shadow-sm relative flex flex-col justify-between"
>
  <!-- Food Image -->
  <img
    :src="item.image"
    alt="Food image"
    class="w-full h-32 object-cover rounded mb-2"
  />

  <!-- Food Name -->
  <h3 class="font-semibold text-sm">{{ item.name }}</h3>

  <!-- Availability -->
  <p
    class="text-xs mt-1"
    :class="item.available ? 'text-green-600' : 'text-red-500'"
  >
    {{ item.available ? 'Available' : 'Not available' }}
  </p>

  <!-- Bottom Row: Price and + Button -->
  <div class="flex items-center justify-between mt-2">
    <p class="text-sm font-bold text-orange-600">₦{{ item.price }}</p>
    
    <!-- Add to cart button -->
    <button
      class="w-8 h-8 rounded-tr-lg rounded-bl-lg bg-orange-600 text-white flex items-center justify-center"
      @click="addToCart(item)"
    >
      +
    </button>
  </div>
</div>

</div>

<!-- No food items -->
<div v-else-if="activeCategory" class="mt-4 text-sm text-gray-400">
  No menu items in this category.
</div>

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { useMenuStore } from '@/stores/menu'

const categoryStore = useCategoryStore()
const menuStore = useMenuStore()

const loading = ref(true)
const activeCategory = ref('') // Holds selected category
const filteredItems = ref([])

onMounted(async () => {
  try {
    await categoryStore.fetchCategories()
    await menuStore.fetchMenu()
  } finally {
    loading.value = false
  }
})

function selectCategory(id) {
  activeCategory.value = id
  console.log('Selected category:', id)

  filteredItems.value = menuStore.items.filter(
    (item) => item.category && item.category._id === id
  )
}
</script>

<style scoped>
/* Hide scrollbar (Chrome, Safari, Opera) */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar (Firefox) */
.no-scrollbar {
  scrollbar-width: none;
}
</style>
