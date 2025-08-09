import { useMongooseModel } from '~/server/utils/useMongooseModel';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const authUser = event.context.user;
  if (!authUser) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const body = await readBody(event);
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Current and new passwords are required.' });
  }
  
  const User = useMongooseModel('User');
  const user = await User.findById(authUser.userId);

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found.' });
  }
  
  const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatch) {
    throw createError({ statusCode: 401, statusMessage: 'Incorrect current password.' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(authUser.userId, { password: hashedPassword });
  
  return { message: 'Password updated successfully!' };
});