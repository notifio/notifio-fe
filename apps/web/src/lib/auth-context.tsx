'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface FakeUser {
  name: string;
  email: string;
  avatar: string | null;
}

interface AuthContextValue {
  user: FakeUser | null;
  isLoaded: boolean;
  signIn: () => void;
  signOut: () => void;
}

const STORAGE_KEY = 'notifio_fake_user';

const FAKE_USER: FakeUser = {
  name: 'Filip',
  email: 'filip@notifio.app',
  avatar: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): FakeUser | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as FakeUser) : null;
  } catch {
    return null;
  }
}

function persistUser(user: FakeUser | null) {
  try {
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // SSR or storage unavailable
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FakeUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setUser(loadUser());
    setIsLoaded(true);
  }, []);

  const signIn = useCallback(() => {
    setUser(FAKE_USER);
    persistUser(FAKE_USER);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    persistUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoaded, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
