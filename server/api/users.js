import { defineEventHandler } from 'h3';
import { useMongooseModel } from '~/server/utils/useMongooseModel'; 
const User = useMongooseModel('User')
export default defineEventHandler(async (event) => {
  try {
    const diners = await User.find({ role: 'diner' }, '_id name avatar').lean();

    const formattedDiners = diners.map(diner => ({
      id: diner._id.toString(), // Convert ObjectId to string
      name: diner.name,
      avatar: diner.avatar
    }));

    return formattedDiners;

  } catch (error) {
    console.error('Error fetching diners:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch diner users',
      data: error.message,
    });
  }
});