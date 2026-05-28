/**
 * RBAC (Role-Based Access Control) Implementation Guide
 * ======================================================
 * 
 * This document explains how to use the RBAC system implemented in the KAB-FIR
 * Grant Management System frontend.
 * 
 * TABLE OF CONTENTS:
 * 1. Role Definitions
 * 2. Permission System
 * 3. Using Permission Checks in Components
 * 4. Protecting Routes
 * 5. Conditional UI Rendering
 * 6. Best Practices
 * 7. Adding New Roles/Permissions
 */

// ─── 1. ROLE DEFINITIONS ──────────────────────────────────────────────────────
//
// Roles are defined in src/constants/roles.js
//
// Current Roles:
// - SUPER_ADMIN (super_admin)
//   * System administration and oversight
//   * Can view users, reviewers, proposals, grant calls
//   * CANNOT perform workflow actions (assign, approve, reject, award)
//
// - SGO_ADMIN (sgo_admin)
//   * Grant workflow administrator
//   * Can perform ALL workflow actions (assign, approve, reject, award)
//   * Can manage users and reviewers
//
// - REVIEWER (reviewer)
//   * Can review assigned proposals
//   * Can submit reviews
//
// - STAFF (staff) / APPLICANT (applicant)
//   * Can submit grant proposals
//   * Can manage their own proposals
//
// Future Roles:
// - ACCOUNTANT
// - COMMITTEE_MEMBER


// ─── 2. PERMISSION SYSTEM ──────────────────────────────────────────────────────
//
// Permissions are defined in src/constants/permissions.js
//
// Structure:
// const PERMISSIONS = {
//   role_name: [
//     'permission1',
//     'permission2',
//     ...
//   ]
// }
//
// Permission Types:
// - Dashboard: view_dashboard, view_statistics
// - User Management: create_users, manage_users, view_users
// - Reviewer Management: create_reviewers, manage_reviewers, view_reviewers
// - Proposal Viewing: view_proposals, view_proposal_details
// - Workflow Actions: assign_reviewers, approve_proposals, reject_proposals,
//                     award_grants, manage_proposal_workflow


// ─── 3. USING PERMISSION CHECKS IN COMPONENTS ──────────────────────────────────
//
// EXAMPLE 1: Check if user has a specific permission
// ──────────────────────────────────────────────────
// import { canAssignReviewers } from '../constants/permissions';
// import { useAuth } from '../context/AuthContext';
//
// function MyComponent() {
//   const { user } = useAuth();
//   const canAssign = canAssignReviewers(user?.role);
//
//   return (
//     <>
//       {canAssign && (
//         <Button onClick={handleAssign}>Assign Reviewers</Button>
//       )}
//     </>
//   );
// }
//
//
// EXAMPLE 2: Generic permission check
// ──────────────────────────────────
// import { hasPermission } from '../constants/permissions';
// import { useAuth } from '../context/AuthContext';
//
// function MyComponent() {
//   const { user } = useAuth();
//
//   if (hasPermission(user?.role, 'approve_proposals')) {
//     return <ApprovePanel />;
//   }
//   return <ViewOnlyPanel />;
// }
//
//
// EXAMPLE 3: Check multiple permissions (ANY)
// ────────────────────────────────────────────
// import { hasAnyPermission } from '../constants/permissions';
// import { useAuth } from '../context/AuthContext';
//
// function MyComponent() {
//   const { user } = useAuth();
//   const canManage = hasAnyPermission(user?.role, [
//     'assign_reviewers',
//     'approve_proposals',
//     'reject_proposals',
//   ]);
//
//   return canManage && <ManagementPanel />;
// }
//
//
// EXAMPLE 4: Check multiple permissions (ALL)
// ────────────────────────────────────────────
// import { hasAllPermissions } from '../constants/permissions';
// import { useAuth } from '../context/AuthContext';
//
// function MyComponent() {
//   const { user } = useAuth();
//   const isFullAdmin = hasAllPermissions(user?.role, [
//     'manage_users',
//     'manage_reviewers',
//     'assign_reviewers',
//   ]);
//
//   return isFullAdmin && <FullAdminPanel />;
// }


// ─── 4. PROTECTING ROUTES ──────────────────────────────────────────────────────
//
// Use ProtectedRoute to restrict access to specific routes
//
// EXAMPLE 1: Role-based route protection
// ───────────────────────────────────────
// import ProtectedRoute from '../components/auth/ProtectedRoute';
// import { ROLES } from '../constants/roles';
//
// <Route path="/admin/dashboard" element={
//   <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
//     <AdminDashboard />
//   </ProtectedRoute>
// } />
//
//
// EXAMPLE 2: Permission-based route protection
// ───────────────────────────────────────────────
// <Route path="/admin/award-grants" element={
//   <ProtectedRoute 
//     requiredPermissions={['award_grants']}
//   >
//     <AwardGrantsPage />
//   </ProtectedRoute>
// } />
//
//
// EXAMPLE 3: Multiple permissions (ANY)
// ─────────────────────────────────────
// <Route path="/admin/decisions" element={
//   <ProtectedRoute 
//     requiredPermissions={['approve_proposals', 'reject_proposals']}
//     requireAll={false} {/* Match if user has ANY of these */}
//   >
//     <DecisionsPage />
//   </ProtectedRoute>
// } />
//
//
// EXAMPLE 4: Multiple permissions (ALL)
// ─────────────────────────────────────
// <Route path="/admin/super-admin-only" element={
//   <ProtectedRoute 
//     requiredPermissions={['create_users', 'manage_reviewers', 'view_system_information']}
//     requireAll={true} {/* User must have ALL of these */}
//   >
//     <SuperAdminPage />
//   </ProtectedRoute>
// } />


// ─── 5. CONDITIONAL UI RENDERING ──────────────────────────────────────────────
//
// EXAMPLE: Hide workflow buttons based on role
// ─────────────────────────────────────────────
// import { canAssignReviewers, canApproveProposals, canAwardGrants } from '../constants/permissions';
// import { useAuth } from '../context/AuthContext';
//
// function ProposalActions({ proposalId }) {
//   const { user } = useAuth();
//
//   return (
//     <div className="flex gap-2">
//       <Button>View Details</Button>
//
//       {canAssignReviewers(user?.role) && (
//         <Button variant="primary">Assign Reviewers</Button>
//       )}
//
//       {canApproveProposals(user?.role) && (
//         <Button variant="success">Approve</Button>
//       )}
//
//       {canAwardGrants(user?.role) && (
//         <Button variant="accent">Award Grant</Button>
//       )}
//     </div>
//   );
// }
//
//
// EXAMPLE: Conditional sidebar menus based on role
// ──────────────────────────────────────────────────
// The Sidebar component in src/components/layout/Sidebar.jsx
// automatically renders different menus based on user.role:
//
// - SUPER_ADMIN: Dashboard, Grant Calls, Users, Reviewers, Proposals (view-only)
// - SGO_ADMIN:   Dashboard, Users, Reviewers, Proposal Management (with actions)
// - REVIEWER:    Dashboard, Assigned Proposals, Submitted Reviews, Notifications
// - STAFF:       Dashboard, My Proposals, Submit Proposal, Notifications


// ─── 6. BEST PRACTICES ────────────────────────────────────────────────────────
//
// 1. USE IMPORTED CONSTANTS:
//    ✓ Good:  canAssignReviewers(user?.role)
//    ✗ Bad:   user?.role === 'sgo_admin'
//
// 2. USE PERMISSION UTILITIES:
//    ✓ Good:  import { canAssignReviewers } from '../constants/permissions'
//    ✗ Bad:   Create separate permission checks in each component
//
// 3. PREFER SPECIFIC PERMISSION CHECKS:
//    ✓ Good:  canAssignReviewers(user?.role)
//    ✗ Bad:   hasPermission(user?.role, 'assign_reviewers')
//    (Specific functions are more readable and maintainable)
//
// 4. PROTECT AT MULTIPLE LEVELS:
//    - Route level: ProtectedRoute component
//    - Component level: Conditional UI rendering
//    - API level: Backend also validates permissions (TODO)
//
// 5. ALWAYS HANDLE PERMISSION DENIAL GRACEFULLY:
//    ✓ Good:  Hide button or show message
//    ✗ Bad:   Allow user to attempt unauthorized action
//
// 6. CACHE PERMISSION CHECKS:
//    If checking many permissions, cache the result:
//    const canManage = hasAnyPermission(user?.role, [...permissions]);
//
// 7. TEST ROLE SCENARIOS:
//    Test the app as both SUPER_ADMIN and SGO_ADMIN roles to ensure
//    UI differences are correct.


// ─── 7. ADDING NEW ROLES/PERMISSIONS ──────────────────────────────────────────
//
// TO ADD A NEW ROLE:
// ──────────────────
// 1. Add role to ROLES constant in src/constants/roles.js:
//    ACCOUNTANT: 'accountant'
//
// 2. Add role display name to ROLE_DISPLAY_NAMES:
//    [ROLES.ACCOUNTANT]: 'Accountant'
//
// 3. Add role to ROLE_HIERARCHY if needed:
//    [ROLES.ACCOUNTANT]: 6
//
// 4. Add permissions in src/constants/permissions.js:
//    [ROLES.ACCOUNTANT]: [
//      'view_proposals',
//      'view_budget_reports',
//      'view_financial_data',
//    ]
//
// 5. Add dashboard path to ROLE_DASHBOARD_PATHS in roles.js:
//    [ROLES.ACCOUNTANT]: '/accountant/dashboard'
//
// 6. Create dashboard route in src/routes/AppRoutes.jsx:
//    <Route path="/accountant/dashboard" element={
//      <ProtectedRoute allowedRoles={[ROLES.ACCOUNTANT]}>
//        <AccountantDashboard />
//      </ProtectedRoute>
//    } />
//
//
// TO ADD A NEW PERMISSION:
// ────────────────────────
// 1. Define the permission string (e.g., 'export_reports')
//
// 2. Add to PERMISSIONS constant in src/constants/permissions.js
//    for each role that should have it:
//    [ROLES.SGO_ADMIN]: [
//      ...existing permissions,
//      'export_reports',
//    ]
//
// 3. Create a utility function (optional but recommended):
//    export const canExportReports = (userRole) =>
//      hasPermission(userRole, 'export_reports');
//
// 4. Use in components:
//    import { canExportReports } from '../constants/permissions';
//    if (canExportReports(user?.role)) {
//      // Show export button
//    }


// ─── FILE STRUCTURE REFERENCE ───────────────────────────────────────────────
//
// src/
//   ├── constants/
//   │   ├── roles.js              // Role definitions
//   │   └── permissions.js         // Permission definitions & utilities
//   │
//   ├── context/
//   │   └── AuthContext.jsx        // User & authentication state
//   │
//   ├── components/
//   │   └── auth/
//   │       └── ProtectedRoute.jsx // Route protection component
//   │
//   └── routes/
//       └── AppRoutes.jsx          // All routes with ProtectedRoute wrappers


// ─── API INTEGRATION (FUTURE) ─────────────────────────────────────────────────
//
// When backend provides JWT tokens with role/permission claims,
// the frontend can automatically sync with backend permissions:
//
// 1. Backend JWT payload includes:
//    {
//      user_id: 123,
//      role: 'sgo_admin',
//      permissions: ['assign_reviewers', 'approve_proposals', ...]
//    }
//
// 2. Frontend stores permissions in AuthContext
//
// 3. Permission checks can compare against backend permissions:
//    const hasPermission = (permission) =>
//      user?.permissions?.includes(permission)
//
// 4. Frontend remains as UI layer for permission enforcement
//    Backend always validates final authorization
