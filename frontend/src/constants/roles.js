/**
 * Role Constants and Definitions
 * Centralized role definitions for the entire application
 */

export const ROLES = {
  SUPER_ADMIN: 'admin',
  SGO_ADMIN: 'sgo_admin',
  REVIEWER: 'reviewer',
  STAFF: 'staff',
  APPLICANT: 'applicant',
  ACCOUNTANT: 'accountant',
  COMMITTEE_MEMBER: 'committee_member',
};

/**
 * Role descriptions for UI display
 */
export const ROLE_DISPLAY_NAMES = {
  [ROLES.SUPER_ADMIN]: 'Super Administrator',
  [ROLES.SGO_ADMIN]: 'SGO Administrator',
  [ROLES.REVIEWER]: 'Reviewer',
  [ROLES.STAFF]: 'Staff',
  [ROLES.APPLICANT]: 'Applicant',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.COMMITTEE_MEMBER]: 'Committee Member',
};

/**
 * Role hierarchy - higher tier roles may have permissions of lower tiers
 * Used for permission inheritance
 */
export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 1,
  [ROLES.SGO_ADMIN]: 2,
  [ROLES.REVIEWER]: 3,
  [ROLES.STAFF]: 4,
  [ROLES.APPLICANT]: 5,
  [ROLES.ACCOUNTANT]: 6,
  [ROLES.COMMITTEE_MEMBER]: 7,
};

/**
 * Admin roles - roles that have admin/dashboard access
 */
export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN];

/**
 * Dashboard redirect paths for each role
 */
export const ROLE_DASHBOARD_PATHS = {
  [ROLES.SUPER_ADMIN]: '/admin/dashboard',
  [ROLES.SGO_ADMIN]: '/admin/dashboard',
  [ROLES.REVIEWER]: '/reviewer/dashboard',
  [ROLES.STAFF]: '/applicant/dashboard',
  [ROLES.APPLICANT]: '/applicant/dashboard',
};
