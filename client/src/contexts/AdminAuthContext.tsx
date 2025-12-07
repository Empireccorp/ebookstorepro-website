import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, getCurrentAdmin } from '../services/adminApi';

interface Admin {
  id: string;
  email: string;
  name: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há token salvo
    const savedToken = localStorage.getItem('admin_token');
    const savedAdmin = localStorage.getItem('admin_user');

    if (savedToken && savedAdmin) {
      setToken(savedToken);
      setAdmin(JSON.parse(savedAdmin));

      // Verificar se o token ainda é válido
      getCurrentAdmin()
        .then((response) => {
          setAdmin(response.data);
          setIsLoading(false);
        })
        .catch(() => {
          // Token inválido
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          setToken(null);
          setAdmin(null);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginApi(email, password);
    const { token: newToken, admin: newAdmin } = response.data;

    setToken(newToken);
    setAdmin(newAdmin);

    localStorage.setItem('admin_token', newToken);
    localStorage.setItem('admin_user', JSON.stringify(newAdmin));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!admin,
        isLoading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
