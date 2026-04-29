import { motion, AnimatePresence } from 'framer-motion';
import { Shield, WifiOff, Wifi, X } from 'lucide-react';
import { useAlertStore } from '../../store/alert.store';
import api from '../../services/api';

const icons = {
  enter: Shield,
  exit: Shield,
  offline: WifiOff,
  online: Wifi,
};

const colors = {
  enter: 'text-amber-400 bg-amber-500/10',
  exit: 'text-purple-400 bg-purple-500/10',
  offline: 'text-red-400 bg-red-500/10',
  online: 'text-emerald-400 bg-emerald-500/10',
};

export default function AlertFeed() {
  const { alerts, markRead, markAllRead } = useAlertStore();

  const handleRead = async (id) => {
    markRead(id);
    try { await api.patch(`/alerts/${id}/read`); } catch {}
  };

  const handleReadAll = async () => {
    markAllRead();
    try { await api.patch('/alerts/mark-all-read'); } catch {}
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Activity Feed</h3>
        {alerts.some((a) => !a.read) && (
          <button onClick={handleReadAll} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <AnimatePresence initial={false}>
          {alerts.length === 0 && (
            <div className="text-center py-8 text-slate-600 text-sm">No recent activity</div>
          )}
          {alerts.map((alert) => {
            const Icon = icons[alert.type] || Shield;
            const colorClass = colors[alert.type] || colors.enter;
            return (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all
                  ${!alert.read ? 'bg-surface-700 border-surface-600' : 'bg-surface-800 border-surface-700 opacity-60'}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                {!alert.read && (
                  <button onClick={() => handleRead(alert._id)}
                    className="flex-shrink-0 text-slate-600 hover:text-slate-400 transition-colors">
                    <X size={12} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
