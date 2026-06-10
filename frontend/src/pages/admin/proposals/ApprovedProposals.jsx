import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';
import Table from '../../../components/common/Table';
import { getApprovedProposals } from '../../../api/adminApi';

export default function ApprovedProposals() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getApprovedProposals();
        setProposals(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    { key: 'protocol_no', label: 'Protocol No' },
    { key: 'title', label: 'Proposal Title' },
    { key: 'grant_type', label: 'Type', render: (row) => <Badge variant="info">{row.grant_type}</Badge> },
    { key: 'pi', label: 'Principal Investigator', render: (row) => `${row.pi_first_name} ${row.pi_last_name}` },
    { key: 'status', label: 'Status', render: () => <Badge variant="success">Approved</Badge> },
    {
      key: 'submitted_at',
      label: 'Submitted On',
      render: (row) => row.submitted_at || row.admin_decision_at || row.created_at || '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/proposals/${row.id}`)}>
          View
        </Button>
      ),
    },
  ];

  if (loading) return <DashboardLayout role={user?.role}><Loader /></DashboardLayout>;

  return (
    <DashboardLayout role={user?.role}>
      <PageHeader
        title="Approved Proposals"
        subtitle={`${proposals.length} proposal${proposals.length !== 1 ? 's' : ''} accepted for funding`}
      />
      {error && <Alert variant="danger">{error}</Alert>}
      <Card>
        <Table columns={columns} data={proposals} emptyMessage="No approved proposals found." />
      </Card>
    </DashboardLayout>
  );
}