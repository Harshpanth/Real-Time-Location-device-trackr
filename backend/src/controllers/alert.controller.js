import { asyncWrapper } from '../utils/asyncWrapper.js';
import Alert from '../models/Alert.js';

export const getAlerts = asyncWrapper(async (req, res) => {
  const alerts = await Alert.find({ owner: req.user.id })
    .populate('device', 'name')
    .populate('geofence', 'name')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: alerts });
});

export const markRead = asyncWrapper(async (req, res) => {
  await Alert.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, { read: true });
  res.json({ success: true });
});

export const markAllRead = asyncWrapper(async (req, res) => {
  await Alert.updateMany({ owner: req.user.id, read: false }, { read: true });
  res.json({ success: true });
});

export const getUnreadCount = asyncWrapper(async (req, res) => {
  const count = await Alert.countDocuments({ owner: req.user.id, read: false });
  res.json({ success: true, data: count });
});
