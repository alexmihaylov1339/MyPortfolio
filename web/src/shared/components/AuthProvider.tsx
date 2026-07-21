'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { APP_ROUTES, AUTH_TOKEN_KEY } from '@/shared/constants';
import { PageLoader } from '@/shared/components/PageLoader';
import { isBrowserEnvironment } from '@shared/utils';

interface AuthContextType {
  isAuthenticated: boolean;
  isReady: boolean;
  setAuthenticated: (auth: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isReady: false,
  setAuthenticated: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isBrowserEnvironment()) return;
    const token = !!localStorage.getItem(AUTH_TOKEN_KEY);
    queueMicrotask(() => {
      setAuthenticated(token);
      setIsReady(true);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isReady, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Protects routes that require authentication. Redirects to /login when not logged in. */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace(APP_ROUTES.login);
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/** Restricts routes to guests only. Redirects authenticated users home. */
export function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace(APP_ROUTES.home);
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
