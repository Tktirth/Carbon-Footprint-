'use strict';

const express = require('express');
const { query, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { get, all, run } = require('../models/db');
const { invalidateDashboardCache, invalidateLeaderboardCache } = require('../services/cacheService');

const router = express.Router();
router.use(authenticateToken);

// ─── GET / — List recommendations ──────────────────────────────────────────

/**
 * Retrieve the user's recommendations, optionally filtered by assessment_id.
 * Sorted by impact (co2_reduction_kg × priority) descending.
 */
router.get('/', [
  query('assessment_id').optional().isInt({ min: 1 }).toInt(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const assessmentId = req.query.assessment_id;

    let recommendations;
    if (assessmentId) {
      recommendations = await all(
        `SELECT * FROM recommendations
         WHERE user_id = ? AND assessment_id = ?
         ORDER BY (co2_reduction_kg * priority) DESC`,
        [userId, assessmentId]
      );
    } else {
      // Get recommendations from latest assessment
      const latest = await get(
        'SELECT id FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      if (!latest) {
        return res.json({ recommendations: [] });
      }
      recommendations = await all(
        `SELECT * FROM recommendations
         WHERE user_id = ? AND assessment_id = ?
         ORDER BY (co2_reduction_kg * priority) DESC`,
        [userId, latest.id]
      );
    }

    return res.json({ recommendations });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /:id/complete — Mark recommendation as completed ─────────────────

/**
 * Toggle the is_completed flag on a recommendation owned by the current user.
 */
router.patch('/:id/complete', [
  param('id').isInt({ min: 1 }).toInt(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const recId = req.params.id;

    const rec = await get('SELECT * FROM recommendations WHERE id = ? AND user_id = ?', [recId, userId]);
    if (!rec) {
      return res.status(404).json({ error: 'Recommendation not found.' });
    }

    const newStatus = rec.is_completed ? 0 : 1;
    await run('UPDATE recommendations SET is_completed = ? WHERE id = ?', [newStatus, recId]);

    // Invalidate caches since database state has changed
    invalidateDashboardCache(userId);
    invalidateLeaderboardCache();

    return res.json({
      message: newStatus ? 'Recommendation marked as completed.' : 'Recommendation marked as incomplete.',
      recommendation: { ...rec, is_completed: newStatus },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
