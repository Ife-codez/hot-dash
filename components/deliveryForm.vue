<template>
  <div class="bg-white p-6 rounded-lg shadow-md border border-gray-100">
    <h2 class="text-xl font-bold text-orange-500 mb-4">Delivery details</h2>

    <div class="space-y-4">
      <div>
        <label for="address" class="block text-sm font-medium">Full Address</label>
        <input
          id="address"
          :value="modelValue.address"
          @input="$emit('update:modelValue', { ...modelValue, address: $event.target.value })"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-all duration-200 p-2"
          placeholder="Enter description"
        />
      </div>

      <div>
        <label for="phone" class="block text-sm font-medium">Phone Number</label>
        <input
          id="phone"
          type="tel"
          :value="modelValue.phone"
          @input="$emit('update:modelValue', { ...modelValue, phone: $event.target.value })"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-all duration-200 p-2"
          placeholder="Enter phone"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// Define the props and emits for v-model
defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
/* No specific styles needed as Tailwind handles everything */
</style>