<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useWebSocket } from '@vueuse/core';
import { useUserStore } from '~/stores/user'; // Adjust path if your store is elsewhere

// Ensure this page is client-side only
definePageMeta({
  ssr: false
});

const userStore = useUserStore();
const currentUser = ref(userStore.user);

const ADMIN_USER_ID = '6881d15eb32e43cbadcb1a79'; // Ensure this matches your admin user's actual _id

const wsUrl = ref(''); // Will be set in onMounted (client-side)

// Store the useWebSocket instance properties directly as refs
const wsStatus = ref('CLOSED');
const wsSend = ref(null);
const wsData = ref(null);

let wsInstance = null; // Holds the useWebSocket instance methods (open, close)

const messages = ref([]);
const messageInput = ref('');

// Function to handle authentication
const authenticateWebSocket = () => {
  if (currentUser.value && currentUser.value._id && currentUser.value.role && wsStatus.value === 'OPEN' && wsSend.value) {
    wsSend.value(JSON.stringify({
      type: 'authenticate',
      userId: currentUser.value._id,
      role: currentUser.value.role
    }));
    console.log(`WebSocket authenticated as ${currentUser.value.role} ${currentUser.value._id}`);
  } else {
    console.log('Authentication conditions not met yet.', { 
      hasUser: !!currentUser.value, 
      wsStatus: wsStatus.value, 
      hasSend: !!wsSend.value 
    });
  }
};

// Function to initialize WebSocket only on client
const initializeWebSocket = () => {
  if (wsInstance) return; // Prevent re-initialization

  const { status, data, send, open, close } = useWebSocket(wsUrl.value, {
    immediate: false, // We'll call open() explicitly
    onConnected: () => {
      console.log('Diner WS: Connected!');
      wsStatus.value = status.value; // Update local status
      authenticateWebSocket(); // <--- CRITICAL: AUTHENTICATE HERE AFTER CONNECTION IS ESTABLISHED
    },
    onDisconnected: () => {
      console.log('Diner WS: Disconnected!');
      wsStatus.value = status.value; // Update local status
    },
    onError: (webSocket, event) => {
      console.error('Diner WS Error:', event);
      wsStatus.value = status.value; // Update local status
    },
    onMessage: (webSocket, event) => {
      // wsData.value = data.value; // Removed this line, as we parse event.data directly
      try {
        // First, check if event.data is actually a string and not empty
        if (typeof event.data !== 'string' || event.data.trim() === '') {
          console.warn('WS Received non-string or empty message:', event.data);
          return; // Skip parsing if not a valid string message
        }

        const parsedData = JSON.parse(event.data);
        console.log('Diner WS Received:', parsedData);

        if (parsedData.type === 'system') {
          console.log(`[System]: ${parsedData.message}`);
        }
        else if (parsedData.type === 'chat') {
          // Check if the message is relevant to this user's chat with the admin
          if ((parsedData.senderId === (currentUser.value && currentUser.value._id) && parsedData.recipientId === ADMIN_USER_ID) ||
              (parsedData.senderId === ADMIN_USER_ID && parsedData.recipientId === (currentUser.value && currentUser.value._id))) {
            messages.value.push(parsedData); // Add to messages displayed
          }
        } else {
            console.warn('Diner WS Received unknown message type:', parsedData.type, parsedData);
        }
      } catch (e) {
        console.error('Failed to parse Diner WS message (likely not JSON):', event.data, e);
      }
    },
  });
  
  wsStatus.value = status.value; // Initialize with current status
  wsSend.value = send; // Assign the send function
  wsData.value = data.value; // Assign the data ref

  wsInstance = { open, close };
  wsInstance.open(); // Open the connection now
};

// Function to send a message via WebSocket
const sendMessage = () => {
  if (messageInput.value.trim() && wsStatus.value === 'OPEN' && wsSend.value && currentUser.value && currentUser.value._id) {
    const chatMessage = {
      type: 'chatMessage',
      senderId: currentUser.value._id,
      recipientId: ADMIN_USER_ID, // Always sending to the specific admin user
      message: messageInput.value.trim(),
    };
    wsSend.value(JSON.stringify(chatMessage)); // Use the assigned send function
    messageInput.value = ''; // Clear input after sending
  } else if (wsStatus.value !== 'OPEN') {
    alert('WebSocket is not open. Please wait or refresh.');
  } else if (!currentUser.value || !currentUser.value._id) {
    alert('Your user ID is not available. Please log in.');
  }
};

// Lifecycle hook: runs when component is mounted on the client-side
onMounted(() => {
  wsUrl.value = `ws://${window.location.host}/_ws`; // Set WS URL on client
  initializeWebSocket(); // Initialize WebSocket ONLY after URL is set and on client-side
});

// Lifecycle hook: runs when component is unmounted
onUnmounted(() => {
  if (wsInstance) {
    wsInstance.close(); // Close the WebSocket connection cleanly
  }
});

// Watcher: Reacts when userStore.user data changes
watch(() => userStore.user, (newUserDetails) => {
  currentUser.value = newUserDetails;
  authenticateWebSocket(); // Attempt to authenticate after user data updates
}, { immediate: true });
</script>

<template>
  <div style="max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
    <h1>Chat with Admin</h1>
    <p>WS Status: <strong>{{ wsStatus }}</strong></p>
    <p>Your User ID: <strong>{{ currentUser ? currentUser._id : 'Loading...' }}</strong></p>
    <p>Your Role: <strong>{{ currentUser ? currentUser.role : 'Loading...' }}</strong></p>

    <div style="border: 1px solid #ccc; height: 300px; overflow-y: scroll; padding: 10px; margin-bottom: 8px; background-color: #fff;">
      <div v-for="(msg, index) in messages" :key="index" style="margin-bottom: 8px;">
        <strong :style="{ color: msg.senderId === (currentUser && currentUser._id) ? 'blue' : 'green' }">
          {{ msg.senderId === (currentUser && currentUser._id) ? 'You' : (msg.senderRole === 'admin' ? 'Admin' : 'Unknown') }}:
        </strong>
        {{ msg.message }}
        <span style="font-size: 0.8em; color: #888;"> ({{ new Date(msg.timestamp).toLocaleTimeString() }})</span>
      </div>
    </div>
    <div>
      <input
        type="text"
        v-model="messageInput"
        @keyup.enter="sendMessage"
        placeholder="Type your message..."
        :disabled="wsStatus !== 'OPEN'" style="width: calc(100% - 70px); padding: 8px;"
      />
      <button @click="sendMessage" :disabled="wsStatus !== 'OPEN'" style="padding: 8px 12px; margin-left: 5px;">Send</button> </div>
  </div>
</template>