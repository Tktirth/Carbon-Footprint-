'use strict';

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
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
  const app = express();

  // ── Global middleware ───────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(caseConverter);
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
