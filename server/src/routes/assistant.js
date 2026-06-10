'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { run, get, all } = require('../models/db');
const { processMessage } = require('../services/assistantEngine');

const router = express.Router();
router.use(authenticateToken);

// ─── GET /history — Retrieve persistent chat history ────────────────────────

/**
 * Return the last 50 chat messages for the authenticated user,
 * ordered oldest-first so the frontend can render them chronologically.
 */
router.get('/history', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const messages = await all(
      `SELECT role, content, created_at
       FROM chat_messages
       WHERE user_id = ?
       ORDER BY id DESC
       LIMIT 50`,
      [userId]
    );

    // Reverse to oldest-first for chat display
    return res.json({ messages: messages.reverse() });
  } catch (err) {
    next(err);
  }
});

// ─── POST /chat — Process a chat message ────────────────────────────────────

/**
 * Receive a message, persist it, load the user's latest assessment context,
 * load the last 8 messages from the database for conversation memory,
 * run it through the assistant engine, persist the AI reply, and return it.
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
    const { message } = req.body;

    // 1. Persist user message
    await run(
      'INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)',
      [userId, 'user', message]
    );

    // 2. Load conversation history from DB (last 8 messages for context)
    const dbHistory = await all(
      `SELECT role, content
       FROM chat_messages
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 8`,
      [userId]
    );
    const history = dbHistory.reverse(); // oldest-first

    // 3. Load user context
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

    // 4. Process through AI engine (with DB-sourced history)
    const response = await processMessage(message, userData, history);

    // 5. Persist assistant reply
    await run(
      'INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)',
      [userId, 'assistant', response.reply]
    );

    return res.json({
      reply: response.reply,
      suggestions: response.suggestions,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
