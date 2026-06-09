'use strict';

/**
 * Global Express error handler.
 *
 * In development mode the full stack trace and error details are returned.
 * In production only a generic message is sent to the client while the real
 * error is logged server-side.
 *
 * @param {Error & { status?: number, statusCode?: number }} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
function errorHandler(err, req, res, _next) {
  const statusCode = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  // Always log server-side
  console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.message}`);
  if (isDev) {
    console.error(err.stack);
  }

  if (isDev) {
    return res.status(statusCode).json({
      error: err.message,
      stack: err.stack,
      status: statusCode,
    });
  }

  // Production — never leak internal details
  if (statusCode >= 500) {
    return res.status(500).json({
      error: 'An internal server error occurred. Please try again later.',
    });
  }

  return res.status(statusCode).json({
    error: err.message || 'Something went wrong.',
  });
}

module.exports = { errorHandler };
