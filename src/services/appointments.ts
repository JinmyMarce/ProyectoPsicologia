import { apiClient } from './apiClient';

export interface Appointment {
  id: number;
  user_email: string;
  psychologist_id: number;
  psychologist_name: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentData {
  user_email: string;
  psychologist_id: number;
  date: string;
  time: string;
  reason: string;
  notes?: string;
  status?: string;
}

export interface Psychologist {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  available: boolean;
}

export interface TimeSlot {
  id: number;
  time: string;
  available: boolean;
}

// Obtener todas las citas (solo admin/super_admin)
export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const response = await apiClient.get('/citas');
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching appointments:', error);
    throw new Error('Error al obtener las citas');
  }
};

// Obtener citas del usuario autenticado
export const getUserAppointments = async (): Promise<Appointment[]> => {
  try {
    // Usar la ruta específica para obtener citas del usuario actual
    const response = await apiClient.get('/appointments');
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching user appointments:', error);
    throw new Error('Error al obtener las citas del usuario');
  }
};

// Crear nueva cita
export const createAppointment = async (appointmentData: CreateAppointmentData): Promise<Appointment> => {
  try {
    const response = await apiClient.post('/appointments', appointmentData);
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error creating appointment:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al crear la cita');
  }
};

// Actualizar cita
export const updateAppointment = async (id: number, appointmentData: Partial<CreateAppointmentData>): Promise<Appointment> => {
  try {
    const response = await apiClient.put(`/appointments/${id}`, appointmentData);
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error updating appointment:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al actualizar la cita');
  }
};

// Eliminar cita
export const deleteAppointment = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/appointments/${id}`);
  } catch (error: unknown) {
    console.error('Error deleting appointment:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al eliminar la cita');
  }
};

// Obtener psicólogos disponibles
export const getPsychologists = async (): Promise<Psychologist[]> => {
  try {
    const response = await apiClient.get('/citas/psychologists/available');
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching psychologists:', error);
    throw new Error('Error al obtener los psicólogos');
  }
};

// Obtener horarios disponibles
export const getAvailableSlots = async (psychologistId: number, date: string): Promise<TimeSlot[]> => {
  try {
    const response = await apiClient.get(`/appointments/available-slots`, {
      params: { psychologist_id: psychologistId, date }
    });
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching available slots:', error);
    throw new Error('Error al obtener los horarios disponibles');
  }
};

// Confirmar cita
export const confirmAppointment = async (id: number): Promise<Appointment> => {
  try {
    const response = await apiClient.patch(`/appointments/${id}/confirm`);
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error confirming appointment:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al confirmar la cita');
  }
};

// Cancelar cita
export const cancelAppointment = async (id: number): Promise<Appointment> => {
  try {
    const response = await apiClient.patch(`/appointments/${id}/cancel`);
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error cancelling appointment:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al cancelar la cita');
  }
};

// Completar cita
export const completeAppointment = async (id: number): Promise<Appointment> => {
  try {
    const response = await apiClient.patch(`/appointments/${id}/complete`);
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error completing appointment:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al completar la cita');
  }
};

// Obtener citas del psicólogo
export const getPsychologistAppointments = async (): Promise<Appointment[]> => {
  try {
    const response = await apiClient.get('/citas');
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching psychologist appointments:', error);
    throw new Error('Error al obtener las citas del psicólogo');
  }
};

// Obtener estadísticas del psicólogo
export const getPsychologistStats = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/citas/stats');
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching psychologist stats:', error);
    throw new Error('Error al obtener las estadísticas del psicólogo');
  }
}; 