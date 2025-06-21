
import getDatabase from '../config/database.js';
import { Product } from '../models/product.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  // Check if product exists and has sufficient stock
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (product.stock < quantity) {
    return res.status(409).json({
      success: false,
      message: 'Insufficient stock'
    });
  }

  const db = await getDatabase();

  // Check if item already exists in cart
  const existingItem = await db.get(
    'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );

  if (existingItem) {
    // Update quantity
    await db.run(
      'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
      [quantity, userId, productId]
    );
  } else {
    // Add new item
    await db.run(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [userId, productId, quantity]
    );
  }

  // Calculate cart total
  const cartTotal = await getCartTotal(userId);

  res.json({
    success: true,
    message: 'Item added to cart',
    cartTotal
  });
});

export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const db = await getDatabase();

  const cartItems = await db.all(`
    SELECT ci.*, p.name, p.price, p.images, p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
    ORDER BY ci.added_at DESC
  `, [userId]);

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  res.json({
    success: true,
    items: cartItems.map(item => ({
      ...item,
      images: item.images ? item.images.split(',') : []
    })),
    total
  });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  const db = await getDatabase();

  // Check if item belongs to user
  const cartItem = await db.get(
    'SELECT ci.*, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.user_id = ?',
    [itemId, userId]
  );

  if (!cartItem) {
    return res.status(404).json({
      success: false,
      message: 'Cart item not found'
    });
  }

  if (quantity > cartItem.stock) {
    return res.status(409).json({
      success: false,
      message: 'Insufficient stock'
    });
  }

  await db.run(
    'UPDATE cart_items SET quantity = ? WHERE id = ?',
    [quantity, itemId]
  );

  const cartTotal = await getCartTotal(userId);

  res.json({
    success: true,
    message: 'Cart updated',
    cartTotal
  });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  const db = await getDatabase();

  const result = await db.run(
    'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
    [itemId, userId]
  );

  if (result.changes === 0) {
    return res.status(404).json({
      success: false,
      message: 'Cart item not found'
    });
  }

  res.json({
    success: true,
    message: 'Item removed from cart'
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const db = await getDatabase();

  await db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);

  res.json({
    success: true,
    message: 'Cart cleared'
  });
});

const getCartTotal = async (userId) => {
  const db = await getDatabase();
  const result = await db.get(`
    SELECT SUM(ci.quantity * p.price) as total
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `, [userId]);
  
  return result.total || 0;
};
