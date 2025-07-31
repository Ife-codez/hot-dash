// server/api/auth/login.post.js
import { useMongooseModel } from '~/server/utils/useMongooseModel';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;


  if (!email || !password) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Email and password are required.'
    }));
  }

  const User = useMongooseModel('User');
  const user = await User.findOne({ email });

  if (!user) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password.'
    }));
  }

  if (!user.verified) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'Please verify your email before logging in.'
    }));
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password.'
    }));
  }


  const userData = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    location: user.location
  };
  
  return {
    message: 'Login successful!',
    user: userData,
    redirect: user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
  };
});