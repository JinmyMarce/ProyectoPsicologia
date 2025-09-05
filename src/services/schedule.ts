import { apiClient } from './apiClient';

export interface BlockedSchedule {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isFullDayBlocked: boolean;
  reason: string;
  psychologistId: number;
  affectedAppointments: number;
  createdAt: string;
}

export interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  hasAppointment: boolean;
  isBlocked: boolean;
  reason?: string;
}

export interface DaySchedule {
  date: string;
  dayName: string;
  isFullDayBlocked: boolean;
  fullDayReason?: string;
  blocks: TimeBlock[];
}

// Obtener horarios bloqueados del psicólogo
export const getBlockedSchedules = async (psychologistId: number, startDate: string, endDate: string): Promise<BlockedSchedule[]> => {
  try {
    const response = await apiClient.get(`/psychologist-dashboard/schedules/blocked`, {
      params: {
        psychologist_id: psychologistId,
        start_date: startDate,
        end_date: endDate
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching blocked schedules:', error);
    throw error;
  }
};

// Crear un bloqueo de horario
export const createScheduleBlock = async (data: {
  psychologistId: number;
  date: string;
  startTime?: string;
  endTime?: string;
  isFullDayBlocked: boolean;
  reason: string;
}): Promise<BlockedSchedule> => {
  try {
    const response = await apiClient.post('/psychologist-dashboard/schedules/block', data);
    return response.data;
  } catch (error) {
    console.error('Error creating schedule block:', error);
    throw error;
  }
};

// Eliminar un bloqueo de horario
export const removeScheduleBlock = async (blockId: string): Promise<void> => {
  try {
    await apiClient.delete(`/psychologist-dashboard/schedules/block/${blockId}`);
  } catch (error) {
    console.error('Error removing schedule block:', error);
    throw error;
  }
};

// Obtener disponibilidad para una fecha específica
export const getAvailabilityForDate = async (psychologistId: number, date: string): Promise<DaySchedule | null> => {
  try {
    const response = await apiClient.get(`/psychologist-dashboard/schedules/availability/${date}`, {
      params: { psychologist_id: psychologistId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching availability:', error);
    throw error;
  }
};

// Verificar si una fecha/hora está disponible para agendar
export const checkSlotAvailability = async (
  psychologistId: number, 
  date: string, 
  time: string
): Promise<{ available: boolean; reason?: string }> => {
  try {
    const response = await apiClient.get(`/psychologist-dashboard/schedules/check-availability`, {
      params: {
        psychologist_id: psychologistId,
        date,
        time
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking slot availability:', error);
    throw error;
  }
};

// Obtener horarios bloqueados para mostrar en calendarios
export const getBlockedDatesForCalendar = async (
  psychologistId: number, 
  month: number, 
  year: number
): Promise<string[]> => {
  try {
    const startDate = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${lastDay}`;
    
    const blockedSchedules = await getBlockedSchedules(psychologistId, startDate, endDate);
    
    // Verificar que blockedSchedules sea un array antes de usar filter
    if (!Array.isArray(blockedSchedules)) {
      console.warn('blockedSchedules is not an array:', blockedSchedules);
      return [];
    }
    
    // Retornar solo las fechas que están completamente bloqueadas
    return blockedSchedules
      .filter(schedule => schedule && schedule.isFullDayBlocked)
      .map(schedule => schedule.date);
  } catch (error) {
    console.error('Error fetching blocked dates for calendar:', error);
    // Retornar array vacío en caso de error para evitar que el calendario falle
    return [];
  }
};



// Función para verificar si una fecha está bloqueada (para calendarios)
export const isDateBlocked = (date: string, blockedSchedules: BlockedSchedule[]): boolean => {
  return blockedSchedules.some(schedule => 
    schedule.date === date && schedule.isFullDayBlocked
  );
};

// Función para verificar si un bloque de tiempo específico está bloqueado
export const isTimeBlockBlocked = (
  date: string, 
  time: string, 
  blockedSchedules: BlockedSchedule[]
): { blocked: boolean; reason?: string } => {
  const schedule = blockedSchedules.find(s => s.date === date);
  
  if (!schedule) {
    return { blocked: false };
  }
  
  if (schedule.isFullDayBlocked) {
    return { blocked: true, reason: schedule.reason };
  }
  
  // Verificar bloqueos específicos de tiempo
  if (schedule.startTime && schedule.endTime) {
    const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
    const startMinutes = parseInt(schedule.startTime.split(':')[0]) * 60 + parseInt(schedule.startTime.split(':')[1]);
    const endMinutes = parseInt(schedule.endTime.split(':')[0]) * 60 + parseInt(schedule.endTime.split(':')[1]);
    
    if (timeMinutes >= startMinutes && timeMinutes < endMinutes) {
      return { blocked: true, reason: schedule.reason };
    }
  }
  
  return { blocked: false };
}; 