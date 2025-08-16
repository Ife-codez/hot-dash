import { useMongooseModel } from '~/server/utils/useMongooseModel'

const Order = useMongooseModel('Order');

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const orderId = event.context.params.id; // Correctly get the ID from the URL

  if (method === 'PATCH') {
    try {
      const body = await readBody(event);
      
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId, 
        { status: body.status },
        { new: true }
      );
      
      if (!updatedOrder) {
        throw createError({ statusCode: 404, statusMessage: 'Order not found' });
      }
      
      return updatedOrder;

    } catch (error) {
      console.error('Error updating order:', error);
      return createError({
        statusCode: 500,
        statusMessage: 'Failed to update order status',
      });
    }
  }

  if (method === 'GET') {
      try {
          const order = await Order.findById(orderId)
            .populate({
              path: 'userId',
              select: 'name email'
            })
            .populate({
              path: 'items.item',
              select: 'name imageUrl price'
            });

          if (!order) {
              throw createError({ statusCode: 404, statusMessage: 'Order not found' });
          }

          return order;
      } catch (error) {
          console.error('Error fetching single order:', error);
          return createError({
              statusCode: 500,
              statusMessage: 'Failed to fetch order',
          });
      }
  }
});