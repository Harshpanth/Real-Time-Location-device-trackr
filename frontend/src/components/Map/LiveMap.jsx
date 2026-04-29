import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useDeviceStore } from '../../store/device.store';

const buildIcon = (device) => {
  const isOnline = device.status === 'online';
  const color = device.color || '#22d3ee';
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:28px;height:28px;">
        ${isOnline ? `<div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.25;animation:markerPulse 2s ease-in-out infinite;"></div>` : ''}
        <div style="position:absolute;inset:4px;border-radius:50%;background:${isOnline ? color : '#475569'};border:2px solid ${isOnline ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)'};"></div>
      </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const FlyTo = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 13, { duration: 1.5 });
  }, [lat, lng]);
  return null;
};

export default function LiveMap({ geofences = [], selectedDevice }) {
  return (
    <MapContainer
      center={[26.227980, 78.176958]}
      zoom={15}
      className="h-full w-full rounded-xl"
      style={{ background: '#050812' }}
    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />


      {selectedDevice?.lastLocation && (
        <FlyTo lat={selectedDevice.lastLocation.lat} lng={selectedDevice.lastLocation.lng} />
      )}

      {geofences.map((fence) => fence.center && (
        <Circle
          key={fence._id}
          center={[fence.center.lat, fence.center.lng]}
          radius={fence.radius}
          pathOptions={{
            color: fence.color || '#8b5cf6',
            fillColor: fence.color || '#8b5cf6',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '6 4',
          }}
        />
      ))}

      <DeviceMarkers selectedId={selectedDevice?._id} />
    </MapContainer>
  );
}

function DeviceMarkers({ selectedId }) {
  const devices = useDeviceStore((s) => s.devices);
  return (
    <>
      {devices.filter((d) => d.lastLocation).map((device) => (
        <Marker
          key={device._id}
          position={[device.lastLocation.lat, device.lastLocation.lng]}
          icon={buildIcon(device)}
          zIndexOffset={device._id === selectedId ? 1000 : 0}
        >
          <Popup className="trackr-popup">
            <div style={{ minWidth: 160, fontFamily: "'DM Sans', sans-serif", background: '#0f1629', color: '#e2e8f0', padding: '8px', borderRadius: '8px' }}>
              <p style={{ fontWeight: 600, fontSize: 13 }}>{device.name}</p>
              <p style={{ fontSize: 11, color: device.status === 'online' ? '#34d399' : '#94a3b8', marginTop: 2 }}>
                {device.status.toUpperCase()}
              </p>
              {device.lastLocation && (
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontFamily: 'monospace' }}>
                  {device.lastLocation.lat.toFixed(5)}, {device.lastLocation.lng.toFixed(5)}
                </p>
              )}
              {device.speed !== undefined && (
                <p style={{ fontSize: 11, color: '#64748b' }}>{device.speed?.toFixed(1) || 0} km/h</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
