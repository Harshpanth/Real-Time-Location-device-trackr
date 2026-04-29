import Location from '../models/Location.js';
import Device from '../models/Device.js';
import { verifyAccess } from '../utils/jwt.js';
import { checkGeofences } from '../services/geofence.service.js';

let redisClient;

export const registerSocketHandlers = (io, redis) => {
  redisClient = redis;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const deviceKey = socket.handshake.auth?.deviceKey;
    if (token) {
      try {
        socket.user = verifyAccess(token);
        socket.type = 'dashboard';
        return next();
      } catch {
        return next(new Error('Invalid token'));
      }
    }
    if (deviceKey) {
      socket.deviceKey = deviceKey;
      socket.type = 'device';
      return next();
    }
    next(new Error('Authentication required'));
  });

  io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.id} [${socket.type}]`);

    if (socket.type === 'dashboard') {
      socket.join(`user:${socket.user.id}`);

      socket.on('subscribe:device', (deviceId) => {
        socket.join(`device:${deviceId}`);
        console.log(`Dashboard subscribed to device:${deviceId}`);
      });

      socket.on('unsubscribe:device', (deviceId) => {
        socket.leave(`device:${deviceId}`);
      });
    }

    if (socket.type === 'device') {
      const device = await Device.findOne({ deviceKey: socket.deviceKey });
      if (!device) { socket.disconnect(); return; }
      socket.deviceId = device._id.toString();
      socket.ownerId = device.owner.toString();

      await Device.findByIdAndUpdate(device._id, { status: 'online', lastSeen: new Date() });
      if (redisClient) await redisClient.set(`heartbeat:${device._id}`, '1', 'EX', 30);
      io.to(`user:${device.owner}`).emit('device:online', { deviceId: device._id.toString() });

      socket.on('location:update', async (data) => {
        try {
          const { lat, lng, speed = 0, accuracy = 0, altitude = 0, heading = 0 } = data;
          const loc = await Location.create({
            device: socket.deviceId,
            coordinates: [lng, lat],
            type: 'Point',
            speed, accuracy, altitude, heading,
            timestamp: new Date(),
          });
          await Device.findByIdAndUpdate(socket.deviceId, {
            lastSeen: new Date(),
            lastLocation: { lat, lng },
            status: 'online',
          });
          if (redisClient) await redisClient.set(`heartbeat:${socket.deviceId}`, '1', 'EX', 30);
          io.to(`device:${socket.deviceId}`).emit('location:update', {
            deviceId: socket.deviceId,
            lat, lng, speed, accuracy,
            timestamp: loc.timestamp,
          });
          io.to(`user:${socket.ownerId}`).emit('location:update', {
            deviceId: socket.deviceId,
            lat, lng, speed, accuracy,
            timestamp: loc.timestamp,
          });
          checkGeofences(socket.deviceId, { lat, lng }, io);
        } catch (err) {
          console.error('location:update error:', err.message);
        }
      });

      socket.on('disconnect', async () => {
        await Device.findByIdAndUpdate(socket.deviceId, { status: 'offline', lastSeen: new Date() });
        if (redisClient) await redisClient.del(`heartbeat:${socket.deviceId}`);
        io.to(`user:${socket.ownerId}`).emit('device:offline', { deviceId: socket.deviceId });
      });
    }

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
