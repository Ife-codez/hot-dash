<template>
  <div class="px-4 mt-4">
    <div v-if="loading" class="text-sm text-gray-500">Loading categories...</div>
    <div v-else-if="!categoryStore.items.length" class="text-sm text-gray-400">No categories found.</div>

    <div
      v-else
      class="overflow-x-auto whitespace-nowrap no-scrollbar flex space-x-6"
    >
      <span
        @click="selectCategory('all')"
        class="cursor-pointer text-sm font-medium"
        :class="{
          'text-orange-500 font-semibold': activeCategory === 'all',
        }"
      >
        All
      </span>
      <span
        v-for="cat in categoryStore.items"
        :key="cat._id"
        @click="selectCategory(cat._id)"
        class="cursor-pointer text-sm font-medium"
        :class="{
          'text-orange-500 font-semibold': activeCategory === cat._id,
        }"
      >
        {{ cat.name }}
      </span>
    </div>
    
    <div v-if="displayedItems.length" class="mt-4 grid grid-cols-2 gap-4">
      <div
        v-for="item in displayedItems"
        :key="item._id"
        class="border rounded-lg p-2 shadow-sm relative flex flex-col justify-between"
      >
        <img
          :src="item.imageUrl"
          alt="Food image"
          class="w-full h-32 object-cover rounded mb-2"
        />

        <h3 class="font-semibold text-sm">{{ item.name }}</h3>

        <p
          class="text-xs mt-1"
          :class="item.available ? 'text-green-600' : 'text-red-500'"
        >
          {{ item.available ? 'Available' : 'Not available' }}
        </p>

        <div class="flex items-center justify-between mt-2">
          <p class="text-sm font-bold text-orange-600">₦{{ item.price }}</p>
          
          <button
            class="w-8 h-8 rounded-tr-lg rounded-bl-lg bg-orange-500 text-white flex items-center justify-center"
            @click="addToCart(item)"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="activeCategory" class="mt-4 text-sm text-gray-400">
      No menu items in this category.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'
import { useSearchStore } from '@/stores/search'

const categoryStore = useCategoryStore()
const menuStore = useMenuStore()
const cartStore = useCartStore()
const searchStore = useSearchStore() // Import the new store

const loading = ref(true)
const activeCategory = ref('all')
const filteredItems = ref([])

onMounted(async () => {
  try {
    await categoryStore.fetchCategories()
    await menuStore.fetchMenu()
    
    selectCategory('all')
  } finally {
    loading.value = false
  }
})

// This computed property will filter based on the active category and the search query
const displayedItems = computed(() => {
  const query = searchStore.searchQuery.toLowerCase().trim();
  if (!query) {
    return filteredItems.value;
  }
  return filteredItems.value.filter(item =>
    item.name.toLowerCase().includes(query)
  );
});

function selectCategory(id) {
  activeCategory.value = id
  console.log('Selected category:', id)
  searchStore.setSearchQuery(''); // Clear search when a new category is selected

  if (id === 'all') {
    const allItems = []
    const categoryCounts = {}
    for (const item of menuStore.items) {
      const categoryId = item.category._id
      if (!categoryCounts[categoryId]) {
        categoryCounts[categoryId] = 0
      }
      if (categoryCounts[categoryId] < 3) {
        allItems.push(item)
        categoryCounts[categoryId]++
      }
    }
    filteredItems.value = allItems
  } else {
    filteredItems.value = menuStore.items.filter(
      (item) => item.category && item.category._id === id
    )
  }
}

function addToCart(item) {
  cartStore.addToCart(item)
  console.log(`Added ${item.name} to cart. Total items: ${cartStore.totalItems}`);
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