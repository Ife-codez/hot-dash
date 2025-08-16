<template>
  <div class="min-h-screen bg-gray-50 text-black p-4 sm:p-6 lg:p-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-orange-500 mb-6 text-center">Pending Orders</h1>

    <div v-if="pending" class="text-center text-gray-500 mt-20">
      <p>Loading orders...</p>
    </div>

    <div v-else class="max-w-4xl mx-auto space-y-6">
      <div v-if="pendingOrders.length === 0" class="text-center text-gray-500 mt-20">
        <p>There are no new pending orders at the moment.</p>
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
            <p class="font-semibold text-gray-700">Customer:</p>
            <p v-if="order.userId" class="text-sm text-gray-600">
              {{ order.userId?.name }} 
              ({{ order.userId?.email }})
            </p>
            <p v-else class="text-sm text-gray-600">Customer information not available</p>
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
          
          <div class="text-right">
            <button 
              @click="markAsDelivered(order._id)"
              class="py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
            >
              Mark as Delivered
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOrderStore } from '~/stores/order';

definePageMeta({
  middleware: ['auth-check'],
  layout: 'admin-layout',
});

const orderStore = useOrderStore();

// Use useAsyncData to fetch orders on the server and client
const { pending } = useAsyncData(
  'admin-orders',
  () => orderStore.fetchOrders()
);

const pendingOrders = computed(() => {
  return orderStore.orders.filter(order => order.status === 'pending');
});

const markAsDelivered = async (orderId) => {
  try {
    const response = await $fetch(`/api/order/${orderId}`, {
      method: 'PATCH',
      body: { status: 'delivered' }
    });
    // Re-fetch orders to update the list
    await orderStore.fetchOrders();
    toast.success('Order marked as delivered!');
  } catch (error) {
    console.error('Failed to mark order as delivered:', error);
    toast.error('Failed to update order status. Please try again.');
  }
};
</script>

<style scoped>

</style>