import { apiClient } from './apiClient';

export interface PsychologicalSession {
  id: number;
  patient_id: number;
  psychologist_id: number;
  fecha_sesion: string;
  temas_tratados?: string;
  notas?: string;
  estado: 'Programada' | 'Realizada' | 'Cancelada';
  duracion_minutos?: number;
  tipo_sesion?: string;
  objetivos?: string;
  conclusiones?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    id: number;
    name: string;
    email: string;
    dni: string;
  };
  psychologist?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateSessionData {
  patient_id: number;
  psychologist_id: number;
  fecha_sesion: string;
  temas_tratados?: string;
  notas?: string;
  estado: 'Programada' | 'Realizada' | 'Cancelada';
  duracion_minutos?: number;
  tipo_sesion?: string;
  objetivos?: string;
  conclusiones?: string;
}

export interface UpdateSessionData {
  patient_id?: number;
  psychologist_id?: number;
  fecha_sesion?: string;
  temas_tratados?: string;
  notas?: string;
  estado?: 'Programada' | 'Realizada' | 'Cancelada';
  duracion_minutos?: number;
  tipo_sesion?: string;
  objetivos?: string;
  conclusiones?: string;
}

export interface SessionStats {
  total_sessions: number;
  programadas: number;
  realizadas: number;
  canceladas: number;
  futuras: number;
  pasadas: number;
  by_psychologist: Array<{
    id: number;
    name: string;
    total_sessions: number;
  }>;
}

export const psychologicalSessionsService = {
  // Obtener lista de sesiones
  async getSessions(params?: {
    patient_id?: number;
    psychologist_id?: number;
    estado?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }) {
    const response = await apiClient.get('/psychological-sessions', { params });
    return response.data;
  },

  // Obtener una sesión por ID
  async getSession(id: number) {
    const response = await apiClient.get(`/psychological-sessions/${id}`);
    return response.data;
  },

  // Crear una nueva sesión
  async createSession(data: CreateSessionData) {
    const response = await apiClient.post('/psychological-sessions', data);
    return response.data;
  },

  // Actualizar una sesión
  async updateSession(id: number, data: UpdateSessionData) {
    const response = await apiClient.put(`/psychological-sessions/${id}`, data);
    return response.data;
  },

  // Eliminar una sesión
  async deleteSession(id: number) {
    const response = await apiClient.delete(`/psychological-sessions/${id}`);
    return response.data;
  },

  // Obtener sesiones por paciente
  async getSessionsByPatient(patientId: number) {
    const response = await apiClient.get(`/psychological-sessions/patient/${patientId}`);
    return response.data;
  },

  // Obtener sesiones por psicólogo
  async getSessionsByPsychologist(psychologistId: number) {
    const response = await apiClient.get(`/psychological-sessions/psychologist/${psychologistId}`);
    return response.data;
  },

  // Obtener sesiones por fecha
  async getSessionsByDate(date: string) {
    const response = await apiClient.get(`/psychological-sessions/date/${date}`);
    return response.data;
  },

  // Buscar paciente por DNI
  async searchPatientByDni(dni: string) {
    const response = await apiClient.get(`/psychological-sessions/search/patient-dni/${dni}`);
    return response.data;
  },

  // Obtener estadísticas de sesiones
  async getStats(): Promise<{ success: boolean; data: SessionStats }> {
    const response = await apiClient.get('/psychological-sessions/stats');
    return response.data;
  }
}; 