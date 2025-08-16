import { defineMongooseModel } from '#nuxt/mongoose'
export default defineMongooseModel('Message', {
  senderId: {
    type: String,
    required: true,
    index: true 
  },
  recipientId: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000 
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  senderRole: { //
    type: String,
    enum: ['diner', 'admin'], // Ensure roles are consistent
    required: true 
  }
}, {
  timestamps: false
})
