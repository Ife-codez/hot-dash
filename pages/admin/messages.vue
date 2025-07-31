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

const wsUrl = ref(''); // Will be set in onMounted (client-side)

// Store the useWebSocket instance properties directly as refs
const wsStatus = ref('CLOSED'); // Reflects the current WebSocket status (CONNECTING, OPEN, CLOSED, ERROR)
const wsSend = ref(null); // Will hold the send function from useWebSocket
const wsData = ref(null); // Will hold the latest data received from useWebSocket

// This variable will hold the actual useWebSocket instance to call its methods (open, close)
let wsInstance = null; 

const selectedUserId = ref(null);
const messages = ref([]);
const messageInput = ref('');

const allUsers = ref([]); // Populated from API

// Maps to store chat history for each user. Key: userId, Value: Array of messages
const chatHistories = ref(new Map());

// Function to handle authentication
const authenticateWebSocket = () => {
  // Ensure we have user data, WebSocket is open, and the send function is available
  if (currentUser.value && currentUser.value._id && currentUser.value.role && wsStatus.value === 'OPEN' && wsSend.value) {
    wsSend.value(JSON.stringify({
      type: 'authenticate',
      userId: currentUser.value._id,
      role: currentUser.value.role
    }));
    console.log(`WebSocket authenticated as ${currentUser.value.role} ${currentUser.value._id}`);
  } else {
    // Log why authentication isn't happening, useful for debugging
    console.log('Authentication conditions not met yet.', { 
      hasUser: !!currentUser.value, 
      wsStatus: wsStatus.value, 
      hasSend: !!wsSend.value 
    });
  }
};

// Function to initialize WebSocket only on client
const initializeWebSocket = () => {
  // Guard to prevent re-initialization if already done
  if (wsInstance) return;

  const { status, data, send, open, close } = useWebSocket(wsUrl.value, {
    immediate: false, // We'll call open() explicitly after setup
    onConnected: () => {
      console.log('Admin WS: Connected!');
      wsStatus.value = status.value; // Update local status to 'OPEN'
      authenticateWebSocket(); // <--- CRITICAL: AUTHENTICATE HERE AFTER CONNECTION IS ESTABLISHED
    },
    onDisconnected: () => {
      console.log('Admin WS: Disconnected!');
      wsStatus.value = status.value; // Update local status to 'CLOSED'
    },
    onError: (webSocket, event) => {
      console.error('Admin WS Error:', event);
      wsStatus.value = status.value; // Update local status to 'ERROR'
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
        console.log('Admin WS Received:', parsedData);

        if (parsedData.type === 'system') {
          console.log(`[System]: ${parsedData.message}`);
        } else if (parsedData.type === 'chat') {
          // Determine the user whose chat history this message belongs to
          const targetUserId = parsedData.senderId === currentUser.value._id ? parsedData.recipientId : parsedData.senderId;
          
          // Initialize chat history for the target user if it doesn't exist
          if (!chatHistories.value.has(targetUserId)) {
            chatHistories.value.set(targetUserId, []);
          }
          // Add the message to the specific user's chat history
          chatHistories.value.get(targetUserId).push(parsedData);

          // If the message is for the currently selected user, update the displayed messages
          if (targetUserId === selectedUserId.value) {
            messages.value = chatHistories.value.get(targetUserId);
          }
        } else {
            console.warn('Admin WS Received unknown message type:', parsedData.type, parsedData);
        }
      } catch (e) {
        console.error('Failed to parse Admin WS message (likely not JSON):', event.data, e);
      }
    },
  });

  // Assign the reactive properties/methods from useWebSocket to local refs for easier access
  // and to ensure reactivity propagates
  wsStatus.value = status.value; // Initialize with current status (likely 'CONNECTING')
  wsSend.value = send; // Assign the send function
  wsData.value = data.value; // Assign the data ref

  wsInstance = { open, close }; // Store open/close methods for onMounted/onUnmounted
  wsInstance.open(); // Open the connection now
};

// Function to select a user from the list to chat with
const selectUserToChat = (userId) => {
  selectedUserId.value = userId;
  // Load existing messages for the selected user, or initialize an empty array
  if (!chatHistories.value.has(userId)) {
    chatHistories.value.set(userId, []);
  }
  messages.value = chatHistories.value.get(userId);
};

// Function to send a message via WebSocket
const sendMessage = () => {
  // Validate input and WebSocket status before sending
  if (messageInput.value.trim() && wsStatus.value === 'OPEN' && wsSend.value && selectedUserId.value && currentUser.value && currentUser.value._id) {
    const chatMessage = {
      type: 'chatMessage',
      senderId: currentUser.value._id,
      recipientId: selectedUserId.value,
      message: messageInput.value.trim(),
    };
    wsSend.value(JSON.stringify(chatMessage)); // Use the assigned send function
    messageInput.value = ''; // Clear input after sending
  } else if (!selectedUserId.value) {
    alert('Please select a user to chat with.');
  } else if (wsStatus.value !== 'OPEN') {
    alert('WebSocket is not open. Please wait for connection or refresh.');
  } else if (!currentUser.value || !currentUser.value._id) {
    alert('Admin user data not available for sending messages. Please log in.');
  }
};

// Lifecycle hook: runs when component is mounted on the client-side
onMounted(async () => {
  // Set the WebSocket URL only on the client side, using window.location.host
  wsUrl.value = `ws://${window.location.host}/_ws`;
  initializeWebSocket(); // Initialize WebSocket ONLY after URL is set and on client-side

  // Fetch all users (diners) from your API for the admin to select from
  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allUsers.value = await response.json();
    console.log('Fetched diner users:', allUsers.value);
  } catch (error) {
    console.error('Failed to fetch diner users:', error);
  }
});

// Lifecycle hook: runs when component is unmounted (e.g., navigating away)
onUnmounted(() => {
  if (wsInstance) {
    wsInstance.close(); // Close the WebSocket connection cleanly
  }
});

// Watcher: Reacts when userStore.user data changes (e.g., after login/refresh)
watch(() => userStore.user, (newUserDetails) => {
  currentUser.value = newUserDetails; // Update local currentUser ref
  // Attempt to authenticate the WebSocket. This is safe because authenticateWebSocket
  // itself checks if the WS is open. It handles cases where user data loads before/after WS connects.
  authenticateWebSocket(); 
}, { immediate: true }); // 'immediate: true' means this watcher runs once immediately on component setup
</script>

<template>
  <div style="display: flex; height: 100vh;">
    <div style="width: 250px; border-right: 1px solid #eee; padding: 15px; background-color: #f8f8f8;">
      <h2>Diner Users</h2>
      <ul style="list-style: none; padding: 0;">
        <li v-if="allUsers.length === 0" style="color: #666; font-style: italic;">No diners found or still loading...</li>
        <li v-for="user in allUsers" :key="user.id"
            @click="selectUserToChat(user.id)"
            :style="{ cursor: 'pointer', padding: '10px', marginBottom: '5px', borderRadius: '5px', backgroundColor: selectedUserId === user.id ? '#e0e0e0' : 'white' }">
          {{ user.name }} (ID: {{ user.id.substring(0, 8) }}...)
        </li>
      </ul>
    </div>

    <div style="flex: 1; padding: 20px; display: flex; flex-direction: column;">
      <h1>Admin Chat Dashboard</h1>
      <p>WS Status: <strong>{{ wsStatus }}</strong></p>
      <p>Your User ID: <strong>{{ currentUser ? currentUser._id : 'Loading...' }}</strong></p>
      <p>Your Role: <strong>{{ currentUser ? currentUser.role : 'Loading...' }}</strong></p>

      <div v-if="selectedUserId">
        <h3>Chatting with: {{ allUsers.find(u => u.id === selectedUserId)?.name || selectedUserId }}</h3>
        <div style="border: 1px solid #ccc; height: 400px; overflow-y: scroll; padding: 10px; margin-bottom: 10px; background-color: #fff;">
          <div v-for="(msg, index) in messages" :key="index" style="margin-bottom: 8px;">
            <strong :style="{ color: msg.senderId === (currentUser && currentUser._id) ? 'blue' : 'green' }">
              {{ msg.senderId === (currentUser && currentUser._id) ? 'You' : (allUsers.find(u => u.id === msg.senderId)?.name || msg.senderId) }}:
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
            placeholder="Type message to user..."
            :disabled="wsStatus !== 'OPEN'" style="width: calc(100% - 70px); padding: 8px;"
          />
          <button @click="sendMessage" :disabled="wsStatus !== 'OPEN'" style="padding: 8px 12px; margin-left: 5px;">Send</button> </div>
      </div>
      <div v-else style="text-align: center; color: #666; margin-top: 50px;">
        Select a user from the left to start chatting.
      </div>
    </div>
  </div>
</template>