-- Delete existing admin user and recreate with proper hash
DELETE FROM users WHERE email = 'admin@jobboard.com';

-- Insert admin user with a working bcrypt hash for "admin123"
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@jobboard.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
