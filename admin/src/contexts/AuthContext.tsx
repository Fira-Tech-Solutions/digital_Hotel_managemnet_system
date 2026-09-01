import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiRequest, setAuthToken } from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';
import type { UserProfile } from '../types';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginPayload {
  token: string;
  staff: {
    id: string;
    name: string;
    email: string;
    role: string;
    hotelId: string;
  };
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  switchUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const mapRole = (role: string): UserProfile['role'] => {
  const map: Record<string, UserProfile['role']> = {
    OWNER: 'Manager',
    MANAGER: 'Manager',
    KITCHEN: 'Kitchen',
    WAITER: 'Waiter',
    SOMMELIER: 'Sommelier',
    HOST: 'Host',
  };
  return map[role] || 'Kitchen';
};

const buildUserProfile = (staff: LoginPayload['staff']): UserProfile => ({
  id: staff.id,
  name: staff.name,
  email: staff.email,
  role: mapRole(staff.role),
  department: staff.role,
  avatar: '',
  initials: staff.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2),
  status: 'Active',
  lastLogin: 'Just now',
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshMe = useCallback(async () => {
    try {
      const me = await apiRequest<{ id: string; name: string; email: string; role: string; hotelId: string }>(
        '/api/admin/auth/me'
      );
      const profile = buildUserProfile(me);
      setState((prev) => ({ ...prev, user: profile, isAuthenticated: true, isLoading: false }));
    } catch {
      setState({ token: null, user: null, isAuthenticated: false, isLoading: false });
      setAuthToken(null);
      disconnectSocket();
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiRequest<LoginPayload>('/api/admin/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setAuthToken(data.token);
    connectSocket(data.token);
    const profile = buildUserProfile(data.staff);
    setState({ token: data.token, user: profile, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    disconnectSocket();
    setState({ token: null, user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const switchUser = useCallback((user: UserProfile) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('hotel_admin_token');
    if (token) {
      setAuthToken(token);
      refreshMe().catch(() => {});
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [refreshMe]);

  // Persist token
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('hotel_admin_token', state.token);
    } else {
      localStorage.removeItem('hotel_admin_token');
    }
  }, [state.token]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshMe, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
