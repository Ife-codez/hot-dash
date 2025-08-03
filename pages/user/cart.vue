<template>
  <div class="min-h-screen bg-gray-50 text-black p-4 sm:p-6 lg:p-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-orange-500 mb-6 text-center">Your food cart</h1>

    <div class="max-w-3xl mx-auto space-y-8">
      <cartItemList />

      <deliveryForm v-model="deliveryDetails" />

      <div class="p-6 bg-white rounded-lg shadow-md border border-gray-100">
        <h2 class="text-xl font-bold text-orange-500 mb-4">Pricing Summary</h2>

        <div class="space-y-3 text-gray-700 text-sm">
          <div class="flex justify-between items-center">
            <span>Cart Total</span>
            <span class="font-semibold text-orange-600">₦{{ cartStore.totalAmount }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span>Package Fee</span>
            <span>₦{{ packageFee }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span>Charges</span>
            <span>₦{{ charges }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span>Delivery Fee</span>
            <span>₦{{ deliveryFee }}</span>
          </div>
        </div>

        <hr class="my-4 border-gray-200" />

        <div class="flex justify-between items-center text-xl font-bold text-gray-800">
          <span>Total</span>
          <span class="text-orange-600">₦{{ finalTotal }}</span>
        </div>
      </div>
      
      <div class="flex justify-between space-x-4">
        <button 
          @click="cartStore.clearCart()"
          class="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
        >
          Empty Cart
        </button>
        <button
          @click="handlePlaceOrder"
          class="flex-1 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
        >
          Place Order
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '~/stores/user'
import { useCartStore } from '~/stores/cart'
import { useOrderStore } from '~/stores/order'
import cartItemList from '~/components/cartItemList.vue'
import deliveryForm from '~/components/deliveryForm.vue'

definePageMeta({
  layout: 'user-layout'
});

const userStore = useUserStore(); // Corrected name to avoid conflict
const cartStore = useCartStore();
const orderStore = useOrderStore();

// Fixed prices for fees
const packageFee = ref(200);
const charges = ref(50);
const deliveryFee = ref(500);

// NEW: This ref will now be reactive and connected to the form
const deliveryDetails = ref({
  address: '',
  phone: '',
});

// Computed property for the final total
const finalTotal = computed(() => {
  return cartStore.totalAmount + packageFee.value + charges.value + deliveryFee.value;
});

const handlePlaceOrder = async () => {
  if (cartStore.items.length === 0) {
    alert('Your cart is empty. Please add items before placing an order.');
    return;
  }
  
  // You now get the userId directly from the store
  // Assuming your user store has a 'user' object with an '_id' property
  const userId = userStore.user?._id; 
  if (!userId) {
    alert('You must be logged in to place an order.');
    // Optional: Redirect to login page
    // useRouter().push('/login');
    return;
  }
  
  // Check if delivery details are filled
  if (!deliveryDetails.value.address || !deliveryDetails.value.phone) {
    alert('Please provide your full address and phone number.');
    return;
  }

  const orderData = {
    userId: userId,
    items: cartStore.items.map(cartItem => ({
      item: cartItem._id,
      quantity: cartItem.quantity,
    })),
    totalAmount: finalTotal.value,
    deliveryAddress: deliveryDetails.value.address,
    deliveryPhone: deliveryDetails.value.phone,
    status: 'pending'
  };
  
  try {
    await orderStore.placeOrder(orderData);
    
    cartStore.clearCart();
    alert('Your order has been placed successfully!');
    // Optional: Reset form fields
    deliveryDetails.value = { address: '', phone: '' };
    
  } catch (error) {
    console.error('Failed to place order:', error);
    alert('Failed to place order. Please try again.');
  }
};
</script>