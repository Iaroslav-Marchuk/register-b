import createHttpError from 'http-errors';

import { OrdersCollection } from '../db/models/orderModel.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/constants.js';
import mongoose from 'mongoose';

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

  if (completedItems > totalItems || completedM2 > totalM2) {
    throw createHttpError(400, 'Completed values cannot exceed total');
  }

  if (
    (completedItems === totalItems && completedM2 !== totalM2) ||
    (completedM2 === totalM2 && completedItems !== totalItems)
  ) {
    throw createHttpError(400, 'Items and M2 must be completed together');
  }

  if (completedItems < totalItems && completedM2 >= totalM2) {
    throw createHttpError(400, 'M2 cannot be completed before items');
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
  const { ep, completedItems, completedM2, ...rest } = payload;

  const lastProductinOrder = await OrdersCollection.findOne({
    ep,
    isFinal: true,
    type: { $in: ['created', 'continued'] },
  }).sort({
    createdAt: -1,
  });

  if (!lastProductinOrder) {
    throw createHttpError(404, 'No existing order with this EP found');
  }

  if (!lastProductinOrder.isFinal) {
    throw createHttpError(
      400,
      'Cannot create recovery before finishing production order',
    );
  }

  const firstProductionOrder = await OrdersCollection.findOne({
    ep,
    type: 'created',
  }).sort({ createdAt: 1 });

  if (!firstProductionOrder) {
    throw createHttpError(404, 'Original order not found');
  }

  if (
    completedItems > firstProductionOrder.totalItems ||
    completedM2 > firstProductionOrder.totalM2
  ) {
    throw createHttpError(
      400,
      'Completed values cannot exceed total items or M2 from original order',
    );
  }

  const recoveredOrder = await OrdersCollection.create({
    ep,
    completedItems,
    completedM2,
    type: 'recovered',
    isFinal: true,
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

  if (
    completedItems > lastExistOrder.missedItems ||
    completedM2 > lastExistOrder.missedM2
  ) {
    throw createHttpError(
      400,
      'Completed values cannot exceed remaining amounts',
    );
  }

  if (!lastExistOrder.isFinal) {
    if (
      completedItems === lastExistOrder.missedItems &&
      completedM2 !== lastExistOrder.missedM2
    ) {
      throw createHttpError(400, 'Invalid final completion (M2)');
    }

    if (
      completedM2 === lastExistOrder.missedM2 &&
      completedItems !== lastExistOrder.missedItems
    ) {
      throw createHttpError(400, 'Invalid final completion (Items)');
    }

    if (
      completedItems < lastExistOrder.missedItems &&
      completedM2 >= lastExistOrder.missedM2
    ) {
      throw createHttpError(400, 'M2 cannot be completed before items');
    }
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

  if (payload.ep !== undefined && Number(payload.ep) !== oldOrder.ep) {
    const epNumber = Number(payload.ep);
    const existOrder = await OrdersCollection.findOne({
      ep: epNumber,
    });

    if (existOrder) {
      throw createHttpError(400, 'Order with this EP already exists!');
    }
  }

  const { ep } = oldOrder;

  const lastOrderForEp = await OrdersCollection.findOne({ ep }).sort({
    createdAt: -1,
  });

  const isLast = lastOrderForEp._id.toString() === orderId;

  if (!isLast && oldOrder.type !== 'recovered') {
    throw createHttpError(400, 'Cannot edit intermediate production step');
  }

  const updateData = { ...payload };

  if (oldOrder.type !== 'recovered') {
    const totalItems = payload.totalItems;
    const completedItems = payload.completedItems ?? oldOrder.completedItems;
    const totalM2 = payload.totalM2;
    const completedM2 = payload.completedM2 ?? oldOrder.completedM2;

    const previousOrders = await OrdersCollection.find({
      ep,
      _id: { $ne: orderId },
    });

    const totalCompletedBefore = previousOrders.reduce(
      (sum, o) => sum + o.completedItems,
      0,
    );
    const totalCompletedM2Before = previousOrders.reduce(
      (sum, o) => sum + o.completedM2,
      0,
    );

    const remainingItems = totalItems - totalCompletedBefore;
    const remainingM2 = totalM2 - totalCompletedM2Before;

    if (completedItems > remainingItems) {
      throw createHttpError(
        400,
        'Cannot complete more than remaining items (including previous completions)',
      );
    }

    if (completedM2 > remainingM2) {
      throw createHttpError(
        400,
        'Cannot complete more than remaining M2 (including previous completions)',
      );
    }

    if (completedItems > totalItems || completedM2 > totalM2) {
      throw createHttpError(400, 'Completed values cannot exceed total');
    }

    if (
      completedItems < oldOrder.missedItems &&
      completedM2 >= oldOrder.missedM2
    ) {
      throw createHttpError(400, 'M2 cannot be completed before items');
    }

    if (
      (completedItems === totalItems && completedM2 !== totalM2) ||
      (completedM2 === totalM2 && completedItems !== totalItems)
    ) {
      throw createHttpError(400, 'Items and M2 must be completed together');
    }

    if (completedItems < totalItems && completedM2 >= totalM2) {
      throw createHttpError(400, 'M2 cannot be completed before items');
    }

    if (completedItems < remainingItems && completedM2 >= remainingM2) {
      throw createHttpError(
        400,
        'M2 cannot be completed before items are finished',
      );
    }

    if (
      totalItems !== undefined &&
      completedItems !== undefined &&
      totalM2 !== undefined &&
      completedM2 !== undefined
    ) {
      updateData.missedItems = remainingItems - completedItems;
      updateData.missedM2 = remainingM2 - completedM2;
      updateData.isFinal =
        updateData.missedItems === 0 && updateData.missedM2 === 0
          ? true
          : false;

      updateData.totalItems = totalItems;
      updateData.completedItems = completedItems;
      updateData.totalM2 = totalM2;
      updateData.completedM2 = completedM2;
    }
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

  const { ep } = orderToDelete;

  const lastOrderForEp = await OrdersCollection.findOne({ ep }).sort({
    createdAt: -1,
  });

  const isLast = lastOrderForEp._id.toString() === orderId;

  if (!lastOrderForEp) {
    throw createHttpError(500, 'Order chain is corrupted');
  }

  if (lastOrderForEp._id.toString() !== orderId) {
    throw createHttpError(400, 'Cannot delete intermediate production step');
  }

  if (
    !isLast &&
    orderToDelete.type === 'created' &&
    orderToDelete.isFinal === false
  ) {
    throw createHttpError(
      400,
      'Cannot delete non-final initial production order',
    );
  }

  await OrdersCollection.findByIdAndDelete(orderId);

  return orderToDelete;
};

export const getUserDailyActivityService = async (userId, year) => {
  const selectedYear = Number(year) || new Date().getFullYear();

  const start = new Date(selectedYear, 0, 1);
  const end = new Date(selectedYear + 1, 0, 1);

  const activity = await OrdersCollection.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        $or: [
          { createdAt: { $gte: start, $lt: end } },
          { updatedAt: { $gte: start, $lt: end } },
        ],
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
          },
        },
        totalCompletedItems: { $sum: '$completedItems' },
        totalCompletedM2: { $sum: '$completedM2' },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        totalCompletedItems: 1,
        totalCompletedM2: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);

  return activity;
};
