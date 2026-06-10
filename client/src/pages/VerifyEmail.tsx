import React, { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function VerifyEmail() {
  const { user, verifyEmail, logout, mockVerificationCode } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If already verified, redirect to home
  if (user.isVerified) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    if (code.trim().length !== 6 || isNaN(Number(code.trim()))) {
      setError('Verification code must be a 6-digit number.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyEmail(code.trim());
      setSuccess('Email verified successfully! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Logout failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl animate-pulse-slow" aria-hidden="true" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-emerald-600/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} aria-hidden="true" />

      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl" aria-hidden="true">🌱</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
            EcoTrack
          </h1>
          <p className="text-gray-400 mt-2">Verify your email address</p>
        </div>

        {/* Verification card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white text-center mb-4">
            Enter Verification Code
          </h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            We've sent a 6-digit verification code to <span className="text-white font-medium">{user.email}</span>.
          </p>

          {/* Mock Mode Helper Banner for Judges */}
          {mockVerificationCode && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-fade-in">
              <span className="font-semibold text-white">🧪 Mock Mode:</span> Your verification code is <span className="font-mono bg-[#0f1b15] px-2 py-0.5 rounded text-white font-bold">{mockVerificationCode}</span>.
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2" role="alert">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2" role="alert">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="code" className="block text-sm font-medium text-gray-300 text-center">
                6-Digit Code
              </label>
              <input
                id="code"
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="glass-input text-center text-2xl tracking-widest font-mono py-3"
                placeholder="123456"
                autoComplete="one-time-code"
                aria-required="true"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={code.length !== 6 || !!success}
            >
              Verify Code
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3 items-center">
            <p className="text-xs text-gray-500 text-center">
              Didn't receive the email? Check your spam folder or console logs (in local mode).
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              Log out and use another account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
