import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.surname?.[0] || ''}`.toUpperCase()
    : '?';

  return (
    <nav className="bg-surface border-b border-border shadow-sm flex-shrink-0">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu for Mobile */}
            <button
              onClick={onMenuClick}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-muted hover:bg-gray-100 hover:text-primary transition"
              title="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <img src="/log1.jpg" alt="KAB-FIR Logo" className="h-12 w-auto rounded-lg" />
            <div>
              <h1 className="text-sm font-bold text-primary leading-tight">
                KAB-FIR
              </h1>
              <p className="text-xs text-muted">Fund for Innovation & Research</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-textMain leading-none">
                      {user.first_name} {user.surname}
                    </p>
                    <p className="text-xs text-muted capitalize mt-0.5">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="flex items-center gap-1.5 text-sm text-muted hover:text-danger transition px-3 py-2 rounded-lg hover:bg-danger/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}