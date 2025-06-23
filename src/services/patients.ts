import { apiClient } from './apiClient';

export interface Patient {
  id: number;
  dni: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientData {
  dni: string;
  name: string;
  email: string;
  password: string;
}

export interface UpdatePatientData {
  dni?: string;
  name?: string;
  email?: string;
}

export interface PatientStats {
  total_patients: number;
  active_patients: number;
  inactive_patients: number;
  by_estado_civil: {
    soltero: number;
    casado: number;
    divorciado: number;
    viudo: number;
  };
  by_ocupacion: {
    estudiante: number;
    trabajador: number;
    docente: number;
  };
  by_sexo: {
    masculino: number;
    femenino: number;
  };
}

export const patientsService = {
  // Obtener lista de pacientes
  async getPatients(params?: {
    search?: string;
    dni?: string;
    estado_civil?: string;
    ocupacion?: string;
    programa_estudios?: string;
    activo?: boolean;
    page?: number;
    per_page?: number;
  }) {
    const response = await apiClient.get('/patients', { params });
    return response.data;
  },

  // Obtener un paciente por ID
  async getPatient(id: number) {
    const response = await apiClient.get(`/patients/${id}`);
    return response.data;
  },

  // Crear un nuevo paciente
  async createPatient(data: CreatePatientData) {
    const response = await apiClient.post('/patients', data);
    return response.data;
  },

  // Actualizar un paciente
  async updatePatient(id: number, data: UpdatePatientData) {
    const response = await apiClient.put(`/patients/${id}`, data);
    return response.data;
  },

  // Eliminar un paciente
  async deletePatient(id: number) {
    const response = await apiClient.delete(`/patients/${id}`);
    return response.data;
  },

  // Buscar paciente por DNI
  async searchByDni(dni: string) {
    const response = await apiClient.get(`/patients/search/dni/${dni}`);
    return response.data;
  },

  // Obtener sesiones de un paciente
  async getPatientSessions(id: number) {
    const response = await apiClient.get(`/patients/${id}/sessions`);
    return response.data;
  },

  // Obtener estadísticas de pacientes
  async getStats(): Promise<{ success: boolean; data: PatientStats }> {
    const response = await apiClient.get('/patients/stats');
    return response.data;
  }
}; 