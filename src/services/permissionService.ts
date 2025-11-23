/**
 * Permission Service
 * Centralized permission management for role-based access control
 */

export type UserRole = 'Admin' | 'Staff' | 'Enumerator';

export interface Permission {
  canManageUsers: boolean;
  canManageQuestions: boolean;
  canViewResponses: boolean;
  canExportData: boolean;
  canViewReports: boolean;
  canConfigureSettings: boolean;
  canChangePassword: boolean;
  canViewRoleGuide: boolean;
}

/**
 * Get permissions for a specific role
 * Admin role has all permissions
 */
export const getPermissionsForRole = (role: UserRole): Permission => {
  // Admin has all permissions
  if (role === 'Admin') {
    return {
      canManageUsers: true,
      canManageQuestions: true,
      canViewResponses: true,
      canExportData: true,
      canViewReports: true,
      canConfigureSettings: true,
      canChangePassword: true,
      canViewRoleGuide: true,
    };
  }

  // Staff has limited permissions
  if (role === 'Staff') {
    return {
      canManageUsers: false,
      canManageQuestions: false,
      canViewResponses: true,
      canExportData: true,
      canViewReports: true,
      canConfigureSettings: false,
      canChangePassword: true,
      canViewRoleGuide: true,
    };
  }

  // Enumerator has minimal permissions
  if (role === 'Enumerator') {
    return {
      canManageUsers: false,
      canManageQuestions: false,
      canViewResponses: false,
      canExportData: false,
      canViewReports: false,
      canConfigureSettings: false,
      canChangePassword: true,
      canViewRoleGuide: true,
    };
  }

  // Default: no permissions
  return {
    canManageUsers: false,
    canManageQuestions: false,
    canViewResponses: false,
    canExportData: false,
    canViewReports: false,
    canConfigureSettings: false,
    canChangePassword: false,
    canViewRoleGuide: false,
  };
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (role: UserRole, permission: keyof Permission): boolean => {
  const permissions = getPermissionsForRole(role);
  return permissions[permission];
};

/**
 * Check if user can manage users
 */
export const canManageUsers = (role: UserRole): boolean => {
  return hasPermission(role, 'canManageUsers');
};

/**
 * Check if user can manage questions
 */
export const canManageQuestions = (role: UserRole): boolean => {
  return hasPermission(role, 'canManageQuestions');
};

/**
 * Check if user can view responses
 */
export const canViewResponses = (role: UserRole): boolean => {
  return hasPermission(role, 'canViewResponses');
};

/**
 * Check if user can export data
 */
export const canExportData = (role: UserRole): boolean => {
  return hasPermission(role, 'canExportData');
};

/**
 * Check if user can view reports
 */
export const canViewReports = (role: UserRole): boolean => {
  return hasPermission(role, 'canViewReports');
};

/**
 * Check if user can configure settings
 */
export const canConfigureSettings = (role: UserRole): boolean => {
  return hasPermission(role, 'canConfigureSettings');
};
