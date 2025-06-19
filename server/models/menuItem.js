import { defineMongooseModel } from '#nuxt/mongoose'
export const menuItem =  defineMongooseModel('MenuItem', {
  name: {type: String, required: true},
  description: String,
  price: { type: Number, required: true},
  category: String,
  imageUrl: String,
  available: {type: Boolean, default: true},
  createdAt: {type: Date, default: Date.now}
})