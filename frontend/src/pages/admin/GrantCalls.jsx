import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import {
  getGrantCalls,
  createGrantCall,
  updateGrantCall,
  deleteGrantCall,
  openApplicationWindow,
  closeApplicationWindow,
} from '../../api/adminApi';

const emptyForm = {
  title: '',
  description: '',
  grant_type: 'Research',
  academic_year: new Date().getFullYear(),
  opening_date: '',
  closing_date: '',
  max_budget: '',
  openImmediately: true,
};

const statusVariant = {
  Draft: 'warning',
  Open: 'success',
  Closed: 'danger',
};

export default function GrantCalls() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGrantCalls();
      setCalls(data || []);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load grant calls';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      setCalls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.grant_type) errors.grant_type = 'Grant type is required';
    if (!formData.academic_year) errors.academic_year = 'Academic year is required';
    if (!formData.opening_date) errors.opening_date = 'Opening date is required';
    if (!formData.closing_date) errors.closing_date = 'Closing date is required';
    if (
      formData.opening_date &&
      formData.closing_date &&
      formData.closing_date <= formData.opening_date
    ) {
      errors.closing_date = 'Closing date must be after opening date';
    }
    return errors;
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setFormErrors({});
    setEditingId(null);
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setFormError('Please fix the errors below.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      grant_type: formData.grant_type,
      academic_year: Number(formData.academic_year),
      opening_date: formData.opening_date,
      closing_date: formData.closing_date,
      max_budget: formData.max_budget ? Number(formData.max_budget) : null,
    };

    try {
      setFormLoading(true);
      setFormError(null);

      if (editingId) {
        const updated = await updateGrantCall(editingId, payload);
        setCalls((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        setSuccess('Grant call updated successfully.');
      } else {
        const created = await createGrantCall(payload);
        let finalCall = created;

        if (formData.openImmediately && created.status === 'Draft') {
          finalCall = await openApplicationWindow(created.id);
        }

        setCalls((prev) => [finalCall, ...prev]);
        setSuccess(
          formData.openImmediately
            ? 'Grant call created and opened for applications. Applicants can now select it in their forms.'
            : 'Grant call created as draft. Open it when you are ready to accept applications.'
        );
      }

      resetForm();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to save grant call';
      setFormError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (call) => {
    setEditingId(call.id);
    setFormData({
      title: call.title,
      description: call.description || '',
      grant_type: call.grant_type,
      academic_year: call.academic_year,
      opening_date: call.opening_date,
      closing_date: call.closing_date,
      max_budget: call.max_budget || '',
      openImmediately: false,
    });
    setFormErrors({});
    setFormError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenWindow = async (callId) => {
    try {
      setActionLoading(callId);
      const updated = await openApplicationWindow(callId);
      setCalls((prev) => prev.map((c) => (c.id === callId ? updated : c)));
      setSuccess('Application window opened. This grant call is now visible in applicant forms.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to open application window';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseWindow = async (callId) => {
    try {
      setActionLoading(callId);
      const updated = await closeApplicationWindow(callId);
      setCalls((prev) => prev.map((c) => (c.id === callId ? updated : c)));
      setSuccess('Application window closed.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to close application window';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (callId) => {
    if (!window.confirm('Delete this draft grant call? This cannot be undone.')) return;
    try {
      setActionLoading(callId);
      await deleteGrantCall(callId);
      setCalls((prev) => prev.filter((c) => c.id !== callId));
      if (editingId === callId) resetForm();
      setSuccess('Grant call deleted.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete grant call';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'grant_type',
      label: 'Type',
      render: (row) => <Badge variant="info">{row.grant_type}</Badge>,
    },
    { key: 'academic_year', label: 'Academic Year', render: (row) => `AY ${row.academic_year}` },
    {
      key: 'dates',
      label: 'Window',
      render: (row) => (
        <span className="text-sm">
          {row.opening_date} → {row.closing_date}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.status === 'Draft' && (
            <>
              <Button
                size="sm"
                variant="success"
                disabled={actionLoading === row.id}
                onClick={() => handleOpenWindow(row.id)}
              >
                Open
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading === row.id}
                onClick={() => handleEdit(row)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={actionLoading === row.id}
                onClick={() => handleDelete(row.id)}
              >
                Delete
              </Button>
            </>
          )}
          {row.status === 'Open' && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading === row.id}
                onClick={() => handleEdit(row)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={actionLoading === row.id}
                onClick={() => handleCloseWindow(row.id)}
              >
                Close
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <Loader />;

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Grant Calls"
        subtitle="Create and manage grant calls. Only Open calls appear in applicant proposal forms."
      />

      {error && <Alert variant="danger" title="Error">{error}</Alert>}
      {success && <Alert variant="success" title="Success">{success}</Alert>}

      <div className="grid grid-cols-1 gap-6">
        <Card title={editingId ? 'Edit Grant Call' : 'Create New Grant Call'}>
          {formError && <Alert variant="danger">{formError}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="e.g. KAB-FIR 2026 Research Grant Call"
                />
                {formErrors.title && <p className="text-xs text-danger mt-1">{formErrors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Grant Type *</label>
                <select
                  name="grant_type"
                  value={formData.grant_type}
                  onChange={handleInputChange}
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-border rounded-md disabled:opacity-60"
                >
                  <option value="Research">Research</option>
                  <option value="Innovation">Innovation</option>
                </select>
                {formErrors.grant_type && <p className="text-xs text-danger mt-1">{formErrors.grant_type}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="Brief description of this grant call"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Academic Year *</label>
                <input
                  type="number"
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                {formErrors.academic_year && <p className="text-xs text-danger mt-1">{formErrors.academic_year}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Opening Date *</label>
                <input
                  type="date"
                  name="opening_date"
                  value={formData.opening_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                {formErrors.opening_date && <p className="text-xs text-danger mt-1">{formErrors.opening_date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Closing Date *</label>
                <input
                  type="date"
                  name="closing_date"
                  value={formData.closing_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                {formErrors.closing_date && <p className="text-xs text-danger mt-1">{formErrors.closing_date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Budget (UGX)</label>
                <input
                  type="number"
                  name="max_budget"
                  value={formData.max_budget}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="Optional"
                />
              </div>
            </div>

            {!editingId && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="openImmediately"
                  checked={formData.openImmediately}
                  onChange={handleInputChange}
                  className="rounded"
                />
                Open for applications immediately (shows in applicant form dropdown)
              </label>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Saving...' : editingId ? 'Update Grant Call' : 'Create Grant Call'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card title="All Grant Calls">
          {calls.length === 0 ? (
            <p className="text-muted text-sm">No grant calls yet. Create one above to get started.</p>
          ) : (
            <Table columns={columns} data={calls} />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
