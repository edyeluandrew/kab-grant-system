import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { canAssignReviewers } from '../../../constants/permissions';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';
import Badge from '../../../components/common/Badge';
import Table from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import { getSubmittedProposals, getReviewers, assignReviewers } from '../../../api/adminApi';

export default function SubmittedProposals() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canAssign = canAssignReviewers(user?.role);
  
  const [proposals, setProposals] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedReviewerIds, setSelectedReviewerIds] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const proposalsData = await getSubmittedProposals();
        setProposals(proposalsData);
        
        // Only fetch reviewers if user has permission to assign them
        if (canAssign) {
          const reviewersData = await getReviewers();
          setReviewers(reviewersData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canAssign]);

  const openAssignModal = (proposal) => {
    setSelectedProposal(proposal);
    setSelectedReviewerIds([]);
    setAssignError(null);
    setModalOpen(true);
  };

  const toggleReviewer = (id) => {
    setSelectedReviewerIds((prev) =>
      prev.includes(id)
        ? prev.filter((r) => r !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  const handleAssign = async () => {
    if (selectedReviewerIds.length === 0) {
      setAssignError('Please select at least one reviewer.');
      return;
    }
    try {
      setAssigning(true);
      setAssignError(null);
      await assignReviewers(selectedProposal.id, selectedReviewerIds);
      setProposals((prev) => prev.filter((p) => p.id !== selectedProposal.id));
      setModalOpen(false);
      setSuccess(`Reviewers assigned to "${selectedProposal.title}" successfully.`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setAssignError(err.message || 'Failed to assign reviewers');
    } finally {
      setAssigning(false);
    }
  };

  const columns = [
    { key: 'protocol_no', label: 'Protocol No' },
    { key: 'title', label: 'Proposal Title' },
    { key: 'grant_type', label: 'Type', render: (row) => <Badge variant="info">{row.grant_type}</Badge> },
    { key: 'pi', label: 'Principal Investigator', render: (row) => `${row.pi_first_name} ${row.pi_last_name}` },
    { key: 'pi_phone', label: 'Contact' },
    { key: 'attachments_count', label: 'Attachments', render: (row) => `${row.attachments_count}/9` },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate(`/admin/proposals/${row.id}`)}>
            View
          </Button>
          {canAssign && (
            <Button size="sm" variant="primary" onClick={() => openAssignModal(row)}>
              Assign Reviewers
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
        title="Submitted Proposals"
        subtitle={`${proposals.length} proposal${proposals.length !== 1 ? 's' : ''} awaiting reviewer assignment`}
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card>
        <Table
          columns={columns}
          data={proposals}
          emptyMessage="No submitted proposals at the moment."
        />
      </Card>

      {/* Assign Reviewers Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Assign Reviewers: ${selectedProposal?.title}`}
        size="lg"
      >
        <p className="text-sm text-muted mb-4">
          Select 1 to 3 reviewers for this proposal. Selected: {selectedReviewerIds.length}/3
        </p>

        {assignError && <Alert variant="danger">{assignError}</Alert>}

        <div className="space-y-2 mb-6">
          {reviewers.map((reviewer) => {
            const isSelected = selectedReviewerIds.includes(reviewer.id);
            const isDisabled = !isSelected && selectedReviewerIds.length >= 3;
            return (
              <div
                key={reviewer.id}
                onClick={() => !isDisabled && toggleReviewer(reviewer.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border transition cursor-pointer ${
                  isSelected
                    ? 'border-accent bg-accent/10'
                    : isDisabled
                    ? 'border-border opacity-40 cursor-not-allowed'
                    : 'border-border hover:border-accent hover:bg-background'
                }`}
              >
                <div>
                  <p className="font-medium text-sm text-textMain">
                    {reviewer.first_name} {reviewer.surname}
                  </p>
                  <p className="text-xs text-muted">{reviewer.research_discipline} — {reviewer.email}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-accent bg-accent' : 'border-border'}`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAssign} disabled={assigning}>
            {assigning ? 'Assigning...' : 'Confirm Assignment'}
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}