import User from '../models/User.js';
import Device from '../models/Device.js';
import Location from '../models/Location.js';
import Geofence from '../models/Geofence.js';

export const seedDatabase = async () => {
  try {
    // Check if demo user already exists
    let demoUser = await User.findOne({ email: 'admin@trackr.dev' });
    if (!demoUser) {
      console.log('🌱 Seeding demo database...');
      demoUser = await User.create({
        name: 'Demo User',
        email: 'admin@trackr.dev',
        password: 'password123', // will be hashed automatically by pre-save middleware
        role: 'user',
      });
      console.log('👤 Created demo user: admin@trackr.dev');
    } else if (demoUser.role !== 'user') {
      demoUser.role = 'user';
      demoUser.name = 'Demo User';
      await demoUser.save();
      console.log('👤 Updated demo user role to: user');
    }

    // Check if demo device already exists
    const deviceKey = '6643b4d848c9f5f1a9d68bb9148ba8303a725e5a7cbee7d4';
    let demoDevice = await Device.findOne({ deviceKey });
    if (!demoDevice) {
      demoDevice = await Device.create({
        owner: demoUser._id,
        name: 'Demo Phone',
        deviceKey,
        status: 'offline',
        lastSeen: new Date(),
        lastLocation: {
          lat: 28.6139,
          lng: 77.2090,
        },
        model: 'iPhone 15 Pro',
        description: 'Simulated live tracking device',
        icon: 'smartphone',
        color: '#22d3ee',
      });
      console.log('📱 Created demo device');
    }

    // Check if location history exists for this device
    const locationCount = await Location.countDocuments({ device: demoDevice._id });
    if (locationCount === 0) {
      await Location.create({
        device: demoDevice._id,
        coordinates: [77.2090, 28.6139], // [lng, lat]
        speed: 0,
        altitude: 200,
        accuracy: 5,
        heading: 0,
        timestamp: new Date(),
      });
      console.log('📍 Created initial location record');
    }

    // Check if demo geofence exists
    const geofenceCount = await Geofence.countDocuments({ owner: demoUser._id });
    if (geofenceCount === 0) {
      await Geofence.create({
        owner: demoUser._id,
        name: 'Connaught Place Zone',
        center: {
          lat: 28.6139,
          lng: 77.2090,
        },
        radius: 1000,
        devices: [demoDevice._id],
        active: true,
        color: '#f43f5e',
      });
      console.log('⭕ Created demo geofence');
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
};
