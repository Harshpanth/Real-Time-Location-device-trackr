import Geofence from '../models/Geofence.js';
import Alert from '../models/Alert.js';
import Device from '../models/Device.js';
import { haversineDistance } from '../utils/geoUtils.js';

export const checkGeofences = async (deviceId, { lat, lng }, io) => {
  try {
    const device = await Device.findById(deviceId);
    if (!device) return;
    const fences = await Geofence.find({ devices: deviceId, active: true });
    for (const fence of fences) {
      const dist = haversineDistance(lat, lng, fence.center.lat, fence.center.lng);
      const inside = dist <= fence.radius;
      const wasInside = fence.deviceStates?.get(deviceId.toString()) ?? false;
      if (inside !== wasInside) {
        const type = inside ? 'enter' : 'exit';
        const message = inside
          ? `Device "${device.name}" entered geofence "${fence.name}"`
          : `Device "${device.name}" exited geofence "${fence.name}"`;
        const alert = await Alert.create({ device: deviceId, geofence: fence._id, owner: device.owner, type, location: { lat, lng }, message });
        fence.deviceStates.set(deviceId.toString(), inside);
        await fence.save();
        io.to(`user:${device.owner}`).emit('alert:geofence', { type, deviceId: deviceId.toString(), deviceName: device.name, fenceName: fence.name, alert: alert.toObject() });
      }
    }
  } catch (err) {
    console.error('Geofence check error:', err.message);
  }
};
