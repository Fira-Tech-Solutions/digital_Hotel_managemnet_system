import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Hotel } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Left Side: Architectural Photography */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80')`,
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(28,26,23,0.3) 0%, rgba(28,26,23,0.6) 100%)' }} />
        {/* Overlay branding on image */}
        <div className="absolute bottom-12 left-12 right-12">
          <div className="flex items-center gap-3 mb-3">
            <Hotel className="w-8 h-8" style={{ color: '#B08D57' }} />
            <span
              className="text-3xl font-semibold tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: '#fdf8f7' }}
            >
              ADAMA
            </span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(253,248,247,0.6)' }}>
            Where hospitality meets precision.
          </p>
        </div>
      </div>

      {/* Right Side: Login Panel */}
      <div
        className="w-full lg:w-[40%] flex flex-col justify-center relative z-10"
        style={{
          padding: '48px 24px',
          background: '#fdf8f7',
        }}
      >
        {/* Mobile background overlay */}
        <div
          className="absolute inset-0 lg:hidden bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=60')`,
          }}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(253,248,247,0.92)', backdropFilter: 'blur(12px)' }} />
        </div>

        {/* Login Card Content */}
        <div className="relative w-full max-w-sm mx-auto">
          {/* Logo / Wordmark */}
          <div className="mb-8 flex items-center gap-3">
            <Hotel className="w-8 h-8" style={{ color: '#B08D57' }} />
            <span
              className="text-2xl font-semibold tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: '#1c1b1b' }}
            >
              ADAMA
            </span>
          </div>

          {/* Headers */}
          <div className="mb-8">
            <h1
              className="text-2xl mb-1"
              style={{ fontFamily: "'Playfair Display', serif", color: '#1c1b1b', lineHeight: '1.2', fontWeight: 500 }}
            >
              Hotel Operations Portal
            </h1>
            <p className="text-sm" style={{ color: '#4b463f' }}>Where hospitality meets precision.</p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-6 px-4 py-3 text-xs text-center"
              style={{
                background: 'rgba(186,26,26,0.08)',
                border: '1px solid rgba(186,26,26,0.15)',
                color: '#ba1a1a',
                borderRadius: '4px',
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                className="block mb-2 uppercase"
                style={{
                  fontSize: '12px',
                  lineHeight: '16px',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  color: '#4b463f',
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full transition-colors duration-200"
                style={{
                  padding: '12px 0',
                  border: 'none',
                  borderBottom: '1px solid rgba(124,118,110,0.2)',
                  background: 'transparent',
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#1c1b1b',
                  outline: 'none',
                  fontFamily: "'Manrope', sans-serif",
                }}
                placeholder="staff@adamahotels.com"
                onFocus={(e) => (e.target.style.borderBottomColor = '#B08D57')}
                onBlur={(e) => (e.target.style.borderBottomColor = 'rgba(124,118,110,0.2)')}
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block uppercase"
                  style={{
                    fontSize: '12px',
                    lineHeight: '16px',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    color: '#4b463f',
                  }}
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full transition-colors duration-200"
                  style={{
                    padding: '12px 40px 12px 0',
                    border: 'none',
                    borderBottom: '1px solid rgba(124,118,110,0.2)',
                    background: 'transparent',
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#1c1b1b',
                    outline: 'none',
                    fontFamily: "'Manrope', sans-serif",
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => (e.target.style.borderBottomColor = '#B08D57')}
                  onBlur={(e) => (e.target.style.borderBottomColor = 'rgba(124,118,110,0.2)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#4b463f' }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 transition-colors duration-200"
                style={{
                  padding: '16px',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  lineHeight: '16px',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#1C1A17',
                  background: isLoading ? 'rgba(176,141,87,0.6)' : '#B08D57',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Manrope', sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.background = '#a07e4a';
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.currentTarget.style.background = '#B08D57';
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  'Sign In to Operations'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid rgba(124,118,110,0.1)' }}>
            <p className="flex items-center justify-center gap-2" style={{ fontSize: '14px', color: 'rgba(75,70,63,0.7)' }}>
              <ShieldCheck className="w-4 h-4" style={{ color: 'rgba(176,141,87,0.6)' }} />
              Secure hotel operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
