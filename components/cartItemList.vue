<template>
  <div>
    <div v-if="cartStore.items.length === 0" class="text-center mt-20">
      <p>Your cart is empty.</p>
      <p class="mt-2">Add some delicious food from the dashboard!</p>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="item in cartStore.items" 
        :key="item._id" 
        class="relative flex items-center bg-white rounded-lg shadow-sm p-3 border border-gray-100"
      >
        <div class="flex flex-col items-center justify-between border rounded-md p-3 h-20">
          <button @click="cartStore.incrementQuantity(item._id)" class="text-orange-500 text-xl leading-none h-1/3">+</button>
          <span class="font-semibold text-lg leading-none h-1/3">{{ item.quantity }}</span>
          <button @click="cartStore.decrementQuantity(item._id)" class="text-orange-500 text-xl leading-none h-1/3">-</button>
        </div>

        <div class="mx-4 shadow-md rounded-md overflow-hidden">
          <img :src="item.imageUrl" alt="Food image" class="w-20 h-20 object-cover" />
        </div>

        <div class="flex-1">
          <h3 class="font-semibold text-md sm:text-lg">{{ item.name }}</h3>
          <p class="text-orange-600 font-bold text-sm sm:text-md">₦{{ item.price }}</p>
        </div>

        <button 
          @click="cartStore.removeItem(item._id)" 
          class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Icon name="mdi:close" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore();
</script>

<style scoped>
/* No specific styles needed as Tailwind handles the layout */
</style>