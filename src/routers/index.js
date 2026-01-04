import { Router } from 'express';

import authRouter from './authRoutes.js';
import orderRouter from './orderRoutes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/orders', orderRouter);

export default router;
