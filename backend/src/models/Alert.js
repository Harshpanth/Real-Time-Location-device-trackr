import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  geofence: { type: mongoose.Schema.Types.ObjectId, ref: 'Geofence' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['enter', 'exit', 'offline', 'online'], required: true },
  location: { lat: Number, lng: Number },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

alertSchema.index({ owner: 1, createdAt: -1 });
alertSchema.index({ read: 1 });

export default mongoose.model('Alert', alertSchema);
