import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import {
  createOrderController,
  deleteOrderController,
  getAllOrdersController,
  getOrderByIdController,
  updateOrderController,
} from '../controllers/orderControllers.js';
import { isValidId } from '../middlewares/isValidId.js';

const router = Router();

router.get('/', ctrlWrapper(getAllOrdersController));

router.get('/:orderId', isValidId, ctrlWrapper(getOrderByIdController));

router.post('/', ctrlWrapper(createOrderController));

router.patch('/:orderId', isValidId, ctrlWrapper(updateOrderController));

router.delete('/:orderId', isValidId, ctrlWrapper(deleteOrderController));
