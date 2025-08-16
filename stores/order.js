import { defineStore } from 'pinia';
import { useNotificationsStore } from './notification';

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: []
  }),
  actions: {
    async placeOrder(orderData) {
      const res = await $fetch('/api/order', {
        method: 'POST',
        body: orderData
      });
      this.orders.push(res);
      // It's a good practice to return the new order data
      return res;
    },
    async fetchOrders(userId = null) {
      const notificationsStore = useNotificationsStore();
      
      const url = userId ? `/api/order?userId=${userId}` : '/api/order';
      const res = await $fetch(url);
      
      this.orders = res;

      // NEW: Check for delivered orders and create a notification if we haven't already
      if (userId) {
        this.orders.forEach(order => {
          if (order.status === 'delivered') {
            const message = `Your order #${order._id.substring(18)} has been delivered!`;
            notificationsStore.addNotification(message, order._id, 'success');
          }
        });
      }
      
      return this.orders; // <--- This is the key addition
    }
  },
  persist: true,
});