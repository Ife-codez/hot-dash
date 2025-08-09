import { useOrderStore } from '~/stores/order';
import { useUserStore } from '~/stores/user';

export default defineNuxtPlugin({
  name: 'fetch-orders-on-load',
  setup() {
    const orderStore = useOrderStore();
    const userStore = useUserStore();

    // Watch for the user to be available and fetch the orders once
    watch(() => userStore.user?._id, async (newUserId) => {
      if (newUserId) {
        console.log('User ID found. Fetching orders globally...');
        await orderStore.fetchOrders(newUserId);
      }
    }, { immediate: true });
  }
});