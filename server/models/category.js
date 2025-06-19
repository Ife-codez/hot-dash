import { defineMongooseModel } from '#nuxt/mongoose'
export const category =  defineMongooseModel('Category', {
  name: {type: String, required: true},
  description: String,
})