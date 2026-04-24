import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getDashboardStats } from '../services/dashboard.service.js';

export const stats = asyncHandler(async (req, res) => {
  const data = await getDashboardStats(req.user._id);
  sendSuccess(res, { message: 'Dashboard stats retrieved successfully', data });
});
