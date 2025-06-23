import { apiClient } from './apiClient';
import { User, Psychologist } from '../types';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'psychologist' | 'admin' | 'super_admin';
  specialization?: string;
  verified?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  specialization?: string;
  verified?: boolean;
  active?: boolean;
}

export interface UserFilters {
  role?: string;
  active?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export const userService = {
  // Obtener todos los usuarios con filtros
  async getUsers(filters: UserFilters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/users?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
    }
  },

  // Obtener un usuario específico
  async getUser(id: string) {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuario');
    }
  },

  // Crear un nuevo usuario
  async createUser(userData: CreateUserData) {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear usuario');
    }
  },

  // Actualizar un usuario
  async updateUser(id: string, userData: UpdateUserData) {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  },

  // Desactivar un usuario
  async deactivateUser(id: string, reason: string) {
    try {
      const response = await apiClient.post(`/users/${id}/deactivate`, { reason });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al desactivar usuario');
    }
  },

  // Reactivar un usuario
  async reactivateUser(id: string) {
    try {
      const response = await apiClient.post(`/users/${id}/reactivate`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al reactivar usuario');
    }
  },

  // Obtener historial de cambios de usuario
  async getUserHistory(id: string) {
    try {
      const response = await apiClient.get(`/users/${id}/history`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener historial');
    }
  },

  // Eliminar un usuario
  async deleteUser(id: string) {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  },

  // Obtener estadísticas de usuarios
  async getUserStats() {
    try {
      const response = await apiClient.get('/users/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  // Cambiar contraseña de usuario
  async changePassword(id: string, currentPassword: string, newPassword: string) {
    try {
      const response = await apiClient.post(`/users/${id}/change-password`, {
        current_password: currentPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  },

  // Enviar email de verificación
  async sendVerificationEmail(id: string) {
    try {
      const response = await apiClient.post(`/users/${id}/send-verification`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar email de verificación');
    }
  },

  // Verificar email
  async verifyEmail(token: string) {
    try {
      const response = await apiClient.post('/users/verify-email', { token });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al verificar email');
    }
  },

  // Restablecer contraseña
  async resetPassword(email: string) {
    try {
      const response = await apiClient.post('/users/reset-password', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al restablecer contraseña');
    }
  },

  // Confirmar restablecimiento de contraseña
  async confirmResetPassword(token: string, newPassword: string) {
    try {
      const response = await apiClient.post('/users/confirm-reset-password', {
        token,
        new_password: newPassword
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al confirmar restablecimiento');
    }
  }
}; 