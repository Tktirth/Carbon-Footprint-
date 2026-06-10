const { describe, it, expect, beforeAll, afterAll, beforeEach } = globalThis;

// Force test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Initialise an in-memory database before importing the app.
// We must do this before any module that touches db.js gets loaded.
const { initDb } = require('../src/models/db');
initDb(':memory:');

const { app } = require('../server');
const http = require('http');

// ── Tiny test HTTP helper (no external deps needed) ─────────────────────────

let server;
let baseUrl;

beforeAll(() => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

afterAll(() => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

beforeEach(() => {
  // Reset DB between tests to avoid state leakage
  initDb(':memory:');
});

/**
 * Tiny fetch wrapper that returns { status, body }.
 */
async function req(method, path, body = null, token = null) {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('API Integration Tests', () => {
  // ── Health Check ──────────────────────────────────────────────────────────

  it('GET /api/health returns 200', async () => {
    const res = await req('GET', '/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  // ── Auth: Registration ────────────────────────────────────────────────────

  it('POST /api/auth/register creates a user and returns a token', async () => {
    const res = await req('POST', '/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('POST /api/auth/register rejects duplicate email', async () => {
    await req('POST', '/api/auth/register', {
      name: 'First', email: 'dup@example.com', password: 'password123',
    });
    const res = await req('POST', '/api/auth/register', {
      name: 'Second', email: 'dup@example.com', password: 'password456',
    });

    expect(res.status).toBe(409);
  });

  it('POST /api/auth/register rejects short password', async () => {
    const res = await req('POST', '/api/auth/register', {
      name: 'Short', email: 'short@example.com', password: '1234',
    });

    expect(res.status).toBe(400);
  });

  // ── Auth: Login ───────────────────────────────────────────────────────────

  it('POST /api/auth/login returns a token for valid credentials', async () => {
    await req('POST', '/api/auth/register', {
      name: 'Login User', email: 'login@example.com', password: 'password123',
    });

    const res = await req('POST', '/api/auth/login', {
      email: 'login@example.com', password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login rejects invalid password', async () => {
    await req('POST', '/api/auth/register', {
      name: 'Bad PW', email: 'badpw@example.com', password: 'password123',
    });

    const res = await req('POST', '/api/auth/login', {
      email: 'badpw@example.com', password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
  });

  // ── Assessment Submission ─────────────────────────────────────────────────

  it('POST /api/assessments creates an assessment with emissions', async () => {
    const regRes = await req('POST', '/api/auth/register', {
      name: 'Assess User', email: 'assess@example.com', password: 'password123',
    });
    const token = regRes.body.token;

    const res = await req('POST', '/api/assessments', {
      vehicle_type: 'car_petrol',
      travel_km_per_week: 150,
      public_transport_km_per_week: 20,
      flights_per_year: 2,
      electricity_kwh_per_month: 350,
      ac_hours_per_day: 3,
      appliance_usage: 'moderate',
      diet_type: 'mixed',
      online_orders_per_month: 8,
      clothing_items_per_month: 2,
      electronics_per_year: 1,
      recycling_percentage: 40,
      waste_bags_per_week: 3,
      water_liters_per_day: 120,
    }, token);

    expect(res.status).toBe(201);
    expect(res.body.emissions).toBeDefined();
    expect(res.body.emissions.annual).toBeGreaterThan(0);
    expect(res.body.scores).toBeDefined();
    expect(res.body.recommendations).toBeDefined();
    expect(res.body.recommendations.length).toBeGreaterThan(0);
  });

  // ── Protected routes require auth ─────────────────────────────────────────

  it('GET /api/assessments returns 401 without token', async () => {
    const res = await req('GET', '/api/assessments');
    expect(res.status).toBe(401);
  });

  // ── Dashboard ─────────────────────────────────────────────────────────────

  it('GET /api/dashboard/summary returns dashboard data', async () => {
    const regRes = await req('POST', '/api/auth/register', {
      name: 'Dash User', email: 'dash@example.com', password: 'password123',
    });
    const token = regRes.body.token;

    // Submit an assessment first
    await req('POST', '/api/assessments', {
      vehicle_type: 'car_petrol',
      travel_km_per_week: 100,
      electricity_kwh_per_month: 300,
      diet_type: 'mixed',
      waste_bags_per_week: 2,
      water_liters_per_day: 100,
    }, token);

    const res = await req('GET', '/api/dashboard/summary', null, token);
    expect(res.status).toBe(200);
    expect(res.body.assessment).toBeDefined();
    expect(res.body.score).toBeDefined();
    expect(res.body.recommendations).toBeDefined();
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.totalAssessments).toBe(1);
  });

  // ── 404 for unknown endpoints ─────────────────────────────────────────────

  it('returns 404 for unknown endpoints', async () => {
    const res = await req('GET', '/api/nonexistent');
    expect(res.status).toBe(404);
  });

  // ── Assistant Chat ────────────────────────────────────────────────────────

  it('POST /api/assistant/chat returns a reply', async () => {
    const regRes = await req('POST', '/api/auth/register', {
      name: 'Chat User', email: 'chat@example.com', password: 'password123',
    });
    const token = regRes.body.token;

    const res = await req('POST', '/api/assistant/chat', {
      message: 'What is a carbon footprint?',
    }, token);

    expect(res.status).toBe(200);
    expect(res.body.reply).toBeDefined();
    expect(res.body.reply.length).toBeGreaterThan(0);
    expect(res.body.suggestions).toBeDefined();
  });

  // ── Chat History Persistence ──────────────────────────────────────────────

  it('GET /api/assistant/history returns persisted messages', async () => {
    const regRes = await req('POST', '/api/auth/register', {
      name: 'History User', email: 'history@example.com', password: 'password123',
    });
    const token = regRes.body.token;

    // Send a message (this persists both user msg + assistant reply)
    await req('POST', '/api/assistant/chat', {
      message: 'Hello, how are you?',
    }, token);

    // Fetch history
    const historyRes = await req('GET', '/api/assistant/history', null, token);
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.messages).toBeDefined();
    expect(historyRes.body.messages.length).toBeGreaterThanOrEqual(2); // user + assistant
    // Find the user message and assistant reply in the history
    const roles = historyRes.body.messages.map(m => m.role);
    expect(roles).toContain('user');
    expect(roles).toContain('assistant');
  });

  // ── Action Plan ───────────────────────────────────────────────────────────

  it('POST /api/assessments/latest/plan generates and saves an action plan', async () => {
    const regRes = await req('POST', '/api/auth/register', {
      name: 'Plan User', email: 'plan@example.com', password: 'password123',
    });
    const token = regRes.body.token;

    // Submit assessment first
    await req('POST', '/api/assessments', {
      vehicle_type: 'car_petrol',
      travel_km_per_week: 200,
      electricity_kwh_per_month: 400,
      diet_type: 'high_meat',
      waste_bags_per_week: 4,
      water_liters_per_day: 150,
    }, token);

    // Generate plan
    const planRes = await req('POST', '/api/assessments/latest/plan', {}, token);
    expect(planRes.status).toBe(201);
    expect(planRes.body.plan).toBeDefined();
    expect(planRes.body.plan.length).toBeGreaterThan(50);

    // Retrieve saved plan
    const getRes = await req('GET', '/api/assessments/latest/plan', null, token);
    expect(getRes.status).toBe(200);
    expect(getRes.body.plan).toBeDefined();
    expect(getRes.body.plan.length).toBeGreaterThan(50);
  });

  it('POST /api/assessments/latest/plan returns 404 with no assessment', async () => {
    const regRes = await req('POST', '/api/auth/register', {
      name: 'NoPlan User', email: 'noplan@example.com', password: 'password123',
    });
    const token = regRes.body.token;

    const planRes = await req('POST', '/api/assessments/latest/plan', {}, token);
    expect(planRes.status).toBe(404);
  });

  // ── Leaderboard ───────────────────────────────────────────────────────────

  it('GET /api/progress/leaderboard returns ranking data', async () => {
    const regRes = await req('POST', '/api/auth/register', {
      name: 'Leader User', email: 'leader@example.com', password: 'password123',
    });
    const token = regRes.body.token;

    // Submit assessment and complete a recommendation
    const assessRes = await req('POST', '/api/assessments', {
      vehicle_type: 'car_petrol',
      travel_km_per_week: 200,
      electricity_kwh_per_month: 400,
      diet_type: 'mixed',
      waste_bags_per_week: 3,
      water_liters_per_day: 120,
    }, token);

    // Fetch the persisted recommendations via the API to get their IDs
    const recsRes = await req('GET', '/api/recommendations', null, token);
    expect(recsRes.body.recommendations.length).toBeGreaterThan(0);
    const recId = recsRes.body.recommendations[0].id;
    await req('PATCH', `/api/recommendations/${recId}/complete`, {}, token);

    // Fetch leaderboard
    const lbRes = await req('GET', '/api/progress/leaderboard', null, token);
    expect(lbRes.status).toBe(200);
    expect(lbRes.body.leaderboard).toBeDefined();
    expect(lbRes.body.leaderboard.length).toBeGreaterThan(0);
    expect(lbRes.body.leaderboard[0].rank).toBe(1);
    expect(lbRes.body.leaderboard[0].totalSavedKg).toBeGreaterThan(0);
    expect(lbRes.body.leaderboard[0].isCurrentUser).toBe(true);
  });
});
