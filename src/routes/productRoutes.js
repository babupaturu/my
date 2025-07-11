
import express from 'express';
import {
  getProducts,
  getProductById,
  getCategories
} from '../controllers/productController.js';
import {
  createReview,
  getProductReviews
} from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, reviewSchema } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);
router.post('/reviews', authenticateToken, validateRequest(reviewSchema), createReview);
router.get('/:productId/reviews', getProductReviews);

export default router;
