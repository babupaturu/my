
import { Order } from '../models/order.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const processPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentDetails } = req.body;
  const userId = req.user.id;

  // Extract order ID from order number (e.g., ORD000001 -> 1)
  const actualOrderId = parseInt(orderId.replace('ORD', ''));

  const order = await Order.findById(actualOrderId, userId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.status !== 'pending_payment') {
    return res.status(400).json({
      success: false,
      message: 'Order is not pending payment'
    });
  }

  // Simulate payment processing
  const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

  // Create payment record
  await Order.createPayment({
    order_id: actualOrderId,
    method: paymentDetails.method,
    transaction_id: transactionId,
    status: 'success'
  });

  // Update order status
  await Order.updateStatus(actualOrderId, 'confirmed');

  res.json({
    success: true,
    transactionId,
    message: 'Payment successful'
  });
});
