import { defineStore } from 'pinia';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    notifiedOrderIds: [], 
  }),
  getters: {
    unreadCount(state) {
      return state.notifications.filter(n => !n.read).length;
    }
  },
  actions: {
    addNotification(message, orderId, type = 'info') { 
      if (this.notifiedOrderIds.includes(orderId)) {
        return;
      }
      
      const newNotification = {
        id: Date.now(),
        orderId, 
        message,
        type,
        read: false,
        timestamp: new Date().toISOString(),
      };
      this.notifications.push(newNotification);
      this.notifiedOrderIds.push(orderId); // Store the ID to prevent duplicates
    },
    markAsRead(id) {
      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
      }
    },
    clearAll() {
      this.notifications = [];
    }
  },
  persist: true,
});