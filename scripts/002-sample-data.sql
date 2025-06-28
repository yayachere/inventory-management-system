-- Insert sample inventory items
-- Run this after creating users with fix-users-table.sql

INSERT INTO items (name, description, sku, price, quantity, category, created_by) VALUES 
('Laptop Computer', 'High-performance laptop for business use', 'LAP-001', 999.99, 25, 'Electronics', 1),
('Office Chair', 'Ergonomic office chair with lumbar support', 'CHR-001', 299.99, 15, 'Furniture', 1),
('Wireless Mouse', 'Bluetooth wireless mouse', 'MOU-001', 49.99, 100, 'Electronics', 1),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 'LAM-001', 79.99, 30, 'Office Supplies', 1),
('Monitor 24"', '24-inch LED monitor with HDMI', 'MON-001', 299.99, 20, 'Electronics', 1),
('Keyboard Mechanical', 'RGB mechanical gaming keyboard', 'KEY-001', 129.99, 50, 'Electronics', 1),
('Notebook A4', 'Professional notebook 200 pages', 'NOT-001', 12.99, 200, 'Office Supplies', 1),
('Pen Set', 'Premium ballpoint pen set', 'PEN-001', 24.99, 75, 'Office Supplies', 1)
ON CONFLICT (sku) DO NOTHING;
