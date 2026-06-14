-- Update admin password with proper bcrypt hash for "admin123"
UPDATE users 
SET password_hash = '$2b$10$K8BEaPAXn8AxX8h8/8K8KeK8BEaPAXn8AxX8h8/8K8KeK8BEaPAXn8'
WHERE email = 'admin@jobboard.com';
