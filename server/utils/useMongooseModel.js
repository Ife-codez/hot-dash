import User from '~/server/models/user'
import Category from '~/server/models/category'
import MenuItem from '~/server/models/menuItem'

export const useMongooseModel = (modelName) => {
  if (modelName === 'User') return User
  if (modelName === 'Category') return Category
  if (modelName === 'MenuItem') return MenuItem
}