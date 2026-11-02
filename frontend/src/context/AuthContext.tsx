import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Account, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  accounts: Account[];
  role: UserRole | null;
  activePortal: 'customer' | 'fraud';
  setActivePortal: (portal: 'customer' | 'fraud') => void;
  isLoading: boolean;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
  quickSwitch: (targetRole: 'customer' | 'analyst' | 'admin') => Promise<void>;
  refreshAccounts: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [role, setRole] = useState<UserRole | null>(null);
  const [activePortal, setActivePortal] = useState<'customer' | 'fraud'>('customer');
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    try {
      const token = localStorage.getItem('sentinel_jwt_token');
      if (token) {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        setRole(currentUser.role);
        setActivePortal(currentUser.role === 'CUSTOMER' ? 'customer' : 'fraud');

        if (currentUser.role === 'CUSTOMER') {
          const accs = await api.getMyAccounts();
          setAccounts(accs);
        }
      } else {
        // Auto-login as demo customer by default so app is immediately interactive!
        await quickSwitch('customer');
      }
    } catch (e) {
      console.warn('Initial session check failed, falling back to customer demo login', e);
      try {
        await quickSwitch('customer');
      } catch (err) {
        console.error('Demo login fallback failed', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (u: string, p: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(u, p);
      localStorage.setItem('sentinel_jwt_token', data.token);
      setUser(data.user);
      setRole(data.user.role);
      setAccounts(data.accounts || []);
      setActivePortal(data.user.role === 'CUSTOMER' ? 'customer' : 'fraud');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sentinel_jwt_token');
    setUser(null);
    setRole(null);
    setAccounts([]);
    setActivePortal('customer');
  };

  const quickSwitch = async (targetRole: 'customer' | 'analyst' | 'admin') => {
    setIsLoading(true);
    try {
      let username = 'customer';
      let password = 'SentinelCustomer123!';
      if (targetRole === 'analyst') {
        username = 'analyst';
        password = 'SentinelAnalyst123!';
      } else if (targetRole === 'admin') {
        username = 'admin';
        password = 'SentinelAdmin123!';
      }

      const data = await api.login(username, password);
      localStorage.setItem('sentinel_jwt_token', data.token);
      setUser(data.user);
      setRole(data.user.role);
      setAccounts(data.accounts || []);
      setActivePortal(data.user.role === 'CUSTOMER' ? 'customer' : 'fraud');
    } catch (err) {
      console.error('Quick switch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccounts = async () => {
    try {
      const accs = await api.getMyAccounts();
      setAccounts(accs);
    } catch (e) {
      console.warn('Could not refresh accounts', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accounts,
        role,
        activePortal,
        setActivePortal,
        isLoading,
        login,
        logout,
        quickSwitch,
        refreshAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
