
import express from 'express';
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, addToCartSchema, updateCartSchema } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticateToken); // All cart routes require authentication

router.post('/add', validateRequest(addToCartSchema), addToCart);
router.get('/', getCart);
router.put('/update/:itemId', validateRequest(updateCartSchema), updateCartItem);
router.delete('/remove/:itemId', removeCartItem);
router.delete('/clear', clearCart);

export default router;
