'use strict';

// ─── National / Global Average Emissions (kg CO₂ / year) ────────────────────
const AVERAGES = {
  transport: 4600,
  energy: 4500,
  food: 2500,
  consumption: 1500,
  waste: 700,
};

// ─── Weights for overall score ──────────────────────────────────────────────
const WEIGHTS = {
  transport: 0.30,
  energy: 0.25,
  food: 0.20,
  consumption: 0.15,
  waste: 0.10,
};

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Compute a 0–100 sustainability score for each emission category.
 *
 * Formula: score = max(0, min(100, 100 – (user / average × 50)))
 *   - At the average → 50
 *   - Below average (better) → higher score
 *   - Above average (worse) → lower score
 *
 * @param {{ transport: number, energy: number, food: number, consumption: number, waste: number }} breakdown
 * @returns {{ transport: number, energy: number, food: number, consumption: number, waste: number }}
 */
function calculateCategoryScores(breakdown) {
  return {
    transport: categoryScore(breakdown.transport, AVERAGES.transport),
    energy: categoryScore(breakdown.energy, AVERAGES.energy),
    food: categoryScore(breakdown.food, AVERAGES.food),
    consumption: categoryScore(breakdown.consumption, AVERAGES.consumption),
    waste: categoryScore(breakdown.waste, AVERAGES.waste),
  };
}

/**
 * Compute the weighted overall sustainability score.
 *
 * @param {{ transport: number, energy: number, food: number, consumption: number, waste: number }} scores
 * @returns {number} 0–100
 */
function calculateOverallScore(scores) {
  const overall =
    scores.transport * WEIGHTS.transport +
    scores.energy * WEIGHTS.energy +
    scores.food * WEIGHTS.food +
    scores.consumption * WEIGHTS.consumption +
    scores.waste * WEIGHTS.waste;

  return round(overall);
}

/**
 * Map a numeric score to a human-readable label.
 *
 * @param {number} score — 0–100
 * @returns {'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor'}
 */
function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  if (score >= 20) return 'Below Average';
  return 'Poor';
}

/**
 * Generate a short explanation paragraph summarising the user's performance
 * relative to global averages.
 *
 * @param {number} score — overall 0–100
 * @param {{ transport: number, energy: number, food: number, consumption: number, waste: number }} categoryScores
 * @returns {string}
 */
function getScoreExplanation(score, categoryScores) {
  const label = getScoreLabel(score);

  // Identify weakest and strongest categories
  const entries = Object.entries(categoryScores);
  entries.sort((a, b) => a[1] - b[1]);
  const weakest = entries[0];
  const strongest = entries[entries.length - 1];

  const weakLabel = formatCategoryName(weakest[0]);
  const strongLabel = formatCategoryName(strongest[0]);

  let explanation = `Your overall sustainability score is ${round(score)} out of 100 (${label}). `;

  if (score >= 80) {
    explanation += `Excellent work! You are well below the global average footprint. `;
  } else if (score >= 60) {
    explanation += `Good job! Your footprint is below the global average in most areas. `;
  } else if (score >= 40) {
    explanation += `You are close to the global average. There is room for improvement. `;
  } else if (score >= 20) {
    explanation += `Your footprint is above the global average in several areas. Consider making some changes. `;
  } else {
    explanation += `Your footprint is significantly above the global average. Immediate action is recommended. `;
  }

  explanation += `Your strongest area is ${strongLabel} (score: ${round(strongest[1])}), `;
  explanation += `while ${weakLabel} (score: ${round(weakest[1])}) offers the biggest opportunity for improvement.`;

  return explanation;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * @param {number} userEmissions
 * @param {number} average
 * @returns {number}
 */
function categoryScore(userEmissions, average) {
  if (average === 0) return 100;
  return round(Math.max(0, Math.min(100, 100 - (userEmissions / average) * 50)));
}

/**
 * @param {string} key — e.g. 'transport'
 * @returns {string} — e.g. 'Transport'
 */
function formatCategoryName(key) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * Round to two decimal places.
 * @param {number} n
 * @returns {number}
 */
function round(n) {
  return Math.round(n * 100) / 100;
}

module.exports = {
  calculateCategoryScores,
  calculateOverallScore,
  getScoreLabel,
  getScoreExplanation,
  AVERAGES,
  WEIGHTS,
};
