import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle2, Clock, ClipboardList } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { getAssignedProposals } from '../../api/reviewerApi';
import { useAuth } from '../../context/AuthContext';

export default function AssignedProposals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAssignedProposals()
      .then((data) => {
        console.log('Assigned proposals loaded:', data);
        setProposals(data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch assigned proposals:', err);
        const errorMsg = err.response?.data?.detail || err.message || 'Failed to load assigned proposals';
        setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        setProposals([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout role="reviewer"><Loader /></DashboardLayout>;

  if (error) {
    return (
      <DashboardLayout role="reviewer">
        <PageHeader
          title="Assigned Proposals"
          subtitle="Proposals assigned to you for review"
        />
        <Alert variant="danger">
          <strong>Failed to load proposals:</strong> {error}
          <br/>
          <small>Please check your connection and refresh the page.</small>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="reviewer">
      <PageHeader
        title="Assigned Proposals"
        subtitle="Proposals assigned to you for review"
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {proposals.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <ClipboardList className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-muted text-sm">No proposals have been assigned to you yet.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wide">Protocol No.</th>
                <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wide">Principal Investigator</th>
                <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wide">Review Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {proposals.map((p) => (
                <tr key={p.id} className="hover:bg-background transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{p.protocol_no}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-textMain line-clamp-1 max-w-xs">{p.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.grant_type === 'Research'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-violet-50 text-violet-600'
                    }`}>
                      {p.grant_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-textMain">
                    {p.pi_first_name} {p.pi_last_name}
                  </td>
                  <td className="px-4 py-3">
                    {p.review_submitted ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/reviewer/proposals/${p.id}`)}
                      className="flex items-center gap-1.5 text-primary text-xs font-medium hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {p.review_submitted ? 'View' : 'Review'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}