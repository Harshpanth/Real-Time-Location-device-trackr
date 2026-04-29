import { create } from 'zustand';

export const useDeviceStore = create((set) => ({
  devices: [],
  selectedDevice: null,
  setDevices: (devices) => set({ devices }),
  setSelectedDevice: (device) => set({ selectedDevice: device }),
  addDevice: (device) => set((s) => ({ devices: [device, ...s.devices] })),
  removeDevice: (id) => set((s) => ({ devices: s.devices.filter((d) => d._id !== id) })),
  updateDeviceLocation: ({ deviceId, lat, lng, speed, timestamp }) =>
    set((s) => ({
      devices: s.devices.map((d) =>
        d._id === deviceId
          ? { ...d, lastLocation: { lat, lng }, lastSeen: timestamp, status: 'online', speed }
          : d
      ),
    })),
  setDeviceOffline: (deviceId) =>
    set((s) => ({
      devices: s.devices.map((d) =>
        d._id === deviceId ? { ...d, status: 'offline' } : d
      ),
    })),
  setDeviceOnline: (deviceId) =>
    set((s) => ({
      devices: s.devices.map((d) =>
        d._id === deviceId ? { ...d, status: 'online' } : d
      ),
    })),
}));
