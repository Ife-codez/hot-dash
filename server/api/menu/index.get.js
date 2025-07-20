import { useMongooseModel } from '~/server/utils/useMongooseModel'
import mongoose from 'mongoose'
export default defineEventHandler(async (event) => {
  const MenuItem = useMongooseModel('MenuItem')
  const category = getQuery(event).category

  const query = {}

  if (category && mongoose.Types.ObjectId.isValid(category)) {
    query.category = category
  }

  const items = await MenuItem.find(query).populate('category')
  return items
})

