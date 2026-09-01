import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, UserCheck, CheckCircle2, X } from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { HotelLogo } from './HotelLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSelectUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const { login, user: authUser, switchUser, logout } = useAuth();
  const [emailInput, setEmailInput] = useState('admin@adama.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    try {
      await login(emailInput, passwordInput);
      setAuthSuccess(true);
      setTimeout(() => {
        setAuthSuccess(false);
        onClose();
      }, 600);
    } catch (err: any) {
      setAuthError(err?.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = () => {
    // Already logged in, just close
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div
        id="auth-modal-card"
        className="relative w-full max-w-md bg-[#13171D] border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-slate-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <HotelLogo variant="icon" size="lg" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Adama Hotel Admin
          </h2>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest mt-0.5">
            Premium Management
          </span>
        </div>

        {/* Section title */}
        <div className="mb-5 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300 mb-2">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>SECURE ACCESS</span>
          </div>
          <p className="text-xs text-slate-400">
            Please authenticate to continue to the administrative dashboard.
          </p>
        </div>

        {/* Error message */}
        {authError && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center">
            {authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthenticate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Staff Email
            </label>
            <input
              type="email"
              id="auth-input-email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              placeholder="e.g. admin@adama.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-amber-400 hover:underline">
                Forgot PIN?
              </a>
            </div>
            <input
              type="password"
              id="auth-input-password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            id="btn-auth-submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all transform active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {authSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950 animate-bounce" />
                <span>Authorized! Loading terminal...</span>
              </>
            ) : isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Authenticate</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Currently logged in as */}
        {currentUser && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Currently Logged In
            </p>
            <div className="flex items-center justify-center gap-3">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover border border-amber-500/40" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center border border-amber-500/40">
                  {currentUser.initials || currentUser.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <span className="text-sm font-bold text-white block">{currentUser.name}</span>
                <span className="text-[11px] text-amber-400">{currentUser.role}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="ml-2 px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure 256-bit Encrypted Connection</span>
        </div>
      </div>
    </div>
  );
};
