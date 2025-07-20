import { defineMongooseModel } from '#nuxt/mongoose'
import mongoose from 'mongoose'
export default defineMongooseModel('MenuItem', {
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  imageUrl: String,
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
})
