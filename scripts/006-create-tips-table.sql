-- Create tips table
CREATE TABLE IF NOT EXISTS tips (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    author VARCHAR(255) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    difficulty_level VARCHAR(50) DEFAULT 'Beginner',
    estimated_read_time INTEGER DEFAULT 5,
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'published',
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tips_category ON tips(category);
CREATE INDEX IF NOT EXISTS idx_tips_status ON tips(status);
CREATE INDEX IF NOT EXISTS idx_tips_created_at ON tips(created_at);
CREATE INDEX IF NOT EXISTS idx_tips_is_featured ON tips(is_featured);

-- Insert sample tips data
INSERT INTO tips (title, content, category, author, tags, difficulty_level, estimated_read_time, is_featured) VALUES
('How to Write an Effective Resume', 'A comprehensive guide on creating a resume that stands out to employers. Include relevant experience, use action verbs, and tailor it to each job application.', 'Career Development', 'Admin', ARRAY['resume', 'career', 'job search'], 'Beginner', 8, true),
('Mastering the Job Interview', 'Tips and strategies for acing your next job interview. Research the company, practice common questions, and prepare thoughtful questions to ask.', 'Interview Skills', 'Admin', ARRAY['interview', 'preparation', 'communication'], 'Intermediate', 12, true),
('Networking for Career Growth', 'Learn how to build professional relationships that can advance your career. Attend industry events, use LinkedIn effectively, and maintain connections.', 'Networking', 'Admin', ARRAY['networking', 'linkedin', 'professional growth'], 'Intermediate', 10, false),
('Salary Negotiation Strategies', 'How to negotiate your salary effectively. Research market rates, know your worth, and practice your negotiation skills.', 'Career Development', 'Admin', ARRAY['salary', 'negotiation', 'career advancement'], 'Advanced', 15, false),
('Remote Work Best Practices', 'Tips for being productive while working from home. Set up a dedicated workspace, establish routines, and maintain work-life balance.', 'Remote Work', 'Admin', ARRAY['remote work', 'productivity', 'work-life balance'], 'Beginner', 7, true);
