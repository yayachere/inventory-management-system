export const PERMISSIONS = {
  admin: {
    canViewDashboard: true,
    canAddItems: true,
    canEditItems: true,
    canDeleteItems: true,
    canSellItems: true,
    canViewAllTransactions: true,
    canManageUsers: true,
    canViewReports: true, // Added permission
  },
  seller: {
    canViewDashboard: true,
    canAddItems: false,
    canEditItems: false,
    canDeleteItems: false,
    canSellItems: true,
    canViewAllTransactions: true,
    canManageUsers: false,
    canViewReports: true, // Seller can view their own report
  },
  controller: {
    canViewDashboard: true,
    canAddItems: true,
    canEditItems: true,
    canDeleteItems: false,
    canSellItems: true,
    canViewAllTransactions: true,
    canManageUsers: false,
    canViewReports: true, // Controller can view their own and seller reports
  },
}

export function hasPermission(userRole: string, permission: keyof typeof PERMISSIONS.admin): boolean {
  const rolePermissions = PERMISSIONS[userRole as keyof typeof PERMISSIONS]
  return rolePermissions?.[permission] || false
}
