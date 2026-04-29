import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, ChevronDown } from 'lucide-react';
import { useDeviceStore } from '../store/device.store';
import ReplayMap from '../components/Map/ReplayMap';
import api from '../services/api';

export default function HistoryPage() {
  const { devices } = useDeviceStore();
  const [selectedId, setSelectedId] = useState('');
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString().slice(0, 16);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 16));

  const fetchReplay = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await api.get(`/locations/${selectedId}/replay`, { params: { from, to } });
      setPoints(res.data.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (devices.length > 0 && !selectedId) setSelectedId(devices[0]._id);
  }, [devices]);

  return (
    <div className="h-full flex flex-col p-6 gap-6 overflow-hidden">
      {/* Controls */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end gap-4 bg-surface-900 border border-surface-700 rounded-xl px-5 py-4 flex-shrink-0">
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Device</label>
          <div className="relative">
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 transition-all appearance-none pr-10">
              {devices.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">From</label>
          <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)}
            className="px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">To</label>
          <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)}
            className="px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 transition-all" />
        </div>
        <button onClick={fetchReplay} disabled={!selectedId || loading}
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
          <Calendar size={14} />
          {loading ? 'Loading...' : 'Load Replay'}
        </button>
      </motion.div>

      {/* Replay map */}
      <div className="flex-1 min-h-0">
        {points.length > 0 ? (
          <ReplayMap points={points} />
        ) : (
          <div className="h-full bg-surface-900 border border-surface-700 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <Calendar size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Select a device and date range, then click Load Replay</p>
              {loading && <p className="text-brand-400 text-sm mt-2">Fetching location data...</p>}
            </div>
          </div>
        )}
      </div>

      {points.length > 0 && (
        <div className="flex-shrink-0 text-xs text-slate-500">
          {points.length} location points loaded
        </div>
      )}
    </div>
  );
}
