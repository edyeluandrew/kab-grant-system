import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/authApi';
import { getFaculties, getDepartments } from '../../api/referenceApi';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const GENDER_OPTIONS = ['Male', 'Female'];

const selectStyle = `
  select.kab-select {
    appearance: none;
    background-color: #EEF6FC;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%230078B8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.85rem center;
    background-size: 1rem;
    padding-right: 2.5rem;
    border: 2px solid #B8D8EE;
    color: #1a3a52;
    transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
  }
  select.kab-select:hover {
    border-color: #0078B8;
    background-color: #E0F0FA;
  }
  select.kab-select:focus {
    border-color: #0078B8;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(0, 120, 184, 0.15);
    outline: none;
  }
  select.kab-select:disabled {
    background-color: #F1F5F9;
    color: #94A3B8;
    border-color: #D9E2E7;
    cursor: not-allowed;
    opacity: 0.7;
  }
  select.kab-select option {
    background-color: #ffffff;
    color: #1a3a52;
    padding: 8px 12px;
  }
  select.kab-select option:checked {
    background-color: #0078B8 !important;
    color: #ffffff !important;
  }
  select.kab-select option:hover {
    background-color: #EEF6FC !important;
  }
`;

export default function Register() {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    first_name: '',
    surname: '',
    other_name: '',
    gender: '',
    phone: '',
    email: '',
    faculty_id: '',
    department_id: '',
    password: '',
    confirm_password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    getFaculties().then(setFaculties).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.faculty_id) {
      getDepartments(form.faculty_id)
        .then(setDepartments)
        .catch(() => setDepartments([]));
      setForm((prev) => ({ ...prev, department_id: '' }));
    } else {
      setDepartments([]);
    }
  }, [form.faculty_id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.first_name || !form.surname || !form.gender || !form.phone || !form.email) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!form.faculty_id || !form.department_id) {
      setError('Please select a faculty and department.');
      return;
    }
    if (!form.password || !form.confirm_password) {
      setError('Please set and confirm your password.');
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await registerUser(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(', '));
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 border border-border rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition';

  const selectClass =
    'kab-select w-full px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer';

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#F4F4F4' }}>
        <style>{selectStyle}</style>
        <div className="text-center max-w-sm">
          {!imageError ? (
            <img
              src="/log1.jpg"
              alt="KAB-FIR Logo"
              className="h-20 w-20 rounded-xl mx-auto mb-6"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="h-20 w-20 rounded-xl mx-auto mb-6 bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
              K
            </div>
          )}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#D4F4DD' }}
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: '#16A34A' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#4B5563' }}>Registration Successful!</h2>
          <p className="text-sm" style={{ color: '#7A8793' }}>
            Your account has been created. Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ backgroundColor: '#F4F4F4' }}>
      <style>{selectStyle}</style>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            {!imageError ? (
              <img
                src="/log1.jpg"
                alt="KAB-FIR Logo"
                className="h-16 w-16 rounded-lg"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                K
              </div>
            )}
            <div>
              <Link to="/" className="inline-block font-extrabold text-2xl tracking-tight" style={{ color: '#0078B8' }}>
                KAB-FIR
              </Link>
              <p className="text-xs mt-1" style={{ color: '#7A8793' }}>Fund for Innovation & Research</p>
            </div>
          </div>
          <h2 className="text-xl font-bold mt-4" style={{ color: '#4B5563' }}>Create your account</h2>
          <p className="text-sm mt-1" style={{ color: '#7A8793' }}>
            Register using your Kabale University email address
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="mb-5 flex items-center gap-2 text-sm rounded-lg px-4 py-3"
            style={{ backgroundColor: '#FFE8E8', border: '1px solid #FF8080', color: '#FF2B2B' }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9E2E7' }}>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Personal Information */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-4 pb-2 border-b border-border" style={{ color: '#4B5563' }}>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#4B5563' }}>
                    First Name <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="e.g. John"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#4B5563' }}>
                    Surname <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="surname"
                    value={form.surname}
                    onChange={handleChange}
                    placeholder="e.g. Mugisha"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#4B5563' }}>Other Name</label>
                  <input
                    type="text"
                    name="other_name"
                    value={form.other_name}
                    onChange={handleChange}
                    placeholder="Optional"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#4B5563' }}>
                    Gender <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <select name="gender" value={form.gender} onChange={handleChange} className={selectClass}>
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#4B5563' }}>
                    Phone Number <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+256700000000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#4B5563' }}>
                    Email Address <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@kab.ac.ug"
                    autoComplete="email"
                    className={inputClass}
                  />
                  <p className="text-xs mt-1" style={{ color: '#7A8793' }}>Must be a @kab.ac.ug email address</p>
                </div>
              </div>
            </div>

            {/* Academic Details */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-4 pb-2 border-b border-border" style={{ color: '#4B5563' }}>
                Academic Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#4B5563' }}>
                    Faculty <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <select name="faculty_id" value={form.faculty_id} onChange={handleChange} className={selectClass}>
                    <option value="">Select faculty</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#4B5563' }}>
                    Department <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <select
                    name="department_id"
                    value={form.department_id}
                    onChange={handleChange}
                    disabled={!form.faculty_id}
                    className={selectClass}
                  >
                    <option value="">{form.faculty_id ? 'Select department' : 'Select faculty first'}</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-4 pb-2 border-b border-border" style={{ color: '#4B5563' }}>
                Set Password
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#4B5563' }}>
                    Password <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      className={inputClass + ' pr-11'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                      style={{ color: '#7A8793' }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#4B5563' }}>
                    Confirm Password <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="confirm_password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      className={inputClass + ' pr-11'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                      style={{ color: '#7A8793' }}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#0078B8' }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: '#7A8793' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium hover:underline" style={{ color: '#0078B8' }}>Sign in</Link>
        </p>
        <p className="text-center text-sm mt-2" style={{ color: '#7A8793' }}>
          <Link to="/" className="hover:underline" style={{ color: '#0078B8' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}