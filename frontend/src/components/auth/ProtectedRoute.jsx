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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Wrong role — send them to their correct dashboard
    const roleHome = ROLE_DASHBOARD_PATHS[user.role] || '/login';
    return <Navigate to={roleHome} replace />;
  }

  // Check permission-based access (if requiredPermissions provided)
  if (requiredPermissions.length > 0) {
    const { hasPermission, hasAllPermissions, hasAnyPermission } = require('../../constants/permissions');

    const hasRequiredPermission = requireAll
      ? hasAllPermissions(user.role, requiredPermissions)
      : hasAnyPermission(user.role, requiredPermissions);

    if (!hasRequiredPermission) {
      // No permission — send them to their dashboard
      const roleHome = ROLE_DASHBOARD_PATHS[user.role] || '/login';
      return <Navigate to={roleHome} replace />;
    }
  }

  return children;
}