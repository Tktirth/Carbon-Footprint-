import React, { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  // Real-time password requirement evaluations
  const hasMinLength = password.length >= 8;
  const hasMaxLength = password.length <= 72;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const validateForm = (): boolean => {
    if (isRegister && !name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (isRegister) {
      if (password.length > 72) {
        setError('Password must be at most 72 characters');
        return false;
      }
      if (!hasUppercase) {
        setError('Password must contain at least one uppercase letter');
        return false;
      }
      if (!hasLowercase) {
        setError('Password must contain at least one lowercase letter');
        return false;
      }
      if (!hasNumber) {
        setError('Password must contain at least one number');
        return false;
      }
      if (!hasSpecial) {
        setError('Password must contain at least one special character (e.g. !, @, #, etc.)');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl animate-pulse-slow" aria-hidden="true" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-emerald-600/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} aria-hidden="true" />
      <div className="absolute top-10 right-1/4 w-64 h-64 rounded-full bg-cyan-500/3 blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} aria-hidden="true" />

      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl animate-bounce-subtle" aria-hidden="true">🌱</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
            EcoTrack
          </h1>
          <p className="text-gray-400 mt-2">
            Track your carbon footprint. Save the planet.
          </p>
        </div>

        {/* Auth card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white text-center mb-6">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>

          {error && (
            <div
              className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
              role="alert"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {isRegister && (
              <div className="space-y-1.5 animate-slide-up">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input"
                  placeholder="John Doe"
                  autoComplete="name"
                  aria-required="true"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                placeholder="you@example.com"
                autoComplete="email"
                aria-required="true"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pr-10"
                  placeholder="••••••••"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {isRegister && password && (
              <div className="text-xs space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/10 animate-fade-in">
                <p className="font-semibold text-gray-400">Password requirements:</p>
                <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-gray-400">
                  <li className={`flex items-center gap-1.5 ${hasMinLength && hasMaxLength ? 'text-emerald-400 font-medium' : ''}`}>
                    <span>{hasMinLength && hasMaxLength ? '✓' : '•'}</span> 8–72 characters
                  </li>
                  <li className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400 font-medium' : ''}`}>
                    <span>{hasUppercase ? '✓' : '•'}</span> Uppercase letter
                  </li>
                  <li className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-400 font-medium' : ''}`}>
                    <span>{hasLowercase ? '✓' : '•'}</span> Lowercase letter
                  </li>
                  <li className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400 font-medium' : ''}`}>
                    <span>{hasNumber ? '✓' : '•'}</span> One number
                  </li>
                  <li className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400 font-medium' : ''}`}>
                    <span>{hasSpecial ? '✓' : '•'}</span> Special character
                  </li>
                </ul>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleToggleMode}
              className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          By signing in, you agree to track and reduce your carbon footprint 🌍
        </p>
      </div>
    </div>
  );
}
