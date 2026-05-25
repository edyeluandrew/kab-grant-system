import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { 
  getGrantCalls, 
  createGrantCall, 
  updateGrantCall, 
  toggleGrantCall, 
  deleteGrantCall,
  openApplicationWindow,
  closeApplicationWindow,
} from '../../api/authApi';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  X,
  Save,
} from 'lucide-react';

export default function GrantCalls() {
  const { user } = useAuth();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedGrantId, setSelectedGrantId] = useState(null);
  const [showWindowModal, setShowWindowModal] = useState(false);
  const [windowAction, setWindowAction] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    application_window_open: '',
    application_window_close: '',
    academic_year: new Date().getFullYear(),
    eligibility_requirements: [],
    guidelines_file: null,
  });

  const [newRequirement, setNewRequirement] = useState('');

  useEffect(() => {
    loadGrantCalls();
  }, []);

  const loadGrantCalls = async () => {
    try {
      setLoading(true);
      const data = await getGrantCalls();
      setGrants(data);
      setError('');
    } catch (err) {
      setError('Failed to load grant calls');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData((prev) => ({
        ...prev,
        eligibility_requirements: [...prev.eligibility_requirements, newRequirement],
      }));
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (index) => {
    setFormData((prev) => ({
      ...prev,
      eligibility_requirements: prev.eligibility_requirements.filter((_, i) => i !== index),
    }));
  };

  const handleOpenModal = (grant = null) => {
    if (grant) {
      setEditingId(grant.id);
      setFormData({
        title: grant.title,
        description: grant.description,
        deadline: grant.deadline,
        application_window_open: grant.application_window_open || '',
        application_window_close: grant.application_window_close || '',
        academic_year: grant.academic_year,
        eligibility_requirements: grant.eligibility_requirements || [],
        guidelines_file: grant.guidelines_file || null,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        deadline: '',
        application_window_open: '',
        application_window_close: '',
        academic_year: new Date().getFullYear(),
        eligibility_requirements: [],
        guidelines_file: null,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewRequirement('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.deadline) {
      setError('Title and deadline are required');
      return;
    }

    try {
      setError('');
      if (editingId) {
        const updated = await updateGrantCall(editingId, formData);
        setGrants((prev) =>
          prev.map((g) => (g.id === editingId ? updated : g))
        );
        setSuccess('Grant call updated successfully');
      } else {
        const newGrant = await createGrantCall(formData);
        setGrants((prev) => [...prev, newGrant]);
        setSuccess('Grant call created successfully');
      }
      handleCloseModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save grant call');
    }
  };

  const handleToggleActive = async (grant) => {
    try {
      await toggleGrantCall(grant.id);
      setGrants((prev) =>
        prev.map((g) =>
          g.id === grant.id ? { ...g, is_active: !g.is_active } : g
        )
      );
      setSuccess(`Grant call ${grant.is_active ? 'deactivated' : 'activated'}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update grant call');
    }
  };

  const handleDelete = async (grantId) => {
    if (!window.confirm('Are you sure you want to delete this grant call?')) return;
    try {
      await deleteGrantCall(grantId);
      setGrants((prev) => prev.filter((g) => g.id !== grantId));
      setSuccess('Grant call deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete grant call');
    }
  };

  const handleOpenWindow = async (grantId) => {
    try {
      const updated = await openApplicationWindow(grantId);
      setGrants((prev) =>
        prev.map((g) => (g.id === grantId ? updated : g))
      );
      setSuccess('Application window opened');
      setTimeout(() => setSuccess(''), 3000);
      setShowWindowModal(false);
    } catch (err) {
      setError('Failed to open application window');
    }
  };

  const handleCloseWindow = async (grantId) => {
    try {
      const updated = await closeApplicationWindow(grantId);
      setGrants((prev) =>
        prev.map((g) => (g.id === grantId ? updated : g))
      );
      setSuccess('Application window closed');
      setTimeout(() => setSuccess(''), 3000);
      setShowWindowModal(false);
    } catch (err) {
      setError('Failed to close application window');
    }
  };

  const getWindowStatus = (grant) => {
    const now = new Date();
    const openDate = new Date(grant.application_window_open);
    const closeDate = new Date(grant.application_window_close);

    if (now < openDate) return { status: 'pending', label: 'Not Yet Open', color: 'text-warning' };
    if (now > closeDate) return { status: 'closed', label: 'Closed', color: 'text-danger' };
    return { status: 'open', label: 'Open', color: 'text-success' };
  };

  const daysUntilDeadline = (deadline) => {
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-textMain">Grant Calls</h1>
            <p className="text-muted mt-1">Create and manage research grant calls</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Grant Call
          </Button>
        </div>

        {/* Alerts */}
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Grant Calls Grid */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-surface rounded-lg animate-pulse" />
            ))}
          </div>
        ) : grants.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-textMain mb-2">No Grant Calls</h3>
            <p className="text-muted mb-6">Create your first grant call to get started</p>
            <Button onClick={() => handleOpenModal()}>Create Grant Call</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {grants.map((grant) => {
              const windowStatus = getWindowStatus(grant);
              const daysLeft = daysUntilDeadline(grant.deadline);

              return (
                <Card key={grant.id} className="relative">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        grant.is_active
                          ? 'bg-success/10 text-success'
                          : 'bg-muted/10 text-muted'
                      }`}
                    >
                      {grant.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-textMain mb-2 pr-24">{grant.title}</h3>
                  <p className="text-muted text-sm mb-4">{grant.description}</p>

                  {/* Key Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-t border-b border-border">
                    <div>
                      <p className="text-xs text-muted">Deadline</p>
                      <p className="text-sm font-semibold text-textMain">
                        {grant.deadline}
                      </p>
                      <p className="text-xs text-warning mt-1">{daysLeft} days left</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Application Window</p>
                      <p className={`text-sm font-semibold ${windowStatus.color}`}>
                        {windowStatus.label}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {grant.application_window_open} to {grant.application_window_close}
                      </p>
                    </div>
                  </div>

                  {/* Eligibility Requirements */}
                  {grant.eligibility_requirements && grant.eligibility_requirements.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-textMain mb-2">
                        Eligibility Requirements
                      </p>
                      <ul className="space-y-1">
                        {grant.eligibility_requirements.slice(0, 2).map((req, idx) => (
                          <li key={idx} className="text-xs text-muted flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-success" />
                            {req}
                          </li>
                        ))}
                        {grant.eligibility_requirements.length > 2 && (
                          <li className="text-xs text-muted italic">
                            +{grant.eligibility_requirements.length - 2} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(grant)}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGrantId(grant.id);
                        setWindowAction(windowStatus.status === 'open' ? 'close' : 'open');
                        setShowWindowModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      {windowStatus.status === 'open' ? (
                        <>
                          <Lock className="w-4 h-4" />
                          Close Window
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          Open Window
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(grant)}
                      className="flex items-center justify-center gap-2"
                    >
                      {grant.is_active ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Unlock className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-danger hover:bg-danger/10"
                      onClick={() => handleDelete(grant.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? 'Edit Grant Call' : 'Create Grant Call'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-textMain mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., Innovation Grant 2026"
              className="w-full px-4 py-2 border border-border rounded-lg text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-textMain mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Describe the grant call objectives"
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textMain mb-1">
                Application Opens *
              </label>
              <input
                type="date"
                value={formData.application_window_open}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    application_window_open: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-border rounded-lg text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-1">
                Application Closes *
              </label>
              <input
                type="date"
                value={formData.application_window_close}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    application_window_close: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-border rounded-lg text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-textMain mb-1">
              Final Deadline *
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, deadline: e.target.value }))
              }
              className="w-full px-4 py-2 border border-border rounded-lg text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Eligibility Requirements */}
          <div>
            <label className="block text-sm font-medium text-textMain mb-2">
              Eligibility Requirements
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
                placeholder="Add a requirement"
                className="flex-1 px-4 py-2 border border-border rounded-lg text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button
                type="button"
                onClick={handleAddRequirement}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.eligibility_requirements.length > 0 && (
              <div className="space-y-2">
                {formData.eligibility_requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-background p-2 rounded border border-border"
                  >
                    <p className="text-sm text-textMain">{req}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="text-muted hover:text-danger"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {editingId ? 'Update' : 'Create'} Grant Call
            </Button>
          </div>
        </form>
      </Modal>

      {/* Window Action Modal */}
      <Modal
        isOpen={showWindowModal}
        onClose={() => setShowWindowModal(false)}
        title={windowAction === 'open' ? 'Open Application Window' : 'Close Application Window'}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-sm text-textMain">
                {windowAction === 'open'
                  ? 'Open the application window for this grant call?'
                  : 'Close the application window for this grant call?'}
              </p>
              <p className="text-xs text-muted mt-1">
                {windowAction === 'open'
                  ? 'Applicants will be able to submit proposals.'
                  : 'No new proposals can be submitted.'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowWindowModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (windowAction === 'open') {
                  handleOpenWindow(selectedGrantId);
                } else {
                  handleCloseWindow(selectedGrantId);
                }
              }}
              className="flex-1"
            >
              {windowAction === 'open' ? 'Open Window' : 'Close Window'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}