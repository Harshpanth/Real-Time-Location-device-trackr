import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wifi, WifiOff, Clock, Gauge } from 'lucide-react';
import { useDeviceStore } from '../store/device.store';
import DeviceCard from '../components/Device/DeviceCard';
import LiveMap from '../components/Map/LiveMap';
import { getSocket } from '../services/socket';

export default function TrackingPage() {
  const { devices, selectedDevice, setSelectedDevice } = useDeviceStore();

  const handleSelect = (device) => {
    setSelectedDevice(device);
    const s = getSocket();
    if (s) s.emit('subscribe:device', device._id);
  };

  useEffect(() => {
    const s = getSocket();
    if (s && devices.length > 0 && !selectedDevice) {
      const first = devices[0];
      setSelectedDevice(first);
      s.emit('subscribe:device', first._id);
    }
  }, [devices]);

  const dev = selectedDevice;

  return (
    <div className="h-full flex gap-0 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-surface-900 border-r border-surface-700 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-surface-700">
          <h2 className="font-display font-semibold text-white text-sm">Live Tracking</h2>
          <p className="text-xs text-slate-500 mt-0.5">{devices.length} device{devices.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {devices.map((d) => (
            <DeviceCard key={d._id} device={d} selected={selectedDevice?._id === d._id} onSelect={handleSelect} />
          ))}
          {devices.length === 0 && (
            <div className="text-center py-10 text-slate-600 text-sm">Add devices from the dashboard</div>
          )}
        </div>

        {/* Device details panel */}
        {dev && (
          <div className="border-t border-surface-700 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${dev.status === 'online' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span className="text-sm font-medium text-white truncate">{dev.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Gauge, label: 'Speed', value: `${dev.speed?.toFixed(1) || 0} km/h` },
                { icon: Clock, label: 'Last seen', value: dev.lastSeen ? new Date(dev.lastSeen).toLocaleTimeString() : 'Never' },
                { icon: MapPin, label: 'Lat', value: dev.lastLocation?.lat?.toFixed(5) || '—' },
                { icon: MapPin, label: 'Lng', value: dev.lastLocation?.lng?.toFixed(5) || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-surface-800 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-500 flex items-center gap-1"><Icon size={9} />{label}</p>
                  <p className="text-xs font-mono font-medium text-white mt-0.5 truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <LiveMap selectedDevice={selectedDevice} />
        {/* Online indicator */}
        <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 bg-surface-900/90 backdrop-blur border border-surface-700 rounded-lg px-3 py-2">
          <div className={`w-2 h-2 rounded-full ${devices.some(d => d.status === 'online') ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-xs text-slate-300">
            {devices.filter(d => d.status === 'online').length} online
          </span>
        </div>
      </div>
    </div>
  );
}
