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
    }
  }
})
