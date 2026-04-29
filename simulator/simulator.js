#!/usr/bin/env node
/**
 * Trackr GPS Simulator
 * Works on Windows, macOS, and Linux
 *
 * Usage:
 *   node simulator.js <DEVICE_KEY> [startLat] [startLng]
 *
 * Example:
 *   node simulator.js abc123def456 28.6139 77.2090
 */

import { io } from 'socket.io-client';

const hardcodedKey = '6643b4d848c9f5f1a9d68bb9148ba8303a725e5a7cbee7d4';
const DEVICE_KEY = process.argv[2] || hardcodedKey;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

if (!DEVICE_KEY || DEVICE_KEY === 'YOUR_DEVICE_KEY_HERE') {
  console.error('');
  console.error('ERROR: No device key provided.');
  console.error('');
  console.error('Usage: node simulator.js <DEVICE_KEY> [startLat] [startLng]');
  console.error('');
  console.error('Get your device key from the Trackr dashboard (Devices page).');
  process.exit(1);
}

let lat = parseFloat(process.argv[3] || '28.6139');   // New Delhi default
let lng = parseFloat(process.argv[4] || '77.2090');

console.log('');
console.log('  Trackr GPS Simulator');
console.log('  ----------------------------');
console.log('  Server  : ' + SERVER_URL);
console.log('  Key     : ' + DEVICE_KEY.slice(0, 8) + '...');
console.log('  Start   : ' + lat.toFixed(5) + ', ' + lng.toFixed(5));
console.log('');

const socket = io(SERVER_URL, {
  auth: { deviceKey: DEVICE_KEY },
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

socket.on('connect', () => {
  console.log('Connected! Socket ID: ' + socket.id);
  console.log('Sending location every 3 seconds...');
  console.log('Press Ctrl+C to stop.');
  console.log('');
  startSending();
});

socket.on('connect_error', (err) => {
  console.error('Connection failed: ' + err.message);
  console.error('Make sure the backend is running on ' + SERVER_URL);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected: ' + reason);
});

let tick = 0;
function startSending() {
  setInterval(() => {
    // Realistic random-walk movement
    lat += (Math.random() - 0.5) * 0.001;
    lng += (Math.random() - 0.5) * 0.001;
    const speed = Math.random() * 15;
    const accuracy = 3 + Math.random() * 10;
    const heading = Math.random() * 360;
    const altitude = 200 + Math.random() * 50;

    socket.emit('location:update', { lat, lng, speed, accuracy, heading, altitude });
    tick++;

    process.stdout.write(
      '\r  [' + tick + '] ' +
      lat.toFixed(6) + ', ' + lng.toFixed(6) +
      '  |  ' + (speed * 3.6).toFixed(1) + ' km/h    '
    );
  }, 3000);
}

process.on('SIGINT', () => {
  console.log('\n\nSimulator stopped.');
  socket.disconnect();
  process.exit(0);
});
