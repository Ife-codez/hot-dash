export default defineEventHandler(async (event) => {
  const id = event.context.params.id
  const body = await readBody(event)

  const updated = await category.findByIdAndUpdate(id, {
    name: body.name,
    description: body.description
  }, { new: true })

  return { message: 'Category updated successfully', data: updated }
})
