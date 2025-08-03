import User from '~/server/models/user'
import Category from '~/server/models/category'
import MenuItem from '~/server/models/menuItem'
import Message from '~/server/models/message'
import Order from '~/server/models/order'

export const useMongooseModel = (modelName) => {
  if (modelName === 'User') return User
  if (modelName === 'Category') return Category
  if (modelName === 'MenuItem') return MenuItem
  if (modelName === 'Message') return Message
  if (modelName === 'Order') return Order
}