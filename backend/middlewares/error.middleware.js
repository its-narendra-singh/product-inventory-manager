const errorMiddleware = (err, req, res, _next) => {
  let { statusCode = 500, message = 'Internal Server Error', isOperational } = err;

  // Mongoose validation error → 400
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    isOperational = true;
  }

  // MongoDB duplicate key → 409
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    isOperational = true;
  }

  // Mongoose CastError (invalid ObjectId) → 400
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    isOperational = true;
  }

  // JWT errors → 401
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }

  if (!isOperational) message = 'Internal Server Error';

  const error = process.env.NODE_ENV === 'development' ? err.stack : undefined;
  res.status(statusCode).json({ success: false, message, ...(error && { error }) });
};

export default errorMiddleware;
