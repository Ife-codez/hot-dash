import { defineStore } from 'pinia'
export const useMenuStore = defineStore('menu', {
  state: () => ({
    items: []
  }),
  actions: {
    async fetchMenu() {
      const res = await $fetch('/api/menu')
      this.items = res
    }
  }
})