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
    async fetchOrders() {
      const res = await $fetch('/api/order')
      this.orders = res
    }
  }
})