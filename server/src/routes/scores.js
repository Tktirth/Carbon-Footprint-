'use strict';

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { get, all } = require('../models/db');
const { getScoreLabel, getScoreExplanation } = require('../services/scoringEngine');

const router = express.Router();
router.use(authenticateToken);

// ─── GET /latest — Latest sustainability score ──────────────────────────────

/**
 * Return the user's most recent sustainability score with label and explanation.
 */
router.get('/latest', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const score = await get(
      `SELECT s.*, a.annual_emissions_kg
       FROM sustainability_scores s
       JOIN assessments a ON a.id = s.assessment_id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (!score) {
      return res.status(404).json({ error: 'No scores found. Submit an assessment first.' });
    }

    const categoryScores = {
      transport: score.transport_score,
      energy: score.energy_score,
      food: score.food_score,
      consumption: score.consumption_score,
      waste: score.waste_score,
    };

    const label = getScoreLabel(score.overall_score);
    const explanation = getScoreExplanation(score.overall_score, categoryScores);

    return res.json({
      score: {
        overall: score.overall_score,
        categories: categoryScores,
        label,
        explanation,
        annual_emissions_kg: score.annual_emissions_kg,
        assessment_id: score.assessment_id,
        created_at: score.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /history — Score history ───────────────────────────────────────────

/**
 * Return all sustainability scores for the user, ordered chronologically.
 */
router.get('/history', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const scores = await all(
      `SELECT s.id, s.assessment_id, s.overall_score, s.transport_score, s.energy_score,
              s.food_score, s.consumption_score, s.waste_score, s.created_at,
              a.annual_emissions_kg
       FROM sustainability_scores s
       JOIN assessments a ON a.id = s.assessment_id
       WHERE s.user_id = ?
       ORDER BY s.created_at ASC`,
      [userId]
    );

    return res.json({
      scores: scores.map((s) => ({
        id: s.id,
        assessment_id: s.assessment_id,
        overall: s.overall_score,
        categories: {
          transport: s.transport_score,
          energy: s.energy_score,
          food: s.food_score,
          consumption: s.consumption_score,
          waste: s.waste_score,
        },
        label: getScoreLabel(s.overall_score),
        annual_emissions_kg: s.annual_emissions_kg,
        created_at: s.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
