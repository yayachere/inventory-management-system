-- Insert sample jobs
INSERT INTO jobs (title, company, location, type, salary, description, requirements, benefits, application_deadline, contact_email) VALUES
(
    'Senior Frontend Developer',
    'TechCorp Inc.',
    'San Francisco, CA',
    'Full-time',
    '$120,000 - $150,000',
    'We are looking for a Senior Frontend Developer to join our dynamic team. You will be responsible for developing user-facing web applications using modern JavaScript frameworks.',
    ARRAY['5+ years of React experience', 'TypeScript proficiency', 'Experience with Next.js', 'Strong CSS skills'],
    ARRAY['Health insurance', 'Dental coverage', '401k matching', 'Flexible work hours', 'Remote work options'],
    '2024-02-15',
    'careers@techcorp.com'
),
(
    'UX/UI Designer',
    'Design Studio Pro',
    'New York, NY',
    'Full-time',
    '$80,000 - $100,000',
    'Join our creative team as a UX/UI Designer. You will work on exciting projects for various clients, creating intuitive and beautiful user experiences.',
    ARRAY['3+ years of UX/UI design experience', 'Proficiency in Figma and Adobe Creative Suite', 'Strong portfolio', 'Understanding of user-centered design principles'],
    ARRAY['Creative environment', 'Professional development budget', 'Health insurance', 'Flexible PTO'],
    '2024-02-10',
    'jobs@designstudiopro.com'
),
(
    'Backend Engineer',
    'DataFlow Systems',
    'Austin, TX',
    'Full-time',
    '$100,000 - $130,000',
    'We need a skilled Backend Engineer to help build and maintain our data processing systems. You will work with large-scale distributed systems and modern cloud technologies.',
    ARRAY['4+ years of backend development', 'Experience with Node.js or Python', 'Database design skills', 'Cloud platform experience (AWS/GCP)'],
    ARRAY['Stock options', 'Health insurance', 'Learning stipend', 'Gym membership'],
    '2024-02-12',
    'hiring@dataflowsystems.com'
)
ON CONFLICT DO NOTHING;
