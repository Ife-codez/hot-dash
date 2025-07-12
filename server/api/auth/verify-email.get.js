import { useMongooseModel } from '~/server/utils/useMongooseModel'

export default defineEventHandler(async (event) => {
  const { token, email } = getQuery(event)

  if (!token || !email) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Invalid verification request. Missing token or email.'
    }))
  }

  const User = useMongooseModel('User')
  const user = await User.findOne({
    email,
    verifyToken: token,
    verifyTokenExpires: { $gt: new Date() }
  })

  if (!user) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: 'Verification failed. Token may be invalid or expired.'
    }))
  }

  // Mark user as verified
  user.verified = true
  user.verifyToken = undefined
  user.verifyTokenExpires = undefined
  await user.save()

  return {
    status: 'success',
    message: 'Email verified successfully. You can now log in.'
  }
})
