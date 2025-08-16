<template>
  <div class="min-h-screen bg-gray-50 text-black p-4 sm:p-6 lg:p-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-orange-500 mb-6 text-center">Notifications</h1>

    <div class="max-w-3xl mx-auto">
      <div v-if="notificationsStore.notifications.length === 0" class="text-center text-gray-500 mt-20">
        <p>You have no new notifications.</p>
      </div>

      <div v-else class="bg-white rounded-lg shadow-md border border-gray-100 divide-y divide-gray-200">
        <div v-for="notification in notificationsStore.notifications" :key="notification.id" class="p-4 sm:p-6">
          <div class="flex items-start justify-between">
            <div>
              <p :class="['font-semibold', { 'text-gray-400': notification.read }]">
                <span v-if="notification.type === 'success'" class="text-green-500">
                  <i class="fa-solid fa-circle-check"></i>
                </span>
                {{ notification.message }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ new Date(notification.timestamp).toLocaleString() }}
              </p>
            </div>
            <button 
              v-if="!notification.read"
              @click="notificationsStore.markAsRead(notification.id)"
              class="text-xs text-orange-500 hover:underline"
            >
              Mark as Read
            </button>
          </div>
        </div>
      </div>

      <div v-if="notificationsStore.notifications.length > 0" class="text-center mt-6">
        <button 
          @click="notificationsStore.clearAll()"
          class="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 transition-colors"
        >
          Clear All Notifications
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth-check'],
  layout: 'user-layout'
});
import { useNotificationsStore } from '~/stores/notification';


const notificationsStore = useNotificationsStore();
</script>

<style scoped>

</style>