<template>
  <div class="min-h-screen bg-white flex flex-col">
    <header class="sticky top-0 z-20 bg-white shadow-sm px-4 py-3 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <button @click="isDrawerOpen = true" class="bg-orange-500 w-8 h-8 rounded-md flex items-center justify-center">
          <Icon name="mdi:menu" class="text-white w-5 h-5" />
        </button>
        <h1 class="text-xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>
    </header>

    <main class="flex-1 p-6">
      <slot />
    </main>
    
    <div
      :class="{ 'translate-x-0': isDrawerOpen, '-translate-x-full': !isDrawerOpen }"
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out transform"
    >
      <div class="h-full flex flex-col p-4">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-lg font-bold text-orange-500">Admin Menu</h2>
          <button @click="isDrawerOpen = false" class="text-gray-500 hover:text-gray-700">
            <Icon name="mdi:close" class="w-6 h-6" />
          </button>
        </div>
        
        <nav class="flex-1 space-y-4">
          <button @click="isDrawerOpen = false" class="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <NuxtLink to="/admin/dashboard" class="flex items-center gap-4">
              <Icon name="mdi:view-dashboard" class="w-6 h-6 text-gray-600" />
              <span class="text-gray-700 font-medium">Dashboard</span>
            </NuxtLink>
          </button>
          <button @click="isDrawerOpen = false" class="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <NuxtLink to="/admin/messages" class="flex items-center gap-4">
              <Icon name="mdi:email" class="w-6 h-6 text-gray-600" />
              <span class="text-gray-700 font-medium">Messages</span>
            </NuxtLink>
          </button>
          <button @click="isDrawerOpen = false" class="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <NuxtLink to="/admin/orders" class="flex items-center gap-4">
              <Icon name="mdi:file-document" class="w-6 h-6 text-gray-600" />
              <span class="text-gray-700 font-medium">Orders</span>
            </NuxtLink>
          </button>
          <button @click="isDrawerOpen = false" class="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <NuxtLink to="/admin/settings" class="flex items-center gap-4">
              <Icon name="mdi:cog" class="w-6 h-6 text-gray-600" />
              <span class="text-gray-700 font-medium">Settings</span>
            </NuxtLink>
          </button>
        </nav>

        <button @click="handleLogout" class="flex items-center space-x-4 p-2 rounded-lg mt-auto hover:bg-red-100 transition-colors w-full text-left">
          <Icon name="mdi:logout" class="w-6 h-6 text-red-500" />
          <span class="text-red-500 font-medium">Logout</span>
        </button>
      </div>
    </div>
    
    <div 
      v-if="isDrawerOpen" 
      @click="isDrawerOpen = false" 
      class="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
    ></div>

    <footer class="w-full bg-white border-t py-4 text-center text-gray-500 text-sm">
      © {{ new Date().getFullYear() }} HotDash. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { useUserStore } from '~/stores/user'

const userStore = useUserStore();
const router = useRouter();
const isDrawerOpen = ref(false);

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>