<template>
  <div class="min-h-screen flex items-center justify-center bg-white dark:bg-black text-center px-4">
    <div>
      <h1 class="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">
        {{ title }}
      </h1>
      <p v-if="status === 'verifying'" class="text-gray-600 dark:text-gray-300">
        Verifying your email...
      </p>
      <p v-if="status === 'success'" class="text-green-600 dark:text-green-400">
         Email verified! Redirecting to login...
      </p>
      <p v-if="status === 'error'" class="text-red-600 dark:text-red-400">
        ❌ Verification failed. Link may be invalid or expired.
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRoute, navigateTo } from '#imports'

const route = useRoute()
const status = ref('verifying')
const title = ref('Email Verification')

onMounted(async () => {
  const token = route.query.token
  const email = route.query.email

  if (!token || !email) {
    status.value = 'error'
    title.value = 'Invalid Link'
    return
  }

  try {
    const response = await $fetch('/api/auth/verify-email', {
      method: 'GET',
      query: { token, email }
    })

    if (response.status === 'success') {
      status.value = 'success'
      title.value = 'Verification Successful'
      setTimeout(() => navigateTo('/login'), 3000)
    } else {
      status.value = 'error'
      title.value = 'Verification Failed'
    }
  } catch (err) {
    status.value = 'error'
    title.value = 'Verification Failed'
  }
})

</script>
