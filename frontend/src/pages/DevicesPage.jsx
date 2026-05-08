import { motion } from 'framer-motion';
import { useDeviceStore } from '../store/device.store';
import { Monitor, Wifi, WifiOff } from 'lucide-react';
import DeviceCard from '../components/Device/DeviceCard';
import api from '../services/api';

export default function DevicesPage() {
  const { devices, removeDevice } = useDeviceStore();

  const online = devices.filter((d) => d.status === 'online').length;
  const offline = devices.length - online;

  const handleDelete = async (id) => {
    try { 
      await api.delete(`/devices/${id}`); 
      removeDevice(id); 
    } catch (err) {
      console.error("Failed to delete device", err);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-auto bg-surface-950">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-white">Device Management</h2>
          <p className="text-sm text-slate-400 mt-1">Monitor and manage all connected tracking devices.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Devices', value: devices.length, icon: Monitor, color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20' },
          { label: 'Online Now', value: online, icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Offline', value: offline, icon: WifiOff, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-4 p-5 rounded-xl border bg-surface-900 border-surface-700`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg} ${stat.border} border`}>
              <stat.icon className={stat.color} size={20} />
            </div>
            <div>
              <p className="text-2xl font-display font-semibold text-white">{stat.value}</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Devices Grid */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest text-slate-400">All Devices</h3>
        
        {devices.length === 0 ? (
          <div className="text-center py-12 bg-surface-900 border border-surface-700 rounded-xl">
            <Monitor className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-white font-medium">No devices found</p>
            <p className="text-sm text-slate-500 mt-1">Go to the Dashboard to add your first device.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {devices.map((device, i) => (
              <motion.div
                key={device._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <DeviceCard 
                  device={device} 
                  onDelete={handleDelete} 
                  // We don't pass onSelect because we just want to view/manage them here
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
