import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { canApproveProposals } from '../../../constants/permissions';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';
import Table from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import { getReviewedProposals, makeDecision } from '../../../api/adminApi';

const DECISIONS = ['Approved', 'Rejected', 'Awarded'];

export default function ReviewedProposals() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Only sgo_admin can make decisions
  const canDecide = canApproveProposals(user?.role);

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [decision, setDecision] = useState('');
  const [note, setNote] = useState('');
  const [deciding, setDeciding] = useState(false);
  const [decisionError, setDecisionError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getReviewedProposals();
        setProposals(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openDecisionModal = (proposal) => {
    setSelectedProposal(proposal);
    setDecision('');
    setNote('');
    setDecisionError(null);
    setModalOpen(true);
  };

  const handleDecision = async () => {
    if (!decision) {
      setDecisionError('Please select a decision.');
      return;
    }
    try {
      setDeciding(true);
      setDecisionError(null);
      await makeDecision(selectedProposal.id, decision, note);
      setProposals((prev) => prev.filter((p) => p.id !== selectedProposal.id));
      setModalOpen(false);
      setSuccess(`Proposal "${selectedProposal.title}" has been ${decision.toLowerCase()}. The applicant has been notified.`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setDecisionError(err.message || 'Failed to submit decision');
    } finally {
      setDeciding(false);
    }
  };

  const decisionVariant = {
    Approved: 'success',
    Rejected: 'danger',
    Awarded: 'warning',
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
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/admin/proposals/${row.id}`)}
          >
            View
          </Button>

          {/* Only sgo_admin sees Make Decision button */}
          {canDecide && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => openDecisionModal(row)}
            >
              Make Decision
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <DashboardLayout role={user?.role}><Loader /></DashboardLayout>;

  return (
    <DashboardLayout role={user?.role}>
      <PageHeader
        title="Reviewed Proposals"
        subtitle={`${proposals.length} proposal${proposals.length !== 1 ? 's' : ''} awaiting final decision`}
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Info banner for super_admin — view only */}
      {!canDecide && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          You are in view-only mode. Only SGO Admins can make final decisions on proposals.
        </div>
      )}

      <Card>
        <Table
          columns={columns}
          data={proposals}
          emptyMessage="No proposals awaiting decision."
        />
      </Card>

      {/* Decision Modal — only reachable by sgo_admin */}
      {canDecide && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Final Decision: ${selectedProposal?.title}`}
          size="md"
        >
          <p className="text-sm text-muted mb-4">
            Select your decision. The applicant will be notified by email automatically.
          </p>

          {decisionError && <Alert variant="danger">{decisionError}</Alert>}

          {/* Decision Buttons */}
          <div className="flex gap-3 mb-6">
            {DECISIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDecision(d)}
                className={`flex-1 py-3 rounded-lg border-2 text-sm font-semibold transition ${
                  decision === d
                    ? d === 'Approved'
                      ? 'border-success bg-success/10 text-success'
                      : d === 'Rejected'
                      ? 'border-danger bg-danger/10 text-danger'
                      : 'border-warning bg-warning/10 text-warning'
                    : 'border-border text-muted hover:border-textMain'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Optional Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-textMain mb-1">
              Note to Applicant{' '}
              <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any feedback or reason for your decision..."
              className="w-full px-3 py-2 border border-border rounded-md text-sm text-textMain outline-none focus:ring-2 focus:ring-accent focus:border-accent min-h-[100px] resize-y"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={decision ? decisionVariant[decision] || 'primary' : 'primary'}
              onClick={handleDecision}
              disabled={deciding || !decision}
            >
              {deciding ? 'Submitting...' : `Confirm ${decision || 'Decision'}`}
            </Button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}