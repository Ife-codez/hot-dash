<template>
  <div class="p-4 bg-white shadow rounded-xl mt-6">
    <h2 class="text-lg font-semibold mb-4">Add New Food Item</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <input v-model="form.name" type="text" placeholder="Food name" class="w-full p-2 border rounded" />
      <textarea v-model="form.description" placeholder="Description" class="w-full p-2 border rounded"></textarea>
      <input v-model.number="form.price" type="number" placeholder="Price" class="w-full p-2 border rounded" />

      <select v-model="form.category" class="w-full p-2 border rounded">
        <option value="" disabled>Select Category</option>
        <option v-for="cat in categoryStore.items" :key="cat._id" :value="cat._id">
          {{ cat.name }}
        </option>
      </select>

      <input v-model="form.imageUrl" type="text" placeholder="Image URL" class="w-full p-2 border rounded" />

      <div class="flex items-center gap-2">
        <input v-model="form.available" type="checkbox" id="available" />
        <label for="available">Available</label>
      </div>

      <button type="submit" class="bg-orange-500 text-white px-4 py-2 rounded">
        Add Food Item
      </button>
    </form>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { useMenuStore } from '@/stores/menu'

const categoryStore = useCategoryStore()
const menuStore = useMenuStore()
const toast = useNuxtApp().$toast

const form = ref({
  name: '',
  description: '',
  price: 0,
  category: '',
  imageUrl: '',
  available: true,
})

onMounted(() => {
  categoryStore.fetchCategories()
})

const handleSubmit = async () => {
  try {
    await menuStore.addMenuItem({ ...form.value })
    toast.success('Food item added!')
    form.value = { name: '', description: '', price: 0, category: '', imageUrl: '', available: true }
  } catch (err) {
    toast.error(err?.data?.message || 'Something went wrong')
  }
}
</script>
