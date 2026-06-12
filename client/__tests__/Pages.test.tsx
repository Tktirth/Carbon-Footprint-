import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Home from '../src/pages/Home';
import About from '../src/pages/About';

// Mock AuthContext
vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: any) => <div>{children}</div>,
}));

describe('Home Page', () => {
  it('renders the hero section and CTA buttons', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText(/Act for the Future/i)).toBeInTheDocument();
    expect(screen.getByText(/Analyze. Reduce. Neutralize./i)).toBeInTheDocument();
    expect(screen.getByText(/Your Personal Carbon Companion/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Free Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/Learn Methodology/i)).toBeInTheDocument();
  });

  it('renders the carbon target panel details', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText(/The Climate Target: 2.0 Tons/i)).toBeInTheDocument();
    expect(screen.getByText(/Annual Carbon Budget/i)).toBeInTheDocument();
    expect(screen.getAllByText(/2.0/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Average: 4.7T/i)).toBeInTheDocument();
  });

  it('renders the core features list', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText(/Scientific Tracker/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Action Plans/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Chat Coach/i)).toBeInTheDocument();
    expect(screen.getByText(/Social Leaderboard/i)).toBeInTheDocument();
  });
});

describe('About Page', () => {
  it('renders the methodology details', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText(/Methodology & Technology/i)).toBeInTheDocument();
    expect(screen.getByText(/Empowering Individuals to Combat Climate Change/i)).toBeInTheDocument();
    expect(screen.getByText(/IPCC/i)).toBeInTheDocument();
    expect(screen.getByText(/US EPA/i)).toBeInTheDocument();
    expect(screen.getByText(/UK DEFRA/i)).toBeInTheDocument();
    expect(screen.getByText(/IEA/i)).toBeInTheDocument();
  });

  it('renders the formula breakdown sections', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText(/Transport & Energy/i)).toBeInTheDocument();
    expect(screen.getByText(/Diet, Consumption & Waste/i)).toBeInTheDocument();
    expect(screen.getByText(/Vehicle Travel/i)).toBeInTheDocument();
    expect(screen.getByText(/Domestic Energy/i)).toBeInTheDocument();
  });

  it('renders the tech stack details', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText(/React 18/i)).toBeInTheDocument();
    expect(screen.getByText(/TypeScript/i)).toBeInTheDocument();
    expect(screen.getByText(/Tailwind CSS/i)).toBeInTheDocument();
    expect(screen.getByText(/Express/i)).toBeInTheDocument();
    expect(screen.getByText(/Postgres\/SQLite/i)).toBeInTheDocument();
    expect(screen.getByText(/Gemini AI/i)).toBeInTheDocument();
  });
});
