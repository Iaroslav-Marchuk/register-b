import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import {
  createOrderController,
  createRecoveryOrderController,
  deleteOrderController,
  editOrderController,
  existOrderController,
  getAllOrdersController,
  getTodayOrdersController,
  getUserDailyActivityController,
  updateOrderController,
  // getOrderByIdController,
} from '../controllers/orderControllers.js';
import { isValidId } from '../middlewares/isValidId.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createOrderSchema,
  createRecoveryOrderSchema,
  editOrderSchema,
  updateOrderSchema,
} from '../validation/orderValidation.js';
import { authenticate } from '../middlewares/authenticante.js';

const router = Router();

router.get('/', authenticate, ctrlWrapper(getAllOrdersController));

router.get('/today', authenticate, ctrlWrapper(getTodayOrdersController));

// router.get('/:orderId', isValidId, ctrlWrapper(getOrderByIdController));

router.post('/existOrder', authenticate, ctrlWrapper(existOrderController));

router.post(
  '/',
  authenticate,
  validateBody(createOrderSchema),
  ctrlWrapper(createOrderController),
);

router.post(
  '/recovery',
  authenticate,
  validateBody(createRecoveryOrderSchema),
  ctrlWrapper(createRecoveryOrderController),
);

router.post(
  '/update',
  authenticate,
  validateBody(updateOrderSchema),
  ctrlWrapper(updateOrderController),
);

router.patch(
  '/:orderId',
  authenticate,
  isValidId,
  validateBody(editOrderSchema),
  ctrlWrapper(editOrderController),
);

router.delete(
  '/:orderId',
  authenticate,
  isValidId,
  ctrlWrapper(deleteOrderController),
);

router.get(
  '/activity/:year',
  authenticate,
  ctrlWrapper(getUserDailyActivityController),
);

export default router;
