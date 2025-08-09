<template>
  <div class="flex flex-col flex-1 bg-white text-black p-4">
    <h1 class="text-2xl sm:text-3xl font-bold text-orange-500 mb-6 text-center">Chat with Admin</h1>

    <div class="flex-1 overflow-y-auto border border-gray-300 rounded-md p-4 mb-4 bg-gray-50 flex flex-col space-y-3">
      <div v-for="(msg, index) in messages" :key="msg._id || index" class="flex" :class="{'justify-end': msg.senderId === (currentUser && currentUser._id)}">
        <div 
          class="max-w-[80%] p-3 rounded-lg text-sm sm:text-base"
          :class="{
            'bg-orange-500 text-white': msg.senderId === (currentUser && currentUser._id),
            'bg-gray-200 text-gray-800': msg.senderId !== (currentUser && currentUser._id),
            'rounded-bl-none': msg.senderId === (currentUser && currentUser._id),
            'rounded-br-none': msg.senderId !== (currentUser && currentUser._id)
          }"
        >
          <span 
            :class="{
              'font-semibold': true,
              'text-white': msg.senderId === (currentUser && currentUser._id),
              'text-gray-800': msg.senderId !== (currentUser && currentUser._id)
            }"
          >
            </span>
          {{ msg.message }}
          <span class="block text-right text-xs mt-1" :class="{'text-orange-100': msg.senderId === (currentUser && currentUser._id), 'text-gray-600': msg.senderId !== (currentUser && currentUser._id)}">
            {{ new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex items-center mt-auto">
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
</template>

<script setup>
definePageMeta({
  ssr: false,
  middleware: ['auth-check'],
  layout: 'user-layout'
});
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useWebSocket } from '@vueuse/core';
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();
const currentUser = ref(userStore.user);

const ADMIN_USER_ID = '6881d15eb32e43cbadcb1a79'; // Ensure this matches your admin user's actual _id

const wsUrl = ref('');

const wsStatus = ref('CLOSED');
const wsSend = ref(null);
const wsData = ref(null);

let wsInstance = null;

const messages = ref([]);
const messageInput = ref('');

const authenticateWebSocket = () => {
  if (currentUser.value && currentUser.value._id && currentUser.value.role && wsStatus.value === 'OPEN' && wsSend.value) {
    wsSend.value(JSON.stringify({
      type: 'authenticate',
      userId: currentUser.value._id,
      role: currentUser.value.role
    }));
  }
};

const fetchChatHistory = async () => {
  if (!currentUser.value || !currentUser.value._id) {
    return;
  }

  try {
    const response = await fetch(`/api/messages?user1Id=${currentUser.value._id}&user2Id=${ADMIN_USER_ID}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const history = await response.json();
    messages.value = history;
    
    await nextTick(() => {
      const chatContainer = document.querySelector('.flex-1.overflow-y-auto');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  } catch (error) {
    console.error('Failed to fetch diner chat history:', error);
  }
};

const initializeWebSocket = () => {
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
      console.error('Diner WS Error:', event);
      wsStatus.value = status.value;
    },
    onMessage: (webSocket, event) => {
      try {
        if (typeof event.data !== 'string' || event.data.trim() === '') {
          return;
        }

        const parsedData = JSON.parse(event.data);

        if (parsedData.type === 'chat') {
          const isRelevantMessage = 
            (parsedData.senderId === (currentUser.value && currentUser.value._id) && parsedData.recipientId === ADMIN_USER_ID) ||
            (parsedData.senderId === ADMIN_USER_ID && parsedData.recipientId === (currentUser.value && currentUser.value._id));
          
          if (isRelevantMessage) {
            messages.value.push(parsedData);
            nextTick(() => {
                const chatContainer = document.querySelector('.flex-1.overflow-y-auto');
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            });
          }
        }
      } catch (e) {
        console.error('Failed to parse Diner WS message:', event.data, e);
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
  if (messageInput.value.trim() && wsStatus.value === 'OPEN' && wsSend.value && currentUser.value && currentUser.value._id) {
    const chatMessage = {
      type: 'chatMessage',
      senderId: currentUser.value._id,
      recipientId: ADMIN_USER_ID,
      message: messageInput.value.trim(),
    };
    wsSend.value(JSON.stringify(chatMessage));
    messageInput.value = '';

    await nextTick(() => {
      const chatContainer = document.querySelector('.flex-1.overflow-y-auto');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  } else if (wsStatus.value !== 'OPEN') {
    alert('WebSocket is not open. Please wait or refresh.');
  } else if (!currentUser.value || !currentUser.value._id) {
    alert('Your user ID is not available. Please log in.');
  }
};

onMounted(() => {
  wsUrl.value = `ws://${window.location.host}/_ws`;
  initializeWebSocket();
});

watch(() => userStore.user, async (newUserDetails) => {
  currentUser.value = newUserDetails;
  authenticateWebSocket();
  if (newUserDetails && newUserDetails._id) {
    await fetchChatHistory();
  }
}, { immediate: true });

onUnmounted(() => {
  if (wsInstance) {
    wsInstance.close();
  }
});
</script>

<style scoped>
/* No specific styles needed here, as Tailwind handles most of it
   and the layout should manage overall page height. */
</style>