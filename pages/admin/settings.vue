<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold text-orange-500 mb-6">Admin Settings</h1>
    
    <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
      
      <div v-if="loadingAdminDetails" class="text-center py-10">
        <Icon name="mdi:loading" class="w-10 h-10 text-orange-500 animate-spin" />
      </div>

      <form v-else @submit.prevent="saveChanges">
        
        <div class="mb-4">
          <label for="name" class="block text-gray-700 font-medium mb-1">Name</label>
          <input
            id="name"
            type="text"
            v-model="form.name"
            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          />
        </div>

        <div class="mb-6">
          <label for="email" class="block text-gray-700 font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            v-model="form.email"
            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          />
        </div>
        
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
        
        <div class="mb-4">
          <label for="currentPassword" class="block text-gray-700 font-medium mb-1">Current Password <span class="text-red-500 text-sm">(Required for any changes)</span></label>
          <div class="relative">
            <input
              :type="currentPasswordFieldType"
              id="currentPassword"
              v-model="form.currentPassword"
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors pr-10"
              autocomplete="current-password"
            />
            <button
              type="button"
              @click="toggleCurrentPasswordVisibility"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
            >
              <Icon :name="currentPasswordFieldType === 'password' ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="mb-6">
          <label for="newPassword" class="block text-sm font-medium text-gray-600">New Password</label>
          <div class="relative">
            <input
              :type="newPasswordFieldType"
              id="newPassword"
              v-model="form.newPassword"
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors pr-10"
              autocomplete="new-password"
            />
            <button
              type="button"
              @click="toggleNewPasswordVisibility"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
            >
              <Icon :name="newPasswordFieldType === 'password' ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-md hover:bg-orange-600 transition-colors duration-200 disabled:bg-gray-400"
        >
          <span v-if="loading">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
        
        <div v-if="successMessage" class="mt-4 text-green-600 text-center font-semibold">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="mt-4 text-red-600 text-center font-semibold">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '~/stores/user';

definePageMeta({
  middleware: ['auth-check'],
  layout: 'admin-layout',
  ssr: false, // ssr: false helps with components that rely on the DOM immediately
});

const userStore = useUserStore();
const toast = useNuxtApp().$toast;

// Define variables to hold success and error messages
const successMessage = ref(null);
const errorMessage = ref(null);
const loadingAdminDetails = ref(true);

const form = ref({
  name: '',
  email: '',
  currentPassword: '',
  newPassword: '',
});

const loading = ref(false);

const currentPasswordFieldType = ref('password')
const newPasswordFieldType = ref('password')

const toggleCurrentPasswordVisibility = () => {
  currentPasswordFieldType.value = currentPasswordFieldType.value === 'password' ? 'text' : 'password'
}
const toggleNewPasswordVisibility = () => {
  newPasswordFieldType.value = newPasswordFieldType.value === 'password' ? 'text' : 'password'
}

const fetchAdminDetails = async () => {
  if (!userStore.user || !userStore.user._id) {
    toast.error('User not authenticated.');
    loadingAdminDetails.value = false;
    return;
  }

  try {
    const response = await $fetch('/api/user/profile');
    form.value.name = response.user.name;
    form.value.email = response.user.email;
  } catch (error) {
    console.error('Failed to fetch admin details:', error);
    toast.error('Failed to load user details.');
  } finally {
    loadingAdminDetails.value = false;
  }
};

const saveChanges = async () => {
  loading.value = true;
  
  if (!form.value.currentPassword) {
    toast.error('Please enter your current password to save changes.');
    loading.value = false;
    // Set the error message here
    errorMessage.value = 'Please enter your current password to save changes.';
    successMessage.value = null;
    return;
  }

  try {
    const body = {
      name: form.value.name,
      email: form.value.email,
      currentPassword: form.value.currentPassword,
    };
    
    if (form.value.newPassword) {
      body.newPassword = form.value.newPassword;
    }
    
    await $fetch('/api/user/profile', {
      method: 'PATCH',
      body: body,
    });
    
    toast.success('Your details have been updated successfully!');
    
    form.value.currentPassword = '';
    form.value.newPassword = '';

    // Set the success message here
    successMessage.value = 'Your details have been updated successfully!';
    errorMessage.value = null;

  } catch (error) {
    console.error('Error saving changes:', error);
    // Set the error message here
    errorMessage.value = error.data?.statusMessage || 'Failed to save changes. Please check your current password.';
    successMessage.value = null;

    toast.error(errorMessage.value);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAdminDetails();
});
</script>

<style scoped>
/* Scoped styles can be added here if needed */
</style>