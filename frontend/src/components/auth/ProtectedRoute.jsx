import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARD_PATHS } from '../../constants/roles';
import Loader from '../common/Loader';

/**
 * Wraps a route and enforces authentication + optional role check.
 * 
 * Usage:
 *   <ProtectedRoute allowedRoles={['sgo_admin']} >
 *     <AdminDashboard />
 *   </ProtectedRoute>
 * 
 * Or with permission checks:
 *   <ProtectedRoute requiredPermissions={['assign_reviewers']}>
 *     <AssignReviewersPage />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  requireAll = false,
}) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    console.log('🔄 ProtectedRoute: Loading auth...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.warn('⛔ ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0) {
    console.log('🔐 ProtectedRoute: Checking role access');
    console.log('  Allowed roles:', allowedRoles);
    console.log('  User role:', user?.role);
    console.log('  Has access:', allowedRoles.includes(user?.role));
    
    if (!allowedRoles.includes(user?.role)) {
      // Wrong role — send them to their correct dashboard
      const roleHome = ROLE_DASHBOARD_PATHS[user?.role] || '/login';
      console.warn(`⚠️ ProtectedRoute: User role "${user?.role}" not in allowed roles, redirecting to ${roleHome}`);
      return <Navigate to={roleHome} replace />;
    }
    console.log('✅ ProtectedRoute: Role access granted');
  }

  // Check permission-based access (if requiredPermissions provided)
  if (requiredPermissions.length > 0) {
    const { hasPermission, hasAllPermissions, hasAnyPermission } = require('../../constants/permissions');

    const hasRequiredPermission = requireAll
      ? hasAllPermissions(user?.role, requiredPermissions)
      : hasAnyPermission(user?.role, requiredPermissions);

    if (!hasRequiredPermission) {
      // No permission — send them to their dashboard
      const roleHome = ROLE_DASHBOARD_PATHS[user?.role] || '/login';
      console.warn(`⚠️ ProtectedRoute: User lacks required permissions, redirecting to ${roleHome}`);
      return <Navigate to={roleHome} replace />;
    }
  }

  console.log('✅ ProtectedRoute: All checks passed, rendering children');
  return children;
}