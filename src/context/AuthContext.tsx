import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, tokenStorage } from '../services/api';
import { getClerkPublishableKey, isClerkKeyValid } from '../services/clerk';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  profile: any;
  loading: boolean;
  isClerkActive: boolean;
  clerkKey: string;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  quickSwitchUser: (role: UserRole) => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
  setUserFromClerk: (user: User, profile: any) => void;
  clearUserSession: () => void;
  refreshUser: () => Promise<void>;
  reloadClerkKey: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [clerkKey, setClerkKey] = useState<string>(() => getClerkPublishableKey());

  const reloadClerkKey = useCallback(() => {
    setClerkKey(getClerkPublishableKey());
  }, []);

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.auth.getMe();
      setUser(res.user);
      setProfile(res.profile);
    } catch (err) {
      console.warn('Session expired or invalid, clearing token.');
      tokenStorage.clear();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const setUserFromClerk = useCallback((syncedUser: User, syncedProfile: any) => {
    setUser(syncedUser);
    setProfile(syncedProfile);
    setLoading(false);
  }, []);

  const clearUserSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setProfile(null);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      tokenStorage.set(res.token);
      setUser(res.user);
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const res = await api.auth.register(userData);
      tokenStorage.set(res.token);
      setUser(res.user);
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const setUserRole = async (targetRole: UserRole) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.auth.updateRole(targetRole);
      tokenStorage.set(res.token);
      setUser(res.user);
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearUserSession();
  };

  const quickSwitchUser = async (targetRole: UserRole) => {
    let email = 'candidate@intervexa.com';
    if (targetRole === 'admin') email = 'admin@intervexa.com';
    if (targetRole === 'interviewer') email = 'interviewer@intervexa.com';

    await login(email, 'password123');
  };

  const isClerkActive = isClerkKeyValid(clerkKey);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        profile,
        loading,
        isClerkActive,
        clerkKey,
        login,
        register,
        logout,
        quickSwitchUser,
        setUserRole,
        setUserFromClerk,
        clearUserSession,
        refreshUser,
        reloadClerkKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
