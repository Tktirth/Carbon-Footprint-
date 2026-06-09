# EcoTrack — Intelligent Carbon Footprint Assistant

EcoTrack is a complete, hackathon-ready sustainability application built to help individuals track, understand, and reduce their carbon footprint through simple actions and personalized insights. It works like a smart sustainability coach rather than a basic carbon calculator, combining a rule-based AI chatbot, a normalized relational database schema, comprehensive scoring engines, and a stunning dark-themed dashboard.

---

## 🚀 Recommended Workspace
> [!NOTE]
> This project is located at:
> `/Users/tirthkosambia/.gemini/antigravity/scratch/carbon-footprint/`
>
> It is highly recommended that you set this subdirectory as your active workspace in your IDE to interact with the code, run tasks, and view files.

---

## 🏗️ Architecture & Technology Stack

The application is structured as a monorepo with separate `client/` and `server/` components:

```
carbon-footprint/
├── client/              # React (Vite) + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI & Chart Components
│   │   ├── context/     # Auth & App State Contexts
│   │   ├── pages/       # Dashboard, Assessment, Insights, Progress, Assistant
│   │   ├── services/    # Centralized API Service
│   │   └── utils/       # Formatting & Theme helpers
│   └── __tests__/       # Vitest Frontend Unit Tests
│
└── server/              # Node.js + Express + SQLite Backend
    ├── database/        # Schema SQL scripts
    ├── src/
    │   ├── middleware/  # JWT Auth, Rate Limiter, Case Converter, Error Handler
    │   ├── models/      # node:sqlite Database Manager
    │   ├── routes/      # Relational Endpoint Controllers
    │   └── services/    # Carbon Calculator, Scoring & AI Engines
    └── __tests__/       # Vitest Backend Unit & Integration Tests
```

### 💻 Key Technologies:
* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts (for charts), React Router 6.
* **Backend**: Node.js, Express, SQLite (using the native `node:sqlite` `DatabaseSync` module for compile-free lightweight deployment), JWT Auth, Express Rate Limit, Helmet.
* **Testing**: Vitest for both backend & frontend test suites (fully independent).

---

## 🎨 Design & Accessibility
* **Theme**: Sleek, premium dark mode using HSL emerald and dark green colors (`#0a0f0d`, `#111916`, `#1a2420`).
* **UI Patterns**: Premium glassmorphism effects (`backdrop-blur bg-white/5 border border-white/10`), smooth micro-animations on load, and custom scrollbars.
* **Accessibility (a11y)**: Semantic HTML5 elements (`<header>`, `<main>`, `<nav>`), unique `id` and `aria-label` tags, explicit form labels, and high-contrast color scales for charts/progress bars.
* **Responsive Layout**: Designed for seamless viewing across smartphones, tablets, and desktop monitors.

---

## 🧮 Emission Factor Formulas

All calculations use realistic, peer-reviewed global average emission factors:

1. **Transport**:
   * Petrol Vehicle: `0.21 kg CO₂ / km`
   * Diesel Vehicle: `0.17 kg CO₂ / km`
   * Electric Vehicle: `0.05 kg CO₂ / km`
   * Motorcycle: `0.10 kg CO₂ / km`
   * Public Transit: `0.04 kg CO₂ / km`
   * Aviation: `255 kg CO₂` per short-haul flight

2. **Energy**:
   * Grid Electricity: `0.42 kg CO₂ / kWh` (global grid average factor)
   * Air Conditioning: `1.5 kWh / hour` consumption
   * Appliance Load: Low (`0.8`), Moderate (`1.0`), High (`1.3`) multiplier

3. **Diet**:
   * Vegan: `1,500 kg CO₂ / year`
   * Vegetarian: `1,700 kg CO₂ / year`
   * Mixed (standard): `2,500 kg CO₂ / year`
   * High Meat: `3,300 kg CO₂ / year`

4. **Consumption**:
   * Online Orders: `19 kg CO₂ / order`
   * Garments: `14 kg CO₂ / item`
   * Electronics: `300 kg CO₂ / device`

5. **Waste & Water**:
   * Household Waste: `2.5 kg CO₂ / bag` (weekly frequency, recycling reduces overall waste footprint dynamically)
   * Daily Water: `0.0003 kg CO₂ / liter`

---

## 💯 Sustainability Scoring & Recommendation Logic
* **Scoring Formula**:
  Each category is scored from `0` to `100` relative to global averages:
  $$\text{Category Score} = \max\left(0, \min\left(100, 100 - \left(\frac{\text{User Emissions}}{\text{Average Emissions}} \times 50\right)\right)\right)$$
  * *At average emissions, the score is exactly 50.*
  * *Zero emissions yields a score of 100.*

* **Weighted Overall Score**:
  $$\text{Overall Score} = (T \times 0.3) + (E \times 0.25) + (F \times 0.2) + (C \times 0.15) + (W \times 0.1)$$
  *(T: Transport, E: Energy, F: Food, C: Consumption, W: Waste)*

* **Rule-Based Assistant**:
  An keyword-matching expert system loaded with 30+ Q&A pairs. The assistant intercepts chat queries, dynamically evaluates the user's latest footprint variables, highlights their top emission drivers, and proposes localized carbon savings actions with follow-up suggestions.

---

## 🛠️ Getting Started & Dev Setup

Ensure you are using **Node.js v22+** (tested and optimized on **Node.js v26**).

### 1. Start the Backend API Server
```bash
cd server
npm install
npm run dev
```
The server will boot on `http://localhost:3001` and initialize/connect to `server/data/carbon_footprint.db`.

### 2. Start the Frontend Client
```bash
cd client
npm install
npm run dev
```
The frontend will start on `http://localhost:5173/`. All API requests starting with `/api` are automatically proxied to the backend.

---

## 🧪 Running Tests

### Backend Tests (52 cases)
Runs unit tests for calculators, recommendation algorithms, scoring modules, and full API integration suites (using an in-memory SQL database):
```bash
cd server
npm test
```

### Frontend Tests (18 cases)
Verifies components, dashboard rendering, navigation paths, form controllers, and layout structures:
```bash
cd client
npm test
```
