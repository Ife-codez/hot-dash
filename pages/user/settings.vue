<template>
  <div class="container mx-auto p-4 md:p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Account Settings</h1>

    <section class="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">General Details</h2>
      <form @submit.prevent="handleGeneralDetailsUpdate" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-600">Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="detailsForm.name"
            class="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
          />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-600">Email Address</label>
          <input 
            type="email" 
            id="email" 
            v-model="detailsForm.email"
            class="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
          />
        </div>
        <div>
          <label for="location" class="block text-sm font-medium text-gray-600">Location</label>
          <input 
            type="text" 
            id="location" 
            v-model="detailsForm.location"
            class="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
          />
        </div>
        <button 
          type="submit" 
          class="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-md hover:bg-orange-600 transition-colors duration-200"
          :disabled="isUpdatingDetails"
        >
          {{ isUpdatingDetails ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </section>

    <section class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">Change Password</h2>
      <form @submit.prevent="handlePasswordUpdate" class="space-y-4">
        <div>
          <label for="currentPassword" class="block text-sm font-medium text-gray-600">Current Password</label>
          <div class="relative">
            <input
              :type="currentPasswordFieldType"
              id="currentPassword"
              v-model="passwordForm.currentPassword"
              class="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors pr-10" 
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
        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-600">New Password</label>
          <div class="relative">
            <input
              :type="newPasswordFieldType"
              id="newPassword"
              v-model="passwordForm.newPassword"
              class="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors pr-10" 
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
          class="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-md hover:bg-orange-600 transition-colors duration-200"
          :disabled="isUpdatingPassword"
        >
          {{ isUpdatingPassword ? 'Updating...' : 'Update Password' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth-check'],
  layout: 'user-layout'
});
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();
const toast = useNuxtApp().$toast;

const isUpdatingDetails = ref(false);
const isUpdatingPassword = ref(false);

const detailsForm = ref({
  name: '',
  email: '',
  location: '',
});
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
});

const currentPasswordFieldType = ref('password')
const newPasswordFieldType = ref('password')

const toggleCurrentPasswordVisibility = () => {
  currentPasswordFieldType.value = currentPasswordFieldType.value === 'password' ? 'text' : 'password'
}
const toggleNewPasswordVisibility = () => {
  newPasswordFieldType.value = newPasswordFieldType.value === 'password' ? 'text' : 'password'
}

const user = computed(() => userStore.user);

onMounted(() => {
  if (user.value) {
    detailsForm.value.name = user.value.name;
    detailsForm.value.email = user.value.email;
    detailsForm.value.location = user.value.location;
  }
});

const handleGeneralDetailsUpdate = async () => {
  try {
    isUpdatingDetails.value = true;
    const response = await $fetch('/api/user/update-profile', {
      method: 'POST',
      body: detailsForm.value,
    });
    userStore.setUser(response.user);
    toast.success('Details updated successfully!');
  } catch (err) {
    console.error('Error updating details:', err);
    toast.error(err?.data?.message || 'Failed to update details.');
  } finally {
    isUpdatingDetails.value = false;
  }
};

const handlePasswordUpdate = async () => {
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    toast.error('Both current and new passwords are required.');
    return;
  }
  
  try {
    isUpdatingPassword.value = true;
    await $fetch('/api/user/update-password', {
      method: 'POST',
      body: passwordForm.value,
    });
    toast.success('Password updated successfully!');
    passwordForm.value.currentPassword = '';
    passwordForm.value.newPassword = '';
  } catch (err) {
    console.error('Error updating password:', err);
    toast.error(err?.data?.message || 'Failed to update password.');
  } finally {
    isUpdatingPassword.value = false;
  }
};
</script>

<style scoped>

</style>