<template>
  <div class="min-h-screen bg-gray-50 text-black p-4 sm:p-6 lg:p-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-orange-500 mb-6 text-center">My Orders</h1>

    <div v-if="pending" class="flex items-center justify-center h-40">
      <Icon name="mdi:loading" class="w-10 h-10 text-orange-500 animate-spin" />
    </div>

    <div v-else>
      <div class="mb-10">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Pending Orders</h2>
        <div class="max-w-4xl mx-auto space-y-6">
          <div v-if="pendingOrders.length === 0" class="text-center text-gray-500">
            <p>You have no pending orders at the moment.</p>
          </div>
          <div v-else>
            <div 
              v-for="order in pendingOrders" 
              :key="order._id" 
              class="bg-white p-6 rounded-lg shadow-md border border-gray-100"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-bold text-gray-800">Order #{{ order._id.substring(18) }}</h3>
                  <p class="text-sm text-gray-500">Ordered at: {{ new Date(order.orderedAt).toLocaleString() }}</p>
                </div>
                <span class="text-lg font-bold text-orange-500">₦{{ order.totalAmount }}</span>
              </div>

              <div class="mb-4">
                <p class="font-semibold text-gray-700">Delivery Information:</p>
                <p class="text-sm text-gray-600">Address: {{ order.deliveryAddress }}</p>
                <p class="text-sm text-gray-600">Phone: {{ order.deliveryPhone }}</p>
              </div>

              <hr class="border-gray-200 my-4" />

              <div class="mb-4">
                <p class="font-semibold text-gray-700 mb-2">Items:</p>
                <ul class="space-y-2">
                  <li v-for="item in order.items" :key="item._id" class="flex justify-between text-sm text-gray-600">
                    <span>{{ item.item?.name }} (x{{ item.quantity }})</span>
                    <span>₦{{ item.item?.price * item.quantity }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-xl font-bold text-gray-800 mb-4">Delivered Orders</h2>
        <div class="max-w-4xl mx-auto space-y-6">
          <div v-if="deliveredOrders.length === 0" class="text-center text-gray-500">
            <p>You have no delivered orders yet.</p>
          </div>
          <div v-else>
            <div 
              v-for="order in deliveredOrders" 
              :key="order._id" 
              class="bg-white p-6 rounded-lg shadow-md border border-gray-100 opacity-70"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-bold text-gray-800">Order #{{ order._id.substring(18) }}</h3>
                  <p class="text-sm text-gray-500">Delivered at: {{ new Date(order.orderedAt).toLocaleString() }}</p>
                </div>
                <span class="text-lg font-bold text-orange-500">₦{{ order.totalAmount }}</span>
              </div>

              <div class="mb-4">
                <p class="font-semibold text-gray-700">Delivery Information:</p>
                <p class="text-sm text-gray-600">Address: {{ order.deliveryAddress }}</p>
                <p class="text-sm text-gray-600">Phone: {{ order.deliveryPhone }}</p>
              </div>

              <hr class="border-gray-200 my-4" />

              <div class="mb-4">
                <p class="font-semibold text-gray-700 mb-2">Items:</p>
                <ul class="space-y-2">
                  <li v-for="item in order.items" :key="item._id" class="flex justify-between text-sm text-gray-600">
                    <span>{{ item.item?.name }} (x{{ item.quantity }})</span>
                    <span>₦{{ item.item?.price * item.quantity }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useOrderStore } from '~/stores/order';
import { useUserStore } from '~/stores/user';

definePageMeta({
  middleware: ['auth-check'],
  layout: 'user-layout'
});

const orderStore = useOrderStore();
const userStore = useUserStore();

// Use useAsyncData to fetch data before rendering
const { pending } = useAsyncData(
  'user-orders',
  () => orderStore.fetchOrders()
);

const pendingOrders = computed(() => {
  return orderStore.orders.filter(order => order.status === 'pending');
});

const deliveredOrders = computed(() => {
  return orderStore.orders.filter(order => order.status === 'delivered');
});
</script>

<style scoped>

</style>