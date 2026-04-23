import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import AppError from '../utils/AppError.js';
import { registerUser, loginUser, rotateRefreshToken, logoutUser } from '../services/auth.service.js';

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const setRefreshCookie = (res, token) =>
  res.cookie('refreshToken', token, { ...COOKIE_BASE, maxAge: 7 * 24 * 60 * 60 * 1000 });

const clearRefreshCookie = (res) => res.clearCookie('refreshToken', COOKIE_BASE);

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, accessToken, refreshToken } = await registerUser({ name, email, password });

  setRefreshCookie(res, refreshToken);
  sendSuccess(res, {
    statusCode: 201,
    message: 'User registered successfully',
    data: { user, accessToken },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await loginUser({ email, password });

  setRefreshCookie(res, refreshToken);
  sendSuccess(res, {
    message: 'Logged in successfully',
    data: { user, accessToken },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken;
  if (!incomingToken) throw new AppError('Refresh token required', 401);

  const { accessToken, refreshToken } = await rotateRefreshToken(incomingToken);

  setRefreshCookie(res, refreshToken);
  sendSuccess(res, { message: 'Token refreshed', data: { accessToken } });
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user._id);
  clearRefreshCookie(res);
  sendSuccess(res, { message: 'Logged out successfully' });
});
