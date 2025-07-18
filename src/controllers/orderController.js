
import { Order } from '../models/order.js';
import { Product } from '../models/product.js';
import { User } from '../models/user.js';
import getDatabase from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  const userId = req.user.id;

  const db = await getDatabase();

  // Get cart items
  const cartItems = await db.all(`
    SELECT ci.*, p.name, p.price, p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `, [userId]);

  if (cartItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty'
    });
  }

  // Check stock availability
  for (const item of cartItems) {
    if (item.stock < item.quantity) {
      return res.status(409).json({
        success: false,
        message: `Insufficient stock for ${item.name}`
      });
    }
  }

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Create shipping address
  const addressId = await User.addAddress(userId, {
    full_name: shippingAddress.fullName,
    phone: shippingAddress.phone,
    address_line1: shippingAddress.addressLine1,
    address_line2: shippingAddress.addressLine2,
    city: shippingAddress.city,
    state: shippingAddress.state,
    zip_code: shippingAddress.zipCode,
    country: shippingAddress.country
  });

  // Create order
  const orderId = await Order.create(userId, {
    total,
    shipping_address_id: addressId
  });

  // Create order items
  const orderItems = cartItems.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.price
  }));

  await Order.addOrderItems(orderId, orderItems);

  // Update product stock
  for (const item of cartItems) {
    await Product.updateStock(item.product_id, item.quantity);
  }

  // Clear cart
  await db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);

  // Generate unique order ID
  const orderNumber = `ORD${orderId.toString().padStart(6, '0')}`;

  res.status(201).json({
    success: true,
    orderId: orderNumber,
    totalAmount: total,
    status: 'pending_payment'
  });
});

export const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user.id;

  const result = await Order.getUserOrders(userId, parseInt(page), parseInt(limit));
  const totalPages = Math.ceil(result.total / parseInt(limit));

  res.json({
    success: true,
    page: parseInt(page),
    totalPages,
    orders: result.orders
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  const order = await Order.findById(orderId, userId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.json({
    success: true,
    order
  });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  const order = await Order.findById(orderId, userId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.status !== 'pending_payment') {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be cancelled'
    });
  }

  await Order.updateStatus(orderId, 'cancelled');

  // Restore stock
  for (const item of order.items) {
    const db = await getDatabase();
    await db.run('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
  }

  res.json({
    success: true,
    message: 'Order cancelled successfully'
  });
});
