import createHttpError from 'http-errors';

import { OrdersCollection } from '../db/models/orderModel.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/constants.js';

export const getAllOrdersService = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = 'createdAt',
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const ordersQuery = OrdersCollection.find();

  if (filter.ep) {
    ordersQuery.where('ep').equals(filter.ep);
  }

  if (filter.client) {
    ordersQuery.where('client').equals(filter.client);
  }

  if (filter.createdAt) {
    ordersQuery.where('createdAt').equals(filter.createdAt);
  }

  if (filter.local) {
    ordersQuery.where('local').equals(filter.local);
  }

  const ordersCount = await OrdersCollection.find()
    .merge(ordersQuery)
    .countDocuments();

  const orders = await ordersQuery
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .exec();
  const paginationData = calculatePaginationData(ordersCount, page, perPage);

  return {
    orders,
    ...paginationData,
  };
};

// export const getOrderByIdService = async (orderId) => {
//   const order = await OrdersCollection.findById(orderId);

//   if (!order) {
//     throw createHttpError(404, 'Order not found!');
//   }

//   return order;
// };

export const createOrderService = async (payload) => {
  const newOrder = await OrdersCollection.create(payload);

  return newOrder;
};

export const updateOrderService = async (orderId, payload) => {
  const updatedOrder = await OrdersCollection.findByIdAndUpdate(
    orderId,
    payload,
    { new: true },
  );
  if (!updatedOrder) throw createHttpError(404, 'Order not found');

  return updatedOrder;
};

export const deleteOrderService = async (orderId) => {
  const orderToDelete = await OrdersCollection.findByIdAndDelete(orderId);

  if (!orderToDelete) {
    throw createHttpError(404, 'Order not found!');
  }

  return;
};
