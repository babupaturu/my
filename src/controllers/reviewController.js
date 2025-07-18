
import getDatabase from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;
  const userId = req.user.id;

  const db = await getDatabase();

  // Check if user has purchased this product
  const hasPurchased = await db.get(`
    SELECT 1 FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.user_id = ? AND oi.product_id = ? AND o.status IN ('confirmed', 'shipped', 'delivered')
  `, [userId, productId]);

  if (!hasPurchased) {
    return res.status(403).json({
      success: false,
      message: 'You can only review products you have purchased'
    });
  }

  // Check if user has already reviewed this product
  const existingReview = await db.get(
    'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );

  if (existingReview) {
    return res.status(409).json({
      success: false,
      message: 'You have already reviewed this product'
    });
  }

  const result = await db.run(
    'INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES (?, ?, ?, ?, ?)',
    [productId, userId, rating, title, comment]
  );

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    reviewId: result.lastID
  });
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const db = await getDatabase();
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await db.all(`
    SELECT r.*, u.name as user_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `, [productId, parseInt(limit), offset]);

  const totalResult = await db.get('SELECT COUNT(*) as total FROM reviews WHERE product_id = ?', [productId]);
  const totalPages = Math.ceil(totalResult.total / parseInt(limit));

  res.json({
    success: true,
    page: parseInt(page),
    totalPages,
    reviews
  });
});
