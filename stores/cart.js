import { defineStore } from 'pinia'
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  getters: {
    totalAmount: (state) =>
      state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  },
  actions: {
    addToCart(item) {
      const existing = this.items.find(i => i._id === this.items._id)
      if(existing) {
        existing.quantity += 1
      } else {
        this.items.push({ ...item, quantity: 1 })
      }
    },
    removeFromCart(id) {
      this.items = this.items.filter(i => i._id !== id)
    },
    clearCart() {
      this.items = []
    }
  }
})