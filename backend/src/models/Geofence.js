import mongoose from 'mongoose';

const geofenceSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  center: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  radius: { type: Number, required: true, min: 50, max: 50000 }, // meters
  devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],
  active: { type: Boolean, default: true },
  color: { type: String, default: '#8b5cf6' },
  deviceStates: { type: Map, of: Boolean, default: {} },
}, { timestamps: true });

export default mongoose.model('Geofence', geofenceSchema);
