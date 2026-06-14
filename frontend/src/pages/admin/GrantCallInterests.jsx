import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import PageLoader from '../../components/common/PageLoader';
import Table from '../../components/common/Table';
import { getGrantCall, getGrantCallInterests } from '../../api/adminApi';
import { getApiError } from '../../utils/apiError';

export default function GrantCallInterests() {
  const { callId } = useParams();
  const [grantCall, setGrantCall] = useState(null);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [call, list] = await Promise.all([
          getGrantCall(callId),
          getGrantCallInterests(callId),
        ]);
        setGrantCall(call);
        setInterests(list || []);
        setError(null);
      } catch (err) {
        setError(getApiError(err, 'Failed to load interest submissions'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [callId]);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => `${row.first_name} ${row.surname}`,
    },
    { key: 'email', label: 'Email' },
    {
      key: 'file_name',
      label: 'Document',
      render: (row) => (
        <span className="text-sm text-textMain">{row.file_name}</span>
      ),
    },
    {
      key: 'submitted_at',
      label: 'Submitted',
      render: (row) => new Date(row.submitted_at).toLocaleString(),
    },
    {
      key: 'download',
      label: 'Download',
      render: (row) => (
        <a
          href={row.document_url}
          target="_blank"
          rel="noopener noreferrer"
          download={row.file_name}
          className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
        >
          <Download className="w-4 h-4" /> PDF
        </a>
      ),
    },
  ];

  if (loading) return <PageLoader role="admin" />;

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Interest Submissions"
        subtitle={grantCall ? grantCall.title : 'Grant call interests'}
        action={
          <Link to="/admin/grant-calls">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Grant Calls
            </Button>
          </Link>
        }
      />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <p className="text-sm text-muted mb-4">
          {interests.length} applicant{interests.length !== 1 ? 's' : ''} expressed interest
          {grantCall ? ` for "${grantCall.title}"` : ''}.
        </p>

        {interests.length === 0 ? (
          <p className="text-center text-muted py-12">No interest submissions yet.</p>
        ) : (
          <Table columns={columns} data={interests} />
        )}
      </Card>
    </DashboardLayout>
  );
}
