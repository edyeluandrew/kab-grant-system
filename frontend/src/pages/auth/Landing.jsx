import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGrantCalls } from '../../api/authApi';
import {
  Megaphone,
  CalendarDays,
  ArrowRight,
  ChevronRight,
  Clock,
} from 'lucide-react';

const announcements = [
  {
    id: 1,
    title: 'KAB-FIR Portal Now Live',
    body: 'The Kabale University Fund for Innovation and Research portal is now open for proposal submissions. All eligible staff are encouraged to apply.',
    date: '2026-05-01',
    type: 'info',
  },
  {
    id: 2,
    title: 'Submission Deadline Reminder',
    body: 'The deadline for Innovation Grant 2026 proposals is 31 December 2026. Ensure all required documents are uploaded before submission.',
    date: '2026-05-10',
    type: 'warning',
  },
  {
    id: 3,
    title: 'Research Ethics Training',
    body: 'Mandatory research ethics training scheduled for 15 June 2026. All principal investigators must attend before submitting proposals.',
    date: '2026-05-12',
    type: 'info',
  },
];

export default function Landing() {
  const { isAuthenticated, user, redirectPathForRole, loading: authLoading } = useAuth();
  const [grantCalls, setGrantCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(true);

  useEffect(() => {
    getGrantCalls()
      .then((data) => setGrantCalls(data.filter((c) => c.is_active)))
      .catch(() => setGrantCalls([]))
      .finally(() => setLoadingCalls(false));
  }, []);

  const daysLeft = (deadline) => {
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} days left` : 'Deadline passed';
  };

  // Determine nav buttons — wait for auth to resolve first to prevent flicker
  const renderNavButtons = () => {
    if (authLoading) return null;

    if (isAuthenticated && user) {
      return (
        <Link
          to={redirectPathForRole(user.role)}
          className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      );
    }

    return (
      <>
        <Link
          to="/login"
          className="text-sm font-medium text-textMain hover:text-primary transition px-4 py-2 rounded-lg border border-border hover:border-primary"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          Create Account
        </Link>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background text-textMain font-sans">

      {/* Top Nav */}
      <header className="bg-surface border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/log1.jpg" alt="KAB-FIR Logo" className="h-12 w-auto rounded-lg" />
            <div>
              <span className="text-primary font-bold text-lg tracking-tight">KAB-FIR</span>
              <span className="block text-xs text-muted">Fund for Innovation & Research</span>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            {renderNavButtons()}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-secondary text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Kabale University <br />
            <span className="text-accent">Fund for Innovation</span> & Research
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Supporting research excellence and innovation at Kabale University. Submit your
            proposals, track progress, and receive funding all in one place.
          </p>

          {/* Hero CTA — only show when auth resolved AND not logged in */}
          {!authLoading && !isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition text-base whitespace-nowrap"
              >
                Create Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition text-base whitespace-nowrap"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main content: Grant Calls + Announcements */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Active Grant Calls */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-textMain">Active Grant Calls</h2>
          </div>

          {loadingCalls ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-surface rounded-xl animate-pulse" />
              ))}
            </div>
          ) : grantCalls.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center text-muted">
              No active grant calls at the moment. Check back soon.
            </div>
          ) : (
            <div className="space-y-4">
              {grantCalls.map((call) => {
                const now = new Date();
                const appOpen = call.application_window_open ? new Date(call.application_window_open) : null;
                const appClose = call.application_window_close ? new Date(call.application_window_close) : null;
                const isWindowOpen = appOpen && appClose && now >= appOpen && now <= appClose;
                const windowStatus = !appOpen ? 'unknown' : now < appOpen ? 'pending' : now > appClose ? 'closed' : 'open';
                
                return (
                  <div
                    key={call.id}
                    className="bg-surface border border-border rounded-xl p-6 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-textMain text-lg">{call.title}</h3>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              isWindowOpen
                                ? 'bg-success/20 text-success'
                                : windowStatus === 'closed'
                                ? 'bg-danger/20 text-danger'
                                : 'bg-warning/20 text-warning'
                            }`}
                          >
                            {isWindowOpen ? '✓ Open for Applications' : windowStatus === 'closed' ? 'Closed' : 'Coming Soon'}
                          </span>
                        </div>
                        <p className="text-muted text-sm leading-relaxed mb-4">{call.description}</p>
                        
                        {/* Key Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4 py-3 border-t border-b border-border/40">
                          <div>
                            <p className="text-xs text-muted mb-1">Submission Deadline</p>
                            <p className="text-sm font-semibold text-textMain">{call.deadline}</p>
                            <p className="text-xs text-warning mt-0.5">{daysLeft(call.deadline)} days left</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted mb-1">Application Window</p>
                            <p className="text-xs text-textMain font-mono">
                              {call.application_window_open} to {call.application_window_close}
                            </p>
                          </div>
                        </div>

                        {/* Eligibility Preview */}
                        {call.eligibility_requirements && call.eligibility_requirements.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-textMain mb-2">Key Requirements:</p>
                            <ul className="space-y-1">
                              {call.eligibility_requirements.slice(0, 2).map((req, idx) => (
                                <li key={idx} className="text-xs text-muted flex items-start gap-2">
                                  <span className="text-success mt-0.5">✓</span>
                                  {req}
                                </li>
                              ))}
                              {call.eligibility_requirements.length > 2 && (
                                <li className="text-xs text-muted italic pt-1">
                                  +{call.eligibility_requirements.length - 2} more requirements
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block bg-success/10 text-success text-xs font-semibold px-3 py-1 rounded-full mb-3">
                          {daysLeft(call.deadline)} days
                        </span>
                        {!authLoading && !isAuthenticated && (
                          <div>
                            <Link
                              to="/register"
                              className="flex items-center gap-1 text-primary text-xs font-medium hover:underline"
                            >
                              Apply Now <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Announcements */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Megaphone className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-textMain">Announcements</h2>
          </div>
          <div className="space-y-4">
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`bg-surface border rounded-xl p-4 ${
                  a.type === 'warning' ? 'border-warning/40' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {a.type === 'warning' ? (
                    <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                  <p className="font-semibold text-sm text-textMain">{a.title}</p>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-2">{a.body}</p>
                <p className="text-xs text-muted/60">{a.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface mt-8 py-6 px-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} Kabale University Directorate of Research & Publications. All rights reserved.
      </footer>
    </div>
  );
}