
import getDatabase from '../config/database.js';

export class Order {
  static async create(userId, orderData) {
    const db = await getDatabase();
    const { total, shipping_address_id } = orderData;
    
    const result = await db.run(
      'INSERT INTO orders (user_id, total, shipping_address_id) VALUES (?, ?, ?)',
      [userId, total, shipping_address_id]
    );
    
    return result.lastID;
  }

  static async addOrderItems(orderId, items) {
    const db = await getDatabase();
    
    for (const item of items) {
      await db.run(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price_at_purchase]
      );
    }
  }

  static async findById(orderId, userId = null) {
    const db = await getDatabase();
    let query = `
      SELECT o.*, a.full_name, a.phone, a.address_line1, a.address_line2,
             a.city, a.state, a.zip_code, a.country
      FROM orders o
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      WHERE o.id = ?
    `;
    const params = [orderId];
    
    if (userId) {
      query += ' AND o.user_id = ?';
      params.push(userId);
    }
    
    const order = await db.get(query, params);
    
    if (!order) return null;
    
    // Get order items
    const items = await db.all(`
      SELECT oi.*, p.name as product_name, p.images
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
    
    return {
      ...order,
      items: items.map(item => ({
        ...item,
        images: item.images ? item.images.split(',') : []
      }))
    };
  }

  static async getUserOrders(userId, page = 1, limit = 10) {
    const db = await getDatabase();
    const offset = (page - 1) * limit;
    
    const orders = await db.all(`
      SELECT o.*, COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
    
    const totalResult = await db.get('SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [userId]);
    
    return {
      orders,
      total: totalResult.total
    };
  }

  static async updateStatus(orderId, status) {
    const db = await getDatabase();
    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  }

  static async createPayment(orderData) {
    const db = await getDatabase();
    const { order_id, method, transaction_id, status = 'success' } = orderData;
    
    const result = await db.run(
      'INSERT INTO payments (order_id, method, transaction_id, status, paid_at) VALUES (?, ?, ?, ?, datetime("now"))',
      [order_id, method, transaction_id, status]
    );
    
    return result.lastID;
  }
}
