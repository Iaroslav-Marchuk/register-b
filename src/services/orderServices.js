import createHttpError from 'http-errors';

import { OrdersCollection } from '../db/models/orderModel.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/constants.js';

export const getOrdersService = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = 'createdAt',
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const mongoFilter = {};

  if (filter.ep) mongoFilter.ep = filter.ep;
  if (filter.client) mongoFilter.client = filter.client;
  if (filter.local) mongoFilter.local = filter.local;
  if (filter.createdAt) mongoFilter.createdAt = filter.createdAt;

  const ordersCount = await OrdersCollection.countDocuments(mongoFilter);

  const orders = await OrdersCollection.find(mongoFilter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean();

  const paginationData = calculatePaginationData(ordersCount, page, perPage);

  return {
    orders,
    ...paginationData,
  };
};

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
  const orderToDelete = await OrdersCollection.findById(orderId);
  if (!orderToDelete) {
    throw createHttpError(404, 'Order not found!');
  }

  await OrdersCollection.findByIdAndDelete(orderId);

  return orderToDelete;
};
