import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService, LoginCredentials } from '../services/auth';
import { googleAuthService, GoogleUser } from '../services/googleAuth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Ana García',
    email: 'ana.garcia@tupac-amaru.edu.pe',
    role: 'psychologist',
    verified: true,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@tupac-amaru.edu.pe',
    role: 'student',
    verified: true,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Admin Usuario',
    email: 'admin@tupac-amaru.edu.pe',
    role: 'admin',
    verified: true,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Super Administrador',
    email: 'superadmin@tupac-amaru.edu.pe',
    role: 'super_admin',
    verified: true,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar sesión existente al cargar
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Verificar si el token sigue siendo válido
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (authToken: string) => {
    try {
      const response = await authService.verifyToken(authToken);
      if (response.success) {
        setUser(response.data.user);
        setToken(response.data.token);
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        // Token inválido, limpiar sesión
        clearSession();
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  const clearSession = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const credentials: LoginCredentials = { email, password };
      const response = await authService.login(credentials);
      
      if (response.success) {
        setUser(response.data.user);
        setToken(response.data.token);
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return true;
      } else {
        setError(response.message || 'Credenciales inválidas');
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError('Error al conectar con el servidor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener token de Google
      const googleResponse = await googleAuthService.signInWithGoogle();
      const googleUser = googleResponse.user;
      
      // Verificar tipo de email y determinar rol
      let role: 'student' | 'psychologist' | 'admin';
      try {
        role = googleAuthService.determineRole(googleUser.email);
      } catch (error) {
        setError('Email no válido para el sistema. Use correo institucional para estudiantes o correo personal para psicólogos.');
        setLoading(false);
        return false;
      }

      // Enviar token de Google al backend
      const response = await authService.loginWithGoogle(googleResponse.token);
      
      if (response.success) {
        setUser(response.data.user);
        setToken(response.data.token);
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return true;
      } else {
        setError(response.message || 'Error al autenticar con Google');
        return false;
      }
    } catch (error) {
      console.error('Error en Google login:', error);
      setError('Error al iniciar sesión con Google');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await authService.logout(token);
      } catch (error) {
        console.error('Error en logout:', error);
      }
    }
    clearSession();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      login, 
      loginWithGoogle, 
      logout, 
      loading,
      error,
      setUser,
      setToken,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}