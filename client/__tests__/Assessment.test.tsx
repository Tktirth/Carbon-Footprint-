import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AssessmentPage from '../src/pages/Assessment';
import { BrowserRouter } from 'react-router-dom';

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

// Mock the API service
vi.mock('../src/services/api', () => ({
  api: {
    submitAssessment: vi.fn().mockResolvedValue({
      assessment: {
        id: 1,
        dailyEmissionsKg: 10,
        monthlyEmissionsKg: 300,
        annualEmissionsKg: 3600,
      },
      score: {
        overallScore: 80,
      },
      recommendations: [
        {
          id: 1,
          title: 'Unplug devices',
          description: 'Phantom power savings',
        },
      ],
    }),
  },
}));

describe('Assessment Component', () => {
  it('renders the initial transport step of the assessment', () => {
    render(
      <BrowserRouter>
        <AssessmentPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Carbon Footprint Assessment')).toBeInTheDocument();
    expect(screen.getByText('Answer a few questions about your lifestyle to calculate your carbon footprint')).toBeInTheDocument();
    expect(screen.getByText('Primary Vehicle Type')).toBeInTheDocument();
  });

  it('shows validation error if next is clicked without selecting vehicle type', () => {
    render(
      <BrowserRouter>
        <AssessmentPage />
      </BrowserRouter>
    );

    const nextBtn = screen.getByText('Next →');
    fireEvent.click(nextBtn);

    expect(screen.getByText('Please select a vehicle type')).toBeInTheDocument();
  });

  it('allows moving to the next step after completing the form fields', async () => {
    render(
      <BrowserRouter>
        <AssessmentPage />
      </BrowserRouter>
    );

    // Select petrol car
    const selectEl = screen.getByLabelText(/Primary Vehicle Type/i);
    fireEvent.change(selectEl, { target: { value: 'car_petrol' } });

    const nextBtn = screen.getByText('Next →');
    fireEvent.click(nextBtn);

    // Should now be on the Energy step (electricity input should be visible)
    await waitFor(() => {
      expect(screen.getByText(/Electricity Consumption/i)).toBeInTheDocument();
    });
  });
});
