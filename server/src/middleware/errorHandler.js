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
/**
 * Native, lightweight Sentry reporter using fetch to keep dependencies small.
 * Sends error report asynchronously if SENTRY_DSN is configured.
 */
function reportToSentry(err, req) {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  try {
    const match = dsn.match(/https:\/\/([^@]+)@([^/]+)\/(.+)/);
    if (!match) return;

    const key = match[1];
    const host = match[2];
    const projectId = match[3];

    const url = `https://${host}/api/${projectId}/store/`;
    const eventId = Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18);

    const payload = {
      event_id: eventId,
      timestamp: new Date().toISOString().split('.')[0],
      platform: 'node',
      exception: {
        values: [{
          type: err.name || 'Error',
          value: err.message,
          stacktrace: {
            frames: err.stack ? err.stack.split('\n').map(line => ({ filename: line.trim() })) : []
          }
        }]
      },
      request: {
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        method: req.method,
        headers: req.headers
      }
    };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7,sentry_client=custom-node/1.0,sentry_key=${key}`
      },
      body: JSON.stringify(payload)
    }).catch((e) => {
      console.error('⚠️ Sentry async report connection failure:', e.message);
    });
  } catch (e) {
    console.error('⚠️ Sentry parsing failure:', e.message);
  }
}

function errorHandler(err, req, res, _next) {
  const statusCode = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  // Always log server-side
  console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.message}`);
  if (isDev) {
    console.error(err.stack);
  }

  // Report critical server errors to Sentry
  if (statusCode >= 500) {
    reportToSentry(err, req);
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
