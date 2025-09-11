import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Auth, Me } from '../auth/auth';

interface AuthContextType {
  auth: Auth;
  me: Me | undefined;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth] = useState(new Auth());
  const [me, setMe] = useState<Me | undefined>(undefined);

  useEffect(() => {
    const initAuth = async () => {
      await auth.init();
      setMe(auth.me);
    };
    initAuth();
  }, [auth]);

  const login = async () => {
    await auth.login();
  };

  const logout = async () => {
    await auth.logout();
    setMe(undefined);
  };

  return (
    <AuthContext.Provider value={{ auth, me, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
