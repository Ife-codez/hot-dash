import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    items: []
  }),
  actions: {
    async fetchMenu() {
      this.items = await $fetch('/api/menu')
    },
    async addMenuItem(itemData) {
      const res = await $fetch('/api/menu', {
        method: 'POST',
        body: itemData
      })
      this.items.push(res.item)
    },
    async updateMenuItem(id, updatedData) {
      const res = await $fetch(`/api/menu/${id}`, {
        method: 'PUT',
        body: updatedData
      })

      // Update item in state
      const index = this.items.findIndex(item => item._id === id)
      if (index !== -1) this.items[index] = res.item
    },
    async deleteMenuItem(id) {
      await $fetch(`/api/menu/${id}`, {
        method: 'DELETE'
      })

      // Remove item from state
      this.items = this.items.filter(item => item._id !== id)
    }
  }
})
