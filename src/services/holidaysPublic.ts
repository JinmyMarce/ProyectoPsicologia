// Servicio simplificado para feriados que no require autenticación
import { Holiday } from './holidays';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class HolidayPublicService {
  /**
   * Obtener feriados para un mes específico sin autenticación
   */
  async getHolidaysForMonth(year: number, month: number, region?: string): Promise<Holiday[]> {
    try {
      console.log(`🔍 Buscando feriados para ${month}/${year} en ${region || 'Nacional'}`);
      
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const response = await fetch(`${API_BASE}/holidays/get-in-range`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          region
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Feriados encontrados para ${month}/${year}:`, data.data?.length || 0);
      
      return data.data || [];
    } catch (error) {
      console.error(`❌ Error cargando feriados para ${month}/${year}:`, error);
      return [];
    }
  }

  /**
   * Verificar si una fecha específica es feriado
   */
  isHolidayDate(date: Date, holidays: Holiday[]): Holiday | null {
    const dateString = date.toISOString().split('T')[0];
    const holiday = holidays.find(holiday => holiday.date === dateString);
    
    if (holiday) {
      console.log(`🎉 Feriado detectado: ${holiday.name} en ${dateString}`);
    }
    
    return holiday || null;
  }

  /**
   * Obtener próximos feriados sin autenticación
   */
  async getUpcomingHolidays(days: number = 30, region?: string): Promise<Holiday[]> {
    try {
      console.log(`🔍 Buscando próximos feriados (${days} días)`);
      
      const response = await fetch(`${API_BASE}/holidays/upcoming?days=${days}${region ? `&region=${region}` : ''}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Próximos feriados encontrados:`, data.data?.length || 0);
      
      return data.data || [];
    } catch (error) {
      console.error('❌ Error cargando próximos feriados:', error);
      return [];
    }
  }

  /**
   * Verificar si una fecha específica es feriado (API)
   */
  async checkHolidayByDate(date: string, region?: string): Promise<{ is_holiday: boolean; holiday: Holiday | null }> {
    try {
      console.log(`🔍 Verificando si ${date} es feriado`);
      
      const response = await fetch(`${API_BASE}/holidays/check-date`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          date,
          region
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Resultado verificación ${date}:`, data.data?.is_holiday ? 'Es feriado' : 'No es feriado');
      
      return {
        is_holiday: data.data?.is_holiday || false,
        holiday: data.data?.holiday || null
      };
    } catch (error) {
      console.error(`❌ Error verificando fecha ${date}:`, error);
      return { is_holiday: false, holiday: null };
    }
  }

  /**
   * Probar conectividad con la API
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Probando conexión con API de feriados...');
      
      const response = await fetch(`${API_BASE}/holidays/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Conexión exitosa con API de feriados:', data.success);
      
      return data.success || false;
    } catch (error) {
      console.error('❌ Error de conexión con API de feriados:', error);
      return false;
    }
  }
}

export const holidayPublicService = new HolidayPublicService();

































