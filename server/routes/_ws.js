// server/routes/_ws.js
import { defineWebSocketHandler } from '#imports';
import { useMongooseModel } from '~/server/utils/useMongooseModel'; // <--- UPDATED IMPORT

const connectedClients = new Map(); // Stores connected and authenticated clients

export default defineWebSocketHandler({
  open(peer) {
    console.log('[ws] open:', peer.id);
  },

  async message(peer, message) {
    console.log('[ws] message:', peer.id, message.text());

    // Get the Message model using your custom utility
    const Message = useMongooseModel('Message'); // <--- GET THE MESSAGE MODEL HERE

    try {
      const parsed = JSON.parse(message.text());

      if (parsed.type === 'authenticate') {
        const { userId, role } = parsed;
        if (userId && role) {
          if (connectedClients.has(peer.id)) {
            console.log(`[ws] Re-authenticating ${peer.id} as ${role} ${userId}`);
          } else {
            console.log(`[ws] Authenticating ${peer.id} as ${role} ${userId}`);
          }
          connectedClients.set(peer.id, { userId, role, peer }); 
          peer.send(JSON.stringify({ type: 'system', message: `Authenticated as ${role}. Ready for chat.` }));
        } else {
          peer.send(JSON.stringify({ type: 'system', message: 'Authentication failed: missing userId or role.' }));
          console.warn(`[ws] Authentication attempt failed for ${peer.id}: missing userId or role.`);
        }
      } else if (parsed.type === 'chatMessage') {
        const { senderId, recipientId, message: chatText } = parsed;

        const sender = connectedClients.get(peer.id);
        if (!sender || sender.userId !== senderId) {
          peer.send(JSON.stringify({ type: 'system', message: 'Not authenticated or sender ID mismatch.' }));
          console.warn(`[ws] Unauthorized chat attempt from ${peer.id}: senderId ${senderId}`);
          return;
        }

        // --- PERSISTENCE LOGIC STARTS HERE ---
        try {
          const newMessage = new Message({ // Use the model obtained from useMongooseModel
            senderId,
            recipientId,
            message: chatText,
            timestamp: new Date(), // Use current server time for consistency
            senderRole: sender.role
          });
          
          await newMessage.save(); // Save the message to MongoDB

          console.log('[ws] Message saved to DB:', newMessage._id);

          const messageToBroadcast = {
            type: 'chat',
            _id: newMessage._id, // Include the MongoDB ID
            senderId: newMessage.senderId,
            senderRole: newMessage.senderRole,  
            recipientId: newMessage.recipientId,
            message: newMessage.message,
            timestamp: newMessage.timestamp.toISOString() 
          };

          let recipientFound = false;
          for (const [, client] of connectedClients) {
            if (client.userId === recipientId) {
              client.peer.send(JSON.stringify(messageToBroadcast));
              recipientFound = true;
              break;
            }
          }
          
          peer.send(JSON.stringify(messageToBroadcast)); 

          if (!recipientFound) {
            peer.send(JSON.stringify({ type: 'system', message: `Recipient ${recipientId} not found or offline.` }));
          }

        } catch (dbError) {
          console.error('[ws] Error saving message to DB:', dbError);
          peer.send(JSON.stringify({ type: 'system', message: 'Failed to send message: Database error.' }));
        }
        // --- PERSISTENCE LOGIC ENDS HERE ---

      } else {
        peer.send(JSON.stringify({ type: 'system', message: `Unknown message type or invalid format: ${parsed.type || 'N/A'}` }));
        console.warn(`[ws] Received unhandled message type: ${parsed.type || 'N/A'} from ${peer.id}`);
      }
    } catch (e) {
      console.error('[ws] Invalid JSON message received:', message.text(), e);
      peer.send(JSON.stringify({ type: 'system', message: 'Invalid message format.' }));
    }
  },

  close(peer, event) {
    console.log('[ws] close:', peer.id, event.code, event.reason);
    connectedClients.delete(peer.id); 
  },

  error(peer, error) {
    console.error('[ws] error:', peer.id, error);
    connectedClients.delete(peer.id);
  }
});