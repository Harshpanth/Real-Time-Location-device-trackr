import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, MapPin, History, Shield, LogOut, Radio, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useAlertStore } from '../../store/alert.store';
import { useSocket } from '../../hooks/useSocket';
import { useDevices } from '../../hooks/useDevices';
import api from '../../services/api';
import { useEffect } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tracking', icon: MapPin, label: 'Live Tracking' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/geofences', icon: Shield, label: 'Geofences' },
];

export default function Layout() {
  const { user, clearAuth } = useAuthStore();
  const { setAlerts, setUnreadCount, unreadCount } = useAlertStore();
  const navigate = useNavigate();
  useSocket();
  useDevices();

  useEffect(() => {
    api.get('/alerts').then((r) => setAlerts(r.data.data)).catch(() => {});
    api.get('/alerts/unread-count').then((r) => setUnreadCount(r.data.data)).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      <aside className="w-16 lg:w-56 flex flex-col bg-surface-900 border-r border-surface-700 flex-shrink-0 transition-all duration-300">
        <div className="h-16 flex items-center px-4 border-b border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
              <Radio size={16} className="text-white" />
            </div>
            <span className="hidden lg:block font-display font-bold text-lg text-white tracking-tight">Trackr</span>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ' +
                (isActive
                  ? 'bg-brand-500/15 text-brand-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-700')
              }>
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-brand-400' : ''} />
                  <span className="hidden lg:block text-sm font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-700">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-accent-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-accent-400">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
            <button onClick={handleLogout}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-surface-700 text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-surface-700 bg-surface-900 flex-shrink-0">
          <div>
            <h1 className="font-display text-base font-semibold text-white">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-xs text-slate-500">Real-time device monitoring</p>
          </div>
          <div className="relative w-9 h-9 rounded-lg bg-surface-700 flex items-center justify-center">
            <Bell size={16} className="text-slate-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
