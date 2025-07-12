import { useMongooseModel } from '~/server/utils/useMongooseModel'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { sendVerificationEmail } from '~/server/utils/sendVerificationEmail'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, location, password } = body

  if (!name || !email || !password) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Name, email, and password are required.'
    }))
  }

  const User = useMongooseModel('User')
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'User already exists.'
    }))
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const verifyToken = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours

  const newUser = await User.create({
    name,
    email,
    location,
    password: hashedPassword,
    verifyToken,
    verifyTokenExpires: expiresAt,
    verified: false
  })

  await sendVerificationEmail({
    to: email,
    name,
    token: verifyToken
  })

  return {
    status: 'success',
    message: 'Account created. Please check your email to verify your account.'
  }
})
