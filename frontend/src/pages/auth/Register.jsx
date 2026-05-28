import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/authApi';
import { getFaculties, getDepartments } from '../../api/referenceApi';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const GENDER_OPTIONS = ['Male', 'Female'];

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

  useEffect(() => {
    getFaculties().then(setFaculties).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.faculty_id) {
      getDepartments(form.faculty_id)
        .then(setDepartments)
        .catch(() => setDepartments([]));
      setForm((prev) => ({ ...prev, department_id: '' }));
    }
  }, [form.faculty_id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.first_name || !form.surname || !form.email || !form.password || !form.confirm_password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerUser(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#F4F4F4' }}>
        <div className="text-center max-w-sm">
          <img src="/log1.jpg" alt="KAB-FIR Logo" className="h-20 w-20 rounded-xl mx-auto mb-6" />
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#D4F4DD' }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: '#16A34A' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#4B5563' }}>Registration Successful!</h2>
          <p className="text-sm" style={{ color: '#7A8793' }}>Your account has been created. Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ backgroundColor: '#F4F4F4' }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/log1.jpg" alt="KAB-FIR Logo" className="h-16 w-16 rounded-lg" />
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

        {error && (
          <div className="mb-5 flex items-center gap-2 text-sm rounded-lg px-4 py-3" style={{ backgroundColor: '#FFE8E8', border: '1px solid #FF8080', color: '#FF2B2B' }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9E2E7' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-semibold text-textMain uppercase tracking-wide mb-4 pb-2 border-b border-border">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="e.g. John"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    Surname <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="surname"
                    value={form.surname}
                    onChange={handleChange}
                    placeholder="e.g. Mugisha"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    Other Name
                  </label>
                  <input
                    type="text"
                    name="other_name"
                    value={form.other_name}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    Gender <span className="text-danger">*</span>
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+256700000000"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@kab.ac.ug"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                  <p className="text-xs text-muted mt-1">Must be a @kab.ac.ug email address</p>
                </div>
              </div>
            </div>

            {/* Faculty & Department */}
            <div>
              <h3 className="text-sm font-semibold text-textMain uppercase tracking-wide mb-4 pb-2 border-b border-border">
                Academic Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    Faculty <span className="text-danger">*</span>
                  </label>
                  <select
                    name="faculty_id"
                    value={form.faculty_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  >
                    <option value="">Select faculty</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    Department <span className="text-danger">*</span>
                  </label>
                  <select
                    name="department_id"
                    value={form.department_id}
                    onChange={handleChange}
                    disabled={!form.faculty_id}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-50"
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <h3 className="text-sm font-semibold text-textMain uppercase tracking-wide mb-4 pb-2 border-b border-border">
                Set Password
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className="w-full px-4 py-2.5 pr-11 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-textMain transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="confirm_password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className="w-full px-4 py-2.5 pr-11 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-textMain transition"
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
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
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

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-center text-sm text-muted mt-2">
          <Link to="/" className="hover:underline">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}