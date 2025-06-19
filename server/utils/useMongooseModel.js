import User from '~/server/models/user'

export const useMongooseModel = (modelName) => {
  if (modelName === 'User') return User
}