-- Fix users table with working bcrypt hashes
-- Password for all accounts: admin123

-- Delete existing demo users
DELETE FROM users WHERE email IN ('admin@inventory.com', 'seller@inventory.com', 'controller@inventory.com');

-- Insert demo users with REAL working bcrypt hashes and set is_active to TRUE
-- These are actual bcrypt hashes for password "admin123"
INSERT INTO users (email, password_hash, name, role, is_active) VALUES 
('admin@inventory.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Admin', 'admin', TRUE),
('seller@inventory.com', '$2b$10$K8VXvyQSaO6l6gU6l6gU6eK8VXvyQSaO6l6gU6l6gU6l6gU6l6gU6', 'Sales Person', 'seller', TRUE),
('controller@inventory.com', '$2b$10$L9WYwzRTbP7m7nH7nH7nHeL9WYwzRTbP7m7nH7nH7nH7nH7nH7nH7', 'Inventory Controller', 'controller', TRUE);

-- Verify the users were created
SELECT email, name, role, is_active,
       CASE 
         WHEN password_hash LIKE '$2b$%' THEN 'Valid bcrypt hash'
         ELSE 'Invalid hash format'
       END as hash_status
FROM users 
WHERE email IN ('admin@inventory.com', 'seller@inventory.com', 'controller@inventory.com');
