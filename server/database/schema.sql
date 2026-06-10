-- Carbon Footprint Assistant Database Schema
-- Normalized relational schema with proper indexes

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_verified INTEGER NOT NULL DEFAULT 0,
  verification_code TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'none',
  travel_km_per_week REAL NOT NULL DEFAULT 0,
  public_transport_km_per_week REAL NOT NULL DEFAULT 0,
  flights_per_year INTEGER NOT NULL DEFAULT 0,
  electricity_kwh_per_month REAL NOT NULL DEFAULT 0,
  ac_hours_per_day REAL NOT NULL DEFAULT 0,
  appliance_usage TEXT NOT NULL DEFAULT 'moderate',
  diet_type TEXT NOT NULL DEFAULT 'mixed',
  online_orders_per_month INTEGER NOT NULL DEFAULT 0,
  clothing_items_per_month INTEGER NOT NULL DEFAULT 0,
  electronics_per_year INTEGER NOT NULL DEFAULT 0,
  recycling_percentage REAL NOT NULL DEFAULT 0,
  waste_bags_per_week REAL NOT NULL DEFAULT 0,
  water_liters_per_day REAL NOT NULL DEFAULT 0,
  daily_emissions_kg REAL NOT NULL DEFAULT 0,
  monthly_emissions_kg REAL NOT NULL DEFAULT 0,
  annual_emissions_kg REAL NOT NULL DEFAULT 0,
  transport_emissions_kg REAL NOT NULL DEFAULT 0,
  energy_emissions_kg REAL NOT NULL DEFAULT 0,
  food_emissions_kg REAL NOT NULL DEFAULT 0,
  consumption_emissions_kg REAL NOT NULL DEFAULT 0,
  waste_emissions_kg REAL NOT NULL DEFAULT 0,
  water_emissions_kg REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sustainability_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  assessment_id INTEGER NOT NULL,
  overall_score REAL NOT NULL DEFAULT 0,
  transport_score REAL NOT NULL DEFAULT 0,
  energy_score REAL NOT NULL DEFAULT 0,
  food_score REAL NOT NULL DEFAULT 0,
  consumption_score REAL NOT NULL DEFAULT 0,
  waste_score REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  assessment_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  co2_reduction_kg REAL NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  financial_impact TEXT NOT NULL DEFAULT 'neutral',
  annual_savings_usd REAL NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 1,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  target_reduction_kg REAL NOT NULL DEFAULT 0,
  target_date TEXT NOT NULL,
  current_reduction_kg REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progress_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  period_type TEXT NOT NULL DEFAULT 'monthly',
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  total_emissions_kg REAL NOT NULL DEFAULT 0,
  score REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sustainability_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  assessment_id INTEGER NOT NULL,
  plan_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_plans_user_id ON sustainability_plans(user_id);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
