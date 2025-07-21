<template>
  <div v-if="visible" class="mt-6 bg-gray-50 p-4 rounded shadow">
    <h3 class="text-lg font-semibold mb-4">All Menu Items</h3>

    <div v-if="loading">Loading menu items...</div>
    <div v-else-if="menuItems.length === 0">No menu items found.</div>

    <div v-else class="space-y-4">
      <div
        v-for="item in menuItems"
        :key="item._id"
        class="p-4 bg-white rounded shadow-sm"
      >
        <div class="flex items-start gap-4">
          <img :src="item.imageUrl" alt="food image" class="w-20 h-20 rounded object-cover" />
          <div class="flex-1">
            <h4 class="font-bold text-lg">{{ item.name }}</h4>
            <p class="text-sm text-gray-500">₦{{ item.price }}</p>
            <p class="text-sm">Available: {{ item.available ? 'Yes' : 'No' }}</p>
          </div>
        </div>

        <div class="mt-2 flex gap-2">
          <button
            class="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            @click="editItem(item)"
          >
            Update
          </button>
          <button
            class="px-3 py-1 bg-red-500 text-white rounded text-sm"
            @click="confirmDelete(item._id)"
          >
            Delete
          </button>
        </div>

        <div v-if="editingId === item._id" class="mt-4 space-y-2">
          <input v-model="editForm.name" type="text" class="w-full p-2 border rounded" />
          <input v-model.number="editForm.price" type="number" class="w-full p-2 border rounded" />
          <input type="file" @change="handleEditFileChange" class="w-full p-2 border rounded" />
          <div>
            <label>
              <input type="checkbox" v-model="editForm.available" />
              Available
            </label>
          </div>
          <button class="bg-green-500 text-white px-3 py-1 rounded" @click="saveChanges(item._id)">
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded shadow-md max-w-sm w-full">
        <p class="text-lg mb-4">Are you sure you want to delete this item?</p>
        <div class="flex justify-end gap-4">
          <button class="px-4 py-2 bg-gray-300 rounded" @click="showConfirmModal = false">
            Cancel
          </button>
          <button class="px-4 py-2 bg-red-500 text-white rounded" @click="deleteConfirmedItem">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMenuStore } from '@/stores/menu'
const menuStore = useMenuStore()
const toast = useNuxtApp().$toast

const props = defineProps({
  visible: Boolean,
})

const emit = defineEmits(['update:visible'])

const menuItems = ref([])
const loading = ref(false)
const editingId = ref(null)
const showConfirmModal = ref(false)
const itemToDelete = ref(null)

const editForm = ref({
  name: '',
  price: 0,
  available: true,
  image: null,
})

onMounted(() => {
  fetchMenuItems()
})

const fetchMenuItems = async () => {
  loading.value = true
  await menuStore.fetchMenu()
  menuItems.value = menuStore.items
  loading.value = false
}

const editItem = (item) => {
  editingId.value = item._id
  editForm.value = {
    name: item.name,
    price: item.price,
    available: item.available,
    image: null,
  }
}

const handleEditFileChange = (e) => {
  editForm.value.image = e.target.files[0]
}

const saveChanges = async (id) => {
  try {
    let imageUrl = null
    if (editForm.value.image) {
      const formData = new FormData()
      formData.append('image', editForm.value.image)

      const response = await $fetch('/api/menu/upload', {
        method: 'POST',
        body: formData,
      })

      imageUrl = response.secure_url
    }

    await menuStore.updateMenuItem(id, {
      name: editForm.value.name,
      price: editForm.value.price,
      available: editForm.value.available,
      ...(imageUrl && { imageUrl }),
    })

    toast.success('Item updated!')
    editingId.value = null
    fetchMenuItems()
  } catch (err) {
    toast.error('Failed to update item.')
  }
}

const confirmDelete = (id) => {
  itemToDelete.value = id
  showConfirmModal.value = true
}

const deleteConfirmedItem = async () => {
  try {
    await menuStore.deleteMenuItem(itemToDelete.value)
    toast.success('Item deleted!')
    fetchMenuItems()
  } catch (err) {
    toast.error('Failed to delete item.')
  } finally {
    showConfirmModal.value = false
    itemToDelete.value = null
  }
}
</script>
