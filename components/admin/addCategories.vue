<template>
  <div class="p-6 max-w-xl mx-auto">
    <!-- Header -->
    <h2 class="text-xl font-bold mb-4">Add New Category</h2>

    <!-- Form to Create New Category -->
    <form @submit.prevent="createCategory">
      <input v-model="name" placeholder="Category name" class="border p-2 w-full mb-2 rounded" />
      <input v-model="description" placeholder="Description" class="border p-2 w-full mb-2 rounded" />
      <button class="bg-orange-500 text-white px-4 py-2 rounded">Create</button>
    </form>

    <p v-if="message" class="mt-2 text-sm text-green-600">{{ message }}</p>

    <!-- Existing Categories List -->
    <h3 class="text-lg font-semibold mt-6">Existing Categories</h3>
    <ul class="mt-2 space-y-2">
      <li v-for="cat in categories" :key="cat._id" class="flex justify-between items-center bg-gray-100 p-2 rounded">
        <span class="font-medium">{{ cat.name }}</span>
        <button @click="openEditModal(cat)" class="text-orange-500 hover:underline text-sm">Update</button>
      </li>
    </ul>

    <!-- Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-11/12 max-w-md">
        <h3 class="text-lg font-bold mb-4">Edit Category</h3>
        <form @submit.prevent="updateCategory">
          <input v-model="editedCategory.name" placeholder="Category name" class="border p-2 w-full mb-2 rounded" />
          <input v-model="editedCategory.description" placeholder="Description" class="border p-2 w-full mb-2 rounded" />
          <div class="flex justify-end space-x-2">
            <button type="button" @click="closeModal" class="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" class="bg-orange-500 text-white px-4 py-2 rounded">Update</button>
            <button type="button" @click="showConfirmDelete = true" class="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div v-if="showConfirmDelete" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-11/12 max-w-md text-center">
        <h3 class="text-lg font-bold mb-4">Confirm Delete</h3>
        <p>Are you sure you want to delete <strong>{{ editedCategory.name }}</strong>?</p>
        <div class="flex justify-center mt-4 space-x-4">
          <button @click="showConfirmDelete = false" class="px-4 py-2 border rounded">Cancel</button>
          <button @click="deleteCategory" class="bg-red-600 text-white px-4 py-2 rounded">Yes, Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const name = ref('')
const description = ref('')
const message = ref('')
const categories = ref([])

const showModal = ref(false)
const showConfirmDelete = ref(false)

const editedCategory = ref({
  _id: '',
  name: '',
  description: ''
})

// Fetch categories from server
const fetchCategories = async () => {
  try {
    const res = await $fetch('/api/category')
    categories.value = res
  } catch (err) {
    console.error('Error fetching categories', err)
  }
}

// Create new category
const createCategory = async () => {
  try {
    const res = await $fetch('/api/category', {
      method: 'POST',
      body: { name: name.value, description: description.value }
    })
    message.value = res.message
    name.value = ''
    description.value = ''
    fetchCategories()
  } catch (err) {
    message.value = err.data?.message || 'Error creating category'
  }
}

// Open modal with selected category
const openEditModal = (cat) => {
  editedCategory.value = { ...cat }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  showConfirmDelete.value = false
}

// PUT request to update category
const updateCategory = async () => {
  try {
    const res = await $fetch(`/api/category/${editedCategory.value._id}`, {
      method: 'PUT',
      body: {
        name: editedCategory.value.name,
        description: editedCategory.value.description
      }
    })
    message.value = res.message
    closeModal()
    fetchCategories()
  } catch (err) {
    message.value = err.data?.message || 'Error updating category'
  }
}

// DELETE request
const deleteCategory = async () => {
  try {
    const res = await $fetch(`/api/category/${editedCategory.value._id}`, {
      method: 'DELETE'
    })
    message.value = res.message
    closeModal()
    fetchCategories()
  } catch (err) {
    message.value = err.data?.message || 'Error deleting category'
  }
}

onMounted(fetchCategories)
</script>
