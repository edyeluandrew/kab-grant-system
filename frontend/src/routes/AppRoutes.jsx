import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ErrorBoundary from '../components/ErrorBoundary';
import { ROLES } from '../constants/roles';

// ─── PUBLIC PAGES ───────────────────────────────────────────────────────────
import Landing from '../pages/auth/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import ChangePassword from '../pages/auth/ChangePassword';

// ─── APPLICANT PAGES (eager — keeps sidebar stable on navigation) ───────────
import ApplicantDashboard from '../pages/applicant/ApplicantDashboard';
import MyProposals from '../pages/applicant/MyProposals';
import SubmitProposal from '../pages/applicant/SubmitProposal';
import ProposalTypeSelection from '../pages/applicant/ProposalTypeSelection';
import ResearchProposalForm from '../pages/applicant/ResearchProposalForm';
import InnovationProposalForm from '../pages/applicant/InnovationProposalForm';
import ProposalReview from '../pages/applicant/ProposalReview';
import ProposalDetails from '../pages/applicant/ProposalDetails';
import UploadDocuments from '../pages/applicant/UploadDocuments';
import ProjectTeamMembers from '../pages/applicant/ProjectTeamMembers';
import ApplicantNotifications from '../pages/applicant/Notifications';
import ApplicantSettings from '../pages/applicant/Settings';
import ExpressInterest from '../pages/applicant/ExpressInterest';

// ─── ADMIN PAGES ────────────────────────────────────────────────────────────
import AdminDashboard from '../pages/admin/AdminDashboard';
import Users from '../pages/admin/Users';
import Reviewers from '../pages/admin/Reviewers';
import GrantCalls from '../pages/admin/GrantCalls';
import GrantCallInterests from '../pages/admin/GrantCallInterests';
import SubmittedProposals from '../pages/admin/proposals/SubmittedProposals';
import ScheduledProposals from '../pages/admin/proposals/ScheduledProposals';
import ReviewedProposals from '../pages/admin/proposals/ReviewedProposals';
import ApprovedProposals from '../pages/admin/proposals/ApprovedProposals';
import RejectedProposals from '../pages/admin/proposals/RejectedProposals';
import AwardedProposals from '../pages/admin/proposals/AwardedProposals';
import AdminProposalDetail from '../pages/admin/proposals/AdminProposalDetail';

// ─── REVIEWER PAGES ─────────────────────────────────────────────────────────
import ReviewerDashboard from '../pages/reviewer/ReviewerDashboard';
import AssignedProposals from '../pages/reviewer/AssignedProposals';
import ReviewProposalDetail from '../pages/reviewer/ReviewProposalDetail';
import SubmittedReviews from '../pages/reviewer/SubmittedReviews';
import ReviewerNotifications from '../pages/reviewer/ReviewerNotifications';

const RouteWrapper = ({ component: Component, role = 'applicant' }) => (
  <ErrorBoundary role={role}>
    <Component />
  </ErrorBoundary>
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
          <RouteWrapper component={ApplicantDashboard} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <RouteWrapper component={MyProposals} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/new" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <RouteWrapper component={ProposalTypeSelection} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/new/research" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <RouteWrapper component={ResearchProposalForm} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/new/innovation" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <RouteWrapper component={InnovationProposalForm} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/review" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <RouteWrapper component={ProposalReview} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/:id" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <RouteWrapper component={ProposalDetails} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/:id/edit/research" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <RouteWrapper component={ResearchProposalForm} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/:id/edit/innovation" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <RouteWrapper component={InnovationProposalForm} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/:id/documents" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <RouteWrapper component={UploadDocuments} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/proposals/:id/team-members" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <RouteWrapper component={ProjectTeamMembers} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/notifications" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <RouteWrapper component={ApplicantNotifications} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/settings" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <RouteWrapper component={ApplicantSettings} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/grant-calls/:callId/interest" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <RouteWrapper component={ExpressInterest} role="applicant" />
        </ProtectedRoute>
      } />
      <Route path="/applicant/change-password" element={
        <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.APPLICANT]}>
          <ChangePassword />
        </ProtectedRoute>
      } />

      {/* ADMIN ROUTES */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <RouteWrapper component={AdminDashboard} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <RouteWrapper component={Users} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/reviewers" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <RouteWrapper component={Reviewers} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/grant-calls" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <RouteWrapper component={GrantCalls} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/grant-calls/:callId/interests" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <RouteWrapper component={GrantCallInterests} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/proposals/submitted" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <RouteWrapper component={SubmittedProposals} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/proposals/scheduled" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <RouteWrapper component={ScheduledProposals} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/proposals/reviewed" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <RouteWrapper component={ReviewedProposals} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/proposals/approved" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <RouteWrapper component={ApprovedProposals} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/proposals/rejected" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <RouteWrapper component={RejectedProposals} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/proposals/awarded" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <RouteWrapper component={AwardedProposals} role="admin" />
        </ProtectedRoute>
      } />
      <Route path="/admin/proposals/:id" element={
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SGO_ADMIN]}>
          <RouteWrapper component={AdminProposalDetail} role="admin" />
        </ProtectedRoute>
      } />

      {/* REVIEWER ROUTES */}
      <Route path="/reviewer/dashboard" element={
        <ProtectedRoute allowedRoles={[ROLES.REVIEWER]}>
          <RouteWrapper component={ReviewerDashboard} role="reviewer" />
        </ProtectedRoute>
      } />
      <Route path="/reviewer/proposals" element={
        <ProtectedRoute allowedRoles={[ROLES.REVIEWER]}>
          <RouteWrapper component={AssignedProposals} role="reviewer" />
        </ProtectedRoute>
      } />
      <Route path="/reviewer/proposals/:id" element={
        <ProtectedRoute allowedRoles={[ROLES.REVIEWER]}>
          <RouteWrapper component={ReviewProposalDetail} role="reviewer" />
        </ProtectedRoute>
      } />
      <Route path="/reviewer/reviews" element={
        <ProtectedRoute allowedRoles={[ROLES.REVIEWER]}>
          <RouteWrapper component={SubmittedReviews} role="reviewer" />
        </ProtectedRoute>
      } />
      <Route path="/reviewer/notifications" element={
        <ProtectedRoute allowedRoles={[ROLES.REVIEWER]}>
          <RouteWrapper component={ReviewerNotifications} role="reviewer" />
        </ProtectedRoute>
      } />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
