import Device from '../models/Device.js';

export const startHeartbeatWorker = (io, redisClient) => {
  if (!redisClient) {
    console.log('Heartbeat worker: Redis not available, skipping');
    return;
  }
  setInterval(async () => {
    try {
      const onlineDevices = await Device.find({ status: 'online' }).select('_id owner');
      for (const device of onlineDevices) {
        const alive = await redisClient.exists(`heartbeat:${device._id}`);
        if (!alive) {
          await Device.findByIdAndUpdate(device._id, { status: 'offline', lastSeen: new Date() });
          io.to(`user:${device.owner}`).emit('device:offline', { deviceId: device._id.toString() });
          console.log(`Device offline (heartbeat timeout): ${device._id}`);
        }
      }
    } catch (err) {
      console.error('Heartbeat worker error:', err.message);
    }
  }, 10000);
  console.log('Heartbeat worker started (10s interval)');
};
