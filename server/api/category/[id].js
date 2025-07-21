import { useMongooseModel } from '~/server/utils/useMongooseModel'

export default defineEventHandler(async (event) => {
  const category = useMongooseModel('Category')
  const id = event.context.params.id

  // Handle PUT request (update category)
  if (event.method === 'PUT') {
    const body = await readBody(event)

    const updated = await category.findByIdAndUpdate(
      id,
      {
        name: body.name,
        description: body.description
      },
      { new: true }
    )

    return { message: 'Category updated successfully', data: updated }
  }

  // Handle DELETE request (delete category)
  if (event.method === 'DELETE') {
    try {
      const deleted = await category.findByIdAndDelete(id)

      if (!deleted) {
        return sendError(event, createError({
          statusCode: 404,
          statusMessage: 'Category not found'
        }))
      }

      return { message: 'Category deleted successfully' }
    } catch (error) {
      return sendError(event, createError({
        statusCode: 500,
        statusMessage: 'Error deleting category'
      }))
    }
  }
})
