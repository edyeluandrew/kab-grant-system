import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOpenGrantCallsForLanding } from '../../api/grantCallsApi';
import { APPLICANT_ROLES } from '../../constants/roles';
import {
  CalendarDays,
  ArrowRight,
  ChevronRight,
  DollarSign,
  Tag,
  SearchX,
  Heart,
} from 'lucide-react';
import GrantCallDocumentsList from '../../components/grantCalls/GrantCallDocumentsList';

const STATUS_CONFIG = {
  Open: { bg: 'bg-success/20', text: 'text-success', label: '✓ Open for Applications' },
  Draft: { bg: 'bg-warning/20', text: 'text-warning', label: 'Coming Soon' },
  Closed: { bg: 'bg-danger/20', text: 'text-danger', label: 'Closed' },
};

function daysLeft(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return 'Deadline passed';
  return `${diff} days left`;
}

export default function Landing() {
  const { isAuthenticated, user, redirectPathForRole, loading: authLoading } = useAuth();
  const [grantCalls, setGrantCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCalls = async () => {
      try {
        const data = await getOpenGrantCallsForLanding();
        if (!cancelled) setGrantCalls(data);
      } catch {
        if (!cancelled) setGrantCalls([]);
      } finally {
        if (!cancelled) setLoadingCalls(false);
      }
    };

    loadCalls();
    return () => { cancelled = true; };
  }, []);

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

  const renderInterestLink = (call) => {
    const interestPath = `/applicant/grant-calls/${call.id}/interest`;

    if (authLoading) return null;

    if (!isAuthenticated) {
      return (
        <Link
          to={`/login?redirect=${encodeURIComponent(interestPath)}`}
          className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          Express Interest <Heart className="w-4 h-4" />
        </Link>
      );
    }

    if (APPLICANT_ROLES.includes(user?.role)) {
      return (
        <Link
          to={interestPath}
          className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          Express Interest <Heart className="w-4 h-4" />
        </Link>
      );
    }

    return (
      <Link
        to={redirectPathForRole(user.role)}
        className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
      >
        Go to Dashboard <ChevronRight className="w-4 h-4" />
      </Link>
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
          <nav className="flex items-center gap-3">{renderNavButtons()}</nav>
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

      {/* Grant Calls */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-8">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-textMain">Active Grant Calls</h2>
        </div>

        {loadingCalls ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-surface rounded-xl animate-pulse" />
            ))}
          </div>
        ) : grantCalls.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl py-16 flex flex-col items-center justify-center text-center gap-3">
            <SearchX className="w-10 h-10 text-muted" />
            <p className="text-textMain font-semibold text-lg">No Active Grant Calls</p>
            <p className="text-muted text-sm max-w-sm">
              There are no open grant calls at the moment. Please check back soon.
            </p>
            {!authLoading && !isAuthenticated && (
              <Link
                to="/register"
                className="mt-2 inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition"
              >
                Create Account <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {grantCalls.map((call) => {
              const statusCfg = STATUS_CONFIG[call.status] || STATUS_CONFIG.Draft;
              const closing = daysLeft(call.closing_date);

              return (
                <div
                  key={call.id}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-primary transition-colors flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-textMain text-lg leading-snug flex-1">{call.title}</h3>
                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Tag className="w-3 h-3" /> {call.grant_type}
                    </span>
                    <span className="text-xs text-muted">AY {call.academic_year}</span>
                  </div>

                  <p className="text-muted text-sm leading-relaxed mb-5 flex-1">{call.description}</p>

                  {/* Info grid */}
                  <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-border/50 mb-5">
                    <div>
                      <p className="text-xs text-muted mb-1">Opens</p>
                      <p className="text-sm font-semibold text-textMain">{call.opening_date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">Closes</p>
                      <p className="text-sm font-semibold text-textMain">{call.closing_date}</p>
                      {closing && <p className="text-xs text-warning mt-0.5">{closing}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">Max Budget</p>
                      <p className="text-sm font-semibold text-textMain flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3" />
                        {call.max_budget ? Number(call.max_budget).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <GrantCallDocumentsList grantCall={call} />

                  <div className="mt-auto pt-2 flex flex-col gap-2">
                    {renderInterestLink(call)}
                    {!authLoading && !isAuthenticated && (
                      <p className="text-xs text-muted">
                        Sign in or create an account to express interest, then apply for a proposal.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface mt-8 py-6 px-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} Kabale University Directorate of Research & Publications. All rights reserved.
      </footer>
    </div>
  );
}