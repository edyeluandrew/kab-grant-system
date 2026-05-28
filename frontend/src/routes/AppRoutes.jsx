import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { ROLES } from '../constants/roles';
import DashboardLayout from '../components/layout/DashboardLayout';

const LoadingFallback = ({ role = 'applicant' }) => (
  <DashboardLayout role={role}>
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-muted">Loading page...</p>
      </div>
    </div>
  </DashboardLayout>
);

// ─── EAGER LOAD: Public pages ─────────────────────────────────────────────
import Landing from '../pages/auth/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import ChangePassword from '../pages/auth/ChangePassword';

// ─── LAZY LOAD: Applicant pages ───────────────────────────────────────────
const ApplicantDashboard = lazy(() => import('../pages/applicant/ApplicantDashboard'));
const MyProposals = lazy(() => import('../pages/applicant/MyProposals'));
const SubmitProposal = lazy(() => import('../pages/applicant/SubmitProposal'));
const ProposalTypeSelection = lazy(() => import('../pages/applicant/ProposalTypeSelection'));
const ResearchProposalForm = lazy(() => import('../pages/applicant/ResearchProposalForm'));
const InnovationProposalForm = lazy(() => import('../pages/applicant/InnovationProposalForm'));
const ProposalReview = lazy(() => import('../pages/applicant/ProposalReview'));
const ProposalDetails = lazy(() => import('../pages/applicant/ProposalDetails'));
const UploadDocuments = lazy(() => import('../pages/applicant/UploadDocuments'));
const ProjectTeamMembers = lazy(() => import('../pages/applicant/ProjectTeamMembers'));
const ApplicantNotifications = lazy(() => import('../pages/applicant/Notifications'));

// ─── LAZY LOAD: Admin pages ───────────────────────────────────────────────
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const Users = lazy(() => import('../pages/admin/Users'));
const Reviewers = lazy(() => import('../pages/admin/Reviewers'));
const GrantCalls = lazy(() => import('../pages/admin/GrantCalls'));
const SubmittedProposals = lazy(() => import('../pages/admin/proposals/SubmittedProposals'));
const ScheduledProposals = lazy(() => import('../pages/admin/proposals/ScheduledProposals'));
const ReviewedProposals = lazy(() => import('../pages/admin/proposals/ReviewedProposals'));
const ApprovedProposals = lazy(() => import('../pages/admin/proposals/ApprovedProposals'));
const RejectedProposals = lazy(() => import('../pages/admin/proposals/RejectedProposals'));
const AwardedProposals = lazy(() => import('../pages/admin/proposals/AwardedProposals'));
const AdminProposalDetail = lazy(() => import('../pages/admin/proposals/AdminProposalDetail'));

// ─── LAZY LOAD: Reviewer pages ────────────────────────────────────────────
const ReviewerDashboard = lazy(() => import('../pages/reviewer/ReviewerDashboard'));
const AssignedProposals = lazy(() => import('../pages/reviewer/AssignedProposals'));
const ReviewProposalDetail = lazy(() => import('../pages/reviewer/ReviewProposalDetail'));
const SubmittedReviews = lazy(() => import('../pages/reviewer/SubmittedReviews'));
const ReviewerNotifications = lazy(() => import('../pages/reviewer/ReviewerNotifications'));

const LazyWrapper = ({ component: Component, role = 'applicant' }) => (
  <Suspense fallback={<LoadingFallback role={role} />}>
    <Component />
  </Suspense>
);

export default function AppRoutes() {
  const { isAuthenticated, user, redirectPathForRole } = useAuth();

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={redirectPathForRole(user.role)} replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={redirectPathForRole(user.role)} replace /> : <Register />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to={redirectPathForRole(user.role)} replace /> : <ForgotPassword />} />
      <Route path="/reset-password" element={isAuthenticated ? <Navigate to={redirectPathForRole(user.role)} replace /> : <ResetPassword />} />
      <Route path="/change-password" element={
        <ProtectedRoute allowedRoles={[ROLES.REVIEWER, ROLES.STAFF, ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <ChangePassword />
        </ProtectedRoute>
      } />

      {/* APPLICANT ROUTES */}
      <Route path="/applicant/dashboard" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <LazyWrapper component={ApplicantDashboard} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <LazyWrapper component={MyProposals} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/new" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <LazyWrapper component={ProposalTypeSelection} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/new/research" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <LazyWrapper component={ResearchProposalForm} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/new/innovation" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <LazyWrapper component={InnovationProposalForm} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/review" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <LazyWrapper component={ProposalReview} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/:id" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <LazyWrapper component={ProposalDetails} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/:id/edit/research" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <LazyWrapper component={ResearchProposalForm} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/:id/edit/innovation" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <LazyWrapper component={InnovationProposalForm} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/:id/documents" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <LazyWrapper component={UploadDocuments} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/:id/team-members" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <LazyWrapper component={ProjectTeamMembers} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/notifications" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <LazyWrapper component={ApplicantNotifications} role="applicant" />
        </ProtectedRoute>
      } />

      {/* ADMIN ROUTES */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <LazyWrapper component={AdminDashboard} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <LazyWrapper component={Users} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/reviewers" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <LazyWrapper component={Reviewers} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/grant-calls" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <LazyWrapper component={GrantCalls} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/proposals/submitted" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <LazyWrapper component={SubmittedProposals} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/proposals/scheduled" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <LazyWrapper component={ScheduledProposals} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/proposals/reviewed" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <LazyWrapper component={ReviewedProposals} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/proposals/approved" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <LazyWrapper component={ApprovedProposals} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/proposals/rejected" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <LazyWrapper component={RejectedProposals} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/proposals/awarded" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <LazyWrapper component={AwardedProposals} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/proposals/:id" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <LazyWrapper component={AdminProposalDetail} role="admin" />
        </ProtectedRoute>
      } />

      {/* REVIEWER ROUTES */}
      <Route path="/reviewer/dashboard" element={
        <ProtectedRoute allowedRoles={[ROLES.REVIEWER]}>
          <LazyWrapper component={ReviewerDashboard} role="reviewer" />
        </ProtectedRoute>
      } />
      <Route path="/reviewer/proposals" element={
        <ProtectedRoute allowedRoles={[ROLES.REVIEWER]}>
          <LazyWrapper component={AssignedProposals} role="reviewer" />
        </ProtectedRoute>
      } />
      <Route path="/reviewer/proposals/:id" element={
        <ProtectedRoute allowedRoles={[ROLES.REVIEWER]}>
          <LazyWrapper component={ReviewProposalDetail} role="reviewer" />
        </ProtectedRoute>
      } />
      <Route path="/reviewer/reviews" element={
        <ProtectedRoute allowedRoles={[ROLES.REVIEWER]}>
          <LazyWrapper component={SubmittedReviews} role="reviewer" />
        </ProtectedRoute>
      } />
      <Route path="/reviewer/notifications" element={
        <ProtectedRoute allowedRoles={[ROLES.REVIEWER]}>
          <LazyWrapper component={ReviewerNotifications} role="reviewer" />
        </ProtectedRoute>
      } />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}