import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Lock, Phone, Mail, MapPin, Calendar, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import PageLoader from '../../components/common/PageLoader';
import { getSettings } from '../../api/generalApi';

export default function ApplicantSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getSettings();
        setSettings(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load settings');
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) return <PageLoader role="applicant" />;

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="Settings"
        subtitle="View system settings and manage your account"
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {/* System Settings Section */}
      {settings && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* System Information */}
          <Card title="System Information" icon={<Settings className="w-5 h-5" />}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-textMain mb-1">
                  System Name
                </label>
                <p className="text-textMain">{settings.system_name || 'N/A'}</p>
              </div>

              {settings.system_motto && (
                <div>
                  <label className="block text-sm font-semibold text-textMain mb-1">
                    Motto
                  </label>
                  <p className="text-textMain">{settings.system_motto}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-textMain mb-1">
                  Academic Year
                </label>
                <p className="text-lg font-bold text-primary">
                  {settings.active_academic_year}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-textMain mb-1">
                  Accepting Applications
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      settings.is_accepting_applications
                        ? 'bg-success'
                        : 'bg-danger'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      settings.is_accepting_applications
                        ? 'text-success'
                        : 'text-danger'
                    }`}
                  >
                    {settings.is_accepting_applications ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Important Dates */}
          <Card title="Important Dates" icon={<Calendar className="w-5 h-5" />}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-textMain mb-1">
                  Submission Deadline
                </label>
                <p className="text-lg font-bold text-primary">
                  {new Date(settings.submission_deadline).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-textMain mb-1">
                  Days Remaining
                </label>
                <p className="text-sm text-muted">
                  {(() => {
                    const deadline = new Date(settings.submission_deadline);
                    const today = new Date();
                    const daysLeft = Math.ceil(
                      (deadline - today) / (1000 * 60 * 60 * 24)
                    );
                    if (daysLeft < 0) {
                      return (
                        <span className="text-danger font-semibold">
                          Deadline has passed
                        </span>
                      );
                    }
                    return (
                      <span className={daysLeft <= 7 ? 'text-warning font-semibold' : ''}>
                        {daysLeft} days
                      </span>
                    );
                  })()}
                </p>
              </div>

              {!settings.is_accepting_applications && (
                <Alert variant="warning" className="mt-4">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Submissions are currently closed
                </Alert>
              )}
            </div>
          </Card>

          {/* Contact Information */}
          {(settings.email || settings.phone || settings.address) && (
            <Card title="Contact Information" icon={<Mail className="w-5 h-5" />}>
              <div className="space-y-3">
                {settings.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted">Email</p>
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-primary hover:underline"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}

                {settings.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted">Phone</p>
                      <a
                        href={`tel:${settings.phone}`}
                        className="text-primary hover:underline"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                )}

                {settings.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted">Address</p>
                      <p className="text-textMain">{settings.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Account Settings */}
          <Card title="Account Security" icon={<Lock className="w-5 h-5" />}>
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Manage your account security and password
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate('/applicant/change-password')}
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
