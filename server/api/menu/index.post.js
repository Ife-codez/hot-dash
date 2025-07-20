import { useMongooseModel } from '~/server/utils/useMongooseModel'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, description, price, category, imageUrl, available } = body

  if (!name || !price || !category || !imageUrl) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'All fields except description are required.'
    }))
  }

  const MenuItem = useMongooseModel('MenuItem')

  const newItem = await MenuItem.create({
    name,
    description,
    price,
    category,
    imageUrl,
    available
  })

  return {
    message: 'Menu item added successfully',
    item: newItem
  }
})
