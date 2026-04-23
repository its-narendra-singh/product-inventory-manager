import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/token.js';
import asyncHandler from '../utils/asyncHandler.js';

const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Access token required', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.id).select('name email role');
  if (!user) throw new AppError('User no longer exists', 401);

  req.user = user;
  next();
});

export default authenticate;
