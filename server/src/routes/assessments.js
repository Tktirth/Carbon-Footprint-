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

// ─── POST /latest/plan — Generate AI Sustainability Action Plan ─────────────

/**
 * Uses Gemini (or structured fallback) to generate a comprehensive, personalised
 * Markdown-formatted Sustainability Action Plan based on the user's latest
 * assessment, scores, and recommendations. Saves the result to the
 * sustainability_plans table for future retrieval.
 */
router.post('/latest/plan', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Load latest assessment
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

    let planText = '';

    // Try Gemini first
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const topRecs = recommendations.slice(0, 5).map(
          (r, i) => `${i + 1}. [${r.category}] ${r.title} — saves ${r.co2_reduction_kg} kg CO₂/yr (${r.difficulty} difficulty)`
        ).join('\n');

        const prompt = `You are a sustainability expert. Create a comprehensive, actionable Sustainability Action Plan for a user with these carbon footprint metrics:

EMISSIONS:
- Daily: ${assessment.daily_emissions_kg} kg CO₂
- Monthly: ${assessment.monthly_emissions_kg} kg CO₂
- Annual: ${assessment.annual_emissions_kg} kg CO₂
- Transport: ${assessment.transport_emissions_kg} kg/yr
- Energy: ${assessment.energy_emissions_kg} kg/yr
- Food: ${assessment.food_emissions_kg} kg/yr
- Consumption: ${assessment.consumption_emissions_kg} kg/yr
- Waste: ${assessment.waste_emissions_kg} kg/yr
- Water: ${assessment.water_emissions_kg} kg/yr

SUSTAINABILITY SCORES (0-100, higher is better):
- Overall: ${scores?.overall_score || 'N/A'}
- Transport: ${scores?.transport_score || 'N/A'}
- Energy: ${scores?.energy_score || 'N/A'}
- Food: ${scores?.food_score || 'N/A'}
- Consumption: ${scores?.consumption_score || 'N/A'}
- Waste: ${scores?.waste_score || 'N/A'}

TOP RECOMMENDED ACTIONS:
${topRecs}

USER HABITS:
- Vehicle: ${assessment.vehicle_type}, ${assessment.travel_km_per_week} km/week
- Diet: ${assessment.diet_type}
- Electricity: ${assessment.electricity_kwh_per_month} kWh/month
- AC: ${assessment.ac_hours_per_day} hrs/day
- Online orders: ${assessment.online_orders_per_month}/month
- Recycling: ${assessment.recycling_percentage}%

Format the plan in Markdown with these sections:
1. **Executive Summary** — 2-3 sentence overview of the user's footprint status
2. **30-Day Quick Wins** — 3-4 immediate, easy actions with estimated impact
3. **90-Day Transformation Plan** — 4-5 medium-term changes with timelines
4. **Long-Term Sustainability Goals** — 2-3 ambitious annual targets
5. **Estimated Impact** — projected total CO₂ reduction if all actions are completed

Keep the plan under 500 words, practical, and motivating. Use emoji sparingly for visual appeal.`;

        const result = await model.generateContent(prompt);
        planText = result.response.text().trim();
      } catch (err) {
        console.error('❌ Gemini plan generation failed, using structured fallback:', err.message);
      }
    }

    // Structured fallback if Gemini unavailable or failed
    if (!planText) {
      const topCat = ['transport', 'energy', 'food', 'consumption', 'waste']
        .map(c => ({
          name: c,
          emissions: assessment[`${c}_emissions_kg`] || 0,
          score: scores?.[`${c}_score`] || 50,
        }))
        .sort((a, b) => b.emissions - a.emissions);

      const worstCategory = topCat[0];
      const totalReduction = recommendations
        .slice(0, 5)
        .reduce((sum, r) => sum + r.co2_reduction_kg, 0);

      planText = `# 🌍 Your Sustainability Action Plan

## Executive Summary
Your annual carbon footprint is **${Math.round(assessment.annual_emissions_kg).toLocaleString()} kg CO₂** (${Math.round(assessment.daily_emissions_kg)} kg/day). Your biggest emission source is **${worstCategory.name}** at ${Math.round(worstCategory.emissions)} kg/year. Your overall sustainability score is **${scores?.overall_score || 'N/A'}/100**.

## 🚀 30-Day Quick Wins
${recommendations.slice(0, 3).map((r, i) => `${i + 1}. **${r.title}** — ${r.description} *(saves ${r.co2_reduction_kg} kg CO₂/yr)*`).join('\n')}

## 📈 90-Day Transformation Plan
${recommendations.slice(0, 5).map((r, i) => `${i + 1}. **[${r.category.toUpperCase()}]** ${r.title} — ${r.difficulty} difficulty, saves $${r.annual_savings_usd}/yr`).join('\n')}

## 🎯 Long-Term Goals
1. Reduce annual emissions by **${Math.round(totalReduction)} kg CO₂** (${Math.round((totalReduction / assessment.annual_emissions_kg) * 100)}% reduction)
2. Achieve an overall sustainability score above **75/100**
3. Maintain recycling rate above **60%**

## 📊 Estimated Impact
If you complete all recommended actions, you could save approximately **${Math.round(totalReduction)} kg CO₂ per year** — equivalent to planting ${Math.round(totalReduction / 22)} trees! 🌳`;
    }

    // Save plan to database
    await run(
      'INSERT INTO sustainability_plans (user_id, assessment_id, plan_text) VALUES (?, ?, ?)',
      [userId, assessment.id, planText]
    );

    return res.status(201).json({ plan: planText });
  } catch (err) {
    next(err);
  }
});

// ─── GET /latest/plan — Retrieve latest saved Action Plan ───────────────────

/**
 * Return the most recently generated sustainability action plan for the user.
 */
router.get('/latest/plan', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const plan = await get(
      'SELECT plan_text, created_at FROM sustainability_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (!plan) {
      return res.status(404).json({ error: 'No action plan found. Generate one first.' });
    }

    return res.json({ plan: plan.plan_text, createdAt: plan.created_at });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
