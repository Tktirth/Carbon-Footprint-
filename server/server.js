'use strict';

const dotenv = require('dotenv');
dotenv.config();

const path = require('path');
const fs = require('fs');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const { generalLimiter } = require('./src/middleware/rateLimiter');
const { errorHandler } = require('./src/middleware/errorHandler');
const { caseConverter } = require('./src/middleware/caseConverter');

// Route modules
const authRoutes = require('./src/routes/auth');
const assessmentRoutes = require('./src/routes/assessments');
const recommendationRoutes = require('./src/routes/recommendations');
const scoreRoutes = require('./src/routes/scores');
const progressRoutes = require('./src/routes/progress');
const dashboardRoutes = require('./src/routes/dashboard');
const assistantRoutes = require('./src/routes/assistant');

/**
 * Create and configure the Express application.
 * Exported separately from the listen() call so integration tests can
 * import the app without binding a port.
 *
 * @returns {import('express').Express}
 */
function createApp() {
  // Enforce strong secret configuration in production
  if (process.env.NODE_ENV === 'production') {
    const masterSecret = process.env.JWT_SECRET;
    if (!masterSecret || masterSecret === 'dev-secret-key-change-in-production') {
      throw new Error(
        'FATAL: A secure JWT_SECRET environment variable must be set in production mode! ' +
        'Optionally also set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET for explicit control.'
      );
    }
  }

  const app = express();

  // Enable trust proxy for express-rate-limit on Cloud Run
  app.set('trust proxy', 1);

  // ── Global middleware ───────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: [
          "'self'",
          "https://generativelanguage.googleapis.com",
          "http://localhost:3001",
          "http://localhost:5173",
          "ws://localhost:5173"
        ],
        imgSrc: ["'self'", "data:", "https://*.googleapis.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }));
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(caseConverter);
  app.use(compression());
  app.use(generalLimiter);

  // ── Health check ──────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── API routes ────────────────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/scores', scoreRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/assistant', assistantRoutes);

  // ── Serve static files ────────────────────────────────────────────────
  const publicPath = path.resolve(__dirname, 'public');
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, filePath) => {
        if (path.extname(filePath) === '.html') {
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
      }
    }));
    app.get('*', (req, res) => {
      // Don't intercept API requests
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Endpoint not found.' });
      }
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }

  // ── 404 catch-all ─────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
  });

  // ── Error handler (must be last) ──────────────────────────────────────
  app.use(errorHandler);

  return app;
}

// ── Start server (only when run directly, not when imported by tests) ─────
const app = createApp();

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🌍 Carbon Footprint API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = { app, createApp };
