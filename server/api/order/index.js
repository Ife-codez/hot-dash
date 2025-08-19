import { useMongooseModel } from '~/server/utils/useMongooseModel'

const Order = useMongooseModel('Order');
const MenuItem = useMongooseModel('MenuItem');

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === 'POST') {
    try {
      const body = await readBody(event);
      
      // Basic validation
      if (!body.userId || !body.items || !body.deliveryAddress || !body.deliveryPhone) {
        throw createError({ statusCode: 400, statusMessage: 'Missing required fields' });
      }

      const newOrder = await Order.create({
        userId: body.userId,
        items: body.items,
        totalAmount: body.totalAmount,
        deliveryAddress: body.deliveryAddress,
        deliveryPhone: body.deliveryPhone,
        status: body.status,
      });

      await newOrder.populate({
        path: 'items.item',
        model: MenuItem,
        select: 'name imageUrl price'
      });

      return newOrder;

    } catch (error) {
      console.error('Error placing order:', error);
      return createError({
        statusCode: 500,
        statusMessage: 'Failed to place order',
      });
    }
  }

  if (method === 'GET') {
    try {
      const query = getQuery(event);
      const filter = {};
      
      // If a userId is present in the query, add it to the filter
      if (query.userId) {
        filter.userId = query.userId;
      }
      const orders = await Order.find(filter)
        .populate({
          path: 'userId',
          select: 'name email'
        })
        .populate({
          path: 'items.item',
          model: MenuItem,
          select: 'name imageUrl price'
        })
        .sort({ orderedAt: -1 });

      return orders;

    } catch (error) {
      console.error('Error fetching orders:', error);
      return createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch orders',
      });
    }
  }
});