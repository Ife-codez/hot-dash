import { defineMongooseModel } from '#nuxt/mongoose'
export default defineMongooseModel('User', {
  name: String,
  email: { type: String, unique: true },
  password: String,
  location: String,
  role: { type: String, enum: ['diner', 'admin'], default: 'diner' },
  avatar: { type: String},
  verified: { type: Boolean, default: false },
  verifyToken: String,
  verifyTokenExpires: Date,
  createdAt: { type: Date, default: Date.now }
})
