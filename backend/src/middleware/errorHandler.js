import { ApiError } from '../utils/ApiError.js';

export const globalErrorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === 'CastError') error = new ApiError(400, 'Invalid ID format');
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(409, `${field} already exists`);
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, messages.join(', '));
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal server error';

  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  res.status(statusCode).json({ success: false, error: message });
};
