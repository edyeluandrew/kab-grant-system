import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { canAssignReviewers } from '../../../constants/permissions';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';
import Table from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import { getScheduledProposals, removeReviewerFromProposal, setReviewDeadline, getReviewStatus } from '../../../api/adminApi';
import { mapReviewStatusAssignments } from '../../../utils/reviewerUtils';
import { getApiError } from '../../../utils/apiError';
import { Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function ScheduledProposals() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Only sgo_admin can remove reviewers
  const canManage = canAssignReviewers(user?.role);

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Deadline modal state
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [selectedProposalForDeadline, setSelectedProposalForDeadline] = useState(null);
  const [selectedReviewerForDeadline, setSelectedReviewerForDeadline] = useState(null);
  const [deadlineValue, setDeadlineValue] = useState('');
  const [settingDeadline, setSettingDeadline] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getScheduledProposals();
        const enriched = await Promise.all(
          (data || []).map(async (proposal) => {
            try {
              const statusRows = await getReviewStatus(proposal.id);
              return {
                ...proposal,
                assigned_reviewers: mapReviewStatusAssignments(statusRows),
              };
            } catch {
              return { ...proposal, assigned_reviewers: [] };
            }
          })
        );
        setProposals(enriched);
      } catch (err) {
        setError(getApiError(err, 'Failed to load scheduled proposals'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRemoveReviewer = async (proposalId, reviewerId, reviewerName) => {
    if (!window.confirm(`Remove ${reviewerName} from this proposal?`)) return;
    try {
      setActionLoading(`${proposalId}-${reviewerId}`);
      await removeReviewerFromProposal(proposalId, reviewerId);
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? { ...p, assigned_reviewers: p.assigned_reviewers.filter((r) => r.id !== reviewerId) }
            : p
        )
      );
      setSuccess('Reviewer removed successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to remove reviewer');
    } finally {
      setActionLoading(null);
    }
  };

  const openDeadlineModal = (proposal, reviewer) => {
    setSelectedProposalForDeadline(proposal);
    setSelectedReviewerForDeadline(reviewer);
    setDeadlineValue(reviewer.review_deadline || '');
    setDeadlineModalOpen(true);
  };

  const handleSetDeadline = async () => {
    if (!deadlineValue) {
      alert('Please select a deadline date');
      return;
    }
    try {
      setSettingDeadline(true);
      await setReviewDeadline(selectedProposalForDeadline.id, selectedReviewerForDeadline.id, deadlineValue);
      
      // Update local state
      setProposals((prev) =>
        prev.map((p) =>
          p.id === selectedProposalForDeadline.id
            ? {
                ...p,
                assigned_reviewers: p.assigned_reviewers.map((r) =>
                  r.id === selectedReviewerForDeadline.id
                    ? { ...r, review_deadline: deadlineValue }
                    : r
                ),
              }
            : p
        )
      );
      
      setSuccess(`Deadline set to ${deadlineValue}`);
      setDeadlineModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to set deadline');
    } finally {
      setSettingDeadline(false);
    }
  };

  const columns = [
    { key: 'protocol_no', label: 'Protocol No' },
    { key: 'title', label: 'Proposal Title' },
    {
      key: 'grant_type',
      label: 'Type',
      render: (row) => <Badge variant="info">{row.grant_type}</Badge>,
    },
    {
      key: 'pi',
      label: 'Principal Investigator',
      render: (row) => `${row.pi_first_name} ${row.pi_last_name}`,
    },
    {
      key: 'assigned_reviewers',
      label: 'Assigned Reviewers',
      render: (row) => (
        <div className="space-y-2">
          {row.assigned_reviewers && row.assigned_reviewers.length > 0 ? (
            row.assigned_reviewers.map((reviewer) => {
              const reviewerName = reviewer.first_name ? `${reviewer.first_name} ${reviewer.surname}` : reviewer.name;
              const isOverdue = reviewer.review_deadline && new Date() > new Date(reviewer.review_deadline) && !reviewer.submitted_review;
              return (
                <div key={reviewer.id} className="flex items-start gap-2 p-2 bg-surface rounded border border-border/40">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-textMain">{reviewerName}</span>
                      {reviewer.submitted_review ? (
                        <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                      ) : isOverdue ? (
                        <AlertCircle className="w-3 h-3 text-danger shrink-0" />
                      ) : (
                        <Clock className="w-3 h-3 text-warning shrink-0" />
                      )}
                    </div>
                    {reviewer.review_deadline && (
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        <Calendar className="w-3 h-3 text-muted" />
                        <span className={isOverdue ? 'text-danger font-medium' : 'text-muted'}>
                          {reviewer.review_deadline}
                          {isOverdue && ` (${reviewer.days_overdue || 0} days overdue)`}
                        </span>
                      </div>
                    )}
                    {!reviewer.review_deadline && canManage && (
                      <span className="text-xs text-warning italic">No deadline set</span>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    {canManage && (
                      <>
                        <button
                          onClick={() => openDeadlineModal(row, reviewer)}
                          className="text-xs text-primary hover:underline whitespace-nowrap"
                        >
                          {reviewer.review_deadline ? 'Change' : 'Set'}
                        </button>
                        <button
                          onClick={() => handleRemoveReviewer(row.id, reviewer.id, reviewerName)}
                          disabled={actionLoading === `${row.id}-${reviewer.id}`}
                          className="text-xs text-danger hover:underline disabled:opacity-50 whitespace-nowrap"
                        >
                          {actionLoading === `${row.id}-${reviewer.id}` ? 'Removing...' : 'Remove'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <span className="text-xs text-muted">None assigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/admin/proposals/${row.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  if (loading) return <DashboardLayout role={user?.role}><Loader /></DashboardLayout>;

  return (
    <DashboardLayout role={user?.role}>
      <PageHeader
        title="Scheduled for Review"
        subtitle={`${proposals.length} proposal${proposals.length !== 1 ? 's' : ''} with reviewers assigned`}
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}



      <Card>
        <Table
          columns={columns}
          data={proposals}
          emptyMessage="No proposals scheduled for review."
        />
      </Card>

      {/* Set Review Deadline Modal */}
      <Modal
        isOpen={deadlineModalOpen}
        onClose={() => setDeadlineModalOpen(false)}
        title="Set Review Deadline"
      >
        {selectedReviewerForDeadline && selectedProposalForDeadline && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted mb-1">Proposal</p>
              <p className="font-medium text-textMain">{selectedProposalForDeadline.title}</p>
            </div>
            <div>
              <p className="text-sm text-muted mb-1">Reviewer</p>
              <p className="font-medium text-textMain">
                {selectedReviewerForDeadline.first_name} {selectedReviewerForDeadline.surname}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                Review Deadline
              </label>
              <input
                type="date"
                value={deadlineValue}
                onChange={(e) => setDeadlineValue(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-textMain"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeadlineModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSetDeadline}
                disabled={settingDeadline}
              >
                {settingDeadline ? 'Setting...' : 'Set Deadline'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}