import { neon } from "@neondatabase/serverless"

/**
 * Get the Neon connection string using your exact variable name
 */
const dbUrl = process.env.NEON_NEON_DATABASE_URL

// Only create the SQL client on the server side
const sql: any =
  typeof window === "undefined" && dbUrl
    ? neon(dbUrl)
    : () => {
        throw new Error("Database unavailable in browser preview")
      }

// Initialize database tables on first import
let initialized = false

async function initializeDatabase() {
  if (initialized || typeof window !== "undefined") return

  try {
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        salary VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT[] NOT NULL DEFAULT '{}',
        benefits TEXT[] NOT NULL DEFAULT '{}',
        posted_date DATE DEFAULT CURRENT_DATE,
        application_deadline DATE NOT NULL,
        contact_email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Insert default admin user if not exists (password: admin123)
    await sql`
      INSERT INTO users (email, password_hash, role) 
      VALUES ('admin@jobboard.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
      ON CONFLICT (email) DO NOTHING
    `

    // Insert sample jobs if table is empty
    const jobCount = await sql`SELECT COUNT(*) as count FROM jobs`
    if (jobCount[0].count === "0") {
      await sql`
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
      `
    }

    initialized = true
    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Database initialization failed:", error)
  }
}

// Only initialize on server-side
if (typeof window === "undefined") {
  initializeDatabase()
}

export default sql
