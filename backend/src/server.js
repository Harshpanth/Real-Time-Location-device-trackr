import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';
import { registerSocketHandlers } from './sockets/location.socket.js';
import { startHeartbeatWorker } from './sockets/heartbeat.worker.js';

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

const start = async () => {
  await connectDB();

  // Redis is fully optional — connectRedis never throws
  const redis = connectRedis();

  registerSocketHandlers(io, redis);
  startHeartbeatWorker(io, redis);

  httpServer.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║         Trackr Backend Running           ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  API    : http://localhost:${PORT}/api       ║`);
    console.log(`║  Health : http://localhost:${PORT}/api/health║`);
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
  });
};

start().catch((err) => {
  console.error('Fatal startup error:', err.message);
  process.exit(1);
});
