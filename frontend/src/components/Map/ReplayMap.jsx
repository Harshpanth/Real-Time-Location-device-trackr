import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';

const replayIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#22d3ee;border:2.5px solid white;box-shadow:0 0 8px rgba(34,211,238,0.5);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      const latlngs = points.map((p) => [p.coordinates[1], p.coordinates[0]]);
      map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
    }
  }, [points.length]);
  return null;
};

export default function ReplayMap({ points }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef(null);

  const currentPoint = points[current];
  const position = currentPoint ? [currentPoint.coordinates[1], currentPoint.coordinates[0]] : null;
  const trail = points.slice(0, current + 1).map((p) => [p.coordinates[1], p.coordinates[0]]);
  const progress = points.length > 0 ? (current / Math.max(1, points.length - 1)) * 100 : 0;

  useEffect(() => {
    if (!playing) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setCurrent((c) => {
        if (c >= points.length - 1) { setPlaying(false); return c; }
        return c + 1;
      });
    }, 200 / speed);
    return () => clearInterval(intervalRef.current);
  }, [playing, speed, points.length]);

  const reset = () => { setPlaying(false); setCurrent(0); };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 rounded-xl overflow-hidden" style={{ minHeight: 300 }}>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%', background: '#050812' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" maxZoom={19} />
          {points.length > 0 && <FitBounds points={points} />}
          {trail.length > 1 && (
            <Polyline positions={trail} pathOptions={{ color: '#22d3ee', weight: 2.5, opacity: 0.9 }} />
          )}
          {position && <Marker position={position} icon={replayIcon} />}
        </MapContainer>
      </div>

      <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 flex-shrink-0">
        <div className="mb-4">
          <input type="range" min={0} max={Math.max(1, points.length - 1)} value={current}
            onChange={(e) => { setPlaying(false); setCurrent(+e.target.value); }}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: '#22d3ee', background: `linear-gradient(to right, #22d3ee ${progress}%, #1e2a45 ${progress}%)` }}
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1.5">
            <span>{points[0] ? new Date(points[0].timestamp).toLocaleString() : '—'}</span>
            <span className="text-brand-400 font-medium">{Math.round(progress)}%</span>
            <span>{points[points.length - 1] ? new Date(points[points.length - 1].timestamp).toLocaleString() : '—'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={reset} className="w-9 h-9 rounded-lg bg-surface-700 hover:bg-surface-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <RotateCcw size={15} />
          </button>
          <button onClick={() => setPlaying(!playing)}
            className="flex-1 h-9 rounded-lg bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 text-white font-medium text-sm transition-colors">
            {playing ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Play</>}
          </button>
          <div className="flex items-center gap-1.5">
            <FastForward size={12} className="text-slate-600" />
            {[1, 2, 4].map((s) => (
              <button key={s} onClick={() => setSpeed(s)}
                className={`w-8 h-9 rounded text-xs font-mono font-medium transition-colors
                  ${speed === s ? 'bg-brand-500/20 text-brand-400' : 'text-slate-500 hover:text-slate-300'}`}>
                {s}x
              </button>
            ))}
          </div>
        </div>

        {currentPoint && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: 'Position', value: `${currentPoint.coordinates[1].toFixed(4)}, ${currentPoint.coordinates[0].toFixed(4)}` },
              { label: 'Speed', value: `${(currentPoint.speed || 0).toFixed(1)} km/h` },
              { label: 'Time', value: new Date(currentPoint.timestamp).toLocaleTimeString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface-700 rounded-lg px-2.5 py-2">
                <p className="text-[10px] text-slate-600">{label}</p>
                <p className="text-xs font-mono text-slate-300 truncate">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
