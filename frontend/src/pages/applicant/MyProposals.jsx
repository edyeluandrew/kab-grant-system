import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { getMyProposals, deleteDraft, submitProposal } from '../../api/applicantApi';

export default function MyProposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const data = await getMyProposals();
        setProposals(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
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
      setError(err.message || 'Failed to delete draft');
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
      setError(err.message || 'Failed to submit proposal');
    } finally {
      setActionLoading(null);
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'default',
      submitted: 'info',
      under_review: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return variants[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      submitted: 'Submitted',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  if (loading) return <Loader />;

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="My Proposals"
        subtitle="View and manage all your research proposals"
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {actionSuccess && <Alert variant="success">{actionSuccess}</Alert>}

      <Card>
        {proposals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted mb-4">No proposals found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Protocol No</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Proposal Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Uploaded</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Members</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Review</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="border-b border-border hover:bg-background">
                    <td className="py-3 px-4 text-textMain font-medium">{proposal.protocolNo}</td>
                    <td className="py-3 px-4 text-textMain">{proposal.title}</td>
                    <td className="py-3 px-4 text-sm text-muted">{proposal.attachmentsSummary}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadge(proposal.status)}>
                        {getStatusLabel(proposal.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-textMain">{proposal.membersCount}</td>
                    <td className="py-3 px-4 text-muted">-</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/applicant/proposals/${proposal.id}`)}
                          disabled={actionLoading === proposal.id}
                        >
                          Details
                        </Button>
                        {proposal.status === 'draft' && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => navigate(`/applicant/proposals/${proposal.id}`)}
                              disabled={actionLoading === proposal.id}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="accent"
                              onClick={() => navigate(`/applicant/proposals/${proposal.id}/documents`)}
                              disabled={actionLoading === proposal.id}
                            >
                              Upload
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => navigate(`/applicant/proposals/${proposal.id}/team-members`)}
                              disabled={actionLoading === proposal.id}
                            >
                              Members
                            </Button>
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => handleSubmit(proposal.id)}
                              disabled={actionLoading === proposal.id}
                            >
                              {actionLoading === proposal.id ? 'Submitting...' : 'Submit'}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(proposal.id)}
                              disabled={actionLoading === proposal.id}
                            >
                              {actionLoading === proposal.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
