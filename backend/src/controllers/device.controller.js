import { asyncWrapper } from '../utils/asyncWrapper.js';
import Device from '../models/Device.js';
import { ApiError } from '../utils/ApiError.js';

export const getDevices = asyncWrapper(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { owner: req.user.id };
  const devices = await Device.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, data: devices });
});

export const getDevice = asyncWrapper(async (req, res) => {
  const device = await Device.findOne({ _id: req.params.id, owner: req.user.id });
  if (!device) throw new ApiError(404, 'Device not found');
  res.json({ success: true, data: device });
});

export const createDevice = asyncWrapper(async (req, res) => {
  const device = await Device.create({ ...req.body, owner: req.user.id });
  res.status(201).json({ success: true, data: device });
});

export const updateDevice = asyncWrapper(async (req, res) => {
  const device = await Device.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!device) throw new ApiError(404, 'Device not found');
  res.json({ success: true, data: device });
});

export const deleteDevice = asyncWrapper(async (req, res) => {
  const device = await Device.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!device) throw new ApiError(404, 'Device not found');
  res.json({ success: true, message: 'Device deleted' });
});
