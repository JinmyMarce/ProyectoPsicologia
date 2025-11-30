import { apiClient } from './apiClient';
import type { User } from '../types';

export interface UpdateUserData {
  // Información del Estudiante (tabla users)
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  birthdate?: string;
  gender?: string;
  dni?: string;
  career?: string;
  semester?: string;
  specialization?: string;
  
  // Campos directos de emergencia y médicos (tabla users)
  emergency_name?: string;
  emergency_phone?: string;
  emergency_relationship?: string;
  allergies?: string;
  current_medications?: string;
  medical_conditions?: string;
  
  // Contacto de Emergencia (tabla emergency_contacts)
  emergency_contact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  
  // Información Médica (tabla medical_infos)
  medical_info?: {
    medical_history?: string;
    current_medications?: string;
    allergies?: string;
  };
  
  // Información adicional
  nationality?: string;
  marital_status?: string;
  avatar?: string;
  
  // Campos de tutor (si aplica)
  classroom?: string;
  study_program?: string;
  course?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Obtener perfil del usuario autenticado
export const getProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get('/user/profile');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw new Error('Error al obtener el perfil');
  }
};

// Actualizar perfil del usuario
export const updateProfile = async (userData: UpdateUserData): Promise<User> => {
  try {
    const response = await apiClient.put('/user/profile', userData);
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error updating profile:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al actualizar el perfil');
  }
};

// Cambiar contraseña
export const changePassword = async (passwordData: ChangePasswordData): Promise<void> => {
  try {
    await apiClient.post('/auth/change-password', passwordData);
  } catch (error: unknown) {
    console.error('Error changing password:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al cambiar la contraseña');
  }
};

// Obtener todos los usuarios (solo admin/super_admin)
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get('/users');
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching users:', error);
    
    // Obtener más información del error
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { 
        response?: { 
          status?: number;
          data?: { 
            message?: string;
            error?: string;
          } 
        } 
      };
      
      if (apiError.response?.status === 500) {
        console.error('Server error details:', apiError.response.data);
        throw new Error(`Error del servidor: ${apiError.response.data?.error || apiError.response.data?.message || 'Error interno del servidor'}`);
      } else if (apiError.response?.status === 403) {
        throw new Error('No tienes permisos para acceder a este recurso');
      } else if (apiError.response?.status === 401) {
        throw new Error('No estás autenticado');
      } else {
        throw new Error(apiError.response?.data?.message || 'Error al obtener los usuarios');
      }
    }
    
    throw new Error('Error al obtener los usuarios');
  }
};

// Obtener usuario por ID
export const getUserById = async (id: number): Promise<User> => {
  try {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching user:', error);
    throw new Error('Error al obtener el usuario');
  }
};

// Crear nuevo usuario
export const createUser = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient.post('/users', userData);
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    
    // Obtener más información del error
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { 
        response?: { 
          status?: number;
          data?: { 
            message?: string;
            error?: string;
            errors?: Record<string, string[]>;
          } 
        } 
      };
      
      if (apiError.response?.status === 500) {
        console.error('Server error details:', apiError.response.data);
        throw new Error(`Error del servidor: ${apiError.response.data?.error || apiError.response.data?.message || 'Error interno del servidor'}`);
      } else if (apiError.response?.status === 422) {
        // Error de validación
        const validationErrors = apiError.response.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat();
          throw new Error(`Error de validación: ${errorMessages.join(', ')}`);
        }
        throw new Error(apiError.response.data?.message || 'Error de validación');
      } else if (apiError.response?.status === 403) {
        throw new Error('No tienes permisos para crear usuarios');
      } else if (apiError.response?.status === 401) {
        throw new Error('No estás autenticado');
      } else {
        throw new Error(apiError.response?.data?.message || 'Error al crear el usuario');
      }
    }
    
    throw new Error('Error al crear el usuario');
  }
};

// Actualizar usuario
export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al actualizar el usuario');
  }
};

// Eliminar usuario
export const deleteUser = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/users/${id}`);
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al eliminar el usuario');
  }
};

// Desactivar usuario
export const deactivateUser = async (id: number, reason: string): Promise<void> => {
  try {
    await apiClient.post(`/users/${id}/deactivate`, { reason });
  } catch (error: unknown) {
    console.error('Error deactivating user:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al desactivar el usuario');
  }
};

// Desactivar cuenta propia (usuario autenticado)
export const deactivateOwnAccount = async (reason: string): Promise<void> => {
  try {
    const response = await apiClient.get('/user/profile');
    const user = response.data.data || response.data;
    await apiClient.post(`/users/${user.id}/deactivate`, { reason });
  } catch (error: unknown) {
    console.error('Error deactivating own account:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al desactivar tu cuenta');
  }
};

// Reactivar usuario
export const reactivateUser = async (id: number): Promise<void> => {
  try {
    await apiClient.post(`/users/${id}/reactivate`);
  } catch (error: unknown) {
    console.error('Error reactivating user:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al reactivar el usuario');
  }
};

// Obtener estadísticas de usuarios
export const getUserStats = async (): Promise<Record<string, unknown>> => {
  try {
    const response = await apiClient.get('/users/stats');
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching user stats:', error);
    throw new Error('Error al obtener estadísticas de usuarios');
  }
}; 