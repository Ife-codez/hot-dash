<template>
  <div class="min-h-screen bg-orange-500 text-white flex flex-col items-center px-6 py-10">
    <div class="flex-1 flex flex-col items-center gap-12 mt-6">
      <div class="w-60 h-60">
        <img
          src="/images/food-plate.png"
          alt="food-plate"
          class="w-full h-full rounded-full object-cover drop-shadow-lg"
        />
      </div>

      <div class="text-center space-y-2">
        <h1 class="text-2xl font-bold">Fast Delivery At Your Doorstep</h1>
        <p class="text-lg md:text-xl">Home delivery and online reservation system for restaurants & cafes</p>
      </div>
    </div>

    <div class="w-full max-w-md mt-10">
      <button class="w-full bg-white text-orange-500 py-3 rounded-xl text-lg font-semibold" @click="goToSignup">
        Get Started
      </button>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()

const goToSignup = () => {
  router.push('/signup')
}

</script>

<style lang="scss" scoped>

</style>