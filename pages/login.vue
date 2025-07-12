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
        <input type="password" id="password" v-model="loginData.password" placeholder="Enter password" required />
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

// toast from plugin
const toast = useNuxtApp().$toast
const router = useRouter()

// login form model
const loginData = ref({
  email: '',
  password: ''
})

// login handler
const handleLogin = async () => {
  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { ...loginData.value }
    })

    // ✅ Store user in Pinia (optional, covered later)
    // e.g., useUserStore().setUser(res.user)

    toast.success(res.message || 'Logged in successfully!')

    // redirect based on role
    router.push(res.redirect || '/user-dashboard')
  } catch (error) {
    toast.error(error?.data?.message || 'Login failed. Try again.')
  }
}
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
