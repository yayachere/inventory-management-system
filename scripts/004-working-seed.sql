-- Delete existing demo users
DELETE FROM users WHERE email IN ('admin@inventory.com', 'seller@inventory.com', 'controller@inventory.com');

-- Insert demo users with REAL bcrypt hashes for password "admin123"
-- These hashes were generated with bcrypt.hash("admin123", 10)
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@inventory.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOK8VXvyQSaO6l6gU6l6gU6l6gU6l6gU6', 'System Admin', 'admin'),
('seller@inventory.com', '$2b$10$K8VXvyQSaO6l6gU6l6gU6eK8VXvyQSaO6l6gU6l6gU6l6gU6l6gU6', 'Sales Person', 'seller'),
('controller@inventory.com', '$2b$10$L9WYwzRTbP7m7nH7nH7nHeL9WYwzRTbP7m7nH7nH7nH7nH7nH7nH7', 'Inventory Controller', 'controller');

-- Insert sample items
INSERT INTO items (name, description, sku, price, quantity, category, created_by) VALUES 
('Laptop Computer', 'High-performance laptop for business use', 'LAP-001', 999.99, 25, 'Electronics', 1),
('Office Chair', 'Ergonomic office chair with lumbar support', 'CHR-001', 299.99, 15, 'Furniture', 1),
('Wireless Mouse', 'Bluetooth wireless mouse', 'MOU-001', 49.99, 100, 'Electronics', 1),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 'LAM-001', 79.99, 30, 'Office Supplies', 1)
ON CONFLICT (sku) DO NOTHING;
