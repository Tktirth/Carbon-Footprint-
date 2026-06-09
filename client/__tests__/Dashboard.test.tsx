import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from '../src/pages/Dashboard';
import { AppProvider } from '../src/context/AppContext';
import { BrowserRouter } from 'react-router-dom';

// Mock Recharts to avoid issues in jsdom environment
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  Radar: () => <div data-testid="radar" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}));

// Mock AuthContext
vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: any) => <div>{children}</div>,
}));

// Mock AppContext state
const mockDashboardData = {
  assessment: {
    id: 1,
    userId: 1,
    vehicleType: 'car_petrol',
    travelKmPerWeek: 150,
    publicTransportKmPerWeek: 20,
    flightsPerYear: 2,
    electricityKwhPerMonth: 300,
    acHoursPerDay: 4,
    applianceUsage: 'moderate',
    dietType: 'mixed',
    onlineOrdersPerMonth: 5,
    clothingItemsPerMonth: 2,
    electronicsPerYear: 1,
    recyclingPercentage: 50,
    wasteBagsPerWeek: 2,
    waterLitersPerDay: 120,
    dailyEmissionsKg: 15.2,
    monthlyEmissionsKg: 462.3,
    annualEmissionsKg: 5547.6,
    transportEmissionsKg: 1800,
    energyEmissionsKg: 1600,
    foodEmissionsKg: 1200,
    consumptionEmissionsKg: 400,
    wasteEmissionsKg: 300,
    waterEmissionsKg: 247.6,
    createdAt: '2026-06-09T00:00:00.000Z',
  },
  score: {
    id: 1,
    overallScore: 68.5,
    transportScore: 60,
    energyScore: 72,
    foodScore: 55,
    consumptionScore: 80,
    wasteScore: 75,
    createdAt: '2026-06-09T00:00:00.000Z',
  },
  recommendations: [
    {
      id: 1,
      category: 'transport',
      title: 'Use public transport 2 days/week',
      description: 'Replacing two weekly car trips with public transit reduces your annual footprint by 180 kg CO₂.',
      co2ReductionKg: 180,
      difficulty: 'Easy',
      financialImpact: 'Saves Money',
      annualSavingsUsd: 120,
      priority: 1,
      isCompleted: false,
    },
    {
      id: 2,
      category: 'energy',
      title: 'Unplug idle electronics',
      description: 'Phantom power load can account for up to 10% of household electric bills.',
      co2ReductionKg: 45,
      difficulty: 'Easy',
      financialImpact: 'Saves Money',
      annualSavingsUsd: 30,
      priority: 2,
      isCompleted: false,
    },
  ],
  trends: [
    { period: 'Assessment 1', emissions: 5547.6, score: 68.5 },
  ],
  goals: [
    {
      id: 1,
      title: 'Reduce annual emissions by 500 kg',
      targetReductionKg: 500,
      targetDate: '2026-12-31',
      currentReductionKg: 120,
      status: 'active',
    },
  ],
  insights: {
    largestSource: 'transportation',
    comparison: 'Your emissions are 12% lower than the national average.',
    insights: [
      'Your driving habits make up 32% of your footprint.',
      'Switching to a plant-based diet one day a week would save 180 kg CO2.',
    ],
  },
};

vi.mock('../src/context/AppContext', () => {
  return {
    useApp: () => ({
      dashboard: mockDashboardData,
      isDashboardLoading: false,
      dashboardError: null,
      fetchDashboard: vi.fn(),
    }),
    AppProvider: ({ children }: any) => <div>{children}</div>,
  };
});

describe('Dashboard Component', () => {
  it('renders the dashboard title and description', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Your Eco Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Track your environmental impact and sustainability progress')).toBeInTheDocument();
  });

  it('renders the large score gauge with correct score percentage', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('69')).toBeInTheDocument();
    });
    expect(screen.getByText('out of 100')).toBeInTheDocument();
  });

  it('renders emissions summary cards with formatted values', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Daily Emissions')).toBeInTheDocument();
    expect(screen.getByText('Monthly Emissions')).toBeInTheDocument();
    expect(screen.getByText('Annual Emissions')).toBeInTheDocument();

    expect(screen.getByText('15.2 kg CO₂')).toBeInTheDocument();
    expect(screen.getByText('462.3 kg CO₂')).toBeInTheDocument();
    expect(screen.getByText('5.5 t CO₂')).toBeInTheDocument();
  });

  it('renders the recommendations list and navigation link', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Top Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Use public transport 2 days/week')).toBeInTheDocument();
    expect(screen.getByText('-180 kg')).toBeInTheDocument();
    expect(screen.getByText('View all recommendations →')).toBeInTheDocument();
  });
});
