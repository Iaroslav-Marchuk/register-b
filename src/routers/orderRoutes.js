import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import {
  createOrderController,
  deleteOrderController,
  getAllOrdersController,
  // getOrderByIdController,
  updateOrderController,
} from '../controllers/orderControllers.js';
import { isValidId } from '../middlewares/isValidId.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createOrderSchema,
  updateOrderSchema,
} from '../validation/orderValidation.js';
import { authenticate } from '../middlewares/authenticante.js';

const router = Router();

router.get('/', authenticate, ctrlWrapper(getAllOrdersController));

// router.get('/:orderId', isValidId, ctrlWrapper(getOrderByIdController));

router.post(
  '/',
  authenticate,
  validateBody(createOrderSchema),
  ctrlWrapper(createOrderController),
);

router.patch(
  '/:orderId',
  authenticate,
  isValidId,
  validateBody(updateOrderSchema),
  ctrlWrapper(updateOrderController),
);

router.delete(
  '/:orderId',
  authenticate,
  isValidId,
  ctrlWrapper(deleteOrderController),
);

export default router;
