'use strict';

// ─── Emission Factors ────────────────────────────────────────────────────────
// All factors produce kilograms of CO₂-equivalent.

/** kg CO₂ per kilometre by vehicle type */
const VEHICLE_FACTORS = {
  car_petrol: 0.21,
  car_diesel: 0.17,
  car_electric: 0.05,
  motorcycle: 0.10,
  none: 0,
};

/** kg CO₂ per km for buses / trains / trams */
const PUBLIC_TRANSPORT_FACTOR = 0.04;

/** kg CO₂ per short-haul return flight (average) */
const FLIGHT_FACTOR = 255;

/** kg CO₂ per kWh (global average grid emission factor) */
const ELECTRICITY_FACTOR = 0.42;

/** kWh consumed per hour of air conditioning */
const AC_KWH_PER_HOUR = 1.5;

/** Multiplier applied to base electricity depending on appliance usage level */
const APPLIANCE_MULTIPLIERS = {
  low: 0.8,
  moderate: 1.0,
  high: 1.3,
};

/** Annual food emissions per diet type (kg CO₂) */
const DIET_FACTORS = {
  vegan: 1500,
  vegetarian: 1700,
  mixed: 2500,
  high_meat: 3300,
};

/** kg CO₂ per online order (packaging + last-mile delivery) */
const ONLINE_ORDER_FACTOR = 19;

/** kg CO₂ per clothing item (raw materials + manufacturing + transport) */
const CLOTHING_FACTOR = 14;

/** kg CO₂ per electronic device (manufacturing lifecycle) */
const ELECTRONICS_FACTOR = 300;

/** kg CO₂ per household waste bag per week */
const WASTE_BAG_FACTOR = 2.5;

/** kg CO₂ per litre of water consumed per day */
const WATER_FACTOR = 0.0003;

/** Weeks in a year */
const WEEKS_PER_YEAR = 52;

/** Days in a year */
const DAYS_PER_YEAR = 365;

/** Months in a year */
const MONTHS_PER_YEAR = 12;

// ─── Calculation Functions ───────────────────────────────────────────────────

/**
 * Calculate annual transport emissions in kg CO₂.
 *
 * @param {object} data
 * @param {string}  data.vehicle_type            — one of VEHICLE_FACTORS keys
 * @param {number}  data.travel_km_per_week       — private vehicle km/week
 * @param {number}  data.public_transport_km_per_week — public transport km/week
 * @param {number}  data.flights_per_year         — number of return flights
 * @returns {number} annual kg CO₂
 */
function calculateTransportEmissions(data) {
  const vehicleFactor = VEHICLE_FACTORS[data.vehicle_type] || 0;
  const privateVehicle = (data.travel_km_per_week || 0) * vehicleFactor * WEEKS_PER_YEAR;
  const publicTransport = (data.public_transport_km_per_week || 0) * PUBLIC_TRANSPORT_FACTOR * WEEKS_PER_YEAR;
  const flights = (data.flights_per_year || 0) * FLIGHT_FACTOR;

  return round(privateVehicle + publicTransport + flights);
}

/**
 * Calculate annual energy emissions in kg CO₂.
 *
 * @param {object} data
 * @param {number} data.electricity_kwh_per_month
 * @param {number} data.ac_hours_per_day
 * @param {string} data.appliance_usage — 'low' | 'moderate' | 'high'
 * @returns {number} annual kg CO₂
 */
function calculateEnergyEmissions(data) {
  const applianceMultiplier = APPLIANCE_MULTIPLIERS[data.appliance_usage] || 1.0;

  // Base electricity
  const annualElectricity = (data.electricity_kwh_per_month || 0) * MONTHS_PER_YEAR;
  const electricityEmissions = annualElectricity * ELECTRICITY_FACTOR * applianceMultiplier;

  // Air conditioning
  const acKwhPerYear = (data.ac_hours_per_day || 0) * AC_KWH_PER_HOUR * DAYS_PER_YEAR;
  const acEmissions = acKwhPerYear * ELECTRICITY_FACTOR;

  return round(electricityEmissions + acEmissions);
}

/**
 * Calculate annual food emissions in kg CO₂.
 *
 * @param {object} data
 * @param {string} data.diet_type — 'vegan' | 'vegetarian' | 'mixed' | 'high_meat'
 * @returns {number} annual kg CO₂
 */
function calculateFoodEmissions(data) {
  return round(DIET_FACTORS[data.diet_type] || DIET_FACTORS.mixed);
}

/**
 * Calculate annual consumption emissions in kg CO₂.
 *
 * @param {object} data
 * @param {number} data.online_orders_per_month
 * @param {number} data.clothing_items_per_month
 * @param {number} data.electronics_per_year
 * @returns {number} annual kg CO₂
 */
function calculateConsumptionEmissions(data) {
  const onlineOrders = (data.online_orders_per_month || 0) * MONTHS_PER_YEAR * ONLINE_ORDER_FACTOR;
  const clothing = (data.clothing_items_per_month || 0) * MONTHS_PER_YEAR * CLOTHING_FACTOR;
  const electronics = (data.electronics_per_year || 0) * ELECTRONICS_FACTOR;

  return round(onlineOrders + clothing + electronics);
}

/**
 * Calculate annual waste emissions in kg CO₂.
 * Recycling reduces net waste emissions proportionally.
 *
 * @param {object} data
 * @param {number} data.waste_bags_per_week
 * @param {number} data.recycling_percentage — 0-100
 * @returns {number} annual kg CO₂
 */
function calculateWasteEmissions(data) {
  const grossWaste = (data.waste_bags_per_week || 0) * WASTE_BAG_FACTOR * WEEKS_PER_YEAR;
  const recyclingReduction = 1 - (Math.min(data.recycling_percentage || 0, 100) / 100);

  return round(grossWaste * recyclingReduction);
}

/**
 * Calculate annual water emissions in kg CO₂.
 *
 * @param {object} data
 * @param {number} data.water_liters_per_day
 * @returns {number} annual kg CO₂
 */
function calculateWaterEmissions(data) {
  return round((data.water_liters_per_day || 0) * WATER_FACTOR * DAYS_PER_YEAR);
}

/**
 * Calculate total annual emissions with a full category breakdown plus
 * convenience daily and monthly figures.
 *
 * @param {object} data — full assessment input
 * @returns {{
 *   daily: number,
 *   monthly: number,
 *   annual: number,
 *   breakdown: {
 *     transport: number,
 *     energy: number,
 *     food: number,
 *     consumption: number,
 *     waste: number,
 *     water: number
 *   }
 * }}
 */
function calculateTotalEmissions(data) {
  const transport = calculateTransportEmissions(data);
  const energy = calculateEnergyEmissions(data);
  const food = calculateFoodEmissions(data);
  const consumption = calculateConsumptionEmissions(data);
  const waste = calculateWasteEmissions(data);
  const water = calculateWaterEmissions(data);

  const annual = round(transport + energy + food + consumption + waste + water);
  const monthly = round(annual / MONTHS_PER_YEAR);
  const daily = round(annual / DAYS_PER_YEAR);

  return {
    daily,
    monthly,
    annual,
    breakdown: { transport, energy, food, consumption, waste, water },
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Round to two decimal places.
 * @param {number} n
 * @returns {number}
 */
function round(n) {
  return Math.round(n * 100) / 100;
}

module.exports = {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateFoodEmissions,
  calculateConsumptionEmissions,
  calculateWasteEmissions,
  calculateWaterEmissions,
  calculateTotalEmissions,
  // Expose factors for tests
  VEHICLE_FACTORS,
  PUBLIC_TRANSPORT_FACTOR,
  FLIGHT_FACTOR,
  ELECTRICITY_FACTOR,
  DIET_FACTORS,
};
