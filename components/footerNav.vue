<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow md:hidden">
    <div class="flex justify-between items-center px-6 py-2">
      <button @click="navigateTo('/user')" class="flex flex-col items-center">
        <Icon name="mdi:home" class="w-6 h-6" />
        <span class="text-xs">Home</span>
      </button>

      <button @click="navigateTo('/user/chat')" class="flex flex-col items-center">
        <Icon name="mdi:chat" class="w-6 h-6" />
        <span class="text-xs">Chat</span>
      </button>

      <button @click="navigateTo('/user/cart')" class="relative -mt-6 p-3 bg-orange-500 rounded-full text-white shadow-lg">
        <Icon name="mdi:cart" class="w-6 h-6" />
      </button>

      <button @click="navigateTo('/user/notifications')" class="flex flex-col items-center">
        <Icon name="mdi:bell" class="w-6 h-6" />
        <span class="text-xs">Notify</span>
      </button>

      <button @click="navigateTo('/user/orders')" class="flex flex-col items-center">
        <Icon name="mdi:clipboard-list" class="w-6 h-6" />
        <span class="text-xs">Orders</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
const navigateTo = useRouter().push
</script>

<style scoped>
/* Optional: Highlight center icon more */
</style>
