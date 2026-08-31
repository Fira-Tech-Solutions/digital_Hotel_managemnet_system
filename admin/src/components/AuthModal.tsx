import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, UserCheck, CheckCircle2, X } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../mockData';
import { HotelLogo } from './HotelLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [selectedRole, setSelectedRole] = useState<'Kitchen' | 'Manager'>('Kitchen');
  const [emailInput, setEmailInput] = useState('chef.marco@hoteladmin.com');
  const [passwordInput, setPasswordInput] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [authSuccess, setAuthSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRoleTab = (role: 'Kitchen' | 'Manager') => {
    setSelectedRole(role);
    if (role === 'Kitchen') {
      setEmailInput('chef.marco@hoteladmin.com');
    } else {
      setEmailInput('elena.r@hoteladmin.com');
    }
  };

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedUser = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === emailInput.toLowerCase() || u.role === selectedRole
    ) || INITIAL_USERS[0];

    setAuthSuccess(true);
    setTimeout(() => {
      onSelectUser(matchedUser);
      setAuthSuccess(false);
      onClose();
    }, 600);
  };

  const handleQuickSelect = (user: UserProfile) => {
    onSelectUser(user);
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

        {/* Role Segmented Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-5">
          <button
            type="button"
            id="auth-tab-kitchen"
            onClick={() => handleRoleTab('Kitchen')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedRole === 'Kitchen'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kitchen Staff
          </button>
          <button
            type="button"
            id="auth-tab-manager"
            onClick={() => handleRoleTab('Manager')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedRole === 'Manager'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Manager
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAuthenticate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Staff ID or Email
            </label>
            <input
              type="text"
              id="auth-input-email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              placeholder="e.g. chef.marco@hoteladmin.com"
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
              placeholder="••••••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
              />
              <span>Remember this terminal</span>
            </label>
          </div>

          <button
            type="submit"
            id="btn-auth-submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all transform active:scale-[0.98] cursor-pointer"
          >
            {authSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950 animate-bounce" />
                <span>Authorized! Loading terminal...</span>
              </>
            ) : (
              <>
                <span>Authenticate</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick switch profile shortcuts */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
            Quick Switch Active Profile
          </p>
          <div className="grid grid-cols-3 gap-2">
            {INITIAL_USERS.slice(0, 3).map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleQuickSelect(user)}
                className={`p-2 rounded-xl text-left border transition-all flex flex-col items-center text-center ${
                  currentUser.id === user.id
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mb-1 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-xs font-bold flex items-center justify-center mb-1">
                    {user.initials}
                  </div>
                )}
                <span className="text-[11px] font-semibold truncate w-full">{user.name}</span>
                <span className="text-[10px] text-slate-400">{user.role}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure 256-bit Encrypted Connection</span>
        </div>
      </div>
    </div>
  );
};
