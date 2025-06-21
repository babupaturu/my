
import getDatabase from '../config/database.js';

export class Product {
  static async getAll(filters = {}) {
    const db = await getDatabase();
    let query = `
      SELECT p.*, c.name as category_name, s.business_name as seller_name,
             AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sellers s ON p.seller_id = s.id
      LEFT JOIN reviews r ON p.id = r.product_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (filters.category) {
      conditions.push('c.name = ?');
      params.push(filters.category);
    }
    
    if (filters.minPrice) {
      conditions.push('p.price >= ?');
      params.push(filters.minPrice);
    }
    
    if (filters.maxPrice) {
      conditions.push('p.price <= ?');
      params.push(filters.maxPrice);
    }
    
    if (filters.search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY p.id';
    
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          query += ' ORDER BY p.price ASC';
          break;
        case 'price_desc':
          query += ' ORDER BY p.price DESC';
          break;
        case 'rating':
          query += ' ORDER BY avg_rating DESC';
          break;
        case 'newest':
          query += ' ORDER BY p.created_at DESC';
          break;
      }
    }
    
    const limit = parseInt(filters.limit) || 20;
    const offset = ((parseInt(filters.page) || 1) - 1) * limit;
    
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const products = await db.all(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(DISTINCT p.id) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id';
    const countConditions = [];
    const countParams = [];
    
    if (filters.category) {
      countConditions.push('c.name = ?');
      countParams.push(filters.category);
    }
    
    if (filters.minPrice) {
      countConditions.push('p.price >= ?');
      countParams.push(filters.minPrice);
    }
    
    if (filters.maxPrice) {
      countConditions.push('p.price <= ?');
      countParams.push(filters.maxPrice);
    }
    
    if (filters.search) {
      countConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      countParams.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (countConditions.length > 0) {
      countQuery += ' WHERE ' + countConditions.join(' AND ');
    }
    
    const totalResult = await db.get(countQuery, countParams);
    
    return {
      products: products.map(product => ({
        ...product,
        images: product.images ? product.images.split(',') : [],
        variations: product.variations ? JSON.parse(product.variations) : {}
      })),
      total: totalResult.total
    };
  }

  static async findById(id) {
    const db = await getDatabase();
    const product = await db.get(`
      SELECT p.*, c.name as category_name, s.business_name as seller_name, s.id as seller_id,
             AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sellers s ON p.seller_id = s.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);
    
    if (!product) return null;
    
    return {
      ...product,
      images: product.images ? product.images.split(',') : [],
      variations: product.variations ? JSON.parse(product.variations) : {}
    };
  }

  static async getCategories() {
    const db = await getDatabase();
    return await db.all('SELECT * FROM categories ORDER BY name');
  }

  static async updateStock(productId, quantity) {
    const db = await getDatabase();
    await db.run('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', [quantity, productId, quantity]);
  }

  static async checkStock(productId, quantity) {
    const db = await getDatabase();
    const product = await db.get('SELECT stock FROM products WHERE id = ?', [productId]);
    return product && product.stock >= quantity;
  }
}
