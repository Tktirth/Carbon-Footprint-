'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { run, get } = require('../models/db');
const { signToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

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
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
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

// ─── POST /register ─────────────────────────────────────────────────────────

/**
 * Register a new user account.
 * Validates input, hashes password, creates user, returns JWT.
 */
router.post('/register', authLimiter, registerValidation, (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check for existing user
    const existing = get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password (cost factor 12)
    const passwordHash = bcrypt.hashSync(password, 12);

    const result = run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );

    const user = { id: result.lastInsertRowid, email, name };
    const token = signToken(user);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user.id, name, email },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /login ────────────────────────────────────────────────────────────

/**
 * Authenticate an existing user.
 * Validates credentials, returns JWT.
 */
router.post('/login', authLimiter, loginValidation, (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = get('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last activity
    run('UPDATE users SET updated_at = datetime(\'now\') WHERE id = ?', [user.id]);

    const token = signToken({ id: user.id, email: user.email, name: user.name });

    return res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

const { authenticateToken } = require('../middleware/auth');

// ─── GET /profile ───────────────────────────────────────────────────────────

/**
 * Get the current authenticated user's profile.
 */
router.get('/profile', authenticateToken, (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = get('SELECT id, name, email FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
