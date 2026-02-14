'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSession, onAuthStateChange } from '../../lib/services/auth';
import type { Session, User } from '../../types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getSession()
      .then((initialSession) => {
        setSession(initialSession);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to get initial session:', error);
        setLoading(false);
      });

    // Subscribe to auth state changes
    const { unsubscribe } = onAuthStateChange((newSession) => {
      setSession(newSession);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    session,
    user: session?.user || null,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
