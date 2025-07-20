import { useMongooseModel } from '~/server/utils/useMongooseModel'

export default defineEventHandler(async (event) => {
  const category = useMongooseModel('Category')
  const body = await readBody(event)

  if (!body.name) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Category name is required'
    }))
  }

  const newCategory = await category.create({
    name: body.name,
    description: body.description || ''
  })

  return {
    message: 'Category created successfully',
    category: newCategory
  }
})
