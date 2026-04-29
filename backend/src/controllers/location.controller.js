import { asyncWrapper } from '../utils/asyncWrapper.js';
import Location from '../models/Location.js';
import Device from '../models/Device.js';
import { ApiError } from '../utils/ApiError.js';

export const getHistory = asyncWrapper(async (req, res) => {
  const { deviceId } = req.params;
  const { page = 1, limit = 100, from, to } = req.query;
  const device = await Device.findOne({ _id: deviceId, owner: req.user.id });
  if (!device) throw new ApiError(404, 'Device not found');
  const filter = { device: deviceId };
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }
  const locations = await Location.find(filter)
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  const total = await Location.countDocuments(filter);
  res.json({ success: true, data: locations, pagination: { total, page: +page, limit: +limit } });
});

export const getReplay = asyncWrapper(async (req, res) => {
  const { deviceId } = req.params;
  const { from, to } = req.query;
  const device = await Device.findOne({ _id: deviceId, owner: req.user.id });
  if (!device) throw new ApiError(404, 'Device not found');
  const filter = { device: deviceId };
  if (from) filter.timestamp = { $gte: new Date(from) };
  if (to) filter.timestamp = { ...filter.timestamp, $lte: new Date(to) };
  const locations = await Location.find(filter).sort({ timestamp: 1 }).limit(2000);
  res.json({ success: true, data: locations });
});
