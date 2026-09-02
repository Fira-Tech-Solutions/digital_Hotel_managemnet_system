import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiRequest, setAuthToken } from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';
import type { UserProfile } from '../types';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  permissions: string[];
  isElevated: boolean;
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

interface MyPermissions {
  staffId: string;
  name: string;
  email: string;
  role: string;
  hotelId: string;
  isElevated: boolean;
  permissions: string[];
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  pinLogin: (pin: string, hotelId: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  switchUser: (user: UserProfile) => void;
  hasPermission: (resource: string, action: string) => boolean;
  hasAnyPermission: (checks: [string, string][]) => boolean;
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
    permissions: [],
    isElevated: false,
    isAuthenticated: false,
    isLoading: true,
  });

  const fetchPermissions = useCallback(async (): Promise<{ permissions: string[]; isElevated: boolean }> => {
    try {
      const data = await apiRequest<MyPermissions>('/api/admin/auth/my-permissions');
      return { permissions: data.permissions, isElevated: data.isElevated };
    } catch {
      return { permissions: [], isElevated: false };
    }
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const me = await apiRequest<{ id: string; name: string; email: string; role: string; hotelId: string }>(
        '/api/admin/auth/me'
      );
      const profile = buildUserProfile(me);
      const { permissions, isElevated } = await fetchPermissions();
      setState((prev) => ({
        ...prev,
        user: profile,
        permissions,
        isElevated,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch {
      setState({ token: null, user: null, permissions: [], isElevated: false, isAuthenticated: false, isLoading: false });
      setAuthToken(null);
      disconnectSocket();
    }
  }, [fetchPermissions]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiRequest<LoginPayload>('/api/admin/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setAuthToken(data.token);
    connectSocket(data.token);
    const profile = buildUserProfile(data.staff);
    const { permissions, isElevated } = await fetchPermissions();
    setState({ token: data.token, user: profile, permissions, isElevated, isAuthenticated: true, isLoading: false });
  }, [fetchPermissions]);

  const pinLogin = useCallback(async (pin: string, hotelId: string) => {
    const data = await apiRequest<LoginPayload>('/api/admin/auth/pin-login', {
      method: 'POST',
      body: { pin, hotelId },
    });
    setAuthToken(data.token);
    connectSocket(data.token);
    const profile = buildUserProfile(data.staff);
    const { permissions, isElevated } = await fetchPermissions();
    setState({ token: data.token, user: profile, permissions, isElevated, isAuthenticated: true, isLoading: false });
  }, [fetchPermissions]);

  const logout = useCallback(() => {
    setAuthToken(null);
    disconnectSocket();
    setState({ token: null, user: null, permissions: [], isElevated: false, isAuthenticated: false, isLoading: false });
  }, []);

  const hasPermission = useCallback(
    (resource: string, action: string) => {
      return state.permissions.includes(`${resource}:${action}`) || state.permissions.includes('*');
    },
    [state.permissions]
  );

  const hasAnyPermission = useCallback(
    (checks: [string, string][]) => {
      return checks.some(([r, a]) => state.permissions.includes(`${r}:${a}`) || state.permissions.includes('*'));
    },
    [state.permissions]
  );

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
    <AuthContext.Provider value={{ ...state, login, pinLogin, logout, refreshMe, switchUser, hasPermission, hasAnyPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
