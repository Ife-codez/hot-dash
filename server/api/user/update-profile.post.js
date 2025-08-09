import { useMongooseModel } from '~/server/utils/useMongooseModel';

export default defineEventHandler(async (event) => {
  const authUser = event.context.user;
  if (!authUser) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  
  const body = await readBody(event);
  const { name, location } = body;

  if (!name || !location) {
    throw createError({ statusCode: 400, statusMessage: 'Name and location are required.' });
  }

  const User = useMongooseModel('User');
  const updatedUser = await User.findByIdAndUpdate(
    authUser.userId,
    { name, location },
    { new: true, select: '-password' } // Return the updated user, but without the password field
  );

  if (!updatedUser) {
    throw createError({ statusCode: 404, statusMessage: 'User not found.' });
  }

  return {
    message: 'Profile updated successfully!',
    user: {
      _id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      location: updatedUser.location,
      avatar: updatedUser.avatar,
    }
  };
});