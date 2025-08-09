import { defineStore } from 'pinia';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    notifiedOrderIds: [], // NEW: Keep a list of order IDs we've already notified about
  }),
  getters: {
    unreadCount(state) {
      return state.notifications.filter(n => !n.read).length;
    }
  },
  actions: {
    addNotification(message, orderId, type = 'info') { // UPDATED: Accept an orderId
      if (this.notifiedOrderIds.includes(orderId)) {
        return; // Don't add if we've already notified for this order
      }
      
      const newNotification = {
        id: Date.now(),
        orderId, // NEW: Store the order ID
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