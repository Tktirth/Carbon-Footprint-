'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { get } = require('../models/db');
const { processMessage } = require('../services/assistantEngine');

const router = express.Router();
router.use(authenticateToken);

// ─── POST /chat — Process a chat message ────────────────────────────────────

/**
 * Receive a message, load the user's latest assessment context, run it through
 * the assistant engine, and return the reply with follow-up suggestions.
 */
router.post('/chat', [
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required.')
    .isLength({ max: 1000 }).withMessage('Message must be under 1000 characters.'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { message, history } = req.body;

    // Load user context
    let userData = null;

    const assessment = await get(
      'SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (assessment) {
      const scores = await get(
        'SELECT * FROM sustainability_scores WHERE assessment_id = ?',
        [assessment.id]
      );

      userData = {
        assessment,
        scores,
        emissions: {
          daily: assessment.daily_emissions_kg,
          monthly: assessment.monthly_emissions_kg,
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
      };
    }

    const response = await processMessage(message, userData, history);

    return res.json({
      reply: response.reply,
      suggestions: response.suggestions,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
