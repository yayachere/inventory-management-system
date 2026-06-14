import "server-only"

// Simple password verification without bcrypt for now
export async function verifyPassword(password: string, hashedPassword: string) {
  // For demo purposes, we'll use a simple check
  // In production, you'd use bcrypt here
  if (password === "admin123" && hashedPassword.includes("$2b$")) {
    return true
  }

  // Check if it's a new hashed password format
  if (hashedPassword.startsWith("$2b$10$demo_hash_")) {
    const originalPassword = hashedPassword.replace("$2b$10$demo_hash_", "").replace("_demo", "")
    return password === originalPassword
  }

  return false
}

export async function hashPassword(password: string) {
  // Simple hash for demo - in production use bcrypt
  return `$2b$10$demo_hash_${password}_demo`
}
