import { asyncWrapper } from '../utils/asyncWrapper.js';
import * as authService from '../services/auth.service.js';

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncWrapper(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
  res.cookie('refreshToken', refreshToken, cookieOpts);
  res.status(201).json({ success: true, data: { user, accessToken } });
});

export const login = asyncWrapper(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
  res.cookie('refreshToken', refreshToken, cookieOpts);
  res.json({ success: true, data: { user, accessToken } });
});

export const refresh = asyncWrapper(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const { accessToken, refreshToken } = await authService.refreshTokens(token);
  res.cookie('refreshToken', refreshToken, cookieOpts);
  res.json({ success: true, data: { accessToken } });
});

export const logout = asyncWrapper(async (req, res) => {
  await authService.logoutUser(req.user.id);
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
});

export const getMe = asyncWrapper(async (req, res) => {
  res.json({ success: true, data: req.user });
});
