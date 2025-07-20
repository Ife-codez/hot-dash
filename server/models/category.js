
import { defineMongooseModel } from '#nuxt/mongoose'

export default defineMongooseModel('Category', {
  name: { type: String, required: true },
  description: String,
})

