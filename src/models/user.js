
import getDatabase from '../config/database.js';
import bcrypt from 'bcrypt';

export class User {
  static async create(userData) {
    const db = await getDatabase();
    const { name, email, password, phone, role = 'customer' } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, role]
    );
    
    return result.lastID;
  }

  static async findByEmail(email) {
    const db = await getDatabase();
    return await db.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  static async findById(id) {
    const db = await getDatabase();
    return await db.get('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [id]);
  }

  static async update(id, userData) {
    const db = await getDatabase();
    const { name, email, phone } = userData;
    
    await db.run(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone, id]
    );
    
    return await this.findById(id);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async addAddress(userId, addressData) {
    const db = await getDatabase();
    const { full_name, phone, address_line1, address_line2, city, state, zip_code, country } = addressData;
    
    const result = await db.run(
      'INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, zip_code, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, full_name, phone, address_line1, address_line2, city, state, zip_code, country]
    );
    
    return result.lastID;
  }

  static async getAddresses(userId) {
    const db = await getDatabase();
    return await db.all('SELECT * FROM addresses WHERE user_id = ?', [userId]);
  }
}
