// server/api/users.js
import { defineEventHandler } from 'h3';
import { useMongooseModel } from '~/server/utils/useMongooseModel'; // Adjust path to your User model
const User = useMongooseModel('User')
export default defineEventHandler(async (event) => {
  try {
    const diners = await User.find({ role: 'diner' }, '_id name avatar').lean();

    // Map _id to id for consistency if your frontend expects 'id'
    const formattedDiners = diners.map(diner => ({
      id: diner._id.toString(), // Convert ObjectId to string
      name: diner.name,
      avatar: diner.avatar
    }));

    return formattedDiners;

  } catch (error) {
    console.error('Error fetching diners:', error);
    // Use h3's createError for proper HTTP error responses
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch diner users',
      data: error.message,
    });
  }
});