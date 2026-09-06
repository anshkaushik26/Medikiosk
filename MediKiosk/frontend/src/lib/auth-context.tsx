'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserSession, UserRole, PatientProfile, DoctorProfile } from './types';
import { api } from './api';

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  role: UserRole;
  isLoading: boolean;
  loginWithOtp: (identity_type: string, identifier: string, otp: string) => Promise<UserSession>;
  selectRole: (role: 'PATIENT' | 'DOCTOR') => Promise<void>;
  updatePatientProfile: (profile: PatientProfile) => Promise<void>;
  updateDoctorProfile: (profile: DoctorProfile) => Promise<void>;
  logout: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshSession = async () => {
    try {
      const storedToken = localStorage.getItem('medikiosk_token');
      if (storedToken) {
        setToken(storedToken);
        const me = await api.getMe();
        setUser(me);
        localStorage.setItem('medikiosk_user', JSON.stringify(me));
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn('Session refresh error:', err);
      // If token expired, clear
      localStorage.removeItem('medikiosk_token');
      localStorage.removeItem('medikiosk_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const loginWithOtp = async (identity_type: string, identifier: string, otp: string): Promise<UserSession> => {
    const res = await api.verifyOtp(identity_type, identifier, otp);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('medikiosk_token', res.access_token);
    localStorage.setItem('medikiosk_user', JSON.stringify(res.user));
    return res.user;
  };

  const selectRole = async (selectedRole: 'PATIENT' | 'DOCTOR') => {
    const updated = await api.setRole(selectedRole);
    setUser(updated);
    localStorage.setItem('medikiosk_user', JSON.stringify(updated));
  };

  const updatePatientProfile = async (profile: PatientProfile) => {
    await api.savePatientProfile(profile);
    await refreshSession();
  };

  const updateDoctorProfile = async (profile: DoctorProfile) => {
    await api.saveDoctorProfile(profile);
    await refreshSession();
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setToken(null);
    router.push('/');
  };

  const resetDemoData = async () => {
    await api.resetDemo();
    await refreshSession();
  };

  const role: UserRole = user?.role || 'PENDING';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoading,
        loginWithOtp,
        selectRole,
        updatePatientProfile,
        updateDoctorProfile,
        logout,
        resetDemoData,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
