import { Router } from 'express';

import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticante.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import {
  loginUserSchema,
  registerUserSchema,
} from '../validation/userValidation.js';

import {
  changelocalController,
  changePasswordController,
  getCurrentUserController,
  loginUserController,
  logoutController,
  refreshController,
  registerUserController,
} from '../controllers/authControllers.js';

const router = Router();

router.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);

router.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);

router.post('/logout', ctrlWrapper(logoutController));

router.post('/refresh', ctrlWrapper(refreshController));

router.get('/currentUser', authenticate, getCurrentUserController);

router.patch('/changeLocal', authenticate, changelocalController);

router.patch(
  '/changePassword',
  authenticate,
  ctrlWrapper(changePasswordController),
);

export default router;
