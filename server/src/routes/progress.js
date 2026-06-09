'use strict';

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { run, get, all } = require('../models/db');

const router = express.Router();
router.use(authenticateToken);

// ─── GET /trends — Emission trends ──────────────────────────────────────────

/**
 * Return emission and score trends built from assessments and progress_history.
 * Each data point contains the assessment date, annual emissions, and score.
 */
router.get('/trends', (req, res, next) => {
  try {
    const userId = req.user.id;

    // Assessment-based timeline
    const assessments = all(
      `SELECT a.id, a.annual_emissions_kg, a.transport_emissions_kg, a.energy_emissions_kg,
              a.food_emissions_kg, a.consumption_emissions_kg, a.waste_emissions_kg,
              a.water_emissions_kg, a.created_at,
              s.overall_score
       FROM assessments a
       LEFT JOIN sustainability_scores s ON s.assessment_id = a.id
       WHERE a.user_id = ?
       ORDER BY a.created_at ASC`,
      [userId]
    );

    // Progress history entries
    const history = all(
      `SELECT * FROM progress_history
       WHERE user_id = ?
       ORDER BY period_start ASC`,
      [userId]
    );

    // Compute deltas between consecutive assessments
    const trends = assessments.map((a, idx) => {
      const prev = idx > 0 ? assessments[idx - 1] : null;
      const delta = prev ? Math.round((a.annual_emissions_kg - prev.annual_emissions_kg) * 100) / 100 : 0;
      const deltaPct = prev && prev.annual_emissions_kg > 0
        ? Math.round(((a.annual_emissions_kg - prev.annual_emissions_kg) / prev.annual_emissions_kg) * 10000) / 100
        : 0;

      return {
        assessment_id: a.id,
        date: a.created_at,
        annual_emissions_kg: a.annual_emissions_kg,
        overall_score: a.overall_score,
        breakdown: {
          transport: a.transport_emissions_kg,
          energy: a.energy_emissions_kg,
          food: a.food_emissions_kg,
          consumption: a.consumption_emissions_kg,
          waste: a.waste_emissions_kg,
          water: a.water_emissions_kg,
        },
        change: { absolute_kg: delta, percentage: deltaPct },
      };
    });

    return res.json({ trends, history });
  } catch (err) {
    next(err);
  }
});

// ─── GET /goals — List user goals ───────────────────────────────────────────

router.get('/goals', (req, res, next) => {
  try {
    const userId = req.user.id;
    const goals = all(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Compute progress percentage for each goal
    const enriched = goals.map((g) => ({
      ...g,
      progress_pct: g.target_reduction_kg > 0
        ? Math.min(100, Math.round((g.current_reduction_kg / g.target_reduction_kg) * 10000) / 100)
        : 0,
    }));

    return res.json({ goals: enriched });
  } catch (err) {
    next(err);
  }
});

// ─── POST /goals — Create a goal ────────────────────────────────────────────

router.post('/goals', [
  body('title').trim().notEmpty().withMessage('Title is required.')
    .isLength({ max: 200 }).withMessage('Title max 200 chars.'),
  body('target_reduction_kg')
    .isFloat({ min: 0.1 }).withMessage('target_reduction_kg must be a positive number.'),
  body('target_date')
    .isISO8601().withMessage('target_date must be a valid ISO 8601 date.'),
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { title, target_reduction_kg, target_date } = req.body;

    const result = run(
      `INSERT INTO goals (user_id, title, target_reduction_kg, target_date)
       VALUES (?, ?, ?, ?)`,
      [userId, title, target_reduction_kg, target_date]
    );

    const goal = get('SELECT * FROM goals WHERE id = ?', [result.lastInsertRowid]);

    return res.status(201).json({
      message: 'Goal created successfully.',
      goal: {
        ...goal,
        progress_pct: 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /goals/:id — Update a goal ───────────────────────────────────────

router.patch('/goals/:id', [
  param('id').isInt({ min: 1 }).toInt(),
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('target_reduction_kg').optional().isFloat({ min: 0.1 }),
  body('current_reduction_kg').optional().isFloat({ min: 0 }),
  body('target_date').optional().isISO8601(),
  body('status').optional().isIn(['active', 'completed', 'cancelled']),
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const goalId = req.params.id;

    const existing = get('SELECT * FROM goals WHERE id = ? AND user_id = ?', [goalId, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    // Build dynamic update
    const fields = [];
    const values = [];
    const allowedFields = ['title', 'target_reduction_kg', 'current_reduction_kg', 'target_date', 'status'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    values.push(goalId);
    run(`UPDATE goals SET ${fields.join(', ')} WHERE id = ?`, values);

    const updated = get('SELECT * FROM goals WHERE id = ?', [goalId]);
    const progressPct = updated.target_reduction_kg > 0
      ? Math.min(100, Math.round((updated.current_reduction_kg / updated.target_reduction_kg) * 10000) / 100)
      : 0;

    // Auto-complete if target reached
    if (progressPct >= 100 && updated.status === 'active') {
      run('UPDATE goals SET status = ? WHERE id = ?', ['completed', goalId]);
      updated.status = 'completed';
    }

    return res.json({
      message: 'Goal updated successfully.',
      goal: { ...updated, progress_pct: progressPct },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
