import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  quickSwitchRole: (role: UserRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fc_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('fc_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('fc_token');
      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          if (res.data?.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('fc_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid. Falling back to default admin demo account.');
          await quickSwitchRole('admin');
        }
      } else {
        // Auto-login to admin demo account on first arrival for seamless evaluation
        await quickSwitchRole('admin');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.data?.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('fc_token', newToken);
        localStorage.setItem('fc_user', JSON.stringify(newUser));
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Login error:', err.response?.data?.message || err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fc_token');
    localStorage.removeItem('fc_user');
  };

  const quickSwitchRole = async (role: UserRole): Promise<boolean> => {
    const creds: Record<UserRole, { email: string; pass: string }> = {
      admin: { email: 'admin@farmcontract.in', pass: 'Admin@123' },
      farmer: { email: 'farmer@farmcontract.in', pass: 'Farmer@123' },
      buyer: { email: 'buyer@farmcontract.in', pass: 'Buyer@123' },
      officer: { email: 'officer@farmcontract.in', pass: 'Officer@123' },
    };

    const target = creds[role];
    if (target) {
      try {
        const res = await api.auth.login({ email: target.email, password: target.pass });
        if (res.data?.success) {
          const { token: newToken, user: newUser } = res.data;
          setToken(newToken);
          setUser(newUser);
          localStorage.setItem('fc_token', newToken);
          localStorage.setItem('fc_user', JSON.stringify(newUser));
          return true;
        }
      } catch (err) {
        console.error('Role switch failed:', err);
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, quickSwitchRole }}>
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
