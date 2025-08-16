import { defineStore } from 'pinia'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    items: []
  }),
  actions: {
    async fetchCategories() {
      const res = await $fetch('/api/category')
      this.items = res
      
      return this.items; // <--- This is the key addition
    }
  }
})