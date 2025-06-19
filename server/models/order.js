import { defineMongooseModel } from '#nuxt/mongoose'
export const order =  defineMongooseModel('Order', {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  items: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem'},
      quantity: {type: Number, default: 1}
    }
  ],
  totalAmount: {type: Number, required: true},
  deliveryAddress: String,
  status: {
    type: String,
    enum: ['pending', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderedAt: {type: Date, default: Date.now}
})