import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle2, LayoutDashboard } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { getReviewerDashboardStats } from '../../api/reviewerApi';
import { useAuth } from '../../context/AuthContext';

const statConfig = [
  {
    key: 'total_assigned',
    title: 'Total Assigned',
    subtitle: 'Proposals assigned to you',
    icon: ClipboardList,
    route: '/reviewer/proposals',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    key: 'pending_review',
    title: 'Pending Review',
    subtitle: 'Awaiting your review report',
    icon: Clock,
    route: '/reviewer/proposals',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    key: 'submitted_reviews',
    title: 'Submitted Reviews',
    subtitle: 'Reviews you have completed',
    icon: CheckCircle2,
    route: '/reviewer/reviews',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
];

export default function ReviewerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getReviewerDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout role="reviewer"><Loader /></DashboardLayout>;

  return (
    <DashboardLayout role="reviewer">
      <PageHeader
        title="Reviewer Dashboard"
        subtitle="KAB Fund for Innovation and Research — Review Panel"
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {stats && (
        <>
          {/* Welcome Banner */}
          <div className="mb-6 bg-secondary text-white rounded-xl px-6 py-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium opacity-70">Welcome back,</p>
              <p className="text-2xl font-extrabold mt-0.5 tracking-tight">
                {user?.first_name} {user?.surname}
              </p>
              <p className="text-sm opacity-60 mt-1">Review Panel — Kabale University</p>
            </div>
            <div className="opacity-20">
              <LayoutDashboard className="w-16 h-16" />
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statConfig.map(({ key, title, subtitle, icon: Icon, route, color, bg }) => (
              <button
                key={key}
                onClick={() => navigate(route)}
                className="text-left bg-surface border border-border rounded-xl p-5 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className="text-3xl font-extrabold text-textMain tracking-tight">
                    {stats[key] ?? 0}
                  </span>
                </div>
                <p className="text-sm font-semibold text-textMain group-hover:text-primary transition-colors">
                  {title}
                </p>
                <p className="text-xs text-muted mt-0.5">{subtitle}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}