const { describe, it, expect } = globalThis;
const {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateFoodEmissions,
  calculateConsumptionEmissions,
  calculateWasteEmissions,
  calculateWaterEmissions,
  calculateTotalEmissions,
} = require('../src/services/carbonCalculator');

describe('carbonCalculator', () => {
  // ── Transport ─────────────────────────────────────────────────────────────

  describe('calculateTransportEmissions', () => {
    it('calculates petrol car emissions correctly', () => {
      const result = calculateTransportEmissions({
        vehicle_type: 'car_petrol',
        travel_km_per_week: 200,
        public_transport_km_per_week: 0,
        flights_per_year: 0,
      });
      // 200 * 0.21 * 52 = 2184
      expect(result).toBe(2184);
    });

    it('calculates diesel car + public transport emissions', () => {
      const result = calculateTransportEmissions({
        vehicle_type: 'car_diesel',
        travel_km_per_week: 100,
        public_transport_km_per_week: 50,
        flights_per_year: 0,
      });
      // 100*0.17*52 + 50*0.04*52 = 884 + 104 = 988
      expect(result).toBe(988);
    });

    it('includes flights in transport emissions', () => {
      const result = calculateTransportEmissions({
        vehicle_type: 'none',
        travel_km_per_week: 0,
        public_transport_km_per_week: 0,
        flights_per_year: 4,
      });
      // 4 * 255 = 1020
      expect(result).toBe(1020);
    });

    it('returns 0 for no transport', () => {
      const result = calculateTransportEmissions({
        vehicle_type: 'none',
        travel_km_per_week: 0,
        public_transport_km_per_week: 0,
        flights_per_year: 0,
      });
      expect(result).toBe(0);
    });
  });

  // ── Energy ────────────────────────────────────────────────────────────────

  describe('calculateEnergyEmissions', () => {
    it('calculates electricity emissions with moderate appliances', () => {
      const result = calculateEnergyEmissions({
        electricity_kwh_per_month: 300,
        ac_hours_per_day: 0,
        appliance_usage: 'moderate',
      });
      // 300 * 12 * 0.42 * 1.0 = 1512
      expect(result).toBe(1512);
    });

    it('applies high appliance multiplier', () => {
      const result = calculateEnergyEmissions({
        electricity_kwh_per_month: 300,
        ac_hours_per_day: 0,
        appliance_usage: 'high',
      });
      // 300 * 12 * 0.42 * 1.3 = 1965.6
      expect(result).toBe(1965.6);
    });

    it('includes AC emissions', () => {
      const result = calculateEnergyEmissions({
        electricity_kwh_per_month: 0,
        ac_hours_per_day: 8,
        appliance_usage: 'moderate',
      });
      // 8 * 1.5 * 365 * 0.42 = 1839.6
      expect(result).toBe(1839.6);
    });
  });

  // ── Food ──────────────────────────────────────────────────────────────────

  describe('calculateFoodEmissions', () => {
    it('returns correct vegan emissions', () => {
      expect(calculateFoodEmissions({ diet_type: 'vegan' })).toBe(1500);
    });

    it('returns correct high_meat emissions', () => {
      expect(calculateFoodEmissions({ diet_type: 'high_meat' })).toBe(3300);
    });

    it('defaults to mixed for unknown diet', () => {
      expect(calculateFoodEmissions({ diet_type: 'unknown' })).toBe(2500);
    });
  });

  // ── Consumption ───────────────────────────────────────────────────────────

  describe('calculateConsumptionEmissions', () => {
    it('calculates online orders + clothing + electronics', () => {
      const result = calculateConsumptionEmissions({
        online_orders_per_month: 10,
        clothing_items_per_month: 2,
        electronics_per_year: 3,
      });
      // 10*12*19 + 2*12*14 + 3*300 = 2280 + 336 + 900 = 3516
      expect(result).toBe(3516);
    });

    it('returns 0 when all values are zero', () => {
      const result = calculateConsumptionEmissions({
        online_orders_per_month: 0,
        clothing_items_per_month: 0,
        electronics_per_year: 0,
      });
      expect(result).toBe(0);
    });
  });

  // ── Waste ─────────────────────────────────────────────────────────────────

  describe('calculateWasteEmissions', () => {
    it('calculates waste with no recycling', () => {
      const result = calculateWasteEmissions({
        waste_bags_per_week: 3,
        recycling_percentage: 0,
      });
      // 3 * 2.5 * 52 = 390
      expect(result).toBe(390);
    });

    it('reduces waste by recycling percentage', () => {
      const result = calculateWasteEmissions({
        waste_bags_per_week: 4,
        recycling_percentage: 50,
      });
      // 4 * 2.5 * 52 * 0.5 = 260
      expect(result).toBe(260);
    });

    it('caps recycling at 100%', () => {
      const result = calculateWasteEmissions({
        waste_bags_per_week: 2,
        recycling_percentage: 150,
      });
      // 2 * 2.5 * 52 * (1 - 1.0) = 0
      expect(result).toBe(0);
    });
  });

  // ── Water ─────────────────────────────────────────────────────────────────

  describe('calculateWaterEmissions', () => {
    it('calculates water emissions', () => {
      const result = calculateWaterEmissions({ water_liters_per_day: 150 });
      // 150 * 0.0003 * 365 = 16.425 → 16.43
      expect(result).toBe(16.43);
    });

    it('returns 0 for zero water', () => {
      expect(calculateWaterEmissions({ water_liters_per_day: 0 })).toBe(0);
    });
  });

  // ── Total ─────────────────────────────────────────────────────────────────

  describe('calculateTotalEmissions', () => {
    it('returns daily, monthly, annual and breakdown', () => {
      const result = calculateTotalEmissions({
        vehicle_type: 'car_petrol',
        travel_km_per_week: 100,
        public_transport_km_per_week: 20,
        flights_per_year: 2,
        electricity_kwh_per_month: 400,
        ac_hours_per_day: 2,
        appliance_usage: 'moderate',
        diet_type: 'mixed',
        online_orders_per_month: 5,
        clothing_items_per_month: 1,
        electronics_per_year: 1,
        recycling_percentage: 30,
        waste_bags_per_week: 2,
        water_liters_per_day: 100,
      });

      expect(result).toHaveProperty('daily');
      expect(result).toHaveProperty('monthly');
      expect(result).toHaveProperty('annual');
      expect(result).toHaveProperty('breakdown');
      expect(result.breakdown).toHaveProperty('transport');
      expect(result.breakdown).toHaveProperty('energy');
      expect(result.breakdown).toHaveProperty('food');
      expect(result.breakdown).toHaveProperty('consumption');
      expect(result.breakdown).toHaveProperty('waste');
      expect(result.breakdown).toHaveProperty('water');

      // Verify annual = sum of categories
      const sum =
        result.breakdown.transport +
        result.breakdown.energy +
        result.breakdown.food +
        result.breakdown.consumption +
        result.breakdown.waste +
        result.breakdown.water;
      expect(result.annual).toBeCloseTo(sum, 0);

      // Verify daily ≈ annual / 365
      expect(result.daily).toBeCloseTo(result.annual / 365, 0);
    });

    it('handles all-zero input gracefully', () => {
      const result = calculateTotalEmissions({
        vehicle_type: 'none',
        travel_km_per_week: 0,
        public_transport_km_per_week: 0,
        flights_per_year: 0,
        electricity_kwh_per_month: 0,
        ac_hours_per_day: 0,
        appliance_usage: 'low',
        diet_type: 'vegan',
        online_orders_per_month: 0,
        clothing_items_per_month: 0,
        electronics_per_year: 0,
        recycling_percentage: 100,
        waste_bags_per_week: 0,
        water_liters_per_day: 0,
      });

      // Only food (vegan) should be > 0
      expect(result.breakdown.transport).toBe(0);
      expect(result.breakdown.energy).toBe(0);
      expect(result.breakdown.food).toBe(1500);
      expect(result.breakdown.consumption).toBe(0);
      expect(result.breakdown.waste).toBe(0);
      expect(result.breakdown.water).toBe(0);
      expect(result.annual).toBe(1500);
    });
  });
});
