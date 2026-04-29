import mongoose from 'mongoose';
import crypto from 'crypto';

const deviceSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  deviceKey: { type: String, unique: true },
  status: { type: String, enum: ['online', 'offline'], default: 'offline' },
  lastSeen: Date,
  lastLocation: {
    lat: Number,
    lng: Number,
  },
  model: { type: String, default: 'Generic Device' },
  description: { type: String, maxlength: 200 },
  icon: { type: String, default: 'smartphone' },
  color: { type: String, default: '#22d3ee' },
}, { timestamps: true });

deviceSchema.pre('save', function (next) {
  if (!this.deviceKey) {
    this.deviceKey = crypto.randomBytes(24).toString('hex');
  }
  next();
});

export default mongoose.model('Device', deviceSchema);
