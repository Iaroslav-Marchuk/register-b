import {
  createOrderService,
  createRecoveryOrderService,
  deleteOrderService,
  editOrderService,
  existOrderService,
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
    location: req.user.local,
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

export const existOrderController = async (req, res) => {
  const { ep } = req.body;
  const { isExist, order } = await existOrderService({ ep });
  res.status(200).json({
    message: 'Successfully checked order EP!',
    isExist,
    order,
  });
};

export const createOrderController = async (req, res) => {
  const payload = {
    ...req.body,
    owner: req.user._id,
    local: req.user.local,
  };

  const { order } = await createOrderService(payload);

  res.status(201).json({
    message: 'Successfully created new order!',
    order,
  });
};

export const createRecoveryOrderController = async (req, res) => {
  const payload = {
    ...req.body,
    owner: req.user._id,
    local: req.user.local,
  };

  const { order } = await createRecoveryOrderService(payload);

  res.status(201).json({
    message: 'Successfully created recovery order!',
    order,
  });
};

export const updateOrderController = async (req, res) => {
  const payload = {
    ...req.body,
    owner: req.user._id,
    local: req.user.local,
  };

  const { order } = await updateOrderService(payload);
  res.status(201).json({
    message: 'Successfully updated order!',
    order,
  });
};

export const editOrderController = async (req, res) => {
  const { orderId } = req.params;
  const payload = { ...req.body };

  const { order } = await editOrderService(orderId, payload);

  res.status(200).json({
    message: 'Successfully updated order!',
    order,
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
