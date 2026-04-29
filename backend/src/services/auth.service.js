import User from '../models/User.js';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

export const registerUser = async ({ name, email, password }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'Email already registered');
  const user = await User.create({ name, email, password });
  const accessToken = signAccess({ id: user._id, role: user.role });
  const refreshToken = signRefresh({ id: user._id });
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();
  return { user: user.toSafeObject(), accessToken, refreshToken };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password)))
    throw new ApiError(401, 'Invalid email or password');
  if (!user.isActive) throw new ApiError(403, 'Account deactivated');
  const accessToken = signAccess({ id: user._id, role: user.role });
  const refreshToken = signRefresh({ id: user._id });
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();
  return { user: user.toSafeObject(), accessToken, refreshToken };
};

export const refreshTokens = async (token) => {
  if (!token) throw new ApiError(401, 'No refresh token');
  let payload;
  try { payload = verifyRefresh(token); } catch { throw new ApiError(401, 'Invalid refresh token'); }
  const user = await User.findById(payload.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) throw new ApiError(401, 'Refresh token revoked');
  const accessToken = signAccess({ id: user._id, role: user.role });
  const refreshToken = signRefresh({ id: user._id });
  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};
