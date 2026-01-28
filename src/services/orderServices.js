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
  if (filter.client) {
    mongoFilter.client = { $regex: filter.client, $options: 'i' };
  }
  if (filter.local) mongoFilter.local = filter.local;
  if (filter.createdAt) mongoFilter.createdAt = filter.createdAt;

  const ordersCount = await OrdersCollection.countDocuments(mongoFilter);

  const orders = await OrdersCollection.find(mongoFilter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean();

  const paginationData = calculatePaginationData(ordersCount, page, perPage);

  const [stats] = await OrdersCollection.aggregate([
    { $match: mongoFilter },
    {
      $group: {
        _id: null,
        totalCompleted: { $sum: '$completedItems' },
        totalM2: { $sum: '$completedM2' },
      },
    },
    {
      $project: {
        _id: 0,
        totalCompleted: 1,
        totalM2: 1,
        ratio: {
          $cond: [
            { $eq: ['$totalCompleted', 0] },
            0,
            { $divide: ['$totalM2', '$totalCompleted'] },
          ],
        },
      },
    },
  ]);

  return {
    orders,
    ...paginationData,
    ...stats,
  };
};

export const existOrderService = async ({ ep }) => {
  const lastOrder = await OrdersCollection.findOne({ ep })
    .sort({ createdAt: -1 })
    .lean();

  if (!lastOrder) {
    return { isExist: false, order: null };
  }

  return { isExist: true, order: lastOrder };
};

export const createOrderService = async (payload) => {
  const { ep, totalItems, completedItems, totalM2, completedM2, ...rest } =
    payload;

  const existOrder = await OrdersCollection.findOne({ ep });

  if (existOrder) {
    throw createHttpError(400, 'Order with this EP already exists!');
  }

  const diffItems = totalItems - completedItems;
  const diffM2 = totalM2 - completedM2;

  const missedItems = diffItems > 0 ? diffItems : 0;
  const missedM2 = diffM2 > 0 ? diffM2 : 0;

  const isFinal = missedItems === 0 && missedM2 === 0 ? true : false;

  const newOrder = await OrdersCollection.create({
    ep,
    totalItems,
    completedItems,
    totalM2,
    completedM2,
    missedItems,
    missedM2,
    isFinal,
    type: 'created',
    ...rest,
  });

  return { order: newOrder };
};

export const createRecoveryOrderService = async (payload) => {
  console.log('🚀 ~ createRecoveryOrderService ~ payload:', payload);

  const { ep, completedItems, completedM2, ...rest } = payload;

  const lastOrder = await OrdersCollection.findOne({ ep }).sort({
    createdAt: -1,
  });

  if (!lastOrder) {
    throw createHttpError(404, 'No existing order with this EP found');
  }

  if (!lastOrder.isFinal) {
    throw createHttpError(
      400,
      'Cannot create recovery before finishing production order',
    );
  }

  const recoveredOrder = await OrdersCollection.create({
    ep,
    completedItems,
    completedM2,
    type: 'recovered',
    ...rest,
  });

  return { order: recoveredOrder };
};

export const updateOrderService = async (payload) => {
  const { ep, completedItems, completedM2, ...rest } = payload;

  const lastExistOrder = await OrdersCollection.findOne({ ep }).sort({
    createdAt: -1,
  });

  if (!lastExistOrder) {
    throw createHttpError(404, 'No existing order with this EP found');
  }

  if (lastExistOrder.isFinal) {
    throw createHttpError(
      400,
      'Cannot update already finished production order',
    );
  }

  const pendingDiffItems = lastExistOrder.missedItems - completedItems;
  const pendingDiffM2 = lastExistOrder.missedM2 - completedM2;

  const missedItems = pendingDiffItems > 0 ? pendingDiffItems : 0;
  const missedM2 = pendingDiffM2 > 0 ? pendingDiffM2 : 0;

  const isFinal = missedItems === 0 && missedM2 === 0 ? true : false;

  const updatedOrder = await OrdersCollection.create({
    ep,
    totalItems: lastExistOrder.totalItems,
    completedItems,
    totalM2: lastExistOrder.totalM2,
    completedM2,
    missedItems,
    missedM2,
    isFinal,
    type: 'continued',
    ...rest,
  });

  return { order: updatedOrder };
};

export const editOrderService = async (orderId, payload) => {
  const oldOrder = await OrdersCollection.findById(orderId);
  if (!oldOrder) throw createHttpError(404, 'Order not found');

  // const existOrder = await OrdersCollection.findOne({
  //   ep: payload.ep,
  //   _id: { $ne: orderId },
  // });

  // if (existOrder) {
  //   throw createHttpError(400, 'Order with this EP already exists!');
  // }

  if (payload.ep !== undefined) {
    const existOrder = await OrdersCollection.findOne({
      ep: payload.ep,
      _id: { $ne: orderId },
    });

    if (existOrder) {
      throw createHttpError(400, 'Order with this EP already exists!');
    }
  }

  const updateData = { ...payload };

  const totalItems = payload.totalItems;
  const completedItems = payload.completedItems;
  const totalM2 = payload.totalM2;
  const completedM2 = payload.completedM2;

  if (
    totalItems !== undefined &&
    completedItems !== undefined &&
    totalM2 !== undefined &&
    completedM2 !== undefined
  ) {
    const diffItems = totalItems - completedItems;
    const diffM2 = totalM2 - completedM2;

    updateData.missedItems = diffItems > 0 ? diffItems : 0;
    updateData.missedM2 = diffM2 > 0 ? diffM2 : 0;
    updateData.isFinal =
      updateData.missedItems === 0 && updateData.missedM2 === 0 ? true : false;

    updateData.totalItems = totalItems;
    updateData.completedItems = completedItems;
    updateData.totalM2 = totalM2;
    updateData.completedM2 = completedM2;
  }

  const editedOrder = await OrdersCollection.findByIdAndUpdate(
    orderId,
    updateData,
    { new: true },
  );

  if (!editedOrder) throw createHttpError(404, 'Order not found');

  return { order: editedOrder };
};

export const deleteOrderService = async (orderId) => {
  const orderToDelete = await OrdersCollection.findById(orderId);
  if (!orderToDelete) {
    throw createHttpError(404, 'Order not found!');
  }

  await OrdersCollection.findByIdAndDelete(orderId);

  return orderToDelete;
};
