// Servicio de feriados con datos locales para garantizar que funcione
import { Holiday } from './holidays';

// Feriados fijos de Perú para 2025
const PERU_HOLIDAYS_2025: Holiday[] = [
  {
    id: 1,
    name: "Año Nuevo",
    date: "2025-01-01",
    type: "national",
    is_national: true,
    is_regional: false,
    region: null,
    description: "Año Nuevo - Feriado Nacional",
    year: 2025,
    is_active: true,
    formatted_date: "01/01/2025"
  },
  {
    id: 2,
    name: "Jueves Santo",
    date: "2025-04-17",
    type: "national",
    is_national: true,
    is_regional: false,
    region: null,
    description: "Jueves Santo - Feriado Nacional",
    year: 2025,
    is_active: true,
    formatted_date: "17/04/2025"
  },
  {
    id: 3,
    name: "Viernes Santo",
    date: "2025-04-18",
    type: "national",
    is_national: true,
    is_regional: false,
    region: null,
    description: "Viernes Santo - Feriado Nacional",
    year: 2025,
    is_active: true,
    formatted_date: "18/04/2025"
  },
  {
    id: 4,
    name: "Día del Trabajo",
    date: "2025-05-01",
    type: "national",
    is_national: true,
    is_regional: false,
    region: null,
    description: "Día del Trabajo - Feriado Nacional",
    year: 2025,
    is_active: true,
    formatted_date: "01/05/2025"
  },
  {
    id: 5,
    name: "Fiestas Patrias - Día de la Independencia",
    date: "2025-07-28",
    type: "national",
    is_national: true,
    is_regional: false,
    region: null,
    description: "Día de la Independencia del Perú",
    year: 2025,
    is_active: true,
    formatted_date: "28/07/2025"
  },
  {
    id: 6,
    name: "Fiestas Patrias - Día de la Gran Parada Militar",
    date: "2025-07-29",
    type: "national",
    is_national: true,
    is_regional: false,
    region: null,
    description: "Día de la Gran Parada Militar",
    year: 2025,
    is_active: true,
    formatted_date: "29/07/2025"
  },
  {
    id: 7,
    name: "Santa Rosa de Lima",
    date: "2025-08-30",
    type: "national",
    is_national: true,
    is_regional: false,
    region: null,
    description: "Santa Rosa de Lima - Patrona de América",
    year: 2025,
    is_active: true,
    formatted_date: "30/08/2025"
  },
  {
    id: 8,
    name: "Combate de Angamos",
    date: "2025-10-08",
    type: "national",
    is_national: true,
    is_regional: false,
    region: null,
    description: "Combate de Angamos - Feriado Nacional",
    year: 2025,
    is_active: true,
    formatted_date: "08/10/2025"
  },
  {
    id: 9,
    name: "Todos los Santos",
    date: "2025-11-01",
    type: "national",
    is_national: true,
    is_regional: false,
    region: null,
    description: "Día de Todos los Santos",
    year: 2025,
    is_active: true,
    formatted_date: "01/11/2025"
  },
  {
    id: 10,
    name: "Inmaculada Concepción",
    date: "2025-12-08",
    type: "national",
    is_national: true,
    is_regional: false,
    region: null,
    description: "Inmaculada Concepción - Feriado Nacional",
    year: 2025,
    is_active: true,
    formatted_date: "08/12/2025"
  },
  {
    id: 11,
    name: "Navidad",
    date: "2025-12-25",
    type: "national",
    is_national: true,
    is_regional: false,
    region: null,
    description: "Navidad - Feriado Nacional",
    year: 2025,
    is_active: true,
    formatted_date: "25/12/2025"
  },
  // Feriados regionales de Lima
  {
    id: 12,
    name: "Señor de los Milagros",
    date: "2025-10-18",
    type: "regional",
    is_national: false,
    is_regional: true,
    region: "Lima",
    description: "Señor de los Milagros - Feriado Regional de Lima",
    year: 2025,
    is_active: true,
    formatted_date: "18/10/2025"
  },
  {
    id: 13,
    name: "San Martín de Porres",
    date: "2025-11-03",
    type: "regional",
    is_national: false,
    is_regional: true,
    region: "Lima",
    description: "San Martín de Porres - Feriado Regional de Lima",
    year: 2025,
    is_active: true,
    formatted_date: "03/11/2025"
  }
];

class HolidayLocalService {
  /**
   * Obtener todos los feriados del año actual
   */
  getAllHolidays(): Holiday[] {
    return PERU_HOLIDAYS_2025;
  }

  /**
   * Obtener feriados para un mes específico
   */
  getHolidaysForMonth(year: number, month: number, region?: string): Holiday[] {
    return PERU_HOLIDAYS_2025.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      const isCorrectMonth = holidayDate.getFullYear() === year && (holidayDate.getMonth() + 1) === month;
      
      if (!isCorrectMonth) return false;
      
      // Si se especifica región, incluir nacionales y de esa región
      if (region) {
        return holiday.is_national || (holiday.region === region);
      }
      
      // Si no se especifica región, solo nacionales
      return holiday.is_national;
    });
  }

  /**
   * Verificar si una fecha específica es feriado
   */
  isHolidayDate(date: Date, holidays: Holiday[]): Holiday | null {
    const dateString = date.toISOString().split('T')[0];
    const holiday = holidays.find(holiday => holiday.date === dateString);
    return holiday || null;
  }

  /**
   * Obtener próximos feriados
   */
  getUpcomingHolidays(days: number = 30, region?: string): Holiday[] {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return PERU_HOLIDAYS_2025.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      const isInRange = holidayDate >= today && holidayDate <= futureDate;
      
      if (!isInRange) return false;
      
      // Aplicar filtro de región
      if (region) {
        return holiday.is_national || (holiday.region === region);
      }
      
      return holiday.is_national;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Generar eventos para el calendario
   */
  getHolidayEventsForCalendar(startDate: Date, endDate: Date, region?: string): Array<{
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: { type: string; data: Holiday };
  }> {
    const holidays = this.getAllHolidays();
    
    return holidays
      .filter(holiday => {
        const holidayDate = new Date(holiday.date);
        const isInRange = holidayDate >= startDate && holidayDate <= endDate;
        
        if (!isInRange) return false;
        
        // Aplicar filtro de región
        if (region) {
          return holiday.is_national || (holiday.region === region);
        }
        
        return holiday.is_national;
      })
      .map(holiday => ({
        id: `holiday-${holiday.id}`,
        title: `🎉 ${holiday.name}`,
        start: new Date(holiday.date),
        end: new Date(holiday.date),
        allDay: true,
        resource: { type: 'holiday', data: holiday }
      }));
  }

  /**
   * Obtener CSS class para un día específico
   */
  getHolidayCSSClass(date: Date, holidays: Holiday[]): string {
    const holiday = this.isHolidayDate(date, holidays);
    if (!holiday) return '';
    
    return holiday.is_national ? 'holiday-national' : 'holiday-regional';
  }

  /**
   * Obtener tooltip para un día específico
   */
  getHolidayTooltip(date: Date, holidays: Holiday[]): string | null {
    const holiday = this.isHolidayDate(date, holidays);
    if (!holiday) return null;
    
    const scope = holiday.is_national ? 'Nacional' : `Regional (${holiday.region})`;
    return `🎉 ${holiday.name} - ${scope}`;
  }
}

export const holidayLocalService = new HolidayLocalService();




