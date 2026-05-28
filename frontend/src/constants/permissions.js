/**
 * Permission Utilities and Helper Functions
 * Centralized permission checking for the entire application
 * 
 * Usage:
 * canAssignReviewers(userRole) - checks if user can assign reviewers
 * hasPermission(userRole, permissionName) - generic permission checker
 */

import { ROLES } from './roles';

/**
 * Define all permissions and which roles have them
 * Permission format: { role: [list of permissions] }
 */
const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    'view_dashboard',
    'view_statistics',
    'create_users',
    'manage_users',
    'view_users',
    'create_reviewers',
    'manage_reviewers',
    'view_reviewers',
    'view_proposals',
    'view_proposal_details',
    'view_system_information',
    // Super Admin CANNOT do:
    // - assign_reviewers
    // - approve_proposals
    // - reject_proposals
    // - award_grants
    // - manage_proposal_workflow
    // - upload_grant_documents
  ],
  [ROLES.SGO_ADMIN]: [
    'view_dashboard',
    'view_statistics',
    'create_users',
    'manage_users',
    'view_users',
    'create_reviewers',
    'manage_reviewers',
    'view_reviewers',
    'view_proposals',
    'view_proposal_details',
    'view_system_information',
    // Workflow permissions (SGO ADMIN specific)
    'assign_reviewers',
    'schedule_proposal_reviews',
    'approve_proposals',
    'reject_proposals',
    'award_grants',
    'manage_proposal_workflow',
    'manage_review_resolutions',
    'upload_final_proposals',
    'upload_budgets',
    'upload_contracts',
    'manage_awarded_grants',
    'monitor_grant_implementation',
    'upload_monitoring_reports',
    // Grant Call Management
    'manage_grant_calls',
    'create_grant_calls',
    'view_grant_calls',
    'open_application_window',
    'close_application_window',
    'upload_guidelines',
  ],
  [ROLES.REVIEWER]: [
    'view_assigned_proposals',
    'submit_review',
    'view_submitted_reviews',
    'view_profile',
    'change_password',
  ],
  [ROLES.STAFF]: [
    'view_dashboard',
    'view_my_proposals',
    'create_proposal',
    'edit_own_proposal',
    'submit_proposal',
    'upload_proposal_documents',
    'manage_team_members',
    'view_notifications',
    'view_profile',
    'change_password',
  ],
  [ROLES.APPLICANT]: [
    'view_dashboard',
    'view_my_proposals',
    'create_proposal',
    'edit_own_proposal',
    'submit_proposal',
    'upload_proposal_documents',
    'manage_team_members',
    'view_notifications',
    'view_profile',
    'change_password',
  ],
};

/**
 * Check if a user has a specific permission
 * @param {string} userRole - The user's role
 * @param {string} permission - The permission to check
 * @returns {boolean} - True if user has permission, false otherwise
 */
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  const rolePermissions = PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if a user has any of the provided permissions
 * @param {string} userRole - The user's role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean} - True if user has at least one permission
 */
export const hasAnyPermission = (userRole, permissions) => {
  if (!Array.isArray(permissions)) return false;
  return permissions.some((permission) => hasPermission(userRole, permission));
};

/**
 * Check if a user has all of the provided permissions
 * @param {string} userRole - The user's role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean} - True if user has all permissions
 */
export const hasAllPermissions = (userRole, permissions) => {
  if (!Array.isArray(permissions)) return false;
  return permissions.every((permission) => hasPermission(userRole, permission));
};

// ─── Proposal Workflow Permissions ───────────────────────────────────────────

/**
 * Can the user assign reviewers to proposals?
 */
export const canAssignReviewers = (userRole) =>
  hasPermission(userRole, 'assign_reviewers');

/**
 * Can the user approve proposals?
 */
export const canApproveProposals = (userRole) =>
  hasPermission(userRole, 'approve_proposals');

/**
 * Can the user reject proposals?
 */
export const canRejectProposals = (userRole) =>
  hasPermission(userRole, 'reject_proposals');

/**
 * Can the user award grants?
 */
export const canAwardGrants = (userRole) =>
  hasPermission(userRole, 'award_grants');

/**
 * Can the user manage proposal workflow stages?
 */
export const canManageProposalWorkflow = (userRole) =>
  hasPermission(userRole, 'manage_proposal_workflow');

/**
 * Can the user manage review resolutions?
 */
export const canManageReviewResolutions = (userRole) =>
  hasPermission(userRole, 'manage_review_resolutions');

/**
 * Can the user upload grant implementation documents?
 */
export const canUploadGrantDocuments = (userRole) =>
  hasPermission(userRole, 'upload_final_proposals') ||
  hasPermission(userRole, 'upload_budgets') ||
  hasPermission(userRole, 'upload_contracts') ||
  hasPermission(userRole, 'upload_monitoring_reports');

/**
 * Can the user perform any workflow action?
 * This checks if a user has ANY workflow management permission
 */
export const canPerformWorkflowActions = (userRole) => {
  return (
    canAssignReviewers(userRole) ||
    canApproveProposals(userRole) ||
    canRejectProposals(userRole) ||
    canAwardGrants(userRole) ||
    canManageProposalWorkflow(userRole)
  );
};

// ─── User Management Permissions ──────────────────────────────────────────────

/**
 * Can the user create new users?
 */
export const canCreateUsers = (userRole) =>
  hasPermission(userRole, 'create_users');

/**
 * Can the user manage users (create, edit, delete)?
 */
export const canManageUsers = (userRole) =>
  hasPermission(userRole, 'manage_users');

/**
 * Can the user view all users?
 */
export const canViewAllUsers = (userRole) =>
  hasPermission(userRole, 'view_users');

/**
 * Can the user create new reviewers?
 */
export const canCreateReviewers = (userRole) =>
  hasPermission(userRole, 'create_reviewers');

/**
 * Can the user manage reviewers (create, edit, delete)?
 */
export const canManageReviewers = (userRole) =>
  hasPermission(userRole, 'manage_reviewers');

/**
 * Can the user view all reviewers?
 */
export const canViewAllReviewers = (userRole) =>
  hasPermission(userRole, 'view_reviewers');

// ─── Proposal Viewing Permissions ────────────────────────────────────────────

/**
 * Can the user view all proposals?
 */
export const canViewAllProposals = (userRole) =>
  hasPermission(userRole, 'view_proposals');

/**
 * Can the user view proposal details?
 */
export const canViewProposalDetails = (userRole) =>
  hasPermission(userRole, 'view_proposal_details');

// ─── Admin Panel Permissions ─────────────────────────────────────────────────

/**
 * Can the user access the admin dashboard?
 */
export const canAccessAdminDashboard = (userRole) =>
  hasPermission(userRole, 'view_dashboard') &&
  (userRole === ROLES.SUPER_ADMIN || userRole === ROLES.SGO_ADMIN);

/**
 * Can the user access admin functions?
 * (this is different from accessing admin dashboard)
 */
export const canAccessAdminFunctions = (userRole) =>
  userRole === ROLES.SUPER_ADMIN || userRole === ROLES.SGO_ADMIN;

// ─── Proposal Viewing Permissions Based on Role ──────────────────────────────

/**
 * Get all viewable proposal statuses for a role
 * Some roles can only view certain proposal statuses
 */
export const getViewableProposalStatuses = (userRole) => {
  // Admins can view all statuses
  if (userRole === ROLES.SUPER_ADMIN || userRole === ROLES.SGO_ADMIN) {
    return ['Submitted', 'Scheduled for Review', 'Reviewed', 'Approved', 'Rejected', 'Awarded'];
  }
  
  // Reviewers can only view assigned proposals
  if (userRole === ROLES.REVIEWER) {
    return ['Scheduled for Review'];
  }
  
  // Staff/Applicants can only view their own proposals
  if (userRole === ROLES.STAFF || userRole === ROLES.APPLICANT) {
    return ['Draft', 'Submitted', 'Scheduled for Review', 'Approved', 'Rejected', 'Awarded'];
  }

  return [];
};

// ─── Grant Call Management Permissions ────────────────────────────────────────

/**
 * Can the user manage grant calls?
 */
export const canManageGrantCalls = (userRole) =>
  hasPermission(userRole, 'manage_grant_calls');

/**
 * Can the user create grant calls?
 */
export const canCreateGrantCalls = (userRole) =>
  hasPermission(userRole, 'create_grant_calls');

/**
 * Can the user view grant calls?
 */
export const canViewGrantCalls = (userRole) =>
  hasPermission(userRole, 'view_grant_calls');

/**
 * Can the user open application windows?
 */
export const canOpenApplicationWindow = (userRole) =>
  hasPermission(userRole, 'open_application_window');

/**
 * Can the user close application windows?
 */
export const canCloseApplicationWindow = (userRole) =>
  hasPermission(userRole, 'close_application_window');

/**
 * Can the user upload guidelines?
 */
export const canUploadGuidelines = (userRole) =>
  hasPermission(userRole, 'upload_guidelines');
