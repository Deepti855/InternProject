import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiPlusSquare, FiUser, FiShield, FiStar } from 'react-icons/fi';
import { clsx } from 'clsx';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: '/dashboard', icon: FiHome, label: 'Feed' },
    { path: '/showcase', icon: FiStar, label: 'Premium Showcase' },
    { path: '/create', icon: FiPlusSquare, label: 'Create Post' },
    { path: '/profile', icon: FiUser, label: 'Profile' },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ path: '/admin', icon: FiShield, label: 'Admin Dashboard' });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="hidden md:flex flex-col w-64 fixed h-[calc(100vh-4rem)] bg-vibin-card pt-6 border-r border-vibin-border">
      <div className="flex flex-col space-y-1 px-3">
        {navLinks.map((link) => {
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-150',
                active
                  ? 'bg-vibin-primary/10 text-vibin-primary'
                  : 'text-vibin-muted hover:bg-slate-50 hover:text-vibin-text'
              )}
            >
              <link.icon className={clsx('w-5 h-5', active ? 'text-vibin-primary' : 'text-vibin-muted')} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-auto px-4 pb-6">
        <div className="px-3 py-3 flex items-center space-x-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-vibin-primary/10 text-vibin-primary rounded-full flex items-center justify-center font-bold text-lg shrink-0">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-vibin-text text-sm truncate">{user?.username}</p>
            <p className="text-xs text-vibin-muted truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
