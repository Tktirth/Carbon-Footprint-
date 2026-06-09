const { describe, it, expect } = globalThis;
const { generateRecommendations } = require('../src/services/recommendationEngine');

describe('recommendationEngine', () => {
  const highEmissionUser = {
    vehicle_type: 'car_petrol',
    travel_km_per_week: 200,
    public_transport_km_per_week: 10,
    flights_per_year: 6,
    electricity_kwh_per_month: 600,
    ac_hours_per_day: 8,
    appliance_usage: 'high',
    diet_type: 'high_meat',
    online_orders_per_month: 15,
    clothing_items_per_month: 5,
    electronics_per_year: 4,
    recycling_percentage: 10,
    waste_bags_per_week: 5,
    water_liters_per_day: 300,
  };

  const lowEmissionUser = {
    vehicle_type: 'none',
    travel_km_per_week: 0,
    public_transport_km_per_week: 10,
    flights_per_year: 0,
    electricity_kwh_per_month: 150,
    ac_hours_per_day: 1,
    appliance_usage: 'low',
    diet_type: 'vegan',
    online_orders_per_month: 2,
    clothing_items_per_month: 0,
    electronics_per_year: 0,
    recycling_percentage: 80,
    waste_bags_per_week: 1,
    water_liters_per_day: 80,
  };

  it('generates many recommendations for high-emission users', () => {
    const recs = generateRecommendations(highEmissionUser, {});
    // High-emission user should match many conditions
    expect(recs.length).toBeGreaterThanOrEqual(10);
  });

  it('generates fewer recommendations for low-emission users', () => {
    const recs = generateRecommendations(lowEmissionUser, {});
    // Low emission — only universally applicable ones like "reduce food waste"
    expect(recs.length).toBeLessThan(5);
  });

  it('includes transport recommendations for heavy drivers', () => {
    const recs = generateRecommendations(highEmissionUser, {});
    const transportRecs = recs.filter((r) => r.category === 'transport');
    expect(transportRecs.length).toBeGreaterThanOrEqual(3);
  });

  it('does not include car-related recs for non-drivers', () => {
    const recs = generateRecommendations(lowEmissionUser, {});
    const carRecs = recs.filter((r) =>
      r.title.toLowerCase().includes('carpool') ||
      r.title.toLowerCase().includes('electric vehicle')
    );
    expect(carRecs.length).toBe(0);
  });

  it('recommendations are sorted by impact (co2_reduction_kg * priority) descending', () => {
    const recs = generateRecommendations(highEmissionUser, {});
    for (let i = 1; i < recs.length; i++) {
      const prevImpact = recs[i - 1].co2_reduction_kg * recs[i - 1].priority;
      const curImpact = recs[i].co2_reduction_kg * recs[i].priority;
      expect(prevImpact).toBeGreaterThanOrEqual(curImpact);
    }
  });

  it('each recommendation has required fields', () => {
    const recs = generateRecommendations(highEmissionUser, {});
    for (const rec of recs) {
      expect(rec).toHaveProperty('category');
      expect(rec).toHaveProperty('title');
      expect(rec).toHaveProperty('description');
      expect(rec).toHaveProperty('co2_reduction_kg');
      expect(rec).toHaveProperty('difficulty');
      expect(rec).toHaveProperty('financial_impact');
      expect(rec).toHaveProperty('annual_savings_usd');
      expect(rec).toHaveProperty('priority');
      // Should NOT contain the internal condition function
      expect(rec).not.toHaveProperty('condition');
    }
  });

  it('includes diet recommendation for high_meat eaters', () => {
    const recs = generateRecommendations(highEmissionUser, {});
    const dietRecs = recs.filter((r) => r.category === 'food');
    expect(dietRecs.length).toBeGreaterThanOrEqual(2);
    expect(dietRecs.some((r) => r.title.toLowerCase().includes('meatless'))).toBe(true);
  });

  it('includes recycling recommendation for low recyclers', () => {
    const recs = generateRecommendations(highEmissionUser, {});
    const wasteRecs = recs.filter((r) => r.category === 'waste');
    expect(wasteRecs.some((r) => r.title.toLowerCase().includes('recycling'))).toBe(true);
  });
});
