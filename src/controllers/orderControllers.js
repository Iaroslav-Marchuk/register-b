import {
  createOrderService,
  deleteOrderService,
  getAllOrdersService,
  getOrderByIdService,
  updateOrderService,
} from '../services/orderServices.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';

export const getAllOrdersController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);

  const orders = await getAllOrdersService({ page, perPage });

  res.status(200).json({
    message: 'Successfully found orders!',
    orders,
  });
};

export const getOrderByIdController = async (req, res) => {
  const { orderId } = req.params;
  const order = await getOrderByIdService(orderId);

  res.status(200).json({
    message: `Successfully found order with id: ${orderId}`,
    order,
  });
};

export const createOrderController = async (req, res) => {
  const newOrder = await createOrderService(req.body, req.user._id);

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
  });
};
