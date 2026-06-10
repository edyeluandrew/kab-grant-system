import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { canCreateReviewers, canManageReviewers } from '../../constants/permissions';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';
import { getReviewers, createReviewer, removeReviewer } from '../../api/adminApi';
import { normalizeReviewers } from '../../utils/reviewerUtils';
import { getApiError } from '../../utils/apiError';

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

const disciplineOptions = [
  'Natural Sciences', 'Engineering and Technology', 'Medical and Health Sciences',
  'Agricultural Sciences', 'Social Sciences', 'Humanities', 'Information Technology',
];

const emptyForm = {
  first_name: '',
  surname: '',
  gender: '',
  phone: '',
  research_discipline: '',
  email: '',
  password: '',
  confirm_password: '',
};

export default function Reviewers() {
  const { user } = useAuth();

  // Permission checks
  const canCreate = canCreateReviewers(user?.role);
  const canRemove = canManageReviewers(user?.role);

  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchReviewers();
  }, []);

  const fetchReviewers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReviewers();
      setReviewers(normalizeReviewers(data || []));
    } catch (err) {
      console.error('Failed to fetch reviewers:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load reviewers';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      setReviewers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name) errors.first_name = 'First name is required';
    if (!formData.surname) errors.surname = 'Surname is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password && formData.password.length < 8)
      errors.password = 'Password must be at least 8 characters';
    if (!formData.confirm_password)
      errors.confirm_password = 'Please confirm the password';
    if (
      formData.password &&
      formData.confirm_password &&
      formData.password !== formData.confirm_password
    ) {
      errors.confirm_password = 'Passwords do not match';
    }
    return errors;
  };

  const handleCreateReviewer = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setFormError('Please fix the errors below.');
      return;
    }
    try {
      setFormLoading(true);
      setFormError(null);
      const newReviewer = await createReviewer(formData);
      setReviewers((prev) => [...prev, normalizeReviewers([newReviewer])[0]]);
      setFormData(emptyForm);
      setFormErrors({});
      setSuccess('Reviewer account created successfully. A temporary password has been sent to their email.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setFormError(getApiError(err, 'Failed to create reviewer'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveReviewer = async (reviewer) => {
    if (!window.confirm(`Remove ${reviewer.first_name} ${reviewer.surname} as a reviewer?`)) return;
    try {
      setActionLoading(reviewer.id);
      await removeReviewer(reviewer.id);
      setReviewers((prev) => prev.filter((r) => r.id !== reviewer.id));
      setSuccess('Reviewer removed successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to remove reviewer');
    } finally {
      setActionLoading(null);
    }
  };

  const renderField = (name, label, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-textMain mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-md text-sm text-textMain outline-none focus:ring-2 ${
          formErrors[name]
            ? 'border-danger focus:ring-danger'
            : 'border-border focus:ring-accent focus:border-accent'
        }`}
      />
      {formErrors[name] && <p className="text-xs text-danger mt-1">{formErrors[name]}</p>}
    </div>
  );

  const renderSelect = (name, label, options) => (
    <div>
      <label className="block text-sm font-medium text-textMain mb-1">{label}</label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-md text-sm text-textMain bg-white outline-none focus:ring-2 ${
          formErrors[name]
            ? 'border-danger focus:ring-danger'
            : 'border-border focus:ring-accent focus:border-accent'
        }`}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option
            key={typeof opt === 'string' ? opt : opt.value}
            value={typeof opt === 'string' ? opt : opt.value}
          >
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
      {formErrors[name] && <p className="text-xs text-danger mt-1">{formErrors[name]}</p>}
    </div>
  );

  // Columns — Remove button only for sgo_admin
  const reviewerColumns = [
    { key: 'name', label: 'Name', render: (row) => `${row.first_name} ${row.surname}` },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'research_discipline', label: 'Research Discipline' },
    ...(canRemove
      ? [
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
              <Button
                size="sm"
                variant="danger"
                disabled={actionLoading === row.id}
                onClick={() => handleRemoveReviewer(row)}
              >
                {actionLoading === row.id ? 'Removing...' : 'Remove'}
              </Button>
            ),
          },
        ]
      : []),
  ];

  if (loading) return <DashboardLayout role={user?.role}><Loader /></DashboardLayout>;

  return (
    <DashboardLayout role={user?.role}>
      <PageHeader
        title="Reviewers"
        subtitle={canCreate ? 'Create and manage reviewer accounts' : 'View registered reviewers'}
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}


      {/* Create Reviewer Form — only for sgo_admin */}
      {canCreate && (
        <Card title="Create New Reviewer Account" className="mb-6">
          {formError && <Alert variant="danger">{formError}</Alert>}
          <form onSubmit={handleCreateReviewer} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('first_name', 'First Name')}
              {renderField('surname', 'Surname')}
              {renderSelect('gender', 'Gender', genderOptions)}
              {renderField('phone', 'Phone Number', 'tel')}
              {renderSelect('research_discipline', 'Research Discipline', disciplineOptions)}
              {renderField('email', 'Email Address', 'email')}
              {renderField('password', 'Temporary Password', 'password')}
              {renderField('confirm_password', 'Confirm Password', 'password')}
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit" variant="primary" disabled={formLoading}>
                {formLoading ? 'Creating...' : 'Create Reviewer Account'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Reviewers List — visible to both roles */}
      <Card
        title="Registered Reviewers"
        subtitle={`${reviewers.length} reviewer${reviewers.length !== 1 ? 's' : ''}`}
      >
        <Table
          columns={reviewerColumns}
          data={reviewers}
          emptyMessage="No reviewers registered yet."
        />
      </Card>
    </DashboardLayout>
  );
}