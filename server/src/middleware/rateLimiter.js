'use strict';

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter — 100 requests per 15-minute window per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    error: 'Too many requests. Please try again in a few minutes.',
  },
});

/**
 * Stricter rate limiter for authentication endpoints — 10 requests per
 * 15-minute window per IP to slow down brute-force attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    error: 'Too many authentication attempts. Please try again later.',
  },
});

module.exports = { generalLimiter, authLimiter };
