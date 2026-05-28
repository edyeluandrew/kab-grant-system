import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  ClipboardList,
  SearchCheck,
  ThumbsUp,
  ThumbsDown,
  Trophy,
  LayoutDashboard,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { getAdminDashboard } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';

const statConfig = [
  {
    key: 'submitted',
    title: 'Submitted',
    subtitle: 'Awaiting reviewer assignment',
    icon: Inbox,
    route: '/admin/proposals/submitted',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    key: 'scheduled_for_review',
    title: 'Scheduled for Review',
    subtitle: 'Reviewers assigned',
    icon: ClipboardList,
    route: '/admin/proposals/scheduled',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
  },
  {
    key: 'reviewed',
    title: 'Reviewed',
    subtitle: 'Awaiting final decision',
    icon: SearchCheck,
    route: '/admin/proposals/reviewed',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    key: 'approved',
    title: 'Approved',
    subtitle: 'Accepted for funding',
    icon: ThumbsUp,
    route: '/admin/proposals/approved',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    key: 'rejected',
    title: 'Rejected',
    subtitle: 'Declined proposals',
    icon: ThumbsDown,
    route: '/admin/proposals/rejected',
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
  {
    key: 'awarded',
    title: 'Awarded',
    subtitle: 'Successfully funded',
    icon: Trophy,
    route: '/admin/proposals/awarded',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAdminDashboard()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout role="admin"><Loader /></DashboardLayout>;

  return (
    <DashboardLayout role={user?.role || 'admin'}>
      <PageHeader
        title="Admin Dashboard"
        subtitle="KAB Fund for Innovation and Research Overview"
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {stats && (
        <>
          {/* Total Banner */}
          <div className="mb-6 bg-secondary text-white rounded-xl px-6 py-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium opacity-70">Total Proposals in System</p>
              <p className="text-5xl font-extrabold mt-1 tracking-tight">{stats.total}</p>
            </div>
            <div className="flex items-center gap-3 opacity-30">
              <LayoutDashboard className="w-16 h-16" />
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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