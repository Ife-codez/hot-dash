<template>
  <div>
    <!-- <UserNav /> -->
    <div class="mt-4 px-4">
      <h2 class="text-lg font-semibold text-orange-500">
        Hi {{ user?.name || 'Guest' }} 
      </h2>
      <p class="text-2xl font-semibold">Find your food</p>
    </div>
    <searchButton />
    <categoryScroll />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'user-layout',
})

import { useUserStore } from '~/stores/user'
const userStore = useUserStore()
const user = userStore.user

</script>


<style lang="scss" scoped>

</style>