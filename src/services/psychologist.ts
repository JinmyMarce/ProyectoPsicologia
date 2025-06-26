import { Psychologist, PsychologistHistory } from '../types';
import { AUTH_CONFIG } from '../config/auth';

export interface CreatePsychologistData {
  name: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  password: string;
  specialization: string;
  celular: string;
  fecha_nacimiento: string;
  verified?: boolean;
}

export interface UpdatePsychologistData {
  name?: string;
  email?: string;
  specialization?: string;
  verified?: boolean;
  password?: string;
}

export interface DeactivatePsychologistData {
  deactivation_reason?: string;
}

class PsychologistService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token');
    const url = `${AUTH_CONFIG.API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
      console.error('Psychologist request failed:', error);
      throw error;
    }
  }

  // Obtener lista de psicólogos activos
  async getPsychologists(): Promise<{ success: boolean; data: Psychologist[] }> {
    return this.request<{ success: boolean; data: Psychologist[] }>('/psychologists');
  }

  // Crear nuevo psicólogo
  async createPsychologist(data: CreatePsychologistData): Promise<{ success: boolean; data: Psychologist; message: string }> {
    return this.request<{ success: boolean; data: Psychologist; message: string }>('/psychologists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Obtener psicólogo específico
  async getPsychologist(id: string): Promise<{ success: boolean; data: Psychologist }> {
    return this.request<{ success: boolean; data: Psychologist }>(`/psychologists/${id}`);
  }

  // Actualizar psicólogo
  async updatePsychologist(id: string, data: UpdatePsychologistData): Promise<{ success: boolean; data: Psychologist; message: string }> {
    return this.request<{ success: boolean; data: Psychologist; message: string }>(`/psychologists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Desactivar psicólogo
  async deactivatePsychologist(id: string, data: DeactivatePsychologistData): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/psychologists/${id}/deactivate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Obtener historial de psicólogos
  async getPsychologistHistory(): Promise<{ success: boolean; data: PsychologistHistory[] }> {
    return this.request<{ success: boolean; data: PsychologistHistory[] }>('/psychologists/history/list');
  }

  // Reactivar psicólogo desde historial
  async reactivatePsychologist(historyId: string): Promise<{ success: boolean; data: Psychologist; message: string }> {
    return this.request<{ success: boolean; data: Psychologist; message: string }>(`/psychologists/history/${historyId}/reactivate`, {
      method: 'POST',
    });
  }
}

export const psychologistService = new PsychologistService(); 