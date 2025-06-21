-- Clear previous data (order matters due to foreign keys)
DELETE FROM wishlist;
DELETE FROM reviews;
DELETE FROM payments;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM sellers;
DELETE FROM addresses;
DELETE FROM users;

-- USERS
INSERT INTO users (name, email, password, phone, role) VALUES
('Alice Smith', 'alice@example.com', 'hashed_pass1', '+911111111111', 'customer'),
('Bob Seller', 'bob@seller.com', 'hashed_pass2', '+922222222222', 'seller'),
('Admin Joe', 'admin@example.com', 'hashed_pass3', '+933333333333', 'admin');

-- ADDRESSES
INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, zip_code, country) VALUES
(1, 'Alice Smith', '+911111111111', '123 Lane', 'Apt 1', 'Delhi', 'Delhi', '110001', 'India');

-- SELLERS
INSERT INTO sellers (user_id, business_name, business_description) VALUES
(2, 'TechZone', 'Electronics and gadgets');

-- CATEGORIES
INSERT INTO categories (name, parent_id) VALUES
('Electronics', NULL),
('Mobiles', 1),
('Laptops', 1),
('Home Appliances', NULL);

-- PRODUCTS
INSERT INTO products (name, description, price, stock, seller_id, category_id, images, variations) VALUES
('iPhone 15', 'Latest Apple smartphone', 999.99, 20, 1, 2, 'iphone1.jpg,iphone2.jpg', '{"color": ["Black", "Blue"], "storage": ["128GB", "256GB"]}'),
('MacBook Air M2', 'Apple M2 laptop', 1299.99, 15, 1, 3, 'macbook1.jpg,macbook2.jpg', '{"color": ["Silver", "Space Gray"], "ram": ["8GB", "16GB"]}'),
('Samsung Refrigerator', 'Double door fridge', 799.99, 10, 1, 4, 'fridge1.jpg,fridge2.jpg', '{"color": ["Silver"]}');

-- CART ITEMS
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(1, 1, 1),
(1, 2, 1);

-- ORDERS
INSERT INTO orders (user_id, total, status, shipping_address_id) VALUES
(1, 2299.98, 'pending_payment', 1);

-- ORDER ITEMS
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES
(1, 1, 1, 999.99),
(1, 2, 1, 1299.99);

-- PAYMENTS
INSERT INTO payments (order_id, method, transaction_id, status, paid_at) VALUES
(1, 'card', 'TXN123456', 'success', datetime('now'));

-- REVIEWS
INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES
(1, 1, 5, 'Awesome phone!', 'The iPhone 15 is super fast and premium.'),
(2, 1, 4, 'Sleek and powerful', 'Great battery life and performance.');

-- WISHLIST
INSERT INTO wishlist (user_id, product_id) VALUES
(1, 3),
(1, 2);
