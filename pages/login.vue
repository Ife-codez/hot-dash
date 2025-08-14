<template>
  <div class="min-h-screen flex flex-col items-center bg-orange-500 px-6 py-10">
    <h1 class="text-3xl font-semibold text-white mb-8">Login</h1>

    <form class="flex flex-col space-y-5 w-full max-w-md" @submit.prevent="handleLogin">
      <div class="flex flex-col space-y-1">
        <label for="email" class="text-white">Email Address:</label>
        <input type="email" id="email" v-model="loginData.email" placeholder="Enter email address" required />
      </div>

      <div class="flex flex-col space-y-1">
        <label for="password" class="text-white">Password:</label>
        <div class="relative">
          <input
            :type="passwordFieldType"
            id="password"
            v-model="loginData.password"
            placeholder="Enter password"
            required
            class="pr-10"
          />
          <button
            type="button"
            @click="togglePasswordVisibility"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
          >
            <Icon :name="passwordFieldType === 'password' ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" class="w-5 h-5" />
          </button>
        </div>
      </div>
      <div>
        <button
          type="submit"
          class="mt-6 bg-white text-orange-500 py-3 rounded-xl text-lg font-semibold w-full"
        >
          Log In
        </button>
      </div>
    </form>

    <div class="mt-6 text-white text-center">
      <p>Don't have an account?</p>
      <NuxtLink to="/signup" class="underline">Sign up</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'

const toast = useNuxtApp().$toast
const userStore = useUserStore()

const loginData = ref({
  email: '',
  password: ''
})

const passwordFieldType = ref('password')

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
}

const handleLogin = async () => {
  let redirectPath = '/';
  
  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { ...loginData.value }
    });

    if (res.user) {
      userStore.setUser(res.user);
    }
    
    redirectPath = res.redirect || '/user/dashboard';
    
    toast.success(res.message || 'Logged in successfully!');

  } catch (error) {
    toast.error(error?.data?.statusMessage || 'Login failed. Try again.');
    return;
  }

  await navigateTo(redirectPath, { replace: true, external: true });
};
</script>

<style scoped>
input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid orange;
  border-radius: 0.5rem;
  outline: none;
}
input:focus {
  transition: box-shadow 0.2s ease;
  box-shadow: 0 0 0 3px rgba(244, 162, 97, 0.6);
  border-color: #f4a261;
}
</style>