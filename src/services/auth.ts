import { User } from '../types';
import { AUTH_CONFIG } from '../config/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface GoogleAuthResponse {
  user: User;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

class AuthService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${AUTH_CONFIG.API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Auth request failed:', error);
      throw error;
    }
  }

  // Login tradicional con email y password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Login con Google OAuth
  async loginWithGoogle(googleToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: googleToken }),
    });
  }

  // Verificar token actual
  async verifyToken(token: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Logout
  async logout(token: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Registrar usuario (solo para estudiantes con correo institucional)
  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: 'student';
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Obtener perfil del usuario
  async getProfile(token: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export const authService = new AuthService(); 