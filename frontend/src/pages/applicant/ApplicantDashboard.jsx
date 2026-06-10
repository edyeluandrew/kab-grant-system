import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, PenTool, Clock, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { getApplicantDashboard, getMyProposals, deleteDraft, submitProposal } from '../../api/applicantApi';
import { getApiError } from '../../utils/apiError';
import { isDraftLike, getStatusLabel, getStatusVariant } from '../../utils/statusUtils';
import {
  getProtocolNo,
  getGrantType,
  getTeamMemberCount,
  getAttachmentSummary,
  getEditPath,
} from '../../utils/proposalDisplayUtils';

export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await getApplicantDashboard();
        const proposalsData = await getMyProposals();
        setDashboard(dashboardData);
        setProposals(proposalsData);
        setError(null);
      } catch (err) {
        setError(getApiError(err, 'Failed to load dashboard'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (proposalId) => {
    if (!window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(proposalId);
      await deleteDraft(proposalId);
      setProposals((prev) => prev.filter((p) => p.id !== proposalId));
      setActionSuccess('Draft deleted successfully');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(getApiError(err, 'Failed to delete draft'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (proposalId) => {
    try {
      setActionLoading(proposalId);
      await submitProposal(proposalId);
      // Refresh the proposals list
      const updatedProposals = await getMyProposals();
      setProposals(updatedProposals);
      setActionSuccess('Proposal submitted successfully');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      const message = getApiError(err, 'Failed to submit proposal');
      if (message.includes('Missing:')) {
        navigate(`/applicant/proposals/${proposalId}/documents`);
      } else {
        setError(message);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getProposalTypeBadge = (grantType) => {
    const variants = {
      Research: 'info',
      Innovation: 'accent',
    };
    return variants[grantType] || 'default';
  };

  if (loading) return <Loader />;
const userFullName = user ? `${user.first_name} ${user.surname}` : 'Researcher';
  const isFirstLogin = proposals.length === 0;
  const greeting = isFirstLogin ? `Welcome, ${userFullName}` : `Welcome back, ${userFullName}`;

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title={greeting}
        subtitle="Manage your research proposals and submissions"
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {actionSuccess && <Alert variant="success">{actionSuccess}</Alert>}

      {/* Statistics */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Proposals" value={dashboard.stats.totalProposals} icon={<FileText className="w-8 h-8" />} />
          <StatCard title="Draft" value={dashboard.stats.draft} icon={<PenTool className="w-8 h-8" />} />
          <StatCard title="Under Review" value={dashboard.stats.underReview} icon={<Clock className="w-8 h-8" />} />
          <StatCard title="Approved" value={dashboard.stats.approved} icon={<CheckCircle className="w-8 h-8" />} />
        </div>
      )}

      {/* My Proposals Section */}
      <Card title="My Proposals" subtitle="Recent proposal submissions and drafts">
        {proposals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted mb-4">
              No proposals found. Click <strong>Submit New Proposal</strong> from the Side Menu to start a new
              submission.
            </p>
            <Button variant="primary" onClick={() => navigate('/applicant/proposals/new')}>
              Start New Proposal
            </Button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Protocol No</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Proposal Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Attachments</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Members</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Review Report</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Action</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => {
                  const { uploaded, total } = getAttachmentSummary(proposal);
                  const grantType = getGrantType(proposal);
                  return (
                  <tr key={proposal.id} className="border-b border-border hover:bg-background">
                    <td className="py-3 px-4 text-textMain">{getProtocolNo(proposal)}</td>
                    <td className="py-3 px-4 text-textMain">{proposal.title}</td>
                    <td className="py-3 px-4">
                      {grantType && (
                        <Badge variant={getProposalTypeBadge(grantType)}>
                          {grantType}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">{uploaded}/{total} uploaded</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusVariant(proposal.status)}>
                        {getStatusLabel(proposal.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-textMain">{getTeamMemberCount(proposal)}</td>
                    <td className="py-3 px-4 text-muted">-</td>
                    <td className="py-3 px-4">
                      <div className="space-y-2">
                        {/* Primary Action Button */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/applicant/proposals/${proposal.id}`)}
                            disabled={actionLoading === proposal.id}
                            className="flex-1"
                          >
                            Details
                          </Button>
                        </div>

                        {/* Draft Actions */}
                        {isDraftLike(proposal.status) && (
                          <>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => navigate(getEditPath(proposal))}
                                disabled={actionLoading === proposal.id}
                                className="flex-1"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="accent"
                                onClick={() => navigate(`/applicant/proposals/${proposal.id}/documents`)}
                                disabled={actionLoading === proposal.id}
                                className="flex-1"
                              >
                                Upload
                              </Button>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => navigate(`/applicant/proposals/${proposal.id}/team-members`)}
                                disabled={actionLoading === proposal.id}
                                className="flex-1"
                              >
                                Members
                              </Button>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleSubmit(proposal.id)}
                                disabled={actionLoading === proposal.id}
                                className="flex-1"
                              >
                                {actionLoading === proposal.id ? 'Submitting...' : 'Submit'}
                              </Button>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDelete(proposal.id)}
                                disabled={actionLoading === proposal.id}
                                className="flex-1"
                              >
                                {actionLoading === proposal.id ? 'Deleting...' : 'Delete'}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
