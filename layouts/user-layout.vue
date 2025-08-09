<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-white shadow-sm">
      <userNav />
    </header>
    
    <!-- Main Content -->
    <main class="flex-1 pb-4"> 
      <div v-if="pending" class="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <Icon name="mdi:loading" class="w-10 h-10 text-orange-500 animate-spin" />
      </div>
      <div v-else>
        <slot />
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="w-full bg-white border-t py-4 text-center shadow-inner">
      <footerNav />
    </footer>
  </div>
</template>

<script setup>
import { useUserStore } from '~/stores/user';
import footerNav from '~/components/footerNav.vue';
import userNav from '~/components/userNav.vue';

const userStore = useUserStore();
const token = useCookie('auth_token');

if (!token.value) {
  userStore.logout();
}

const { data, error, pending } = await useFetch(
  token.value ? '/api/user/profile' : null,
  { watch: false, key: 'user-profile' }
);

if (data.value?.user) {
  userStore.setUser(data.value.user);
}

if (error.value?.statusCode === 401) {
  console.error('Invalid token:', error.value);
  userStore.logout();
  token.value = null;
}
</script>
