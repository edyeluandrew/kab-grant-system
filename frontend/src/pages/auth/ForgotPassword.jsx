import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../api/authApi';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      // POST /api/v1/auth/forgot-password → { message }
      await forgotPassword({ email });
      setSuccess(true);
      setTimeout(() => navigate('/reset-password', { state: { email } }), 2000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(', '));
      } else {
        setError(err.message || 'Failed to send reset code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col" style={{ backgroundColor: '#F4F4F4' }}>
        <div className="bg-surface border-b border-border shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
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
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#D4F4DD' }}
            >
              <CheckCircle2 className="w-8 h-8" style={{ color: '#16A34A' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#4B5563' }}>Check your email</h2>
            <p className="text-sm mb-6" style={{ color: '#7A8793' }}>
              We've sent a 6-digit code to{' '}
              <span className="font-semibold" style={{ color: '#4B5563' }}>{email}</span>
            </p>
            <p className="text-sm" style={{ color: '#7A8793' }}>Redirecting to next step...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ backgroundColor: '#F4F4F4' }}>
      {/* Header */}
      <div className="bg-surface border-b border-border shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
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
            to="/login"
            className="inline-flex items-center gap-1 text-sm font-medium mb-6 hover:underline"
            style={{ color: '#0078B8' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold" style={{ color: '#4B5563' }}>Reset your password</h2>
            <p className="text-sm mt-2" style={{ color: '#7A8793' }}>
              Enter your email and we'll send you a code to reset your password
            </p>
          </div>

          {error && (
            <div
              className="mb-4 flex items-center gap-2 text-sm rounded-lg px-4 py-3"
              style={{ backgroundColor: '#FFE8E8', border: '1px solid #FF8080', color: '#FF2B2B' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-textMain mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="your@kab.ac.ug"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-surface text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
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
                <Mail className="w-4 h-4" />
              )}
              {loading ? 'Sending code...' : 'Send Reset Code'}
            </button>
          </form>

          <p className="text-center text-xs text-muted mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in instead</Link>
          </p>
        </div>
      </div>
    </div>
  );
}