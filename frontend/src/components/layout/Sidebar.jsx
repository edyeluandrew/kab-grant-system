import { NavLink } from 'react-router-dom';
import { ROLES } from '../../constants/roles';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Plus,
  Bell,
  Users,
  CheckCircle2,
  ClipboardList,
  CalendarDays,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Trophy,
  Clock,
  LogOut,
  User,
} from 'lucide-react';

export default function Sidebar({ role = 'staff' }) {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    switch (role) {
      case ROLES.STAFF:
      case ROLES.APPLICANT:
        return [
          { label: 'Dashboard', href: '/applicant/dashboard', icon: LayoutDashboard },
          { label: 'My Proposals', href: '/applicant/proposals', end: true, icon: FileText },
          { label: 'Submit New Proposal', href: '/applicant/proposals/new', icon: Plus },
          { label: 'Notifications', href: '/applicant/notifications', icon: Bell },
        ];

      case ROLES.REVIEWER:
        return [
          { label: 'Dashboard', href: '/reviewer/dashboard', icon: LayoutDashboard },
          { label: 'Assigned Proposals', href: '/reviewer/proposals', end: true, icon: FileText },
          { label: 'Submitted Reviews', href: '/reviewer/reviews', icon: CheckCircle2 },
          { label: 'Notifications', href: '/reviewer/notifications', icon: Bell },
        ];

      case ROLES.SUPER_ADMIN:
        return [
          { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Grant Calls', href: '/admin/grant-calls', icon: CalendarDays },
          { label: 'Users', href: '/admin/users', icon: Users },
          { label: 'Reviewers', href: '/admin/reviewers', icon: UserCheck },
          { type: 'divider', label: 'PROPOSALS' },
          { label: 'Submitted', href: '/admin/proposals/submitted', icon: ClipboardList },
          { label: 'Scheduled', href: '/admin/proposals/scheduled', icon: Clock },
          { label: 'Reviewed', href: '/admin/proposals/reviewed', icon: CheckCircle2 },
          { label: 'Approved', href: '/admin/proposals/approved', icon: ThumbsUp },
          { label: 'Rejected', href: '/admin/proposals/rejected', icon: ThumbsDown },
          { label: 'Awarded', href: '/admin/proposals/awarded', icon: Trophy },
        ];

      case ROLES.SGO_ADMIN:
        return [
          { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Grant Calls', href: '/admin/grant-calls', icon: CalendarDays },
          { label: 'Users', href: '/admin/users', icon: Users },
          { label: 'Reviewers', href: '/admin/reviewers', icon: UserCheck },
          { type: 'divider', label: 'PROPOSAL MANAGEMENT' },
          { label: 'Submitted', href: '/admin/proposals/submitted', icon: ClipboardList },
          { label: 'Scheduled', href: '/admin/proposals/scheduled', icon: Clock },
          { label: 'Reviewed', href: '/admin/proposals/reviewed', icon: CheckCircle2 },
          { label: 'Approved', href: '/admin/proposals/approved', icon: ThumbsUp },
          { label: 'Rejected', href: '/admin/proposals/rejected', icon: ThumbsDown },
          { label: 'Awarded', href: '/admin/proposals/awarded', icon: Trophy },
        ];

      default:
        return [
          { label: 'Dashboard', href: '/applicant/dashboard', icon: LayoutDashboard },
        ];
    }
  };

  const menuItems = getMenuItems();

  const getRoleDisplayName = () => {
    const roleNames = {
      [ROLES.SUPER_ADMIN]: 'Super Admin',
      [ROLES.SGO_ADMIN]: 'SGO Admin',
      [ROLES.REVIEWER]: 'Reviewer',
      [ROLES.STAFF]: 'Staff',
      [ROLES.APPLICANT]: 'Applicant',
    };
    return roleNames[role] || role.replace(/_/g, ' ');
  };

  return (
    <aside className="w-64 bg-secondary text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <img src="/log1.jpg" alt="KAB-FIR Logo" className="h-14 w-14 rounded-lg" />
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">KAB-FIR</h1>
            <p className="text-xs text-white/70">Kabale University</p>
          </div>
        </div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-accent/80 mb-4">
          {getRoleDisplayName()}
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div key={index} className="pt-4 pb-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30 px-4">
                    {item.label}
                  </p>
                </div>
              );
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                    isActive
                      ? 'bg-accent text-white font-semibold'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile Section at Bottom */}
      <div className="mt-auto p-4 border-t border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user ? `${user.first_name} ${user.surname}` : ''}
            </p>
            <p className="text-xs text-white/70 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-md text-sm bg-white/10 hover:bg-white/20 transition text-white"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}