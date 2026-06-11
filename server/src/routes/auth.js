'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../models/db');
const { run, get, all } = db;
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  authenticateToken
} = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { sendVerificationEmail } = require('../services/mailService');

const router = express.Router();

// ─── Validation helpers ─────────────────────────────────────────────────────

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('A valid email is required.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character.'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('A valid email is required.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.'),
];

// ─── Helpers: Fingerprinting & Session Control ──────────────────────────────

function getClientFingerprint(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  return { ip, ua };
}

async function saveRefreshToken(userId, token, ip, ua) {
  // 1. Garbage Collection: Sweep expired tokens
  const nowVal = db.isPostgres ? new Date() : new Date().toISOString();
  await run('DELETE FROM refresh_tokens WHERE expires_at < ?', [nowVal]);

  // 2. Session Limit: Enforce maximum of 5 concurrent active sessions
  const sessions = await all(
    'SELECT id FROM refresh_tokens WHERE user_id = ? AND is_revoked = 0 ORDER BY created_at ASC',
    [userId]
  );
  if (sessions.length >= 5) {
    const toDeleteCount = sessions.length - 4; // leave room for this new session (total 5)
    for (let i = 0; i < toDeleteCount; i++) {
      await run('DELETE FROM refresh_tokens WHERE id = ?', [sessions[i].id]);
    }
  }

  // 3. Save new token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
  const expiresVal = db.isPostgres ? expiresAt : expiresAt.toISOString();

  await run(
    'INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent, is_revoked) VALUES (?, ?, ?, ?, ?, 0)',
    [userId, token, expiresVal, ip, ua]
  );
}

// ─── POST /register ─────────────────────────────────────────────────────────

router.post('/register', authLimiter, registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check for existing user
    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password (cost factor 12)
    const passwordHash = bcrypt.hashSync(password, 12);

    const verifiedVal = db.isPostgres ? true : 1;
    const result = await run(
      `INSERT INTO users (name, email, password_hash, is_verified, verification_code)
       VALUES (?, ?, ?, ?, NULL)`,
      [name, email, passwordHash, verifiedVal]
    );

    const userId = result.lastInsertRowid;
    const userPayload = { id: userId, email, name };

    // Generate tokens
    const accessToken = signAccessToken(userPayload);
    const refreshToken = signRefreshToken(userPayload);

    // Save refresh token to DB & Set Cookie
    const { ip, ua } = getClientFingerprint(req);
    await saveRefreshToken(userId, refreshToken, ip, ua);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      message: 'Account created successfully.',
      token: accessToken,
      user: { id: userId, name, email, isVerified: true }
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /login ────────────────────────────────────────────────────────────

router.post('/login', authLimiter, loginValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await get(
      'SELECT id, name, email, password_hash, is_verified FROM users WHERE email = ?',
      [email]
    );
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last activity
    await run('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const userPayload = { id: user.id, email: user.email, name: user.name };

    // Generate tokens
    const accessToken = signAccessToken(userPayload);
    const refreshToken = signRefreshToken(userPayload);

    // Save refresh token to DB & Set Cookie
    const { ip, ua } = getClientFingerprint(req);
    await saveRefreshToken(user.id, refreshToken, ip, ua);
    setRefreshTokenCookie(res, refreshToken);

    const isVerified = db.isPostgres ? !!user.is_verified : user.is_verified === 1;

    return res.json({
      message: 'Login successful.',
      token: accessToken,
      user: { id: user.id, name: user.name, email: user.email, isVerified },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /verify ───────────────────────────────────────────────────────────

router.post('/verify', async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const user = await get(
      'SELECT id, is_verified, verification_code FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isVerified = db.isPostgres ? !!user.is_verified : user.is_verified === 1;
    if (isVerified) {
      return res.json({ message: 'Account is already verified.' });
    }

    if (user.verification_code !== code.trim()) {
      return res.status(400).json({ error: 'Invalid verification code. Please try again.' });
    }

    // Mark user as verified
    const verifiedVal = db.isPostgres ? true : 1;
    await run(
      'UPDATE users SET is_verified = ?, verification_code = NULL WHERE id = ?',
      [verifiedVal, user.id]
    );

    return res.json({ message: 'Email address verified successfully!' });
  } catch (err) {
    next(err);
  }
});

// ─── POST /refresh ──────────────────────────────────────────────────────────

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies.jid;
    if (!token) {
      return res.status(401).json({ error: 'Refresh token missing.' });
    }

    // Verify Refresh Token signature
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: 'Refresh token expired or invalid.' });
    }

    // Find token in DB (including revoked ones)
    const dbToken = await get(
      'SELECT id, user_id, expires_at, ip_address, user_agent, is_revoked FROM refresh_tokens WHERE token = ?',
      [token]
    );
    if (!dbToken) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: 'Refresh token revoked or inactive.' });
    }

    // 1. REPLAY / REUSE ATTACK DETECTION
    const isRevoked = db.isPostgres ? dbToken.is_revoked : dbToken.is_revoked === 1;
    if (isRevoked) {
      // Security Breach! Revoke all tokens for this user immediately.
      await run('DELETE FROM refresh_tokens WHERE user_id = ?', [dbToken.user_id]);
      clearRefreshTokenCookie(res);
      console.warn(`🚨 Security Breach: Revoked refresh token reuse detected for user ${dbToken.user_id}. All active sessions invalidated.`);
      return res.status(401).json({ error: 'Security breach detected. All active sessions invalidated. Please log in again.' });
    }

    // 2. CLIENT FINGERPRINT VALIDATION
    const { ip, ua } = getClientFingerprint(req);
    if (dbToken.ip_address !== ip || dbToken.user_agent !== ua) {
      // Potential session hijacking! Revoke this specific token.
      await run('DELETE FROM refresh_tokens WHERE id = ?', [dbToken.id]);
      clearRefreshTokenCookie(res);
      console.warn(`🚨 Security Alert: Fingerprint mismatch for user ${dbToken.user_id}. Expected IP: ${dbToken.ip_address}, UA: ${dbToken.user_agent}. Got IP: ${ip}, UA: ${ua}.`);
      return res.status(401).json({ error: 'Session verification failed. Please log in again.' });
    }

    // Verify DB Expiry
    const expiresAt = new Date(dbToken.expires_at);
    if (expiresAt < new Date()) {
      await run('DELETE FROM refresh_tokens WHERE id = ?', [dbToken.id]);
      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: 'Refresh token expired.' });
    }

    // Retrieve user info
    const user = await get(
      'SELECT id, name, email FROM users WHERE id = ?',
      [dbToken.user_id]
    );
    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: 'User associated with token not found.' });
    }

    const userPayload = { id: user.id, email: user.email, name: user.name };

    // Rotate Tokens: generate new access & refresh tokens
    const newAccessToken = signAccessToken(userPayload);
    const newRefreshToken = signRefreshToken(userPayload);

    // Mark old token as revoked instead of deleting (allows reuse detection for its expiry duration)
    const revokedVal = db.isPostgres ? true : 1;
    await run('UPDATE refresh_tokens SET is_revoked = ? WHERE id = ?', [revokedVal, dbToken.id]);

    // Save new token to DB & Set Cookie
    await saveRefreshToken(user.id, newRefreshToken, ip, ua);
    setRefreshTokenCookie(res, newRefreshToken);

    return res.json({
      token: newAccessToken
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /logout ───────────────────────────────────────────────────────────

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies.jid;
    if (token) {
      await run('DELETE FROM refresh_tokens WHERE token = ?', [token]);
    }
    clearRefreshTokenCookie(res);
    return res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
});

// ─── GET /profile ───────────────────────────────────────────────────────────

router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await get(
      'SELECT id, name, email, is_verified FROM users WHERE id = ?',
      [userId]
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isVerified = db.isPostgres ? !!user.is_verified : user.is_verified === 1;

    return res.json({
      user: { id: user.id, name: user.name, email: user.email, isVerified }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
