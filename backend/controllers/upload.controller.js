import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const uploadImage = (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No image file provided', 400));
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  sendSuccess(res, { message: 'Image uploaded successfully', data: { imageUrl } });
};
