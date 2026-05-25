import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../api/authApi';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [form, setForm] = useState({
    email: email,
    otp_code: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.otp_code || !form.new_password || !form.confirm_password) {
      setError('Please fill in all fields.');
      return;
    }

    if (form.otp_code.length !== 6 || isNaN(form.otp_code)) {
      setError('OTP must be 6 digits.');
      return;
    }

    if (form.new_password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (form.new_password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4F4F4' }}>
        <div className="border-b shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="max-w-md mx-auto px-6 py-6 flex items-center gap-3">
            <img src="/log1.jpg" alt="KAB-FIR Logo" className="h-14 w-14 rounded-lg" />
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#0078B8' }}>KAB-FIR</h1>
              <p className="text-xs" style={{ color: '#7A8793' }}>Fund for Innovation & Research</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#D4F4DD' }}>
              <CheckCircle2 className="w-8 h-8" style={{ color: '#16A34A' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#4B5563' }}>Password reset successful!</h2>
            <p className="text-sm mb-6" style={{ color: '#7A8793' }}>Your password has been updated. Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4F4F4' }}>
      {/* Header with Logo */}
      <div className="border-b shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-md mx-auto px-6 py-6 flex items-center gap-3">
          <img src="/log1.jpg" alt="KAB-FIR Logo" className="h-14 w-14 rounded-lg" />
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#0078B8' }}>KAB-FIR</h1>
            <p className="text-xs" style={{ color: '#7A8793' }}>Fund for Innovation & Research</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ backgroundColor: '#F4F4F4' }}>
        <div className="w-full max-w-md">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1 text-sm font-medium mb-6 hover:underline"
            style={{ color: '#0078B8' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold" style={{ color: '#4B5563' }}>Enter reset code</h2>
            <p className="text-sm mt-2" style={{ color: '#7A8793' }}>
              We sent a 6-digit code to <span className="font-semibold" style={{ color: '#4B5563' }}>{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm rounded-lg px-4 py-3" style={{ backgroundColor: '#FFE8E8', border: '1px solid #FF8080', color: '#FF2B2B' }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-textMain mb-1.5">
                Reset Code (6 digits)
              </label>
              <input
                type="text"
                name="otp_code"
                value={form.otp_code}
                onChange={handleChange}
                placeholder="000000"
                maxLength="6"
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-center font-mono text-lg tracking-widest"
              />
              <p className="text-xs text-muted mt-1">Enter the code from your email</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="new_password"
                  value={form.new_password}
                  onChange={handleChange}
                  placeholder="Enter new password (min 8 chars)"
                  className="w-full px-4 py-2.5 pr-11 border border-border rounded-lg bg-surface text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
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
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 pr-11 border border-border rounded-lg bg-surface text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {loading ? 'Resetting password...' : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-xs text-muted mt-6">
            <Link to="/login" className="text-primary font-medium hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
