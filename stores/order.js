import { defineStore } from 'pinia'
export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: []
  }),
  actions: {
    async placeOrder(orderData) {
      const res = await $fetch('/api/order', {
        method: 'POST',
        body: orderData
      })
      this.orders.push(res)
    },
    async fetchOrders(userId = null) {
      // If a userId is provided, add it to the query parameters
      const url = userId ? `/api/order?userId=${userId}` : '/api/order';
      const res = await $fetch(url);
      this.orders = res;
    }
  }
})