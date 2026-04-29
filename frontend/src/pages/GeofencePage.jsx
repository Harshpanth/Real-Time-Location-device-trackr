import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Trash2, MapPin, X, Loader2, Target } from 'lucide-react';
import { MapContainer, TileLayer, Circle, useMapEvents } from 'react-leaflet';
import api from '../services/api';
import { useDeviceStore } from '../store/device.store';

function ClickMarker({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng) });
  return null;
}

export default function GeofencePage() {
  const { devices } = useDeviceStore();
  const [fences, setFences] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', radius: 500, devices: [], color: '#8b5cf6', center: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFences = async () => {
    try { const r = await api.get('/geofences'); setFences(r.data.data); } catch {}
  };

  useEffect(() => { fetchFences(); }, []);

  const handleDelete = async (id) => {
    try { await api.delete(`/geofences/${id}`); setFences(f => f.filter(x => x._id !== id)); } catch {}
  };

  const toggleActive = async (fence) => {
    try {
      const r = await api.put(`/geofences/${fence._id}`, { active: !fence.active });
      setFences(f => f.map(x => x._id === fence._id ? r.data.data : x));
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.center) { setError('Click on the map to set center'); return; }
    setLoading(true); setError('');
    try {
      const r = await api.post('/geofences', form);
      setFences(f => [...f, r.data.data]);
      setShowModal(false);
      setForm({ name: '', radius: 500, devices: [], color: '#8b5cf6', center: null });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="h-full flex gap-0 overflow-hidden">
      {/* Left panel */}
      <div className="w-80 flex-shrink-0 bg-surface-900 border-r border-surface-700 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-surface-700 flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-white text-sm">Geofences</h2>
            <p className="text-xs text-slate-500 mt-0.5">{fences.length} zones defined</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium rounded-lg transition-colors">
            <Plus size={13} /> New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <AnimatePresence>
            {fences.map((fence) => (
              <motion.div key={fence._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-surface-800 border border-surface-700 rounded-xl p-4 hover:border-surface-600 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: (fence.color || '#8b5cf6') + '22', border: `1px solid ${fence.color || '#8b5cf6'}44` }}>
                      <Target size={13} style={{ color: fence.color || '#8b5cf6' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{fence.name}</p>
                      <p className="text-xs text-slate-500">{fence.radius}m radius</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => toggleActive(fence)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer
                        ${fence.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-500'}`}>
                      {fence.active ? 'Active' : 'Paused'}
                    </button>
                    <button onClick={() => handleDelete(fence._id)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-danger transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {fence.devices?.length > 0 && (
                  <p className="text-xs text-slate-600 mt-2">{fence.devices.length} device{fence.devices.length !== 1 ? 's' : ''} monitored</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {fences.length === 0 && (
            <div className="text-center py-10">
              <Shield size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">No geofences yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%', background: '#050812' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" maxZoom={19} />
          {fences.filter(f => f.center).map((fence) => (
            <Circle key={fence._id}
              center={[fence.center.lat, fence.center.lng]}
              radius={fence.radius}
              pathOptions={{ color: fence.color || '#8b5cf6', fillColor: fence.color || '#8b5cf6', fillOpacity: fence.active ? 0.1 : 0.03, weight: fence.active ? 1.5 : 0.5, dashArray: '6 4' }}
            />
          ))}
          {showModal && form.center && (
            <Circle center={[form.center.lat, form.center.lng]} radius={form.radius}
              pathOptions={{ color: form.color, fillColor: form.color, fillOpacity: 0.12, weight: 1.5, dashArray: '6 4' }} />
          )}
          {showModal && <ClickMarker onPick={(ll) => setForm(f => ({ ...f, center: { lat: ll.lat, lng: ll.lng } }))} />}
        </MapContainer>

        {showModal && (
          <div className="absolute top-4 right-4 z-[1000] w-72 bg-surface-900/95 backdrop-blur border border-surface-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white text-sm">Create Geofence</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300 transition-colors"><X size={16} /></button>
            </div>
            {!form.center && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-brand-500/10 border border-brand-500/20 mb-4">
                <MapPin size={13} className="text-brand-400 flex-shrink-0" />
                <p className="text-xs text-brand-300">Click on the map to place the center</p>
              </div>
            )}
            {form.center && (
              <p className="text-xs text-emerald-400 mb-3 font-mono">
                Center: {form.center.lat.toFixed(4)}, {form.center.lng.toFixed(4)}
              </p>
            )}
            {error && <div className="mb-3 text-xs text-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
                <input value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Home, Office, School..."
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Radius: {form.radius}m</label>
                <input type="range" min={100} max={10000} step={100} value={form.radius}
                  onChange={(e) => setForm({ ...form, radius: +e.target.value })}
                  className="w-full" style={{ accentColor: '#22d3ee' }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Color</label>
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-9 w-full rounded-lg border border-surface-600 bg-surface-800 cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Monitor Devices</label>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {devices.map((d) => (
                    <label key={d._id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.devices.includes(d._id)}
                        onChange={(e) => setForm(f => ({
                          ...f,
                          devices: e.target.checked ? [...f.devices, d._id] : f.devices.filter(x => x !== d._id)
                        }))}
                        className="rounded" style={{ accentColor: '#22d3ee' }} />
                      <span className="text-xs text-slate-300">{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading || !form.center}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={13} className="animate-spin" />Creating...</> : 'Create Geofence'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
