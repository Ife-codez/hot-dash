import { defineEventHandler, getQuery } from 'h3'; 
import { useMongooseModel } from '~/server/utils/useMongooseModel'; 

export default defineEventHandler(async (event) => {
  const Message = useMongooseModel('Message'); 

  // Extract query parameters: user1Id and user2Id
  const query = getQuery(event);
  const { user1Id, user2Id } = query;

  if (!user1Id || !user2Id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Both user1Id and user2Id are required.',
    });
  }

  try {
    // Fetch messages where:
    // 1. Sender is user1Id AND Recipient is user2Id
    // OR
    // 2. Sender is user2Id AND Recipient is user1Id
    const messages = await Message.find({
      $or: [
        { senderId: user1Id, recipientId: user2Id },
        { senderId: user2Id, recipientId: user1Id },
      ],
    }).sort({ timestamp: 1 }); 

    return messages; // Return the fetched messages
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Could not fetch messages.',
    });
  }
});