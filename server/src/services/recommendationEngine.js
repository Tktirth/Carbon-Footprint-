'use strict';

// ─── Recommendation Catalogue ───────────────────────────────────────────────
// Each entry includes a `condition` function that receives assessment data and
// computed emissions.  Only matching recommendations are returned.

const CATALOGUE = [
  // ── Transport ─────────────────────────────────────────────────────────────
  {
    category: 'transport',
    title: 'Switch to public transport',
    description:
      'Replacing 50 km of weekly car travel with public transport can save over 450 kg CO₂ per year. Buses and trains produce roughly 80% less emissions per passenger-km than private cars.',
    co2_reduction_kg: 450,
    difficulty: 'medium',
    financial_impact: 'positive',
    annual_savings_usd: 1200,
    priority: 4,
    condition: (d) => ['car_petrol', 'car_diesel'].includes(d.vehicle_type) && d.travel_km_per_week > 50,
  },
  {
    category: 'transport',
    title: 'Start carpooling',
    description:
      'Sharing your commute with just one other person halves per-person vehicle emissions. Look for carpool groups in your area or at your workplace.',
    co2_reduction_kg: 550,
    difficulty: 'easy',
    financial_impact: 'positive',
    annual_savings_usd: 900,
    priority: 3,
    condition: (d) => ['car_petrol', 'car_diesel'].includes(d.vehicle_type) && d.travel_km_per_week > 100,
  },
  {
    category: 'transport',
    title: 'Consider an electric vehicle',
    description:
      'Electric vehicles produce up to 75% fewer emissions than petrol cars over their lifetime, even accounting for electricity generation. Government incentives can offset the purchase price.',
    co2_reduction_kg: 1700,
    difficulty: 'hard',
    financial_impact: 'negative',
    annual_savings_usd: 600,
    priority: 5,
    condition: (d) => ['car_petrol', 'car_diesel'].includes(d.vehicle_type) && d.travel_km_per_week > 150,
  },
  {
    category: 'transport',
    title: 'Cycle or walk for short trips',
    description:
      'For trips under 5 km, cycling or walking eliminates emissions entirely while improving your health. E-bikes extend this range to about 15 km comfortably.',
    co2_reduction_kg: 200,
    difficulty: 'easy',
    financial_impact: 'positive',
    annual_savings_usd: 400,
    priority: 2,
    condition: (d) => d.vehicle_type !== 'none' && d.travel_km_per_week > 20,
  },
  {
    category: 'transport',
    title: 'Reduce air travel',
    description:
      'Each short-haul flight produces roughly 255 kg CO₂. Consider trains for domestic routes, video calls for business, and fewer but longer vacations.',
    co2_reduction_kg: 510,
    difficulty: 'medium',
    financial_impact: 'positive',
    annual_savings_usd: 800,
    priority: 4,
    condition: (d) => d.flights_per_year > 2,
  },
  {
    category: 'transport',
    title: 'Offset your flights',
    description:
      'When flying is unavoidable, purchase verified carbon offsets from Gold Standard or Verra-certified projects. This does not reduce emissions but funds equivalent removal.',
    co2_reduction_kg: 255,
    difficulty: 'easy',
    financial_impact: 'negative',
    annual_savings_usd: 0,
    priority: 1,
    condition: (d) => d.flights_per_year >= 1 && d.flights_per_year <= 2,
  },

  // ── Energy ────────────────────────────────────────────────────────────────
  {
    category: 'energy',
    title: 'Switch to LED lighting',
    description:
      'LED bulbs use 75% less energy than incandescent bulbs and last 25 times longer. Replacing all lights in a home can save 150–300 kg CO₂ per year.',
    co2_reduction_kg: 200,
    difficulty: 'easy',
    financial_impact: 'positive',
    annual_savings_usd: 120,
    priority: 3,
    condition: (d) => d.electricity_kwh_per_month > 300,
  },
  {
    category: 'energy',
    title: 'Get a home energy audit',
    description:
      'A professional audit identifies insulation gaps, air leaks, and inefficient appliances. Most homeowners find 20–30% savings after implementing recommendations.',
    co2_reduction_kg: 600,
    difficulty: 'medium',
    financial_impact: 'positive',
    annual_savings_usd: 350,
    priority: 4,
    condition: (d) => d.electricity_kwh_per_month > 500,
  },
  {
    category: 'energy',
    title: 'Reduce air conditioning use',
    description:
      'Setting your thermostat 2 °C higher in summer reduces AC energy by ~15%. Use fans, close blinds during peak sun, and ensure filters are clean for efficient cooling.',
    co2_reduction_kg: 350,
    difficulty: 'easy',
    financial_impact: 'positive',
    annual_savings_usd: 180,
    priority: 3,
    condition: (d) => d.ac_hours_per_day > 4,
  },
  {
    category: 'energy',
    title: 'Install solar panels',
    description:
      'Rooftop solar can offset 80–100% of household electricity. With decreasing panel costs and available tax credits, payback periods are now 5–8 years in most regions.',
    co2_reduction_kg: 2000,
    difficulty: 'hard',
    financial_impact: 'positive',
    annual_savings_usd: 1400,
    priority: 5,
    condition: (d) => d.electricity_kwh_per_month > 400,
  },
  {
    category: 'energy',
    title: 'Unplug standby devices',
    description:
      'Standby power ("vampire load") accounts for 5–10% of residential electricity use. Smart power strips automatically cut power when devices are off.',
    co2_reduction_kg: 150,
    difficulty: 'easy',
    financial_impact: 'positive',
    annual_savings_usd: 80,
    priority: 2,
    condition: (d) => d.appliance_usage === 'high',
  },

  // ── Food ──────────────────────────────────────────────────────────────────
  {
    category: 'food',
    title: 'Try Meatless Mondays',
    description:
      'Replacing meat with plant-based meals one day per week reduces food-related emissions by roughly 15%. It is an easy first step toward a lower-carbon diet.',
    co2_reduction_kg: 400,
    difficulty: 'easy',
    financial_impact: 'positive',
    annual_savings_usd: 250,
    priority: 3,
    condition: (d) => d.diet_type === 'high_meat',
  },
  {
    category: 'food',
    title: 'Shift toward a plant-rich diet',
    description:
      'A plant-rich diet (mostly vegetables, legumes, grains) produces about 50% fewer emissions than a high-meat diet and is linked to lower rates of heart disease.',
    co2_reduction_kg: 800,
    difficulty: 'medium',
    financial_impact: 'positive',
    annual_savings_usd: 500,
    priority: 4,
    condition: (d) => d.diet_type === 'high_meat' || d.diet_type === 'mixed',
  },
  {
    category: 'food',
    title: 'Reduce food waste',
    description:
      'About one-third of food produced globally is wasted. Plan meals, store food properly, and compost scraps to cut your food footprint by up to 10%.',
    co2_reduction_kg: 250,
    difficulty: 'easy',
    financial_impact: 'positive',
    annual_savings_usd: 600,
    priority: 2,
    condition: () => true, // universally applicable
  },

  // ── Consumption ───────────────────────────────────────────────────────────
  {
    category: 'consumption',
    title: 'Consolidate online orders',
    description:
      'Each delivery emits ~19 kg CO₂ from packaging and last-mile transport. Consolidating orders into fewer shipments reduces trips and packaging waste.',
    co2_reduction_kg: 340,
    difficulty: 'easy',
    financial_impact: 'positive',
    annual_savings_usd: 100,
    priority: 3,
    condition: (d) => d.online_orders_per_month > 10,
  },
  {
    category: 'consumption',
    title: 'Buy second-hand clothing',
    description:
      'The fashion industry is responsible for ~10% of global emissions. Buying second-hand extends garment life and avoids the 14 kg CO₂ embodied in each new item.',
    co2_reduction_kg: 500,
    difficulty: 'easy',
    financial_impact: 'positive',
    annual_savings_usd: 300,
    priority: 3,
    condition: (d) => d.clothing_items_per_month > 3,
  },
  {
    category: 'consumption',
    title: 'Extend electronics lifespan',
    description:
      'Manufacturing a single device produces ~300 kg CO₂. Repairing, upgrading, and keeping devices an extra 1–2 years significantly reduces your tech footprint.',
    co2_reduction_kg: 300,
    difficulty: 'easy',
    financial_impact: 'positive',
    annual_savings_usd: 400,
    priority: 2,
    condition: (d) => d.electronics_per_year > 2,
  },

  // ── Waste ─────────────────────────────────────────────────────────────────
  {
    category: 'waste',
    title: 'Start a recycling programme',
    description:
      'Recycling aluminium saves 95% of the energy needed to make new cans. Sort paper, plastics, glass, and metals to divert waste from landfill.',
    co2_reduction_kg: 250,
    difficulty: 'easy',
    financial_impact: 'neutral',
    annual_savings_usd: 0,
    priority: 3,
    condition: (d) => (d.recycling_percentage || 0) < 50,
  },
  {
    category: 'waste',
    title: 'Compost organic waste',
    description:
      'Food scraps in landfill produce methane, a greenhouse gas 28× more potent than CO₂. Composting turns waste into nutrient-rich soil instead.',
    co2_reduction_kg: 180,
    difficulty: 'medium',
    financial_impact: 'neutral',
    annual_savings_usd: 50,
    priority: 2,
    condition: (d) => d.waste_bags_per_week > 3,
  },
  {
    category: 'waste',
    title: 'Reduce single-use plastics',
    description:
      'Carry reusable bags, bottles, and containers. Reducing one waste bag per week saves about 130 kg CO₂ annually and keeps plastic out of oceans.',
    co2_reduction_kg: 130,
    difficulty: 'easy',
    financial_impact: 'positive',
    annual_savings_usd: 60,
    priority: 2,
    condition: (d) => d.waste_bags_per_week > 2,
  },
];

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate personalised recommendations based on assessment data and computed
 * emissions.  Only recommendations whose condition matches the user's data are
 * included.  Results are sorted by `co2_reduction_kg × priority` descending so
 * the highest-impact actions surface first.
 *
 * @param {object} assessmentData — raw assessment fields
 * @param {{ breakdown: object }} emissions — output of calculateTotalEmissions
 * @returns {Array<{
 *   category: string,
 *   title: string,
 *   description: string,
 *   co2_reduction_kg: number,
 *   difficulty: string,
 *   financial_impact: string,
 *   annual_savings_usd: number,
 *   priority: number,
 * }>}
 */
function generateRecommendations(assessmentData, emissions) {
  const matched = CATALOGUE
    .filter((rec) => {
      try {
        return rec.condition(assessmentData);
      } catch (_) {
        return false;
      }
    })
    .map(({ condition, ...rest }) => rest); // strip internal condition fn

  // Sort by impact: co2_reduction_kg * priority, descending
  matched.sort((a, b) => (b.co2_reduction_kg * b.priority) - (a.co2_reduction_kg * a.priority));

  return matched;
}

module.exports = { generateRecommendations };
