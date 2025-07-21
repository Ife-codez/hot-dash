import { useMongooseModel } from '~/server/utils/useMongooseModel'

export default defineEventHandler(async (event) => {
  const menu = useMongooseModel('MenuItem')
  const id = event.context.params.id

  if (event.method === 'PUT') {
    const body = await readBody(event)

    const updated = await menu.findByIdAndUpdate(id, {
      name: body.name,
      price: body.price,
      image: body.image,
      available: body.available,
    }, { new: true })

    return { message: 'Menu item updated', item: updated }
  }

  if (event.method === 'DELETE') {
    await menu.findByIdAndDelete(id)
    return { message: 'Menu item deleted' }
  }
})
