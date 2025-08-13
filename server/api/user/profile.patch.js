import { defineEventHandler, createError } from 'h3';
import { useMongooseModel } from '~/server/utils/useMongooseModel';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const authUser = event.context.user;

  // 1. Authentication
  if (!authUser) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const body = await readBody(event);
  const { name, email, currentPassword, newPassword } = body;

  const User = useMongooseModel('User');
  const user = await User.findById(authUser.userId);

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found.' });
  }

  const updates = {};
  
  // Conditionally update name
  if (name && name !== user.name) {
    updates.name = name;
  }

  // Conditionally update email
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError({ statusCode: 409, statusMessage: 'Email is already in use.' });
    }
    updates.email = email;
  }

  // Conditionally update password, with a required security check
  if (newPassword) {
    if (!currentPassword) {
      throw createError({ statusCode: 400, statusMessage: 'Current password is required to change the password.' });
    }
    
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      throw createError({ statusCode: 401, statusMessage: 'Incorrect current password.' });
    }
    
    updates.password = await bcrypt.hash(newPassword, 10);
  }

  // Save Changes to the database
  if (Object.keys(updates).length > 0) {
    await User.findByIdAndUpdate(authUser.userId, updates);
  } else {
    throw createError({ statusCode: 400, statusMessage: 'No changes provided.' });
  }

  return { message: 'Profile updated successfully!' };
});