/**
 * Job utility functions for managing job status and expiration
 */

/**
 * Check if a job deadline has passed
 */
export function isExpired(deadline: string): boolean {
  try {
    return new Date(deadline) < new Date()
  } catch {
    return false
  }
}

/**
 * Get job status based on deadline
 */
export function getJobStatus(deadline: string): 'Active' | 'Expired' {
  return isExpired(deadline) ? 'Expired' : 'Active'
}

/**
 * Get status badge color
 */
export function getStatusColor(status: 'Active' | 'Expired'): string {
  return status === 'Active' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800'
}

/**
 * Get status badge icon
 */
export function getStatusIcon(status: 'Active' | 'Expired'): string {
  return status === 'Active' ? '🟢' : '🔴'
}
