'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Derive a child secret from a master key using HMAC-SHA256.
 * Ensures access and refresh secrets are always cryptographically distinct
 * even when only a single JWT_SECRET env var is provided.
 */
function deriveSecret(master, label) {
  return crypto.createHmac('sha256', master).update(label).digest('hex');
}

const MASTER_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || deriveSecret(MASTER_SECRET, 'access');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || deriveSecret(MASTER_SECRET, 'refresh');

/**
 * Express middleware that verifies a JWT Bearer token from the Authorization
 * header and attaches the decoded payload to `req.user`.
 *
 * Responds with 401 on missing token and 403 on invalid / expired token.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required. Please provide a Bearer token.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Malformed Authorization header. Expected "Bearer <token>".' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token has expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token. Please log in again.' });
    }
    return res.status(403).json({ error: 'Token verification failed.' });
  }
}

/**
 * Sign a short-lived access JWT for the given user payload.
 * @param {{ id: number, email: string, name: string }} user
 * @returns {string} signed JWT (expires in 15m)
 */
function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

/**
 * Sign a long-lived refresh JWT for the given user payload.
 * @param {{ id: number, email: string, name: string }} user
 * @returns {string} signed JWT (expires in 7d)
 */
function signRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      jti: Math.random().toString(36).substring(2, 15) + Date.now()
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify a refresh token and return its decoded payload.
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

/**
 * Set the HttpOnly Secure SameSite cookie containing the refresh token.
 * @param {import('express').Response} res
 * @param {string} token
 */
function setRefreshTokenCookie(res, token) {
  res.cookie('jid', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
}

/**
 * Clear the refresh token cookie.
 * @param {import('express').Response} res
 */
function clearRefreshTokenCookie(res) {
  res.clearCookie('jid', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}

module.exports = {
  authenticateToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie
};
