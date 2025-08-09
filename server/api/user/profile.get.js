import { useMongooseModel } from '~/server/utils/useMongooseModel';

export default defineEventHandler(async (event) => {
  const authUser = event.context.user;

  if (!authUser) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const User = useMongooseModel('User');
  const user = await User.findById(authUser.userId).select('-password');

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' });
  }

  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      avatar: user.avatar
    }
  };
});