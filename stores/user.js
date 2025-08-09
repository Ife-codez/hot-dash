import { defineStore } from 'pinia'
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null 
  }),
  actions: {
    setUser(data) {
      this.user = data
    },
    updateAvatar(avatarUrl) {
      if (this.user) {
         this.user.avatar = avatarUrl;
      }
    },
    logout() { 
      this.user = null; 
      
    }
  },
  persist: true
})