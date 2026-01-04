import createHttpError from 'http-errors';

import { OrdersCollection } from '../db/models/orderModel.jsx';

export const getAllOrdersService = async () => {
  const orders = await OrdersCollection.find();
  return orders;
};

export const getOrderByIdService = async (orderId) => {
  const order = await OrdersCollection.findById(orderId);

  if (!order) {
    throw createHttpError(404, 'Order not found!');
  }

  return order;
};

export const createOrderService = async (payload, userId) => {
  const newOrder = await OrdersCollection.create({
    ...payload,
    owner: userId,
  });

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
