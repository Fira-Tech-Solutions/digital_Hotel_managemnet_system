const ApiError = require('../utils/ApiError');

// 404 handler for unmatched routes
function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Final error handler — always returns a consistent JSON shape
// { success: false, message, details? }
function errorHandler(err, req, res, next) {
  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = err.message || 'Internal server error';

  // Prisma known error shapes -> friendlier responses
  if (err.code === 'P2002') {
    statusCode = 409;
    message = `A record with this ${err.meta?.target?.join(', ') || 'value'} already exists`;
  }
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(`[${new Date().toISOString()}]`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = { notFound, errorHandler };
