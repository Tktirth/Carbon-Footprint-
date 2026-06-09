const { describe, it, expect } = globalThis;
const {
  calculateCategoryScores,
  calculateOverallScore,
  getScoreLabel,
  getScoreExplanation,
  AVERAGES,
  WEIGHTS,
} = require('../src/services/scoringEngine');

describe('scoringEngine', () => {
  // ── Category Scores ───────────────────────────────────────────────────────

  describe('calculateCategoryScores', () => {
    it('scores 50 when emissions equal the average', () => {
      const scores = calculateCategoryScores({
        transport: AVERAGES.transport,
        energy: AVERAGES.energy,
        food: AVERAGES.food,
        consumption: AVERAGES.consumption,
        waste: AVERAGES.waste,
      });

      expect(scores.transport).toBe(50);
      expect(scores.energy).toBe(50);
      expect(scores.food).toBe(50);
      expect(scores.consumption).toBe(50);
      expect(scores.waste).toBe(50);
    });

    it('scores higher when emissions are below average', () => {
      const scores = calculateCategoryScores({
        transport: 2300, // half of average 4600
        energy: 2250,
        food: 1250,
        consumption: 750,
        waste: 350,
      });

      expect(scores.transport).toBe(75);
      expect(scores.energy).toBe(75);
      expect(scores.food).toBe(75);
      expect(scores.consumption).toBe(75);
      expect(scores.waste).toBe(75);
    });

    it('scores 0 when emissions are at or above 2x average', () => {
      const scores = calculateCategoryScores({
        transport: 9200, // 2x average
        energy: 9000,
        food: 5000,
        consumption: 3000,
        waste: 1400,
      });

      expect(scores.transport).toBe(0);
      expect(scores.energy).toBe(0);
      expect(scores.food).toBe(0);
      expect(scores.consumption).toBe(0);
      expect(scores.waste).toBe(0);
    });

    it('scores 100 for zero emissions', () => {
      const scores = calculateCategoryScores({
        transport: 0,
        energy: 0,
        food: 0,
        consumption: 0,
        waste: 0,
      });

      expect(scores.transport).toBe(100);
      expect(scores.energy).toBe(100);
      expect(scores.food).toBe(100);
      expect(scores.consumption).toBe(100);
      expect(scores.waste).toBe(100);
    });
  });

  // ── Overall Score ─────────────────────────────────────────────────────────

  describe('calculateOverallScore', () => {
    it('returns 50 when all category scores are 50', () => {
      const overall = calculateOverallScore({
        transport: 50,
        energy: 50,
        food: 50,
        consumption: 50,
        waste: 50,
      });
      expect(overall).toBe(50);
    });

    it('applies correct weights', () => {
      const overall = calculateOverallScore({
        transport: 100, // * 0.30 = 30
        energy: 0,      // * 0.25 = 0
        food: 0,         // * 0.20 = 0
        consumption: 0,  // * 0.15 = 0
        waste: 0,        // * 0.10 = 0
      });
      expect(overall).toBe(30);
    });

    it('returns 100 when all scores are 100', () => {
      const overall = calculateOverallScore({
        transport: 100,
        energy: 100,
        food: 100,
        consumption: 100,
        waste: 100,
      });
      expect(overall).toBe(100);
    });
  });

  // ── Score Labels ──────────────────────────────────────────────────────────

  describe('getScoreLabel', () => {
    it('returns Excellent for score >= 80', () => {
      expect(getScoreLabel(80)).toBe('Excellent');
      expect(getScoreLabel(95)).toBe('Excellent');
    });

    it('returns Good for score 60-79', () => {
      expect(getScoreLabel(60)).toBe('Good');
      expect(getScoreLabel(79)).toBe('Good');
    });

    it('returns Average for score 40-59', () => {
      expect(getScoreLabel(40)).toBe('Average');
      expect(getScoreLabel(59)).toBe('Average');
    });

    it('returns Below Average for score 20-39', () => {
      expect(getScoreLabel(20)).toBe('Below Average');
      expect(getScoreLabel(39)).toBe('Below Average');
    });

    it('returns Poor for score < 20', () => {
      expect(getScoreLabel(0)).toBe('Poor');
      expect(getScoreLabel(19)).toBe('Poor');
    });
  });

  // ── Score Explanation ─────────────────────────────────────────────────────

  describe('getScoreExplanation', () => {
    it('includes the score value and label', () => {
      const explanation = getScoreExplanation(75, {
        transport: 80,
        energy: 70,
        food: 60,
        consumption: 90,
        waste: 75,
      });

      expect(explanation).toContain('75');
      expect(explanation).toContain('Good');
    });

    it('identifies strongest and weakest categories', () => {
      const explanation = getScoreExplanation(50, {
        transport: 30,
        energy: 80,
        food: 50,
        consumption: 40,
        waste: 60,
      });

      expect(explanation).toContain('Energy'); // strongest
      expect(explanation).toContain('Transport'); // weakest
    });
  });
});
