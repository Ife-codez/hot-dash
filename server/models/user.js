import { defineMongooseModel } from '#nuxt/mongoose'
export default defineMongooseModel('User', {
  name: String,
  email: {type: String, unique: true},
  password: String,
  role: {type: String, enum: ['diner', 'admin'], default: 'diner'},
  createdAt: {type: Date, default: Date.now}
})