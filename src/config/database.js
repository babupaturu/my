
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

export const getDatabase = async () => {
  if (db) return db;
  
  try {
    db = await open({
      filename: path.join(__dirname, '../../database/ecommerce.db'),
      driver: sqlite3.Database
    });
    
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    
    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

export default getDatabase;
