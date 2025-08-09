// server/api/auth/login.post.js
import { useMongooseModel } from '~/server/utils/useMongooseModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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
  const runtimeConfig = useRuntimeConfig();
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    runtimeConfig.authSecret, // Your JWT secret key
    { expiresIn: '1h' } // Token expiry time
  );

  // --- CRITICAL: Set the token in a secure httpOnly cookie ---
  setCookie(event, 'auth_token', token, {
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'lax', // Protects against CSRF attacks
    maxAge: 60 * 60 * 24 * 7 // Cookie expires in 7 days
  });

  const userData = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    location: user.location,
    avatar: user.avatar
  };
  
  return {
    message: 'Login successful!',
    user: userData,
    redirect: user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
  };
});