<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow">
    <div class="flex justify-between items-center px-6 py-2">
      <!-- Home -->
      <button 
        @click="navigateTo('/user/dashboard')" 
        class="flex flex-col items-center"
        :class="isActive('/user/dashboard') ? 'text-orange-500' : 'text-black'"
      >
        <Icon name="mdi:home" class="w-6 h-6" />
        <span class="text-xs">Home</span>
      </button>

      <!-- Chat -->
      <button 
        @click="navigateTo('/user/chat')" 
        class="flex flex-col items-center"
        :class="isActive('/user/chat') ? 'text-orange-500' : 'text-black'"
      >
        <Icon name="mdi:chat" class="w-6 h-6" />
        <span class="text-xs">Chat</span>
      </button>

      <!-- Cart -->
      <button 
        @click="navigateTo('/user/cart')" 
        class="relative -mt-6 p-3 bg-orange-500 rounded-full text-white shadow-lg"
      >
        <Icon name="mdi:cart" class="w-6 h-6" />
        <span 
          v-if="cartStore.totalItems > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
        >
          {{ cartStore.totalItems }}
        </span>
      </button>

      <!-- Notifications -->
      <button 
        @click="navigateTo('/user/notifications')" 
        class="flex flex-col items-center"
        :class="isActive('/user/notifications') ? 'text-orange-500' : 'text-black'"
      >
        <Icon name="mdi:bell" class="w-6 h-6" />
        <span class="text-xs">Notify</span>
      </button>

      <!-- Orders -->
      <button 
        @click="navigateTo('/user/orders')" 
        class="flex flex-col items-center"
        :class="isActive('/user/orders') ? 'text-orange-500' : 'text-black'"
      >
        <Icon name="mdi:clipboard-list" class="w-6 h-6" />
        <span class="text-xs">Orders</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useCartStore } from '~/stores/cart'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navigateTo = router.push
const cartStore = useCartStore()

const isActive = (path) => route.path === path
</script>
