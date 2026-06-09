'use strict';

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { run, get, all } = require('../models/db');
const { calculateTotalEmissions } = require('../services/carbonCalculator');
const { calculateCategoryScores, calculateOverallScore } = require('../services/scoringEngine');
const { generateRecommendations } = require('../services/recommendationEngine');
const { generateInsights } = require('../services/insightsEngine');

const router = express.Router();

// All assessment routes require authentication
router.use(authenticateToken);

// ─── Validation rules ───────────────────────────────────────────────────────

const assessmentValidation = [
  body('vehicle_type')
    .optional()
    .isIn(['car_petrol', 'car_diesel', 'car_electric', 'motorcycle', 'none'])
    .withMessage('vehicle_type must be one of: car_petrol, car_diesel, car_electric, motorcycle, none'),
  body('travel_km_per_week')
    .optional()
    .isFloat({ min: 0, max: 10000 }).withMessage('travel_km_per_week must be 0–10000'),
  body('public_transport_km_per_week')
    .optional()
    .isFloat({ min: 0, max: 5000 }).withMessage('public_transport_km_per_week must be 0–5000'),
  body('flights_per_year')
    .optional()
    .isInt({ min: 0, max: 200 }).withMessage('flights_per_year must be 0–200'),
  body('electricity_kwh_per_month')
    .optional()
    .isFloat({ min: 0, max: 50000 }).withMessage('electricity_kwh_per_month must be 0–50000'),
  body('ac_hours_per_day')
    .optional()
    .isFloat({ min: 0, max: 24 }).withMessage('ac_hours_per_day must be 0–24'),
  body('appliance_usage')
    .optional()
    .isIn(['low', 'moderate', 'high']).withMessage('appliance_usage must be one of: low, moderate, high'),
  body('diet_type')
    .optional()
    .isIn(['vegan', 'vegetarian', 'mixed', 'high_meat']).withMessage('diet_type must be one of: vegan, vegetarian, mixed, high_meat'),
  body('online_orders_per_month')
    .optional()
    .isInt({ min: 0, max: 500 }).withMessage('online_orders_per_month must be 0–500'),
  body('clothing_items_per_month')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('clothing_items_per_month must be 0–100'),
  body('electronics_per_year')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('electronics_per_year must be 0–100'),
  body('recycling_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('recycling_percentage must be 0–100'),
  body('waste_bags_per_week')
    .optional()
    .isFloat({ min: 0, max: 50 }).withMessage('waste_bags_per_week must be 0–50'),
  body('water_liters_per_day')
    .optional()
    .isFloat({ min: 0, max: 10000 }).withMessage('water_liters_per_day must be 0–10000'),
];

// ─── POST / — Create assessment ─────────────────────────────────────────────

router.post('/', assessmentValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;

    // Build assessment data with defaults
    const data = {
      vehicle_type: req.body.vehicle_type || 'none',
      travel_km_per_week: Number(req.body.travel_km_per_week) || 0,
      public_transport_km_per_week: Number(req.body.public_transport_km_per_week) || 0,
      flights_per_year: Number(req.body.flights_per_year) || 0,
      electricity_kwh_per_month: Number(req.body.electricity_kwh_per_month) || 0,
      ac_hours_per_day: Number(req.body.ac_hours_per_day) || 0,
      appliance_usage: req.body.appliance_usage || 'moderate',
      diet_type: req.body.diet_type || 'mixed',
      online_orders_per_month: Number(req.body.online_orders_per_month) || 0,
      clothing_items_per_month: Number(req.body.clothing_items_per_month) || 0,
      electronics_per_year: Number(req.body.electronics_per_year) || 0,
      recycling_percentage: Number(req.body.recycling_percentage) || 0,
      waste_bags_per_week: Number(req.body.waste_bags_per_week) || 0,
      water_liters_per_day: Number(req.body.water_liters_per_day) || 0,
    };

    // 1. Calculate emissions
    const emissions = calculateTotalEmissions(data);

    // 2. Calculate scores
    const categoryScores = calculateCategoryScores(emissions.breakdown);
    const overallScore = calculateOverallScore(categoryScores);

    // 3. Generate recommendations
    const recs = generateRecommendations(data, emissions);

    // 4. Generate insights
    const insights = generateInsights(emissions, categoryScores);

    // 5. Persist assessment
    const assessmentResult = await run(
      `INSERT INTO assessments
        (user_id, vehicle_type, travel_km_per_week, public_transport_km_per_week, flights_per_year,
         electricity_kwh_per_month, ac_hours_per_day, appliance_usage, diet_type,
         online_orders_per_month, clothing_items_per_month, electronics_per_year,
         recycling_percentage, waste_bags_per_week, water_liters_per_day,
         daily_emissions_kg, monthly_emissions_kg, annual_emissions_kg,
         transport_emissions_kg, energy_emissions_kg, food_emissions_kg,
         consumption_emissions_kg, waste_emissions_kg, water_emissions_kg)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, data.vehicle_type, data.travel_km_per_week, data.public_transport_km_per_week,
        data.flights_per_year, data.electricity_kwh_per_month, data.ac_hours_per_day,
        data.appliance_usage, data.diet_type, data.online_orders_per_month,
        data.clothing_items_per_month, data.electronics_per_year, data.recycling_percentage,
        data.waste_bags_per_week, data.water_liters_per_day,
        emissions.daily, emissions.monthly, emissions.annual,
        emissions.breakdown.transport, emissions.breakdown.energy, emissions.breakdown.food,
        emissions.breakdown.consumption, emissions.breakdown.waste, emissions.breakdown.water,
      ]
    );

    const assessmentId = assessmentResult.lastInsertRowid;

    // 6. Persist score
    await run(
      `INSERT INTO sustainability_scores
        (user_id, assessment_id, overall_score, transport_score, energy_score, food_score, consumption_score, waste_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, assessmentId, overallScore, categoryScores.transport, categoryScores.energy, categoryScores.food, categoryScores.consumption, categoryScores.waste]
    );

    // 7. Persist recommendations in parallel to optimize remote DB roundtrip latency
    await Promise.all(recs.map((rec) =>
      run(
        `INSERT INTO recommendations
          (user_id, assessment_id, category, title, description, co2_reduction_kg, difficulty, financial_impact, annual_savings_usd, priority)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, assessmentId, rec.category, rec.title, rec.description, rec.co2_reduction_kg, rec.difficulty, rec.financial_impact, rec.annual_savings_usd, rec.priority]
      )
    ));

    // 8. Record progress history entry
    const now = new Date().toISOString().slice(0, 10);
    await run(
      `INSERT INTO progress_history (user_id, period_type, period_start, period_end, total_emissions_kg, score)
       VALUES (?, 'monthly', ?, ?, ?, ?)`,
      [userId, now, now, emissions.annual, overallScore]
    );

    return res.status(201).json({
      assessment: {
        id: assessmentId,
        ...data,
      },
      emissions,
      scores: {
        overall: overallScore,
        categories: categoryScores,
      },
      recommendations: recs,
      insights,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET / — List all assessments (paginated) ───────────────────────────────

router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
], async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;

    const total = await get('SELECT COUNT(*) as count FROM assessments WHERE user_id = ?', [userId]);
    const assessments = await all(
      'SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );

    return res.json({
      assessments,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /latest — Most recent assessment with scores & recommendations ─────

router.get('/latest', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const assessment = await get(
      'SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (!assessment) {
      return res.status(404).json({ error: 'No assessments found. Submit one first.' });
    }

    const scores = await get(
      'SELECT * FROM sustainability_scores WHERE assessment_id = ?',
      [assessment.id]
    );

    const recommendations = await all(
      'SELECT * FROM recommendations WHERE assessment_id = ? ORDER BY (co2_reduction_kg * priority) DESC',
      [assessment.id]
    );

    return res.json({
      assessment,
      scores,
      recommendations,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
