import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/apiClient';

interface User {
  id: string;
  identification: string;
  name: string;
  role: 'USER' | 'ADMIN';
  warehouses: Array<{
    code: string;
    description: string;
    status: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  login: (identification: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (identification: string, password: string) => {
    const response = await apiClient.post('/auth/login', { identification, password });
    const { token, user: userData } = response.data.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};