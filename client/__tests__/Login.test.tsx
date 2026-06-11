import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../src/pages/Login';

// Mock AuthContext
const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    isAuthenticated: false,
    isLoading: false,
  }),
  AuthProvider: ({ children }: any) => <div>{children}</div>,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('renders the sign in form by default', () => {
    renderComponent();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('toggles to register mode and resets form inputs', () => {
    renderComponent();
    
    // Type some text
    const emailInput = screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');

    // Click toggle to switch to register mode
    const toggleButton = screen.getByText("Don't have an account? Create one");
    fireEvent.click(toggleButton);

    // Verify it changed to register mode
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    
    // Verify inputs were cleared
    const emailInputReg = screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
    expect(emailInputReg.value).toBe('');
  });

  it('shows password requirements dynamically as the user types in register mode', () => {
    renderComponent();
    
    // Switch to register mode
    fireEvent.click(screen.getByText("Don't have an account? Create one"));

    // Password requirements should not be visible when password field is empty
    expect(screen.queryByText('Password requirements:')).not.toBeInTheDocument();

    // Type a simple password
    const passwordInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    // Requirements list should appear
    expect(screen.getByText('Password requirements:')).toBeInTheDocument();
    
    // '8–72 characters' should not have checkmark (it will show • instead of ✓)
    expect(screen.getByText(/8–72 characters/)).toBeInTheDocument();
    expect(screen.getAllByText('•')).toHaveLength(4);
    expect(screen.getAllByText('✓')).toHaveLength(1);
  });

  it('checks password requirement compliance in register mode', () => {
    renderComponent();
    
    fireEvent.click(screen.getByText("Don't have an account? Create one"));
    
    const passwordInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });

    // All requirements should be present
    expect(screen.getByText(/8–72 characters/)).toBeInTheDocument();
    expect(screen.getByText(/Uppercase letter/)).toBeInTheDocument();
    expect(screen.getByText(/Lowercase letter/)).toBeInTheDocument();
    expect(screen.getByText(/One number/)).toBeInTheDocument();
    expect(screen.getByText(/Special character/)).toBeInTheDocument();

    // All 5 checkmarks (✓) should be visible
    expect(screen.getAllByText('✓')).toHaveLength(5);
  });

  it('triggers local validation errors for invalid signup fields', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByText("Don't have an account? Create one"));

    const submitButton = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(submitButton);

    // Name is empty
    expect(screen.getByText('Please enter your name')).toBeInTheDocument();

    // Type name, keep email invalid
    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Test User' } });
    fireEvent.click(submitButton);
    expect(screen.getByText('Please enter your email')).toBeInTheDocument();

    // Type invalid email
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();

    // Type valid email, keep password short
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'valid@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: '123' } });
    fireEvent.click(submitButton);
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();

    // Type password without uppercase letter
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'lowercase123!' } });
    fireEvent.click(submitButton);
    expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument();
  });

  it('calls login on sign in form submission with valid values', async () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'Password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('calls register on sign up form submission with valid values', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByText("Don't have an account? Create one"));

    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Alice Smith' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'StrongPass123!' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('Alice Smith', 'alice@example.com', 'StrongPass123!');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
