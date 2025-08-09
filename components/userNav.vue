<template>
  <div class="flex justify-between items-center px-4 py-3 bg-white shadow-sm">
    <button @click="isDrawerOpen = true" class="bg-orange-500 w-8 h-8 rounded-md flex items-center justify-center">
      <Icon name="mdi:menu" class="text-white w-5 h-5" />
    </button>
    
    <div class="flex items-center space-x-1">
      <Icon name="mdi:map-marker" class="w-5 h-5 text-orange-500" />    
      <span class="text-sm font-medium text-gray-700">Magura, BD</span>
    </div>
    
    <div v-if="isLoadingAvatar">
      <div class="h-9 w-9 rounded-lg bg-gray-200 flex items-center justify-center animate-pulse">
        <Icon name="mdi:loading" class="w-5 h-5 text-gray-500 animate-spin" />
      </div>
    </div>
    <div v-else>
      <img 
        :src="avatar" 
        alt="Profile Picture" 
        class="h-9 w-9 rounded-lg object-cover"
      >
    </div>
  </div>

  <div 
    :class="{ 'translate-x-0': isDrawerOpen, '-translate-x-full': !isDrawerOpen }"
    class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out transform"
  >
    <div class="h-full flex flex-col p-4">
      <div class="flex items-center space-x-4 mb-8 pb-4 border-b border-gray-200">
        <label for="profile-picture-input" class="cursor-pointer relative group">
          <div v-if="isLoadingAvatar">
            <div class="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
              <Icon name="mdi:loading" class="w-7 h-7 text-gray-500 animate-spin" />
            </div>
          </div>
          <div v-else>
            <img 
              :src="avatar" 
              alt="User Profile" 
              class="h-12 w-12 rounded-full object-cover group-hover:opacity-70 transition-opacity"
            />
          </div>
          
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Icon name="mdi:camera" class="w-6 h-6 text-white bg-black bg-opacity-50 rounded-full p-1" />
          </div>
        </label>
        
        <input 
          id="profile-picture-input" 
          type="file" 
          accept="image/*" 
          class="hidden" 
          @change="handleFileChange"
        >

        <div class="flex flex-col">
          <span class="font-semibold text-lg text-gray-800">{{ userName }}</span>
          <span class="text-sm text-gray-500">Change Picture</span>
        </div>
      </div>
      
      <nav class="flex-1">
        <ul class="space-y-4">
          <li>
            <NuxtLink @click="isDrawerOpen = false" to="/user/settings" class="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Icon name="mdi:cog" class="w-6 h-6 text-gray-600" />
              <span class="text-gray-700 font-medium">Settings</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink @click="isDrawerOpen = false" to="/user/orders" class="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Icon name="mdi:history" class="w-6 h-6 text-gray-600" />
              <span class="text-gray-700 font-medium">Order History</span>
            </NuxtLink>
          </li>
          <li>
            <button @click="handleLogout" class="flex items-center space-x-4 p-2 rounded-lg hover:bg-red-100 transition-colors w-full text-left">
              <Icon name="mdi:logout" class="w-6 h-6 text-red-500" />
              <span class="text-red-500 font-medium">Logout</span>
            </button>
          </li>
        </ul>
      </nav>

      <button @click="isDrawerOpen = false" class="mt-auto flex items-center justify-center p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
        <Icon name="mdi:close" class="w-6 h-6 text-gray-600" />
      </button>
    </div>
  </div>

  <div 
    v-if="isDrawerOpen"
    @click="isDrawerOpen = false"
    class="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
  ></div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '~/stores/user';
import { useNotificationsStore } from '~/stores/notification';

const isDrawerOpen = ref(false);
const isLoadingAvatar = ref(false); // <-- NEW: State to track avatar upload status

const userStore = useUserStore();
const notificationsStore = useNotificationsStore();
const router = useRouter();
const toast = useNuxtApp().$toast;

const user = computed(() => userStore.user);

const userName = computed(() => user.value?.name || 'User');
const avatar = computed(() => user.value?.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png');

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    isLoadingAvatar.value = true; // <-- UPDATED: Set loading state to true
    
    // Step 1: Upload the avatar to the server
    await $fetch('/api/user/upload-avatar', {
      method: 'POST',
      body: formData,
    });
    
    // Step 2: Fetch the latest user data from the server
    const latestUserResponse = await $fetch('/api/user/profile');
    
    // Step 3: Update the entire user object in the Pinia store with the fresh data
    userStore.setUser(latestUserResponse.user);

    toast.success('Profile picture updated successfully!');
    isDrawerOpen.value = false;
  } catch (err) {
    console.error('Error uploading avatar:', err);
    toast.error(err?.data?.message || 'Could not upload profile picture.');
  } finally {
    event.target.value = null;
    isLoadingAvatar.value = false; // <-- UPDATED: Set loading state to false
  }
};

const handleLogout = () => {
  userStore.logout();
  notificationsStore.clearAll();
  isDrawerOpen.value = false;
  router.push('/login');
};
</script>