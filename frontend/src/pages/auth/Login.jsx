import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/authApi';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, redirectPathForRole } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser(form);
      login(data);
      if (data.must_change_password) {
        navigate('/change-password', { replace: true });
      } else {
        navigate(redirectPathForRole(data.role), { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email, password) => {
    setForm({ email, password });
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ backgroundColor: '#F4F4F4' }}>
      {/* Header with Logo */}
      <div className="bg-surface border-b border-border shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-md mx-auto px-6 py-6 flex items-center gap-3">
          {!imageError && (
            <img
              src="/log1.jpg"
              alt="KAB-FIR Logo"
              className="h-14 w-14 rounded-lg"
              onError={() => setImageError(true)}
            />
          )}
          {imageError && (
            <div className="h-14 w-14 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              K
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#0078B8' }}>KAB-FIR</h1>
            <p className="text-xs" style={{ color: '#7A8793' }}>Fund for Innovation & Research</p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ backgroundColor: '#F4F4F4' }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold" style={{ color: '#4B5563' }}>Welcome back</h2>
            <p className="text-sm mt-2" style={{ color: '#7A8793' }}>Sign in to your KAB-FIR account</p>
          </div>

          {/* Demo credentials hint */}
          <div className="mb-6 rounded-lg p-4 space-y-2" style={{ backgroundColor: '#E8F1F8', border: '1px solid #B8D4E8' }}>
            <p className="font-semibold mb-2" style={{ color: '#0078B8', fontSize: '13px' }}>Demo Credentials — click to fill</p>

            <button
              type="button"
              onClick={() => fillCredentials('admin@kab.ac.ug', 'admin1234')}
              className="w-full text-left rounded px-3 py-2 transition hover:opacity-80"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #B8D4E8' }}
            >
              <span style={{ color: '#4B5563', fontSize: '12px', fontWeight: '600' }}>Super Admin</span>
              <span style={{ color: '#7A8793', fontSize: '11px', fontFamily: 'monospace', marginLeft: '8px' }}>
                admin@kab.ac.ug / admin1234
              </span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('sgo.admin@kab.ac.ug', 'sgo1234')}
              className="w-full text-left rounded px-3 py-2 transition hover:opacity-80"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #B8D4E8' }}
            >
              <span style={{ color: '#4B5563', fontSize: '12px', fontWeight: '600' }}>SGO Admin</span>
              <span style={{ color: '#7A8793', fontSize: '11px', fontFamily: 'monospace', marginLeft: '8px' }}>
                sgo.admin@kab.ac.ug / sgo1234
              </span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('j.omondi@kab.ac.ug', 'staff1234')}
              className="w-full text-left rounded px-3 py-2 transition hover:opacity-80"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #B8D4E8' }}
            >
              <span style={{ color: '#4B5563', fontSize: '12px', fontWeight: '600' }}>Staff</span>
              <span style={{ color: '#7A8793', fontSize: '11px', fontFamily: 'monospace', marginLeft: '8px' }}>
                j.omondi@kab.ac.ug / staff1234
              </span>
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: '#FFE8E8', border: '1px solid #FF8080', color: '#FF2B2B' }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#4B5563' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@kab.ac.ug"
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#D9E2E7', color: '#4B5563' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#4B5563' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 pr-11 border rounded-lg text-sm focus:outline-none focus:ring-2 transition"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#D9E2E7', color: '#4B5563' }}
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

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs font-medium hover:underline"
                style={{ color: '#0078B8' }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#0078B8' }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm" style={{ color: '#7A8793' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-medium hover:underline" style={{ color: '#0078B8' }}>
                Register here
              </Link>
            </p>
            <p className="text-sm" style={{ color: '#7A8793' }}>
              <Link to="/" className="hover:underline" style={{ color: '#0078B8' }}>← Back to Home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}