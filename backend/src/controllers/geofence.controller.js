import { asyncWrapper } from '../utils/asyncWrapper.js';
import Geofence from '../models/Geofence.js';
import { ApiError } from '../utils/ApiError.js';

export const getGeofences = asyncWrapper(async (req, res) => {
  const fences = await Geofence.find({ owner: req.user.id }).populate('devices', 'name status');
  res.json({ success: true, data: fences });
});

export const createGeofence = asyncWrapper(async (req, res) => {
  const fence = await Geofence.create({ ...req.body, owner: req.user.id });
  res.status(201).json({ success: true, data: fence });
});

export const updateGeofence = asyncWrapper(async (req, res) => {
  const fence = await Geofence.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    req.body,
    { new: true }
  );
  if (!fence) throw new ApiError(404, 'Geofence not found');
  res.json({ success: true, data: fence });
});

export const deleteGeofence = asyncWrapper(async (req, res) => {
  const fence = await Geofence.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!fence) throw new ApiError(404, 'Geofence not found');
  res.json({ success: true, message: 'Geofence deleted' });
});
