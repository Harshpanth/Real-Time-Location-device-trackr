import { useEffect } from 'react';
import api from '../services/api';
import { useDeviceStore } from '../store/device.store';

export const useDevices = () => {
  const { devices, setDevices } = useDeviceStore();

  const fetchDevices = async () => {
    try {
      const res = await api.get('/devices');
      setDevices(res.data.data);
    } catch (err) {
      console.error('Failed to fetch devices:', err.message);
    }
  };

  useEffect(() => { fetchDevices(); }, []);

  return { devices, refetch: fetchDevices };
};
