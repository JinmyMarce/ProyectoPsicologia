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
  // Datos del paciente
  patient_dni?: string;
  patient_full_name?: string;
  patient_age?: number;
  patient_gender?: string;
  patient_address?: string;
  patient_phone?: string;
  patient_email?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  medical_history?: string;
  current_medications?: string;
  allergies?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentData {
  user_email: string;
  psychologist_id: number;
  date: string;
  time: string;
  reason?: string;
  notes?: string;
  status?: string;
  // Datos personales del paciente
  patient_dni: string;
  patient_full_name: string;
  patient_age: number;
  patient_gender: string;
  patient_address: string;
  patient_study_program: string;
  patient_semester: string;
  // Datos de contacto del paciente
  patient_phone: string;
  patient_email: string;
  // Contacto de emergencia
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  // Información médica (opcional)
  medical_history?: string;
  current_medications?: string;
  allergies?: string;
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
    // Para errores 422 (fines de semana, días pasados), devolver array vacío
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status === 422) {
        return [];
      }
    }
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
    const response = await apiClient.get('/citas/psychologist/stats');
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching psychologist stats:', error);
    throw new Error('Error al obtener las estadísticas del psicólogo');
  }
};

// Obtener datos del estudiante autenticado
export const getStudentData = async (): Promise<{
  fullName: string;
  email: string;
  career?: string;
  semester?: number;
}> => {
  try {
    const response = await apiClient.get('/user/profile');
    const userData = response.data.data || response.data;
    return {
      fullName: userData.name,
      email: userData.email,
      career: userData.career,
      semester: userData.semester
    };
  } catch (error: unknown) {
    console.error('Error fetching student data:', error);
    throw new Error('Error al obtener los datos del estudiante');
  }
};

// Aprobar cita (psicólogo)
export const approveAppointment = async (id: number): Promise<Appointment> => {
  try {
    const response = await apiClient.patch(`/appointments/${id}/approve`);
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error approving appointment:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al aprobar la cita');
  }
};

// Rechazar cita (psicólogo)
export const rejectAppointment = async (id: number, reason: string): Promise<Appointment> => {
  try {
    const response = await apiClient.patch(`/appointments/${id}/reject`, { reason });
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error rejecting appointment:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
    }
    throw new Error('Error al rechazar la cita');
  }
};

// Obtener citas pendientes (psicólogo)
export const getPendingAppointments = async (): Promise<Appointment[]> => {
  try {
    const response = await apiClient.get('/appointments/pending');
    return response.data.data || response.data;
  } catch (error: unknown) {
    console.error('Error fetching pending appointments:', error);
    throw new Error('Error al obtener las citas pendientes');
  }
}; 