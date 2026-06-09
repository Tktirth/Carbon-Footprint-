-- Carbon Footprint Assistant Database Schema (Postgres)
-- Normalized relational schema with proper indexes

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type VARCHAR(50) NOT NULL DEFAULT 'none',
  travel_km_per_week DOUBLE PRECISION NOT NULL DEFAULT 0,
  public_transport_km_per_week DOUBLE PRECISION NOT NULL DEFAULT 0,
  flights_per_year INTEGER NOT NULL DEFAULT 0,
  electricity_kwh_per_month DOUBLE PRECISION NOT NULL DEFAULT 0,
  ac_hours_per_day DOUBLE PRECISION NOT NULL DEFAULT 0,
  appliance_usage VARCHAR(50) NOT NULL DEFAULT 'moderate',
  diet_type VARCHAR(50) NOT NULL DEFAULT 'mixed',
  online_orders_per_month INTEGER NOT NULL DEFAULT 0,
  clothing_items_per_month INTEGER NOT NULL DEFAULT 0,
  electronics_per_year INTEGER NOT NULL DEFAULT 0,
  recycling_percentage DOUBLE PRECISION NOT NULL DEFAULT 0,
  waste_bags_per_week DOUBLE PRECISION NOT NULL DEFAULT 0,
  water_liters_per_day DOUBLE PRECISION NOT NULL DEFAULT 0,
  daily_emissions_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
  monthly_emissions_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
  annual_emissions_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
  transport_emissions_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
  energy_emissions_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
  food_emissions_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
  consumption_emissions_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
  waste_emissions_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
  water_emissions_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sustainability_scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  overall_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  transport_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  energy_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  food_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  consumption_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  waste_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  co2_reduction_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
  difficulty VARCHAR(50) NOT NULL DEFAULT 'medium',
  financial_impact VARCHAR(50) NOT NULL DEFAULT 'neutral',
  annual_savings_usd DOUBLE PRECISION NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 1,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  target_reduction_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
  target_date VARCHAR(50) NOT NULL,
  current_reduction_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_type VARCHAR(50) NOT NULL DEFAULT 'monthly',
  period_start VARCHAR(50) NOT NULL,
  period_end VARCHAR(50) NOT NULL,
  total_emissions_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
  score DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_sustainability_scores_user_id ON sustainability_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_scores_assessment_id ON sustainability_scores(assessment_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_assessment_id ON recommendations(assessment_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_category ON recommendations(category);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_progress_history_user_id ON progress_history(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_history_period ON progress_history(period_type, period_start);
