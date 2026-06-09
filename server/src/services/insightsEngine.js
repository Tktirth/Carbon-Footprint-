'use strict';

const { AVERAGES } = require('./scoringEngine');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * @param {number} n
 * @returns {number}
 */
function round(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Pretty-print a category key.
 * @param {string} key
 * @returns {string}
 */
function label(key) {
  const labels = {
    transport: 'Transport',
    energy: 'Energy',
    food: 'Food',
    consumption: 'Consumption',
    waste: 'Waste',
    water: 'Water',
  };
  return labels[key] || key;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate natural-language insights from a user's emissions breakdown and
 * sustainability scores.
 *
 * Returns:
 *   - `largestSource`  — the category contributing the most emissions
 *   - `comparison`     — how the user's total compares to the national average
 *   - `insights`       — 3–5 contextual, actionable insight strings
 *
 * @param {{
 *   annual: number,
 *   breakdown: { transport: number, energy: number, food: number, consumption: number, waste: number, water: number }
 * }} emissions
 * @param {{ transport: number, energy: number, food: number, consumption: number, waste: number }} scores
 * @returns {{
 *   largestSource: string,
 *   comparison: string,
 *   insights: string[]
 * }}
 */
function generateInsights(emissions, scores) {
  const { annual, breakdown } = emissions;
  const insights = [];

  // 1. Identify largest emission source
  const categories = Object.entries(breakdown);
  categories.sort((a, b) => b[1] - a[1]);
  const [largestKey, largestValue] = categories[0];
  const largestPct = round((largestValue / annual) * 100);
  const largestSource = label(largestKey);

  insights.push(
    `Your largest emission source is ${largestSource}, contributing ${round(largestValue)} kg CO₂/year (${largestPct}% of your total footprint).`
  );

  // 2. Compare to national/global average
  const totalAverage = AVERAGES.transport + AVERAGES.energy + AVERAGES.food + AVERAGES.consumption + AVERAGES.waste;
  const diffPct = round(((annual - totalAverage) / totalAverage) * 100);
  let comparison;
  if (diffPct > 10) {
    comparison = `above average`;
    insights.push(
      `Your annual footprint of ${round(annual)} kg CO₂ is ${Math.abs(diffPct)}% above the global average of ${totalAverage} kg. Reducing your top category could bring you closer to the mean.`
    );
  } else if (diffPct < -10) {
    comparison = `below average`;
    insights.push(
      `Great news! Your annual footprint of ${round(annual)} kg CO₂ is ${Math.abs(diffPct)}% below the global average of ${totalAverage} kg. Keep up the good work!`
    );
  } else {
    comparison = `near average`;
    insights.push(
      `Your annual footprint of ${round(annual)} kg CO₂ is close to the global average of ${totalAverage} kg. Small changes can make a big difference.`
    );
  }

  // 3. Biggest improvement opportunity (lowest score)
  const scoreEntries = Object.entries(scores);
  scoreEntries.sort((a, b) => a[1] - b[1]);
  const [weakKey, weakScore] = scoreEntries[0];
  const weakAvg = AVERAGES[weakKey] || 0;
  const weakEmission = breakdown[weakKey] || 0;

  if (weakScore < 50) {
    insights.push(
      `${label(weakKey)} is your biggest improvement opportunity (score: ${round(weakScore)}/100). You're at ${round(weakEmission)} kg vs. the ${round(weakAvg)} kg average. Focused changes here will have the largest impact on your overall score.`
    );
  }

  // 4. Category-specific contextual insights
  if (breakdown.transport > AVERAGES.transport) {
    insights.push(
      `Your transport emissions are ${round(breakdown.transport - AVERAGES.transport)} kg above the average. Consider carpooling, public transit, or reducing flights to close this gap.`
    );
  }

  if (breakdown.energy > AVERAGES.energy) {
    insights.push(
      `Your energy usage generates ${round(breakdown.energy)} kg CO₂/year, which is above average. An energy audit or switching to LED lighting could yield quick wins.`
    );
  }

  if (breakdown.food > 2500) {
    insights.push(
      `A high-meat diet contributes significantly to emissions. Even one meat-free day per week can reduce food-related CO₂ by ~15%.`
    );
  }

  if (breakdown.consumption > AVERAGES.consumption) {
    insights.push(
      `Your consumption footprint exceeds the average. Consolidating deliveries and buying second-hand can lower emissions while saving money.`
    );
  }

  // Cap at 5 insights
  const cappedInsights = insights.slice(0, 5);

  return {
    largestSource,
    comparison,
    insights: cappedInsights,
  };
}

module.exports = { generateInsights };
