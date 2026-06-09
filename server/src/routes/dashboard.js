'use strict';

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { get, all } = require('../models/db');
const { getScoreLabel } = require('../services/scoringEngine');

const router = express.Router();
router.use(authenticateToken);

// ─── GET /summary — Dashboard aggregate ────────────────────────────────────

/**
 * Return a single aggregated response containing:
 * - Latest assessment summary
 * - Latest sustainability score
 * - Top 5 recommendations (by impact)
 * - Recent emission trends (last 6 assessments)
 * - Active goals
 */
router.get('/summary', (req, res, next) => {
  try {
    const userId = req.user.id;

    // ── Latest assessment
    const assessment = get(
      `SELECT id, annual_emissions_kg, monthly_emissions_kg, daily_emissions_kg,
              transport_emissions_kg, energy_emissions_kg, food_emissions_kg,
              consumption_emissions_kg, waste_emissions_kg, water_emissions_kg,
              vehicle_type, diet_type, created_at
       FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    // ── Latest score
    let score = null;
    if (assessment) {
      const rawScore = get(
        `SELECT overall_score, transport_score, energy_score, food_score,
                consumption_score, waste_score, created_at
         FROM sustainability_scores WHERE assessment_id = ?`,
        [assessment.id]
      );
      if (rawScore) {
        score = {
          overall: rawScore.overall_score,
          label: getScoreLabel(rawScore.overall_score),
          categories: {
            transport: rawScore.transport_score,
            energy: rawScore.energy_score,
            food: rawScore.food_score,
            consumption: rawScore.consumption_score,
            waste: rawScore.waste_score,
          },
          created_at: rawScore.created_at,
        };
      }
    }

    // ── Top 5 recommendations from latest assessment
    let recommendations = [];
    if (assessment) {
      recommendations = all(
        `SELECT id, category, title, description, co2_reduction_kg, difficulty,
                financial_impact, annual_savings_usd, priority, is_completed
         FROM recommendations
         WHERE assessment_id = ?
         ORDER BY (co2_reduction_kg * priority) DESC
         LIMIT 5`,
        [assessment.id]
      );
    }

    // ── Recent trends (last 6 assessments)
    const trends = all(
      `SELECT a.id, a.annual_emissions_kg, a.created_at, s.overall_score
       FROM assessments a
       LEFT JOIN sustainability_scores s ON s.assessment_id = a.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC
       LIMIT 6`,
      [userId]
    ).reverse(); // chronological order

    // ── Active goals
    const goals = all(
      'SELECT * FROM goals WHERE user_id = ? AND status = ? ORDER BY target_date ASC',
      [userId, 'active']
    ).map((g) => ({
      ...g,
      progress_pct: g.target_reduction_kg > 0
        ? Math.min(100, Math.round((g.current_reduction_kg / g.target_reduction_kg) * 10000) / 100)
        : 0,
    }));

    // ── Completed recommendations count
    let completedRecs = 0;
    let totalRecs = 0;
    if (assessment) {
      const counts = get(
        `SELECT COUNT(*) as total, SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
         FROM recommendations WHERE assessment_id = ?`,
        [assessment.id]
      );
      totalRecs = counts.total;
      completedRecs = counts.completed || 0;
    }

    return res.json({
      assessment: assessment || null,
      score,
      recommendations,
      trends,
      goals,
      stats: {
        total_assessments: get('SELECT COUNT(*) as c FROM assessments WHERE user_id = ?', [userId]).c,
        completed_recommendations: completedRecs,
        total_recommendations: totalRecs,
        active_goals: goals.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
