import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  coordinates: {
    type: [Number], // [lng, lat] - GeoJSON format
    required: true,
  },
  type: { type: String, default: 'Point' },
  speed: { type: Number, default: 0 },
  altitude: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  heading: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

locationSchema.index({ coordinates: '2dsphere' });
locationSchema.index({ device: 1, timestamp: -1 });

export default mongoose.model('Location', locationSchema);
