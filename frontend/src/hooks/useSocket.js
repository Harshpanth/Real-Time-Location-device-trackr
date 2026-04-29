import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useDeviceStore } from '../store/device.store';
import { useAlertStore } from '../store/alert.store';
import { useAuthStore } from '../store/auth.store';

export const useSocket = () => {
  const token = useAuthStore((s) => s.token);
  const { updateDeviceLocation, setDeviceOffline, setDeviceOnline } = useDeviceStore();
  const { addAlert } = useAlertStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    const s = connectSocket(token);
    socketRef.current = s;

    s.on('location:update', updateDeviceLocation);
    s.on('device:offline', ({ deviceId }) => setDeviceOffline(deviceId));
    s.on('device:online', ({ deviceId }) => setDeviceOnline(deviceId));
    s.on('alert:geofence', ({ alert }) => addAlert(alert));

    return () => {
      s.off('location:update', updateDeviceLocation);
      s.off('device:offline');
      s.off('device:online');
      s.off('alert:geofence');
    };
  }, [token]);

  return socketRef;
};
