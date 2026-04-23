import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from '../utils/token.js';

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const generateTokenPair = (userId) => ({
  accessToken: generateAccessToken({ id: userId.toString() }),
  refreshToken: generateRefreshToken({ id: userId.toString() }),
});

export const registerUser = async ({ name, email, password }) => {
  const user = await User.create({ name, email, password });

  const { accessToken, refreshToken } = generateTokenPair(user._id);

  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return { user: formatUser(user), accessToken, refreshToken };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) throw new AppError('Invalid credentials', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid credentials', 401);

  const { accessToken, refreshToken } = generateTokenPair(user._id);

  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return { user: formatUser(user), accessToken, refreshToken };
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export const rotateRefreshToken = async (incomingToken) => {
  const decoded = verifyRefreshToken(incomingToken);

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user) throw new AppError('Invalid refresh token', 401);

  if (user.refreshToken !== hashToken(incomingToken)) {
    throw new AppError('Invalid refresh token', 401);
  }

  const { accessToken, refreshToken } = generateTokenPair(user._id);

  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};
