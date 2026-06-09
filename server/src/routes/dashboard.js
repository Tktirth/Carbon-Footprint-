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
router.get('/summary', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // ── Latest assessment
    const assessment = await get(
      `SELECT id, annual_emissions_kg, monthly_emissions_kg, daily_emissions_kg,
              transport_emissions_kg, energy_emissions_kg, food_emissions_kg,
              consumption_emissions_kg, waste_emissions_kg, water_emissions_kg,
              vehicle_type, diet_type, created_at
       FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    // ── Latest score
    let score = null;
    let insights = null;
    if (assessment) {
      const rawScore = await get(
        `SELECT id, overall_score, transport_score, energy_score, food_score,
                consumption_score, waste_score, created_at
         FROM sustainability_scores WHERE assessment_id = ?`,
        [assessment.id]
      );
      if (rawScore) {
        score = {
          id: rawScore.id,
          overall_score: rawScore.overall_score,
          transport_score: rawScore.transport_score,
          energy_score: rawScore.energy_score,
          food_score: rawScore.food_score,
          consumption_score: rawScore.consumption_score,
          waste_score: rawScore.waste_score,
          created_at: rawScore.created_at,
          label: getScoreLabel(rawScore.overall_score),
        };

        const { generateInsights } = require('../services/insightsEngine');
        insights = generateInsights(
          {
            annual: assessment.annual_emissions_kg,
            breakdown: {
              transport: assessment.transport_emissions_kg,
              energy: assessment.energy_emissions_kg,
              food: assessment.food_emissions_kg,
              consumption: assessment.consumption_emissions_kg,
              waste: assessment.waste_emissions_kg,
              water: assessment.water_emissions_kg,
            },
          },
          {
            transport: rawScore.transport_score,
            energy: rawScore.energy_score,
            food: rawScore.food_score,
            consumption: rawScore.consumption_score,
            waste: rawScore.waste_score,
          }
        );
      }
    }

    // ── Top 5 recommendations from latest assessment
    let recommendations = [];
    if (assessment) {
      recommendations = await all(
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
    const rawTrends = await all(
      `SELECT a.id, a.annual_emissions_kg, a.created_at, s.overall_score
       FROM assessments a
       LEFT JOIN sustainability_scores s ON s.assessment_id = a.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC
       LIMIT 6`,
      [userId]
    );
    const trends = rawTrends.reverse(); // chronological order

    // ── Active goals
    const rawGoals = await all(
      'SELECT * FROM goals WHERE user_id = ? AND status = ? ORDER BY target_date ASC',
      [userId, 'active']
    );
    const goals = rawGoals.map((g) => ({
      ...g,
      progress_pct: g.target_reduction_kg > 0
        ? Math.min(100, Math.round((g.current_reduction_kg / g.target_reduction_kg) * 10000) / 100)
        : 0,
    }));

    // ── Completed recommendations count
    let completedRecs = 0;
    let totalRecs = 0;
    if (assessment) {
      const counts = await get(
        `SELECT COUNT(*) as total, SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
         FROM recommendations WHERE assessment_id = ?`,
        [assessment.id]
      );
      totalRecs = counts.total;
      completedRecs = counts.completed || 0;
    }

    const totalCountRes = await get('SELECT COUNT(*) as count FROM assessments WHERE user_id = ?', [userId]);

    return res.json({
      assessment: assessment || null,
      score,
      recommendations,
      trends,
      goals,
      insights,
      stats: {
        total_assessments: totalCountRes.count,
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
