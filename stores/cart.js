import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  persist: true,
  getters: {
    totalAmount: (state) =>
      state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),

    totalItems: (state) =>
      state.items.reduce((sum, i) => sum + i.quantity, 0)
  },

  actions: {
    addToCart(item) {
      const existing = this.items.find(i => i._id === item._id)
      
      if(existing) {
        existing.quantity += 1
      } else {
        this.items.push({ ...item, quantity: 1 })
      }
    },
    
    incrementQuantity(itemId) {
      const item = this.items.find(i => i._id === itemId);
      if (item) {
        item.quantity++;
      }
    },

    decrementQuantity(itemId) {
      const item = this.items.find(i => i._id === itemId);
      if (item && item.quantity > 1) {
        item.quantity--;
      } else if (item && item.quantity === 1) {
        // If quantity is 1, remove the item entirely
        this.removeFromCart(itemId);
      }
    },
    
    removeItem(id) {
      this.items = this.items.filter(i => i._id !== id)
    },
    
    clearCart() {
      this.items = []
    }
  }, 
})