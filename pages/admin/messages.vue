<template>
  <div class="min-h-screen bg-white text-black flex flex-col">
    <div v-if="showUserList" class="flex-1 p-4 sm:p-6 lg:p-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-orange-500 mb-6">Diner Users</h1>
      <ul class="space-y-2">
        <li v-if="allUsers.length === 0" class="text-gray-600 italic">No diners found or still loading...</li>
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
          {{ user.name }}
        </li>
      </ul>
    </div>

    <div v-else-if="selectedUserId" class="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <div class="flex items-center mb-4">
        <button
          @click="goBackToUserList"
          class="bg-orange-500 text-white rounded-md px-4 py-2 text-sm sm:text-base hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200"
        >
          &larr; Back to Users
        </button>
        <h2 class="text-xl sm:text-2xl font-semibold text-orange-500 ml-4 truncate">
          Chatting with: {{ allUsers.find(u => u.id === selectedUserId)?.name || 'Loading...' }}
        </h2>
      </div>

      <div class="flex-1 overflow-y-auto border border-gray-300 rounded-md p-4 mb-4 bg-gray-50 flex flex-col space-y-3">
        <div v-for="(msg, index) in messages" :key="msg._id || index" class="flex" :class="{'justify-end': msg.senderId === (currentUser && currentUser._id)}">
          <div 
            class="max-w-[70%] p-3 rounded-lg text-sm sm:text-base"
            :class="{
              'bg-orange-500 text-white': msg.senderId === (currentUser && currentUser._id),
              'bg-gray-200 text-gray-800': msg.senderId !== (currentUser && currentUser._id),
              'rounded-bl-none': msg.senderId === (currentUser && currentUser._id),
              'rounded-br-none': msg.senderId !== (currentUser && currentUser._id)
            }"
          >
            <strong 
              :class="{
                'text-white': msg.senderId === (currentUser && currentUser._id),
                'text-gray-800': msg.senderId !== (currentUser && currentUser._id)
              }"
            >
              {{ msg.senderId === (currentUser && currentUser._id) ? 'You' : (allUsers.find(u => u.id === msg.senderId)?.name || msg.senderId) }}:
            </strong>
            {{ msg.message }}
            <span class="block text-right text-xs mt-1" :class="{'text-orange-100': msg.senderId === (currentUser && currentUser._id), 'text-gray-600': msg.senderId !== (currentUser && currentUser._id)}">
              {{ new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center">
        <input
          type="text"
          v-model="messageInput"
          @keyup.enter="sendMessage"
          placeholder="Type your message..."
          :disabled="wsStatus !== 'OPEN'"
          class="flex-1 p-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
        />
        <button
          @click="sendMessage"
          :disabled="wsStatus !== 'OPEN' || !messageInput.trim()"
          class="bg-orange-500 text-white rounded-md px-6 py-3 ml-3 text-sm sm:text-base hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Send
        </button>
      </div>
    </div>
    
    <div v-else class="flex-1 flex items-center justify-center p-4">
      <p class="text-center text-gray-600 text-lg">Select a user from the list to start chatting.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useWebSocket } from '@vueuse/core';
import { useUserStore } from '~/stores/user';

definePageMeta({
  ssr: false
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