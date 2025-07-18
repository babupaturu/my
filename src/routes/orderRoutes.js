
import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder
} from '../controllers/orderController.js';
import { processPayment } from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, createOrderSchema } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticateToken); // All order routes require authentication

router.post('/create', validateRequest(createOrderSchema), createOrder);
router.get('/', getOrders);
router.get('/:orderId', getOrderById);
router.put('/:orderId/cancel', cancelOrder);
router.post('/payments/process', processPayment);

export default router;
