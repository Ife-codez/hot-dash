// server/routes/_ws.js
import { defineWebSocketHandler } from '#imports';

// --- Admin's MongoDB _id ---
// Make sure this matches the actual admin user's _id in your MongoDB
const ADMIN_USER_ID = '6881d15eb32e43cbadcb1a79';

// A simple in-memory map to store userId (MongoDB _id) to peerId relationships.
// Reminder: For production with multiple instances, use Redis or similar.
const userToPeerMap = new Map(); // Map<string userId, string peerId>
const peerToUserMap = new Map(); // Map<string peerId, { userId: string, role: string }>

export default defineWebSocketHandler({
  open(peer) {
    console.log('[ws] open:', peer.id);
    // Still waiting for 'authenticate' message for user identification
  },

  message(peer, message) {
    const msgText = message.text();
    // console.log('[ws] message from', peer.id, ':', msgText); // Uncomment for more verbose logging

    try {
      const parsedData = JSON.parse(msgText);

      // --- 1. Authentication/Identification Message ---
      if (parsedData.type === 'authenticate') {
        const { userId, role } = parsedData; // userId will be the MongoDB _id
        if (!userId || !role) {
          peer.send(JSON.stringify({ type: 'error', message: 'Authentication message missing userId or role.' }));
          return;
        }

        userToPeerMap.set(userId, peer.id);
        peerToUserMap.set(peer.id, { userId, role });
        peer.subscribe(`user:${userId}`); // Subscribe to their personal channel
        peer.send(JSON.stringify({ type: 'system', message: `Authenticated as ${role} ${userId}. Ready for chat.` }));
        console.log(`[ws] Authenticated: Peer ${peer.id} as ${role} ${userId}`);

        // Optional: Notify admin if a diner connects
        if (role === 'diner') {
          const adminPeerId = userToPeerMap.get(ADMIN_USER_ID);
          if (adminPeerId) {
            peer.sendTo(adminPeerId, JSON.stringify({ type: 'notification', message: `Diner ${userId} is now online.` }));
          }
        }
        return;
      }

      // --- 2. Private Chat Message ---
      if (parsedData.type === 'chatMessage') {
        const { senderId, recipientId, message: chatContent } = parsedData;
        const senderInfo = peerToUserMap.get(peer.id);

        if (!senderInfo || senderInfo.userId !== senderId) {
          peer.send(JSON.stringify({ type: 'error', message: 'Unauthorized sender ID.' }));
          return;
        }
        if (!recipientId || !chatContent) {
          peer.send(JSON.stringify({ type: 'error', message: 'Chat message missing recipientId or content.' }));
          return;
        }

        const formattedMessage = JSON.stringify({
          type: 'chat',
          senderId: senderId,
          recipientId: recipientId,
          message: chatContent,
          timestamp: Date.now(),
          senderRole: senderInfo.role
        });

        // Publish to the sender's private channel (for display on their own side)
        peer.publish(`user:${senderId}`, formattedMessage);

        // Publish to the recipient's private channel
        peer.publish(`user:${recipientId}`, formattedMessage);

        console.log(`[ws] Private message from ${senderId} to ${recipientId}`);
        return;
      }

    } catch (e) {
      console.error('[ws] Failed to parse message or unknown message type:', msgText, e);
      peer.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format or unknown message type. Please send valid JSON.',
        timestamp: Date.now()
      }));
    }
  },

  close(peer, details) {
    console.log('[ws] close:', peer.id, details.code, details.reason);
    const userInfo = peerToUserMap.get(peer.id);
    if (userInfo) {
      userToPeerMap.delete(userInfo.userId);
      peerToUserMap.delete(peer.id);
      console.log(`[ws] User ${userInfo.userId} disconnected.`);
      // Optional: Notify admin if a diner goes offline
      const adminPeerId = userToPeerMap.get(ADMIN_USER_ID);
      if (adminPeerId) {
        peer.sendTo(adminPeerId, JSON.stringify({ type: 'notification', message: `Diner ${userInfo.userId} is now offline.` }));
      }
    }
  },

  error(peer, error) {
    console.error('[ws] error:', peer.id, error);
    peer.send(JSON.stringify({
      type: 'error',
      message: 'An error occurred on the server.',
      timestamp: Date.now()
    }));
  },
});