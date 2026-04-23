import AppError from '../utils/AppError.js';

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';
  const error = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  res.status(statusCode).json({ success: false, message, ...(error && { error }) });
};

export default errorMiddleware;
