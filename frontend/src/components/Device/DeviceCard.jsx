import { motion } from 'framer-motion';
import { MapPin, Clock, Trash2, Wifi, WifiOff } from 'lucide-react';

export default function DeviceCard({ device, onSelect, onDelete, selected }) {
  const isOnline = device.status === 'online';
  const lastSeen = device.lastSeen
    ? new Date(device.lastSeen).toLocaleTimeString()
    : 'Never';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      onClick={() => onSelect?.(device)}
      className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200
        ${selected
          ? 'bg-brand-500/10 border-brand-500/40'
          : 'bg-surface-800 border-surface-700 hover:border-surface-600 hover:bg-surface-750'}`}
    >
      <div className="flex items-start gap-3">
        {/* Status dot */}
        <div className="mt-1 flex-shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 device-marker-online' : 'bg-slate-600'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm text-white truncate">{device.name}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0
              ${isOnline ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-0.5 font-mono">{device.model || 'Generic Device'}</p>

          <div className="flex items-center gap-3 mt-2">
            {device.lastLocation ? (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <MapPin size={10} className="text-brand-400" />
                {device.lastLocation.lat.toFixed(4)}, {device.lastLocation.lng.toFixed(4)}
              </span>
            ) : (
              <span className="text-xs text-slate-600">No location yet</span>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1.5">
            <Clock size={10} className="text-slate-600" />
            <span className="text-xs text-slate-600">{lastSeen}</span>
          </div>
        </div>

        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(device._id); }}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-danger/15 text-slate-600 hover:text-danger transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
