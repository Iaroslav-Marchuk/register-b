import {
  createOrderService,
  deleteOrderService,
  getOrdersService,
  updateOrderService,
} from '../services/orderServices.js';
import { buildDayRangeQuery } from '../utils/normalizeData.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';

export const getAllOrdersController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const orders = await getOrdersService({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

  res.status(200).json({
    message: 'Successfully found orders!',
    ...orders,
  });
};

export const getTodayOrdersController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);

  const filter = {
    createdAt: buildDayRangeQuery(new Date()),
    location: req.user.location,
    userId: req.user._id,
  };

  const orders = await getOrdersService({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

  res.status(200).json({
    message: 'Successfully found orders!',
    ...orders,
  });
};

export const createOrderController = async (req, res) => {
  const payload = {
    ...req.body,
    owner: req.user._id,
    local: req.user.local,
  };

  console.log(payload);
  const newOrder = await createOrderService(payload);

  res.status(201).json({
    message: 'Successfully created new order!',
    newOrder,
  });
};

export const updateOrderController = async (req, res) => {
  const { orderId } = req.params;
  const payload = req.body;

  const updatedOrder = await updateOrderService(orderId, payload);

  res.status(200).json({
    message: 'Successfully updated order!',
    updatedOrder,
  });
};

export const deleteOrderController = async (req, res) => {
  const { orderId } = req.params;
  await deleteOrderService(orderId);

  res.status(200).json({
    message: 'Order deleted successfully',
    orderId,
  });
};
