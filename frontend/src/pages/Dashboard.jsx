import { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Wifi, WifiOff, Bell, Plus, X, Loader2, Key } from 'lucide-react';
import { useDeviceStore } from '../store/device.store';
import { useAlertStore } from '../store/alert.store';

import DeviceCard from '../components/Device/DeviceCard';
import AlertFeed from '../components/Alert/AlertFeed';
import LiveMap from '../components/Map/LiveMap';
import api from '../services/api';
import { getSocket } from '../services/socket';


const StatCard = ({ label, value, icon: Icon, color = 'brand' }) => {
  const colors = {
    brand: 'bg-brand-500/10 text-brand-400',
    success: 'bg-emerald-500/10 text-emerald-400',
    danger: 'bg-red-500/10 text-red-400',
    warning: 'bg-amber-500/10 text-amber-400',
  };
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-5 hover:border-surface-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <div className="">
          <Icon size={16} />
        </div>
      </div>
      <p className="text-3xl font-display font-semibold text-white">{value}</p>
    </div>
  );
};

export default function Dashboard() {
  const { devices, selectedDevice, setSelectedDevice, addDevice, removeDevice } = useDeviceStore();
  const { unreadCount } = useAlertStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', model: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newDeviceKey, setNewDeviceKey] = useState('');

  const online = devices.filter((d) => d.status === 'online').length;
  const offline = devices.length - online;

  const handleSubscribe = (device) => {
    setSelectedDevice(device);
    const s = getSocket();
    if (s) s.emit('subscribe:device', device._id);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/devices', form);
      addDevice(res.data.data);
      setNewDeviceKey(res.data.data.deviceKey);
      setForm({ name: '', model: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create device');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/devices/${id}`); removeDevice(id); } catch {}
  };

  const stats = [
    { label: 'Total Devices', value: devices.length, icon: Monitor, color: 'brand' },
    { label: 'Online', value: online, icon: Wifi, color: 'success' },
    { label: 'Offline', value: offline, icon: WifiOff, color: 'danger' },
    { label: 'Alerts', value: unreadCount, icon: Bell, color: 'warning' },
  ];

  return (
    <div className="h-full flex flex-col p-6 gap-6 overflow-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-0">
        {/* Map */}
        <div className="xl:col-span-2 bg-surface-900 border border-surface-700 rounded-xl overflow-hidden" style={{ minHeight: 420 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-white">Live Map</span>
            </div>
            <span className="text-xs text-slate-500">{online} device{online !== 1 ? 's' : ''} active</span>
          </div>
          <div style={{ height: 'calc(100% - 49px)' }}>
            <LiveMap selectedDevice={selectedDevice} />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Devices */}
          <div className="bg-surface-900 border border-surface-700 rounded-xl flex flex-col" style={{ maxHeight: 320 }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700 flex-shrink-0">
              <span className="text-sm font-medium text-white">Devices</span>
              <button onClick={() => { setShowAddModal(true); setNewDeviceKey(''); }}
                className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors">
                <Plus size={13} /> Add
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {devices.length === 0 && (
                <div className="text-center py-6 text-slate-600 text-sm">No devices yet. Add your first device.</div>
              )}
              {devices.map((d) => (
                <DeviceCard key={d._id} device={d} selected={selectedDevice?._id === d._id}
                  onSelect={handleSubscribe} onDelete={handleDelete} />
              ))}
            </div>
          </div>

          {/* Alert feed */}
          <div className="flex-1 bg-surface-900 border border-surface-700 rounded-xl p-4 overflow-hidden flex flex-col min-h-0">
            <AlertFeed />
          </div>
        </div>
      </div>

      {/* Add device modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-white">Add Device</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-300 transition-colors"><X size={18} /></button>
            </div>

            {newDeviceKey ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <Key size={22} className="text-emerald-400" />
                </div>
                <p className="text-white font-medium mb-2">Device created!</p>
                <p className="text-slate-400 text-sm mb-4">Save this device key — it won't be shown again.</p>
                <div className="bg-surface-800 border border-surface-600 rounded-lg p-3 font-mono text-sm text-brand-400 break-all mb-4">
                  {newDeviceKey}
                </div>
                <button onClick={() => setShowAddModal(false)}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleAdd} className="space-y-4">
                {error && <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>}
                {[
                  { key: 'name', label: 'Device Name *', placeholder: 'My Phone', required: true },
                  { key: 'model', label: 'Model', placeholder: 'iPhone 15', required: false },
                  { key: 'description', label: 'Description', placeholder: 'Optional notes', required: false },
                ].map(({ key, label, placeholder, required }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                    <input value={form[key]} required={required} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all" />
                  </div>
                ))}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 bg-surface-700 hover:bg-surface-600 text-slate-300 text-sm font-medium rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : 'Create Device'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
