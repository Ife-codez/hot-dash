<template>
  <div class="min-h-screen flex flex-col items-center bg-orange-500 px-6 py-10">
    <h1 class="text-3xl font-semibold text-white mb-8">Sign up</h1>

    <form class="flex flex-col space-y-5 w-full max-w-md" @submit.prevent="handleSignup">
      <div class="flex flex-col space-y-1">
        <label for="name" class="text-white">Name:</label>
        <input type="text" id="name" v-model="userData.name" placeholder="Please enter your name" required />
      </div>

      <div class="flex flex-col space-y-1">
        <label for="email" class="text-white">Email Address:</label>
        <input type="email" id="email" v-model="userData.email" placeholder="Enter email address" required />
      </div>

      <div class="flex flex-col space-y-1">
        <label for="location" class="text-white">Location:</label>
        <input type="text" id="location" v-model="userData.location" placeholder="State/City" required />
      </div>

      <div class="flex flex-col space-y-1">
        <label for="password" class="text-white">Password:</label>
        <input type="password" id="password" v-model="userData.password" placeholder="Create a password" required />
      </div>
      <div>
        <button
          type="submit"
          class="mt-6 bg-white text-orange-500 py-3 rounded-xl text-lg font-semibold w-full"
        >
          Sign up
        </button>
      </div>
    </form>

    <div class="mt-6 text-white text-center">
      <p>Already have an account?</p>
      <NuxtLink to="/login" class="underline">Log in</NuxtLink>
    </div>
  </div>
</template>

<script setup>
const toast = useNuxtApp().$toast
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const userData = ref({
  name: '',
  email: '',
  location: '',
  password: '',
})

const handleSignup = async () => {
  try {
    const res = await $fetch('/api/auth/signup', {
      method: 'POST',
      body: { ...userData.value }
    })

    toast.success(res.message || 'Account created. Check your email to verify.')
    userData.value = { name: '', email: '', location: '', password: '' }

  } catch (error) {
    toast.error(error?.data?.message || 'Signup failed. Try again.')
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
