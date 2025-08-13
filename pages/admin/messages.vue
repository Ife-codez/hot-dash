<template>
  <div class="flex h-full lg:h-[calc(100vh-12rem)] bg-white">

    <div 
      v-show="showUserList"
      class="w-full lg:w-1/3 flex flex-col lg:border-r border-gray-200"
    >
      <div class="p-3 lg:border-b border-gray-200">
        <h1 class="text-xl font-bold text-orange-500">Diner Users</h1>
      </div>
      <div class="flex-1 overflow-y-auto p-3">
        <ul class="space-y-2">
          <li v-if="allUsers.length === 0" class="text-gray-600 italic p-3">No diners found or still loading...</li>
          <li
            v-for="user in allUsers"
            :key="user.id"
            @click="selectUserToChat(user.id)"
            :class="{
              'cursor-pointer p-3 rounded-md transition-colors duration-200': true,
              'bg-orange-100 text-orange-800 font-semibold': selectedUserId === user.id,
              'bg-gray-50 hover:bg-gray-100': selectedUserId !== user.id
            }"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  v-if="user.avatar"
                  :src="user.avatar"
                  :alt="`Profile picture of ${user.name}`"
                  class="object-cover w-full h-full"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500"
                >
                  <Icon name="mdi:account-circle" class="w-8 h-8" />
                </div>
              </div>
              <span class="truncate">{{ user.name }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div
      v-show="!showUserList"
      class="w-full flex-1 flex flex-col"
    >
      <div v-if="selectedUserId">
        <div class="flex items-center p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
          <button
            @click="goBackToUserList"
            class="lg:hidden text-gray-600 hover:text-gray-800 mr-4"
          >
            <Icon name="mdi:arrow-left" class="w-6 h-6" />
          </button>
          <h2 class="text-lg font-semibold text-gray-800 truncate">
            {{ allUsers.find(u => u.id === selectedUserId)?.name || 'Loading...' }}
          </h2>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-3 h-full">
          <div v-if="messages.length === 0" class="flex items-center justify-center h-full">
            <p class="text-center text-gray-500 italic">Start a conversation!</p>
          </div>
          <div v-for="(msg, index) in messages" :key="msg._id || index" class="flex" :class="{'justify-end': msg.senderId === (currentUser && currentUser._id)}">
            <div 
              class="max-w-[70%] p-3 rounded-xl shadow-md text-sm"
              :class="{
                'bg-orange-500 text-white rounded-br-none': msg.senderId === (currentUser && currentUser._id),
                'bg-gray-200 text-gray-800 rounded-bl-none': msg.senderId !== (currentUser && currentUser._id)
              }"
            >
              {{ msg.message }}
              <span class="block text-right text-xs mt-1" :class="{'text-orange-100': msg.senderId === (currentUser && currentUser._id), 'text-gray-600': msg.senderId !== (currentUser && currentUser._id)}">
                {{ new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-3 border-t border-gray-200 bg-white sticky bottom-0">
          <div class="flex items-center">
            <input
              type="text"
              v-model="messageInput"
              @keyup.enter="sendMessage"
              placeholder="Type your message..."
              :disabled="wsStatus !== 'OPEN'"
              class="flex-1 p-3 border border-gray-300 rounded-full text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
            />
            <button
              @click="sendMessage"
              :disabled="wsStatus !== 'OPEN' || !messageInput.trim()"
              class="bg-orange-500 text-white rounded-full p-3 ml-3 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 disabled:bg-gray-400"
            >
              <Icon name="mdi:send" class="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
       <div v-else class="flex items-center justify-center h-full p-3">
        <p class="text-center text-gray-600 text-lg">Select a user to start chatting.</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useWebSocket } from '@vueuse/core';
import { useUserStore } from '~/stores/user';

definePageMeta({
  middleware: ['auth-check'],
  layout: 'admin-layout',
  ssr: false,
});

const userStore = useUserStore();
const currentUser = ref(userStore.user);

const wsUrl = ref('');

const wsStatus = ref('CLOSED');
const wsSend = ref(null);
const wsData = ref(null); // Keep if you use wsData, otherwise can remove

let wsInstance = null;

const selectedUserId = ref(null);
const messages = ref([]);
const messageInput = ref('');

const allUsers = ref([]);
const chatHistories = ref(new Map());

const showUserList = ref(true); // Controls which view is active

const authenticateWebSocket = () => {
  if (currentUser.value && currentUser.value._id && currentUser.value.role && wsStatus.value === 'OPEN' && wsSend.value) {
    wsSend.value(JSON.stringify({
      type: 'authenticate',
      userId: currentUser.value._id,
      role: currentUser.value.role
    }));
  }
};

const fetchUserChatHistory = async (userId) => {
  if (!currentUser.value || !currentUser.value._id || !userId) {
    return;
  }

  // If history is already in cache, no need to refetch
  if (chatHistories.value.has(userId) && chatHistories.value.get(userId).length > 0) {
      return;
  }

  try {
    const response = await fetch(`/api/messages?user1Id=${currentUser.value._id}&user2Id=${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const history = await response.json();
    chatHistories.value.set(userId, history);
  } catch (error) {
    console.error(`Failed to fetch chat history for user ${userId}:`, error);
  }
};

const selectUserToChat = async (userId) => {
  selectedUserId.value = userId;
  showUserList.value = false; // Switch to chat view

  if (currentUser.value && currentUser.value._id) {
    await fetchUserChatHistory(userId);
  }

  // Ensure an empty array if history fetch failed or none exists
  if (!chatHistories.value.has(userId)) {
    chatHistories.value.set(userId, []);
  }
  messages.value = chatHistories.value.get(userId);
  
  // Scroll to bottom of chat after messages are loaded and rendered
  await nextTick(() => {
    const chatContainer = document.querySelector('.flex-1.overflow-y-auto');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });
};

const goBackToUserList = () => {
  selectedUserId.value = null;
  messages.value = []; // Clear messages when going back
  showUserList.value = true; // Switch back to user list view
};

const initializeWebSocket = () => {
  // Prevent re-initialization
  if (wsInstance) return;

  const { status, data, send, open, close } = useWebSocket(wsUrl.value, {
    immediate: false,
    onConnected: () => {
      wsStatus.value = status.value;
      authenticateWebSocket();
    },
    onDisconnected: () => {
      wsStatus.value = status.value;
    },
    onError: (webSocket, event) => {
      console.error('Admin WS Error:', event);
      wsStatus.value = status.value;
    },
    onMessage: (webSocket, event) => {
      try {
        if (typeof event.data !== 'string' || event.data.trim() === '') {
          return;
        }

        const parsedData = JSON.parse(event.data);

        if (parsedData.type === 'chat') {
          const targetUserId = parsedData.senderId === currentUser.value._id ? parsedData.recipientId : parsedData.senderId;
          
          if (!chatHistories.value.has(targetUserId)) {
            chatHistories.value.set(targetUserId, []);
          }
          chatHistories.value.get(targetUserId).push(parsedData);

          // Only update `messages.value` if the currently selected user is the target
          if (targetUserId === selectedUserId.value) {
            messages.value = chatHistories.value.get(targetUserId);
            nextTick(() => {
                const chatContainer = document.querySelector('.flex-1.overflow-y-auto');
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            });
          }
        }
      } catch (e) {
        console.error('Failed to parse Admin WS message:', event.data, e);
      }
    },
  });
  
  wsStatus.value = status.value;
  wsSend.value = send;
  wsData.value = data.value;

  wsInstance = { open, close };
  wsInstance.open();
};

const sendMessage = async () => {
  if (messageInput.value.trim() && wsStatus.value === 'OPEN' && wsSend.value && selectedUserId.value && currentUser.value && currentUser.value._id) {
    const chatMessage = {
      type: 'chatMessage',
      senderId: currentUser.value._id,
      recipientId: selectedUserId.value,
      message: messageInput.value.trim(),
    };
    wsSend.value(JSON.stringify(chatMessage));
    messageInput.value = '';
    
    // Scroll after sending and potentially new message is added
    await nextTick(() => {
      const chatContainer = document.querySelector('.flex-1.overflow-y-auto');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  } else if (!selectedUserId.value) {
    alert('Please select a user to chat with.');
  } else if (wsStatus.value !== 'OPEN') {
    alert('WebSocket is not open. Please wait for connection or refresh.');
  } else if (!currentUser.value || !currentUser.value._id) {
    alert('Admin user data not available for sending messages. Please log in.');
  }
};

onMounted(async () => {
  wsUrl.value = `ws://${window.location.host}/_ws`;
  initializeWebSocket();

  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allUsers.value = await response.json();
  } catch (error) {
    console.error('Failed to fetch diner users:', error);
  }
});

onUnmounted(() => {
  if (wsInstance) {
    wsInstance.close();
  }
});

watch(() => userStore.user, (newUserDetails) => {
  currentUser.value = newUserDetails;
  authenticateWebSocket();
  // If a user is already selected when the admin user details load,
  // try to fetch their history
  if (newUserDetails && newUserDetails._id && selectedUserId.value) {
      fetchUserChatHistory(selectedUserId.value);
  }
}, { immediate: true });
</script>

<style scoped>
/* You can add any custom CSS here that cannot be achieved with Tailwind */
</style>