import {
  createOrderService,
  deleteOrderService,
  getAllOrdersService,
  // getOrderByIdService,
  updateOrderService,
} from '../services/orderServices.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';

export const getAllOrdersController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const orders = await getAllOrdersService({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

  res.status(200).json({
    message: 'Successfully found orders!',
    orders,
  });
};

// export const getOrderByIdController = async (req, res) => {
//   const { orderId } = req.params;
//   const order = await getOrderByIdService(orderId);

//   res.status(200).json({
//     message: `Successfully found order with id: ${orderId}`,
//     order,
//   });
// };

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
  });
};
