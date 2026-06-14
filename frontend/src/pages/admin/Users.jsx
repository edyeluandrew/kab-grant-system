import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';
import { getUsers, activateUser, deactivateUser } from '../../api/adminApi';

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load users';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.is_active ? deactivateUser : activateUser;
    const label = user.is_active ? 'deactivated' : 'activated';

    try {
      setActionLoading(user.id);
      await action(user.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_active: !u.is_active } : u
        )
      );
      setSuccessMessage(`User ${user.first_name} ${user.surname} ${label} successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Full Name',
      render: (row) => `${row.first_name} ${row.surname}`,
    },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'faculty', label: 'Faculty' },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.is_active ? 'success' : 'danger'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button
          size="sm"
          variant={row.is_active ? 'danger' : 'success'}
          disabled={actionLoading === row.id}
          onClick={() => handleToggleStatus(row)}
        >
          {actionLoading === row.id
            ? 'Processing...'
            : row.is_active
            ? 'Deactivate'
            : 'Activate'}
        </Button>
      ),
    },
  ];

  if (loading) return <DashboardLayout role={user?.role}><Loader /></DashboardLayout>;

  return (
    <DashboardLayout role={user?.role}>
      <PageHeader
        title="System Users"
        subtitle={`${users.length} registered staff / student accounts`}
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Card>
        <Table
          columns={columns}
          data={users}
          emptyMessage="No registered users found."
        />
      </Card>
    </DashboardLayout>
  );
}