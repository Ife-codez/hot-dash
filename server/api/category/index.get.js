import { useMongooseModel } from '~/server/utils/useMongooseModel'

export default defineEventHandler(async () => {
  const category = useMongooseModel('Category')
  const categories = await category.find()
  return categories
})
