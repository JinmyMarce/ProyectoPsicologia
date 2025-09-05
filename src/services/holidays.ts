import { apiClient } from './apiClient';

// Tipos para la API de feriados
export interface Holiday {
  id: number;
  name: string;
  date: string;
  formatted_date: string;
  formatted_date_full: string;
  type: string;
  description: string;
  is_national: boolean;
  is_regional: boolean;
  region: string;
  year: number;
  is_today: boolean;
  is_past: boolean;
  is_future: boolean;
  days_until: number;
}

export interface HolidaysResponse {
  success: boolean;
  message: string;
  data: Holiday[];
  meta: {
    total: number;
    year: number;
    region: string;
  };
}

export interface HolidayCheckResponse {
  success: boolean;
  message: string;
  data: {
    date: string;
    is_holiday: boolean;
    holiday: Holiday | null;
  };
}

export interface HolidayStatsResponse {
  success: boolean;
  message: string;
  data: {
    current_year: {
      year: number;
      total_holidays: number;
      past_holidays: number;
      upcoming_holidays: number;
    };
    next_holiday: {
      name: string;
      date: string;
      formatted_date: string;
      days_until: number;
      type: string;
    } | null;
    upcoming_30_days: {
      count: number;
      holidays: Array<{
        name: string;
        date: string;
        days_until: number;
      }>;
    };
    by_type: Record<string, number>;
    region: string;
  };
}

class HolidayService {
  private baseUrl = 'http://localhost:8000/api';

  async getHolidays(year?: number, region?: string): Promise<Holiday[]> {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      if (region) params.append('region', region);

      const response = await fetch(`${this.baseUrl}/holidays?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error al obtener feriados: ${response.status}`);
      }

      const data: HolidaysResponse = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al obtener feriados');
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return [];
    }
  }

  async getHolidaysInRange(startDate: string, endDate: string): Promise<Holiday[]> {
    try {
      const response = await fetch(`${this.baseUrl}/holidays/get-in-range`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate
        })
      });

      if (!response.ok) {
        throw new Error(`Error al obtener feriados: ${response.status}`);
      }

      const data: HolidaysResponse = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al obtener feriados');
      }
    } catch (error) {
      console.error('Error fetching holidays in range:', error);
      return [];
    }
  }

  async checkDate(date: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/holidays/check-date`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.success && data.data.is_holiday;
    } catch (error) {
      console.error('Error checking holiday date:', error);
      return false;
    }
  }

  /**
   * Obtener próximos feriados
   */
  async getUpcomingHolidays(params?: {
    days?: number;
    region?: string;
  }): Promise<HolidaysResponse> {
    const response = await apiClient.get('/holidays/upcoming', { params });
    return response.data;
  }

  /**
   * Verificar si una fecha específica es feriado
   */
  async checkHolidayByDate(date: string, region?: string): Promise<HolidayCheckResponse> {
    const response = await apiClient.post('/holidays/check-date', {
      date,
      region
    });
    return response.data;
  }

  /**
   * Obtener feriados por año específico
   */
  async getHolidaysByYear(year: number, region?: string): Promise<HolidaysResponse> {
    const response = await apiClient.get(`/holidays/year/${year}`, {
      params: { region }
    });
    return response.data;
  }

  /**
   * Obtener estadísticas de feriados
   */
  async getHolidayStats(region?: string): Promise<HolidayStatsResponse> {
    const response = await apiClient.get('/holidays/stats', {
      params: { region }
    });
    return response.data;
  }

  /**
   * Verificar si hay feriados en los próximos días
   */
  async hasUpcomingHolidays(days: number = 7): Promise<boolean> {
    try {
      const response = await this.getUpcomingHolidays({ days });
      return response.data.length > 0;
    } catch (error) {
      console.error('Error checking upcoming holidays:', error);
      return false;
    }
  }

  /**
   * Obtener el próximo feriado
   */
  async getNextHoliday(region?: string): Promise<Holiday | null> {
    try {
      const response = await this.getUpcomingHolidays({ days: 365, region });
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Error getting next holiday:', error);
      return null;
    }
  }

  /**
   * Formatear fecha para mostrar
   */
  formatHolidayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Obtener descripción de días hasta el feriado
   */
  getDaysUntilDescription(daysUntil: number): string {
    if (daysUntil < 0) {
      return 'Ya pasó';
    } else if (daysUntil === 0) {
      return 'Hoy';
    } else if (daysUntil === 1) {
      return 'Mañana';
    } else if (daysUntil <= 7) {
      return `En ${daysUntil} días`;
    } else if (daysUntil <= 30) {
      const weeks = Math.floor(daysUntil / 7);
      return `En ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else {
      const months = Math.floor(daysUntil / 30);
      return `En ${months} mes${months > 1 ? 'es' : ''}`;
    }
  }

  /**
   * Verificar si una fecha cae en fin de semana o feriado
   */
  async isNonWorkingDay(date: string, region?: string): Promise<boolean> {
    try {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      
      // Verificar si es fin de semana (sábado = 6, domingo = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return true;
      }

      // Verificar si es feriado
      const holidayCheck = await this.checkHolidayByDate(date, region);
      return holidayCheck.data.is_holiday;
    } catch (error) {
      console.error('Error checking non-working day:', error);
      return false;
    }
  }

  /**
   * Obtener feriados del mes actual
   */
  async getCurrentMonthHolidays(region?: string): Promise<Holiday[]> {
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const response = await this.getHolidaysInRange(startDate, endDate);
      
      return response;
    } catch (error) {
      console.error('Error getting current month holidays:', error);
      return [];
    }
  }

  /**
   * Obtener feriados para un mes específico
   */
  async getHolidaysForMonth(year: number, month: number, region?: string): Promise<Holiday[]> {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const response = await this.getHolidaysInRange(startDate, endDate);
      
      return response;
    } catch (error) {
      console.error('Error getting holidays for month:', error);
      return [];
    }
  }

  /**
   * Obtener eventos de feriados para react-big-calendar
   */
  async getHolidayEventsForCalendar(startDate: Date, endDate: Date, region?: string): Promise<Array<{
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: {
      type: 'holiday';
      holiday: Holiday;
      isNational: boolean;
      description: string;
    };
  }>> {
    try {
      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];
      
      const response = await this.getHolidaysInRange(start, end);
      
      return response.map(holiday => {
        const holidayDate = new Date(holiday.date);
        return {
          id: holiday.id,
          title: holiday.name,
          start: holidayDate,
          end: holidayDate,
          allDay: true,
          resource: {
            type: 'holiday' as const,
            holiday,
            isNational: holiday.is_national,
            description: holiday.description
          }
        };
      });
    } catch (error) {
      console.error('Error getting holiday events for calendar:', error);
      return [];
    }
  }

  /**
   * Verificar si una fecha específica es feriado (método rápido)
   */
  isHolidayDate(date: Date, holidays: Holiday[]): Holiday | null {
    const dateString = date.toISOString().split('T')[0];
    return holidays.find(holiday => holiday.date === dateString) || null;
  }

  /**
   * Obtener clase CSS para días feriados en calendarios
   */
  getHolidayCSSClass(date: Date, holidays: Holiday[]): string {
    const holiday = this.isHolidayDate(date, holidays);
    if (!holiday) return '';
    
    if (holiday.is_national) {
      return 'holiday-national';
    } else if (holiday.is_regional) {
      return 'holiday-regional';
    }
    
    return 'holiday';
  }

  /**
   * Obtener tooltip para días feriados
   */
  getHolidayTooltip(date: Date, holidays: Holiday[]): string | null {
    const holiday = this.isHolidayDate(date, holidays);
    if (!holiday) return null;
    
    const scope = holiday.is_national ? 'Nacional' : `Regional (${holiday.region})`;
    return `${holiday.name} - ${scope}\n${holiday.description}`;
  }
}

export const holidayService = new HolidayService();
