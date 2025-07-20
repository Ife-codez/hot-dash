import { useMongooseModel } from '~/server/utils/useMongooseModel'

export default defineEventHandler(async () => {
  const category = useMongooseModel('Category')

  const data = [
    { name: 'Food', description: 'All kinds of food' },
    { name: 'Fruits', description: 'Fresh fruits' },
    { name: 'Vegetables', description: 'Green and healthy' },
    { name: 'Drinks', description: 'Refreshing drinks' },
    { name: 'Snacks', description: 'Quick bites' },
    { name: 'Snacks', description: 'Quick bites' },
    { name: 'junks', description: 'Quick bites' },
    { name: 'Snacks', description: 'Quick bites' },
    { name: 'Snacks', description: 'Quick bites' },
  ]

  
  await category.insertMany(data)

  return { status: 'success', message: 'Seeded categories successfully.' }
})
