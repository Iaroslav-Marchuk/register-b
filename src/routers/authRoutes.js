import { Router } from 'express';

import { validateBody } from '../middlewares/validateBody.js';

import {
  loginUserSchema,
  registerUserSchema,
} from '../validation/userValidation.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import {
  getCurrentUserController,
  loginUserController,
  logoutController,
  refreshController,
  registerUserController,
} from '../controllers/authControllers.js';

import { authenticate } from '../middlewares/authenticante.js';

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

export default router;
