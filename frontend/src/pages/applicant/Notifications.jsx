import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Alert from '../../components/common/Alert';
import PageLoader from '../../components/common/PageLoader';
import { getApplicantNotifications } from '../../api/applicantApi';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getApplicantNotifications();
        setNotifications(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getNotificationBorderColor = (type) => {
    const colors = {
      draft_saved: 'border-l-info',
      missing_attachments: 'border-l-warning',
      proposal_submitted: 'border-l-success',
      scheduled_review: 'border-l-info',
      review_completed: 'border-l-info',
      approved: 'border-l-success',
      rejected: 'border-l-danger',
    };
    return colors[type] || 'border-l-info';
  };

  const getNotificationStatusLabel = (type) => {
    const labels = {
      draft_saved: 'Draft Saved',
      missing_attachments: 'Missing Files',
      proposal_submitted: 'Submitted',
      scheduled_review: 'Review Scheduled',
      review_completed: 'Review Complete',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return labels[type] || 'Notification';
  };

  const getNotificationIcon = (type) => {
    const iconProps = 'w-4 h-4';
    const iconClass = 'text-textMain/70';
    const icons = {
      draft_saved: <Info className={`${iconProps} ${iconClass}`} />,
      missing_attachments: <AlertCircle className={`${iconProps} ${iconClass}`} />,
      proposal_submitted: <CheckCircle2 className={`${iconProps} ${iconClass}`} />,
      scheduled_review: <Info className={`${iconProps} ${iconClass}`} />,
      review_completed: <CheckCircle2 className={`${iconProps} ${iconClass}`} />,
      approved: <CheckCircle2 className={`${iconProps} ${iconClass}`} />,
      rejected: <AlertCircle className={`${iconProps} ${iconClass}`} />,
    };
    return icons[type] || <Bell className={`${iconProps} ${iconClass}`} />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <PageLoader role="applicant" />;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="Notifications"
        subtitle={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="bg-white/50 backdrop-blur-lg border border-white/30 rounded-xl shadow-lg overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-12 px-6">
            <p className="text-muted text-sm">No notifications yet. You'll receive updates about your proposals here.</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`px-6 py-4 transition-all ${
                  notification.read
                    ? 'bg-white/20 hover:bg-white/30'
                    : 'bg-white/40 hover:bg-white/50'
                } ${index !== notifications.length - 1 ? 'border-b border-white/20' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md backdrop-blur-sm bg-white/30 text-textMain">
                        {getNotificationIcon(notification.type)}
                        {getNotificationStatusLabel(notification.type)}
                      </span>
                      {!notification.read && (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-md bg-white/50 text-textMain">
                          New
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-sm text-textMain mb-1">{notification.title}</p>
                    <p className="text-sm text-textMain/90 leading-relaxed">{notification.message}</p>
                    <div className="flex items-center gap-1 text-xs text-textMain/60 mt-2">
                      <Clock className="w-3 h-3" />
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
