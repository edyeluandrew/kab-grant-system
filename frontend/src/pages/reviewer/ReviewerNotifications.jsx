import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

export default function ReviewerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call to getReviewerNotifications
        setNotifications([]);
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
      proposal_assigned: 'border-l-info',
      review_due: 'border-l-warning',
      review_submitted: 'border-l-success',
    };
    return colors[type] || 'border-l-info';
  };

  const getNotificationStatusLabel = (type) => {
    const labels = {
      proposal_assigned: 'Proposal Assigned',
      review_due: 'Review Due Soon',
      review_submitted: 'Review Submitted',
    };
    return labels[type] || 'Notification';
  };

  const getNotificationIcon = (type) => {
    const iconProps = 'w-4 h-4';
    const iconClass = 'text-textMain/70';
    const icons = {
      proposal_assigned: <Info className={`${iconProps} ${iconClass}`} />,
      review_due: <AlertCircle className={`${iconProps} ${iconClass}`} />,
      review_submitted: <CheckCircle2 className={`${iconProps} ${iconClass}`} />,
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

  if (loading) return <Loader />;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout role="reviewer">
      <PageHeader
        title="Notifications"
        subtitle={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="bg-white/50 backdrop-blur-lg border border-white/30 rounded-xl shadow-lg overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-12 px-6">
            <p className="text-muted text-sm">No notifications yet. You'll receive updates about assigned proposals here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-l-4 ${getNotificationBorderColor(
                  notification.type,
                )} hover:bg-background/50 transition`}
              >
                <div className="flex gap-3">
                  <div className="pt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-textMain text-sm">{notification.title}</p>
                        <p className="text-xs text-muted mt-0.5">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                      <span className="inline-block px-2 py-0.5 bg-background rounded-full">
                        {getNotificationStatusLabel(notification.type)}
                      </span>
                      <span>{formatDate(notification.created_at)}</span>
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
