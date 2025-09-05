// Servicio de feriados local con datos de ejemplo para 2025 y años futuros
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

// Datos de feriados nacionales de Perú para 2025 (oficiales)
const nationalHolidays2025 = [
  {
    id: 1,
    name: 'Año Nuevo',
    date: '2025-01-01',
    type: 'fijo',
    description: 'Celebración del primer día del año',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 2,
    name: 'Jueves Santo',
    date: '2025-04-17',
    type: 'movil',
    description: 'Conmemoración de la Última Cena de Jesucristo',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 3,
    name: 'Viernes Santo',
    date: '2025-04-18',
    type: 'movil',
    description: 'Conmemoración de la crucifixión de Jesucristo',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 4,
    name: 'Día del Trabajo',
    date: '2025-05-01',
    type: 'fijo',
    description: 'Día Internacional del Trabajo',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 5,
    name: 'Batalla de Arica y Día de la Bandera',
    date: '2025-06-07',
    type: 'fijo',
    description: 'Conmemoración de la Batalla de Arica y Día de la Bandera',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 6,
    name: 'San Pedro y San Pablo',
    date: '2025-06-29',
    type: 'fijo',
    description: 'Festividad religiosa católica',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 7,
    name: 'Día de la Fuerza Aérea del Perú',
    date: '2025-07-23',
    type: 'fijo',
    description: 'Día de la Fuerza Aérea del Perú',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 8,
    name: 'Día de la Independencia',
    date: '2025-07-28',
    type: 'fijo',
    description: 'Proclamación de la independencia del Perú',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 9,
    name: 'Día de las Fuerzas Armadas',
    date: '2025-07-29',
    type: 'fijo',
    description: 'Día en honor a las Fuerzas Armadas del Perú',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 10,
    name: 'Batalla de Junín',
    date: '2025-08-06',
    type: 'fijo',
    description: 'Conmemoración de la Batalla de Junín',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 11,
    name: 'Santa Rosa de Lima',
    date: '2025-08-30',
    type: 'fijo',
    description: 'Día de la patrona de Lima y del Perú',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 12,
    name: 'Combate de Angamos',
    date: '2025-10-08',
    type: 'fijo',
    description: 'Conmemoración del heroísmo de Miguel Grau',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 13,
    name: 'Día de Todos los Santos',
    date: '2025-11-01',
    type: 'fijo',
    description: 'Día de Todos los Santos',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 14,
    name: 'Inmaculada Concepción',
    date: '2025-12-08',
    type: 'fijo',
    description: 'Festividad católica de la Inmaculada Concepción',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 15,
    name: 'Batalla de Ayacucho',
    date: '2025-12-09',
    type: 'fijo',
    description: 'Conmemoración de la Batalla de Ayacucho',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  },
  {
    id: 16,
    name: 'Navidad',
    date: '2025-12-25',
    type: 'fijo',
    description: 'Celebración del nacimiento de Jesucristo',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: 2025
  }
];

// Función para generar feriados para años futuros
const generateHolidaysForYear = (year: number): Holiday[] => {
  const holidays = [];
  let id = 1;

  // Feriados fijos (misma fecha todos los años) - Lista oficial 2025
  const fixedHolidays = [
    { name: 'Año Nuevo', date: '01-01', type: 'fijo', description: 'Celebración del primer día del año' },
    { name: 'Día del Trabajo', date: '05-01', type: 'fijo', description: 'Día Internacional del Trabajo' },
    { name: 'Batalla de Arica y Día de la Bandera', date: '06-07', type: 'fijo', description: 'Conmemoración de la Batalla de Arica y Día de la Bandera' },
    { name: 'San Pedro y San Pablo', date: '06-29', type: 'fijo', description: 'Festividad religiosa católica' },
    { name: 'Día de la Fuerza Aérea del Perú', date: '07-23', type: 'fijo', description: 'Día de la Fuerza Aérea del Perú' },
    { name: 'Día de la Independencia', date: '07-28', type: 'fijo', description: 'Proclamación de la independencia del Perú' },
    { name: 'Día de las Fuerzas Armadas', date: '07-29', type: 'fijo', description: 'Día en honor a las Fuerzas Armadas del Perú' },
    { name: 'Batalla de Junín', date: '08-06', type: 'fijo', description: 'Conmemoración de la Batalla de Junín' },
    { name: 'Santa Rosa de Lima', date: '08-30', type: 'fijo', description: 'Día de la patrona de Lima y del Perú' },
    { name: 'Combate de Angamos', date: '10-08', type: 'fijo', description: 'Conmemoración del heroísmo de Miguel Grau' },
    { name: 'Día de Todos los Santos', date: '11-01', type: 'fijo', description: 'Día de Todos los Santos' },
    { name: 'Inmaculada Concepción', date: '12-08', type: 'fijo', description: 'Festividad católica de la Inmaculada Concepción' },
    { name: 'Batalla de Ayacucho', date: '12-09', type: 'fijo', description: 'Conmemoración de la Batalla de Ayacucho' },
    { name: 'Navidad', date: '12-25', type: 'fijo', description: 'Celebración del nacimiento de Jesucristo' }
  ];

  // Agregar feriados fijos
  const today = new Date();
  fixedHolidays.forEach(holiday => {
    const date = new Date(`${year}-${holiday.date}`);
    
    holidays.push({
      id: id++,
      name: holiday.name,
      date: `${year}-${holiday.date}`,
      formatted_date: date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      formatted_date_full: date.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      type: holiday.type,
      description: holiday.description,
    is_national: true,
    is_regional: false,
      region: 'Nacional',
      year: year,
      is_today: date.toDateString() === today.toDateString(),
      is_past: date < today,
      is_future: date > today,
      days_until: Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    });
  });

  // Calcular fechas móviles (Semana Santa)
  const easterDate = calculateEasterDate(year);
  const thursdayDate = new Date(easterDate);
  thursdayDate.setDate(easterDate.getDate() - 3);
  const fridayDate = new Date(easterDate);
  fridayDate.setDate(easterDate.getDate() - 2);

  // Agregar Jueves Santo
  holidays.push({
    id: id++,
    name: 'Jueves Santo',
    date: thursdayDate.toISOString().split('T')[0],
    formatted_date: thursdayDate.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    formatted_date_full: thursdayDate.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    type: 'movil',
    description: 'Conmemoración de la Última Cena de Jesucristo',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: year,
    is_today: thursdayDate.toDateString() === today.toDateString(),
    is_past: thursdayDate < today,
    is_future: thursdayDate > today,
    days_until: Math.ceil((thursdayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  });

  // Agregar Viernes Santo
  holidays.push({
    id: id++,
    name: 'Viernes Santo',
    date: fridayDate.toISOString().split('T')[0],
    formatted_date: fridayDate.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    formatted_date_full: fridayDate.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    type: 'movil',
    description: 'Conmemoración de la crucifixión de Jesucristo',
    is_national: true,
    is_regional: false,
    region: 'Nacional',
    year: year,
    is_today: fridayDate.toDateString() === today.toDateString(),
    is_past: fridayDate < today,
    is_future: fridayDate > today,
    days_until: Math.ceil((fridayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  });

  return holidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Algoritmo de Meeus/Jones/Butcher para calcular la fecha de Pascua
const calculateEasterDate = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
};

class LocalHolidayService {
  async getHolidays(year?: number, region?: string): Promise<Holiday[]> {
    try {
      const targetYear = year || new Date().getFullYear();
      
      // Si es 2025, usar los datos predefinidos
      if (targetYear === 2025) {
        const today = new Date();
        return nationalHolidays2025.map(holiday => {
          const date = new Date(holiday.date);
          return {
            ...holiday,
            formatted_date: date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            formatted_date_full: date.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            is_today: date.toDateString() === today.toDateString(),
            is_past: date < today,
            is_future: date > today,
            days_until: Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          };
        });
      }
      
      // Para otros años, generar dinámicamente
      return generateHolidaysForYear(targetYear);
    } catch (error) {
      console.error('Error getting local holidays:', error);
      return [];
    }
  }

  async getHolidaysInRange(startDate: string, endDate: string): Promise<Holiday[]> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startYear = start.getFullYear();
      const endYear = end.getFullYear();
      
      let allHolidays: Holiday[] = [];
      
      // Obtener feriados para cada año en el rango
      for (let year = startYear; year <= endYear; year++) {
        const yearHolidays = await this.getHolidays(year);
        allHolidays = allHolidays.concat(yearHolidays);
      }
      
      // Filtrar por rango de fechas
      return allHolidays.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate >= start && holidayDate <= end;
      });
    } catch (error) {
      console.error('Error getting holidays in range:', error);
      return [];
    }
  }

  async checkDate(date: string): Promise<boolean> {
    try {
      const targetDate = new Date(date);
      const year = targetDate.getFullYear();
      const holidays = await this.getHolidays(year);
      
      return holidays.some(holiday => holiday.date === date);
    } catch (error) {
      console.error('Error checking holiday date:', error);
      return false;
    }
  }

  /**
   * Verificar si una fecha específica es feriado (método síncrono)
   */
  isHolidayDate(date: Date, holidays: Holiday[]): Holiday | null {
    const dateString = date.toISOString().split('T')[0];
    return holidays.find(holiday => holiday.date === dateString) || null;
  }
}

export const localHolidayService = new LocalHolidayService();
