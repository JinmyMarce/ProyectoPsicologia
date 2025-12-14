import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Sun,
  CloudRain,
  Filter,
  Plus,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  MapPin
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { AlertModal } from './AlertModal';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';
import { holidayService } from '../../services/holidays';
import { localHolidayService } from '../../services/holidaysLocal';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

// Tipos
interface Holiday {
  id: number;
  name: string;
  date: string;
  description?: string;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  psychologist_name: string;
  status: string;
}

// Mapeo de imágenes para cada feriado
const HOLIDAY_IMAGES: { [key: string]: string } = {
  'Año Nuevo': '/images/Feriados/Añonuevo.png',
  'Batalla de Arica y Día de la Bandera': '/images/Feriados/banderabatallaarica.png',
  'Combate de Angamos': '/images/Feriados/batallaangamos.png',
  'Batalla de Ayacucho': '/images/Feriados/batallaayacucho.png',
  'Batalla de Junín': '/images/Feriados/batalladejunin.png',
  'Combate del 2 de Mayo': '/images/Feriados/combate2demayo.png',
  'Todos los Santos': '/images/Feriados/diadetodoslossantos.png',
  'Día del Trabajo': '/images/Feriados/Diadetrabajor.png',
  'Fiestas Patrias': '/images/Feriados/fiestaspatrias.png',
  'Día de la Fuerza Aérea del Perú': '/images/Feriados/Fuerzaarea.png',
  'Inmaculada Concepción': '/images/Feriados/imaculadaconcepcion.png',
  'Jueves Santo': '/images/Feriados/juevessanto.png',
  'Navidad': '/images/Feriados/navidad.jpg',
  'San Pedro y San Pablo': '/images/Feriados/pedropablo.png',
  'Santa Rosa de Lima': '/images/Feriados/santarosadelima.png',
  'Viernes Santo': '/images/Feriados/Viernessanto.png'
};

// Función para verificar si una imagen existe
const checkImageExists = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Función para obtener la imagen del feriado
const getHolidayImage = (holidayName: string): string => {
  // Rutas corregidas para las imágenes
  const images: { [key: string]: string } = {
    'Año Nuevo': '/images/Feriados/Añonuevo.png',
    'Batalla de Arica': '/images/Feriados/banderabatallaarica.png',
    'Día de la Bandera': '/images/Feriados/banderabatallaarica.png',
    'Combate de Angamos': '/images/Feriados/batallaangamos.png',
    'Batalla de Ayacucho': '/images/Feriados/batallaayacucho.png',
    'Batalla de Junín': '/images/Feriados/batalladejunin.png',
    'Combate del 2 de Mayo': '/images/Feriados/combate2demayo.png',
    'Día de Todos los Santos': '/images/Feriados/diadetodoslossantos.png',
    'Día del Trabajador': '/images/Feriados/Diadetrabajor.png',
    'Día del Trabajo': '/images/Feriados/Diadetrabajor.png',
    'Fiestas Patrias': '/images/Feriados/fiestaspatrias.png',
    'Día de la Fuerza Aérea del Perú': '/images/Feriados/Fuerzaarea.png',
    'Día de las Fuerzas Armadas': '/images/Feriados/fiestaspatrias.png',
    'Día de la Independencia': '/images/Feriados/fiestaspatrias.png',
    'Inmaculada Concepción': '/images/Feriados/imaculadaconcepcion.png',
    'Jueves Santo': '/images/Feriados/juevessanto.png',
    'Navidad': '/images/Feriados/navidad.jpg',
    'San Pedro y San Pablo': '/images/Feriados/pedropablo.png',
    'Santa Rosa de Lima': '/images/Feriados/santarosadelima.png',
    'Viernes Santo': '/images/Feriados/Viernessanto.png'
  };

  // Buscar coincidencias exactas primero
  if (images[holidayName]) {
    return images[holidayName];
  }

  // Buscar coincidencias parciales más inteligentes
  const holidayNameLower = holidayName.toLowerCase().trim();
  
  // Mapeo más específico para casos especiales - Día de Todos los Santos primero para prioridad
  if (holidayNameLower.includes('todos los santos') || holidayNameLower.includes('todoslos santos') || holidayNameLower.includes('dia de todos los santos') || holidayNameLower.includes('día de todos los santos') || holidayNameLower === 'todos los santos') {
    return '/images/Feriados/diadetodoslossantos.png';
  }
  if (holidayNameLower.includes('año nuevo') || holidayNameLower.includes('ano nuevo')) {
    return '/images/Feriados/Añonuevo.png';
  }
  if (holidayNameLower.includes('batalla de arica') || holidayNameLower.includes('día de la bandera')) {
    return '/images/Feriados/banderabatallaarica.png';
  }
  if (holidayNameLower.includes('combate de angamos')) {
    return '/images/Feriados/batallaangamos.png';
  }
  if (holidayNameLower.includes('batalla de ayacucho')) {
    return '/images/Feriados/batallaayacucho.png';
  }
  if (holidayNameLower.includes('batalla de junin')) {
    return '/images/Feriados/batalladejunin.png';
  }
  if (holidayNameLower.includes('combate del 2 de mayo') || holidayNameLower.includes('combate de 2 de mayo')) {
    return '/images/Feriados/combate2demayo.png';
  }
  if (holidayNameLower.includes('dia del trabajador') || holidayNameLower.includes('día del trabajador') || holidayNameLower.includes('día del trabajo')) {
    return '/images/Feriados/Diadetrabajor.png';
  }
  if (holidayNameLower.includes('fiestas patrias')) {
    return '/images/Feriados/fiestaspatrias.png';
  }
  if (holidayNameLower.includes('fuerza aerea') || holidayNameLower.includes('fuerza aérea')) {
    return '/images/Feriados/Fuerzaarea.png';
  }
  if (holidayNameLower.includes('fuerzas armadas')) {
    return '/images/Feriados/fiestaspatrias.png';
  }
  if (holidayNameLower.includes('independencia')) {
    return '/images/Feriados/fiestaspatrias.png';
  }
  if (holidayNameLower.includes('inmaculada concepcion') || holidayNameLower.includes('inmaculada concepción')) {
    return '/images/Feriados/imaculadaconcepcion.png';
  }
  if (holidayNameLower.includes('jueves santo')) {
    return '/images/Feriados/juevessanto.png';
  }
  if (holidayNameLower.includes('navidad')) {
    return '/images/Feriados/navidad.jpg';
  }
  if (holidayNameLower.includes('san pedro y san pablo')) {
    return '/images/Feriados/pedropablo.png';
  }
  if (holidayNameLower.includes('santa rosa de lima')) {
    return '/images/Feriados/santarosadelima.png';
  }
  if (holidayNameLower.includes('viernes santo')) {
    return '/images/Feriados/Viernessanto.png';
  }
  
  // Si no hay coincidencia, usar imagen por defecto
  return '/images/Feriados/fiestaspatrias.png';
};

// Función para obtener la descripción específica del feriado
const getHolidayDescription = (holidayName: string): string => {
  const holidayNameLower = holidayName.toLowerCase();
  
  if (holidayNameLower.includes('año nuevo') || holidayNameLower.includes('ano nuevo')) {
    return 'Celebración del inicio del nuevo año civil. Es un día de reflexión, nuevos propósitos y celebración familiar.';
  }
  if (holidayNameLower.includes('batalla de arica')) {
    return 'Se honra el heroísmo de Alfonso Ugarte en la defensa de Arica. También se celebra la bandera como símbolo patrio.';
  }
  if (holidayNameLower.includes('combate de angamos')) {
    return 'Homenaje al acto heroico del almirante Miguel Grau en defensa del Perú durante la Guerra del Pacífico. Es día de memoria naval y civismo.';
  }
  if (holidayNameLower.includes('batalla de ayacucho')) {
    return 'Conmemoración de la batalla decisiva que selló la independencia del Perú y América del Sur. Celebración de la libertad y soberanía nacional.';
  }
  if (holidayNameLower.includes('batalla de junin')) {
    return 'Se recuerda el enfrentamiento decisivo de 1824, clave en la campaña libertadora sudamericana. Es una jornada de orgullo nacional y reconocimiento histórico.';
  }
  if (holidayNameLower.includes('combate del 2 de mayo') || holidayNameLower.includes('combate de 2 de mayo')) {
    return 'Conmemoración de la heroica defensa del Callao contra la flota española. Celebración del valor y resistencia del pueblo peruano.';
  }
  if (holidayNameLower.includes('dia de todos los santos') || holidayNameLower.includes('día de todos los santos')) {
    return 'Día en que las familias recuerdan a los seres queridos fallecidos con visitas a cementerios, misas y rituales de memoria.';
  }
  if (holidayNameLower.includes('dia del trabajador') || holidayNameLower.includes('día del trabajador')) {
    return 'Celebración internacional del Día del Trabajo. Reconocimiento a la dignidad del trabajo y los derechos laborales de todos los trabajadores.';
  }
  if (holidayNameLower.includes('fiestas patrias')) {
    return 'Celebración de la independencia del Perú. Días de orgullo nacional, desfiles cívicos y celebración de nuestra identidad como nación libre.';
  }
  if (holidayNameLower.includes('fuerza aerea') || holidayNameLower.includes('fuerza aérea')) {
    return 'Homenaje a la Fuerza Aérea del Perú y su contribución a la defensa nacional. Celebración del valor y profesionalismo de nuestros aviadores.';
  }
  if (holidayNameLower.includes('fuerzas armadas')) {
    return 'Homenaje a las Fuerzas Armadas del Perú. Celebración del compromiso con la defensa de la patria y la seguridad nacional.';
  }
  if (holidayNameLower.includes('independencia')) {
    return 'Celebración de la independencia del Perú. Día de orgullo nacional y conmemoración de nuestra libertad como nación soberana.';
  }
  if (holidayNameLower.includes('inmaculada concepcion') || holidayNameLower.includes('inmaculada concepción')) {
    return 'Celebración religiosa de la Inmaculada Concepción de María. Día de fe y devoción para la comunidad católica peruana.';
  }
  if (holidayNameLower.includes('jueves santo')) {
    return 'Día sagrado de la Semana Santa. Conmemoración de la Última Cena de Jesucristo con sus discípulos.';
  }
  if (holidayNameLower.includes('navidad')) {
    return 'Celebración del nacimiento de Jesucristo. Día de paz, amor y unión familiar, celebrado por cristianos y no cristianos.';
  }
  if (holidayNameLower.includes('san pedro y san pablo')) {
    return 'Celebración religiosa de los apóstoles San Pedro y San Pablo. Día de fe y tradición para la comunidad católica.';
  }
  if (holidayNameLower.includes('santa rosa de lima')) {
    return 'Celebración de Santa Rosa de Lima, patrona de América. Día de devoción y ejemplo de virtud cristiana.';
  }
  if (holidayNameLower.includes('viernes santo')) {
    return 'Día sagrado de la Semana Santa. Conmemoración de la pasión y muerte de Jesucristo en la cruz.';
  }
  
  // Descripción por defecto
  return 'Se recuerda el enfrentamiento decisivo de 1824, clave en la campaña libertadora sudamericana.';
};

// Función para determinar el tipo de feriado (cívico o religioso)
const getHolidayType = (holidayName: string): string => {
  const religiousHolidays = [
    'Navidad',
    'Jueves Santo',
    'Viernes Santo',
    'Inmaculada Concepción',
    'San Pedro y San Pablo',
    'Santa Rosa de Lima',
    'Día de Todos los Santos'
  ];

  const civicHolidays = [
    'Año Nuevo',
    'Batalla de Arica',
    'Combate de Angamos',
    'Batalla de Ayacucho',
    'Batalla de Junín',
    'Combate del 2 de Mayo',
    'Día del Trabajador',
    'Fiestas Patrias',
    'Día de la Fuerza Aérea del Perú',
    'Día de las Fuerzas Armadas',
    'Día de la Independencia'
  ];

  // Buscar coincidencias parciales
  for (const holiday of religiousHolidays) {
    if (holidayName.toLowerCase().includes(holiday.toLowerCase())) {
      return 'Religioso';
    }
  }

  for (const holiday of civicHolidays) {
    if (holidayName.toLowerCase().includes(holiday.toLowerCase())) {
      return 'Cívico';
    }
  }

  // Por defecto
  return 'Nacional';
};

// Función para determinar si un feriado debe mostrar título en el modal
const shouldShowTitle = (holidayName: string): boolean => {
  // SIEMPRE mostrar el título en todas las imágenes
  return true;
};

// Función para determinar si una imagen se recorta de arriba
const shouldCropFromTop = (holidayName: string): boolean => {
  // TODAS las imágenes se recortan de abajo para mostrar el título
  return false;
};



interface UnifiedCalendarProps {
  className?: string;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
  availableDates?: Date[];
  blockedDates?: Date[];
  holidays?: Holiday[];
  appointments?: Appointment[];
  userType?: 'student' | 'psychologist' | 'tutor' | 'admin';
  showLegend?: boolean;
  showNavigation?: boolean;
  showHeader?: boolean;
  showToolbar?: boolean;
  showSearch?: boolean;
  onExport?: () => void;
  onRefresh?: () => void;
  onFilterChange?: (filters: any) => void;
  onSearch?: (query: string) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  isAvailable: boolean;
  isBlocked: boolean;
  isAppointment: boolean;
  appointmentData?: any;
  holidayData?: any;
}

export const UnifiedCalendar: React.FC<UnifiedCalendarProps> = ({
  className = '',
  onDateSelect,
  selectedDate,
  availableDates,
  blockedDates = [],
  holidays = [],
  appointments = [],
  userType,
  showLegend = true,
  showNavigation = true,
  showHeader = true,
  showToolbar = true,
  showSearch = true,
  onSearch,
  onFilterChange
}) => {
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateState, setSelectedDateState] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [localHolidays, setLocalHolidays] = useState<Array<{ date: Date; name: string; description?: string }>>([]);
  const [localBlockedDates, setLocalBlockedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    showAvailable: true,
    showBlocked: true,
    showHolidays: true,
    showAppointments: true,
    showWeekends: true,
    showPast: true
  });
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  
  // Estado para modal de feriado
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<{ date: Date; name: string; description?: string } | null>(null);
  
    // Estados para información colapsable (solo uno puede estar abierto)
  const [openSection, setOpenSection] = useState<'description' | 'important' | null>(null);
  
  // Estado para colapsar/expandir descripción de temporada en móviles
  const [showSeasonDescription, setShowSeasonDescription] = useState(false);
  
  // Estado de depuración (opcional)
  const [debugMode, setDebugMode] = useState(false);
  
  // Resetear estados cuando se cierre el modal
  useEffect(() => {
    if (!showHolidayModal) {
      setOpenSection(null);
    }
  }, [showHolidayModal]);
  
  // Función para manejar la apertura/cierre de secciones
  const toggleSection = (section: 'description' | 'important') => {
    if (openSection === section) {
      setOpenSection(null); // Cerrar si ya está abierto
    } else {
      setOpenSection(section); // Abrir la nueva sección y cerrar la otra
    }
  };

  // Cargar feriados de manera ultra rápida al montar el componente
  // Solo si no se pasan como prop
  useEffect(() => {
    // Si ya se pasaron holidays como prop, no cargar
    if (holidays && holidays.length > 0) {
      const formattedHolidays = holidays.map(holiday => ({
        date: dayjs(holiday.date).toDate(),
        name: holiday.name,
        description: holiday.description,
        type: holiday.type,
        is_national: holiday.is_national,
        region: holiday.region
      }));
      setLocalHolidays(formattedHolidays);
      return;
    }

    const loadHolidaysUltraFast = async () => {
      try {
        const currentYear = new Date().getFullYear();
        // Usar servicio local primero para máxima velocidad
        let currentYearHolidays: any[] = [];
        
        try {
          currentYearHolidays = await localHolidayService.getHolidays(currentYear, 'Lima');
          if (currentYearHolidays.length > 0) {
            // Formatear y establecer inmediatamente
            const formattedHolidays = currentYearHolidays.map(holiday => ({
              date: dayjs(holiday.date).toDate(),
              name: holiday.name,
              description: holiday.description,
              type: holiday.type,
              is_national: holiday.is_national,
              region: holiday.region
            }));
            setLocalHolidays(formattedHolidays);
            return;
          }
        } catch (localError) {
          // Si falla el servicio local, usar el remoto
          console.log('Servicio local no disponible, usando remoto');
        }
        
        // Fallback al servicio remoto
        currentYearHolidays = await holidayService.getHolidays(currentYear, 'Lima');
        
        // Convertir y formatear de manera más eficiente
        const formattedHolidays = currentYearHolidays.map(holiday => ({
          date: dayjs(holiday.date).toDate(),
          name: holiday.name,
          description: holiday.description,
          type: holiday.type,
          is_national: holiday.is_national,
          region: holiday.region
        }));
        
        // Filtrar solo feriados activos y nacionales, y eliminar duplicados
        const filteredHolidays = formattedHolidays
          .filter(holiday => {
            // Solo mostrar feriados nacionales activos
            const isActive = holiday.is_national !== false; // Asumir activo si no está definido
            const isNational = holiday.is_national === true || holiday.is_national === undefined;
            return isActive && isNational;
          })
          .filter((holiday, index, self) => {
            // Eliminar duplicados por fecha, manteniendo el primero
          const holidayDate = dayjs(holiday.date).format('YYYY-MM-DD');
          return index === self.findIndex(h => dayjs(h.date).format('YYYY-MM-DD') === holidayDate);
        });
        
        setLocalHolidays(filteredHolidays);
      } catch (error) {
        console.error('Error loading holidays ultra fast:', error);
        // Fallback ultra rápido: cargar solo el año actual
        try {
          const currentYear = new Date().getFullYear();
          const holidaysData = await holidayService.getHolidays(currentYear, 'Lima');
          
          const formattedHolidays = holidaysData
            .map(holiday => ({
            date: dayjs(holiday.date).toDate(),
            name: holiday.name,
            description: holiday.description,
            type: holiday.type,
            is_national: holiday.is_national,
            region: holiday.region
            }))
            .filter(holiday => {
              // Solo mostrar feriados nacionales activos
              const isActive = holiday.is_national !== false;
              const isNational = holiday.is_national === true || holiday.is_national === undefined;
              return isActive && isNational;
            })
            .filter((holiday, index, self) => {
              // Eliminar duplicados por fecha
              const holidayDate = dayjs(holiday.date).format('YYYY-MM-DD');
              return index === self.findIndex(h => dayjs(h.date).format('YYYY-MM-DD') === holidayDate);
            });
          
          setLocalHolidays(formattedHolidays);
        } catch (fallbackError) {
          console.error('Error en fallback rápido de feriados:', fallbackError);
          // Último recurso: array vacío
          setLocalHolidays([]);
        }
      }
    };

            loadHolidaysUltraFast();
  }, [holidays]); // Se ejecuta cuando cambian los holidays o al montar

  // Escuchar eventos de actualización de horarios bloqueados
  useEffect(() => {
    const handleScheduleBlocked = (event: CustomEvent) => {
      const schedule = event.detail.schedule;
      if (schedule && schedule.date) {
        const blockedDate = dayjs(schedule.date).toDate();
        setLocalBlockedDates(prev => {
          // Evitar duplicados
          const dateString = dayjs(blockedDate).format('YYYY-MM-DD');
          const exists = prev.some(d => dayjs(d).format('YYYY-MM-DD') === dateString);
          if (!exists) {
            return [...prev, blockedDate];
          }
          return prev;
        });
      }
    };

    const handleScheduleUnblocked = (event: CustomEvent) => {
      const scheduleId = event.detail.scheduleId;
      // Si tenemos el ID, podemos removerlo, pero como no lo tenemos en localBlockedDates,
      // mejor recargar desde el contexto o las props
      // Por ahora, simplemente recargamos desde blockedDates prop
    };

    const handleScheduleUpdated = () => {
      // Cuando se actualiza el horario, recargar bloqueos desde el contexto
      // Esto se manejará mejor si el componente padre actualiza las props blockedDates
      // Por ahora, simplemente forzamos una actualización visual
      if (blockedDates && blockedDates.length > 0) {
        setLocalBlockedDates(blockedDates.map(d => dayjs(d).toDate()));
      }
    };

    window.addEventListener('scheduleBlocked', handleScheduleBlocked as EventListener);
    window.addEventListener('scheduleUnblocked', handleScheduleUnblocked as EventListener);
    window.addEventListener('scheduleUpdated', handleScheduleUpdated as EventListener);

    return () => {
      window.removeEventListener('scheduleBlocked', handleScheduleBlocked as EventListener);
      window.removeEventListener('scheduleUnblocked', handleScheduleUnblocked as EventListener);
      window.removeEventListener('scheduleUpdated', handleScheduleUpdated as EventListener);
    };
  }, [blockedDates]);

  // Sincronizar localBlockedDates con blockedDates prop cuando cambien
  useEffect(() => {
    if (blockedDates && blockedDates.length > 0) {
      setLocalBlockedDates(blockedDates.map(d => dayjs(d).toDate()));
    }
  }, [blockedDates]);

  // Validaciones de agendamiento
  const isDateAvailableForBooking = (date: Date): boolean => {
    const today = new Date();
    const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
    const todayStart = dayjs(peruTime).startOf('day');
    const dateStart = dayjs(date).startOf('day');
    
    // No se puede agendar días anteriores
    if (dayjs(dateStart).isBefore(todayStart)) {
      return false;
    }
    
    // Función para contar días hábiles (lunes a viernes)
    const countBusinessDays = (start: dayjs.Dayjs, end: dayjs.Dayjs): number => {
      let count = 0;
      let current = start.startOf('day');
      const endDate = end.startOf('day');
      
      while (current.isBefore(endDate)) {
        const dayOfWeek = current.day();
        // Lunes a viernes (1-5) son días hábiles
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          count++;
        }
        current = current.add(1, 'day');
      }
      return count;
    };
    
    // Anticipación mínima de 2 días hábiles
    const businessDaysDifference = countBusinessDays(todayStart, dateStart);
    if (businessDaysDifference < 2) {
      return false;
    }
    
    // No se puede agendar más de 2 semanas adelante
    const twoWeeksFromNow = dayjs(todayStart).add(14, 'day');
    if (dayjs(dateStart).isAfter(twoWeeksFromNow)) {
      return false;
    }
    
    // Verificar si es día hábil (Lunes a Viernes)
    const dayOfWeek = dayjs(date).day();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Domingo o Sábado
      return false;
    }
    
    // Verificar si es feriado - SOLO usar localHolidays para evitar duplicados
    const localHoliday = localHolidays && localHolidays.length > 0 ? localHolidays.some(h => 
      dayjs(h.date).format('YYYY-MM-DD') === dayjs(date).format('YYYY-MM-DD')
    ) : false;
    if (localHoliday) {
      return false;
    }
    
    // Verificar si está bloqueado
    const externalBlocked = blockedDates.some(blockedDate => 
      dayjs(blockedDate).format('YYYY-MM-DD') === dayjs(date).format('YYYY-MM-DD')
    );
    const localBlocked = localBlockedDates.some(blockedDate => 
      dayjs(blockedDate).format('YYYY-MM-DD') === dayjs(date).format('YYYY-MM-DD')
    );
    if (externalBlocked || localBlocked) {
      return false;
    }
    
    return true;
  };
  
  // Función para encontrar el siguiente día hábil disponible
  const getNextAvailableBusinessDay = (startDate: Date): Date => {
    let currentDate = dayjs(startDate);
    const maxAttempts = 30; // Máximo 30 días de búsqueda
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const dayOfWeek = currentDate.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Verificar si es feriado
      const isHoliday = localHolidays && localHolidays.length > 0 ? localHolidays.some(h => 
        dayjs(h.date).format('YYYY-MM-DD') === currentDate.format('YYYY-MM-DD')
      ) : false;
      
      // Verificar si está bloqueado
      const isBlocked = blockedDates.some(blockedDate => 
        dayjs(blockedDate).format('YYYY-MM-DD') === currentDate.format('YYYY-MM-DD')
      ) || localBlockedDates.some(blockedDate => 
        dayjs(blockedDate).format('YYYY-MM-DD') === currentDate.format('YYYY-MM-DD')
      );
      
      // Si es día hábil, no es feriado y no está bloqueado, y cumple con la anticipación mínima
      if (!isWeekend && !isHoliday && !isBlocked) {
        const todayStart = dayjs(new Date().toLocaleString("en-US", {timeZone: "America/Lima"})).startOf('day');
        // Contar días hábiles desde hoy
        let businessDaysCount = 0;
        let checkDate = dayjs(todayStart);
        while (checkDate.isBefore(currentDate) || checkDate.isSame(currentDate, 'day')) {
          const dayOfWeek = checkDate.day();
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            businessDaysCount++;
          }
          if (checkDate.isSame(currentDate, 'day')) {
            break;
          }
          checkDate = checkDate.add(1, 'day');
        }
        // Anticipación mínima de 2 días hábiles
        if (businessDaysCount >= 2) {
          return currentDate.toDate();
        }
      }
      
      // Avanzar al siguiente día
      currentDate = currentDate.add(1, 'day');
      attempts++;
    }
    
    // Si no se encuentra ningún día disponible, retornar la fecha original
    return startDate;
  };

  // CALENDARIO COMPLETAMENTE REESCRITO DESDE CERO
  const generateCalendarDays = (): CalendarDay[] => {
    const start = dayjs(currentMonth).startOf('month');
    const end = dayjs(currentMonth).endOf('month');
    
    // Obtener el primer día de la semana (lunes = 1, domingo = 0)
    const firstDayOfWeek = start.day();
    
    // Calcular cuántos días del mes anterior necesitamos para completar la primera semana
    let daysFromPreviousMonth = 0;
    if (firstDayOfWeek !== 1) { // Si no empieza en lunes
      daysFromPreviousMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    }
    
    // Calcular cuántos días del mes siguiente necesitamos para completar la última semana
    const lastDayOfWeek = end.day();
    let daysFromNextMonth = 0;
    if (lastDayOfWeek !== 0) { // Si no termina en domingo
      daysFromNextMonth = 7 - lastDayOfWeek;
    }
    
    const days: CalendarDay[] = [];
    
    // Agregar días del mes anterior
    for (let i = daysFromPreviousMonth - 1; i >= 0; i--) {
      const date = start.subtract(i + 1, 'day');
      const dateString = date.format('YYYY-MM-DD');
      
      // Verificar si es feriado - SOLO usar localHolidays para evitar duplicados
      const localHoliday = localHolidays && localHolidays.length > 0 ? localHolidays.filter(h => 
        dayjs(h.date).format('YYYY-MM-DD') === dateString
      )[0] : null;
      const holidayData = localHoliday;
      
      days.push({
        date: date.toDate(),
        isCurrentMonth: false,
        isToday: date.isSame(dayjs(), 'day'),
        isPast: date.isBefore(dayjs(), 'day'),
        isWeekend: date.day() === 0 || date.day() === 6,
        isHoliday: !!holidayData,
        isAvailable: false,
        isBlocked: !(date.day() === 0 || date.day() === 6) && localBlockedDates.some(bd => 
          dayjs(bd).format('YYYY-MM-DD') === dateString
        ),
        isAppointment: false,
        appointmentData: null,
        holidayData
      });
    }
    
    // Agregar días del mes actual
    for (let i = 0; i < end.date(); i++) {
      const date = start.add(i, 'day');
      const dateString = date.format('YYYY-MM-DD');
      
      // Verificar si es feriado - SOLO usar localHolidays para evitar duplicados
      const localHoliday = localHolidays && localHolidays.length > 0 ? localHolidays.filter(h => 
        dayjs(h.date).format('YYYY-MM-DD') === dateString
      )[0] : null;
      const holidayData = localHoliday;
      
      // Verificar disponibilidad
      const isAvailable = isDateAvailableForBooking(date.toDate());
      
      // Verificar si está bloqueado (pero NO si es fin de semana)
      const isWeekend = date.day() === 0 || date.day() === 6;
      const externalBlocked = blockedDates && blockedDates.length > 0 ? blockedDates.some(date => 
        dayjs(date).format('YYYY-MM-DD') === dateString
      ) : false;
      const localBlocked = localBlockedDates && localBlockedDates.length > 0 ? localBlockedDates.some(date => 
        dayjs(date).format('YYYY-MM-DD') === dateString
      ) : false;
      const isBlocked = !isWeekend && (externalBlocked || localBlocked);
      
      // Verificar si tiene cita
      const appointmentData = appointments && appointments.length > 0 ? appointments.filter(apt => 
        dayjs(apt.date).format('YYYY-MM-DD') === dateString
      )[0] : null;
      
      days.push({
        date: date.toDate(),
        isCurrentMonth: true,
        isToday: date.isSame(dayjs(), 'day'),
        isPast: date.isBefore(dayjs(), 'day'),
        isWeekend: date.day() === 0 || date.day() === 6,
        isHoliday: !!holidayData,
        isAvailable,
        isBlocked,
        isAppointment: !!appointmentData,
        appointmentData,
        holidayData
      });
    }
    
    // Agregar días del mes siguiente
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const nextMonthDate = end.add(i, 'day');
      const nextMonthDateString = nextMonthDate.format('YYYY-MM-DD');
      
      // Verificar si es feriado - SOLO usar localHolidays para evitar duplicados
      const localHoliday = localHolidays && localHolidays.length > 0 ? localHolidays.filter(h => 
        dayjs(h.date).format('YYYY-MM-DD') === nextMonthDateString
      )[0] : null;
      const holidayData = localHoliday;
      
      days.push({
        date: nextMonthDate.toDate(),
        isCurrentMonth: false,
        isToday: nextMonthDate.isSame(dayjs(), 'day'),
        isPast: nextMonthDate.isBefore(dayjs(), 'day'),
        isWeekend: nextMonthDate.day() === 0 || nextMonthDate.day() === 6,
        isHoliday: !!holidayData,
        isAvailable: false,
        isBlocked: !(nextMonthDate.day() === 0 || nextMonthDate.day() === 6) && localBlockedDates.some(bd => 
          dayjs(bd).format('YYYY-MM-DD') === nextMonthDateString
        ),
        isAppointment: false,
        appointmentData: null,
        holidayData
      });
    }
    
    return days;
  };

  // Usar useMemo para recalcular los días cuando cambie currentMonth
  const calendarDays = useMemo(() => {
    const days = generateCalendarDays();
    return days;
  }, [currentMonth, localHolidays, blockedDates, localBlockedDates, appointments]);

  // Navegación del mes
  const goToPreviousMonth = () => {
    setCurrentMonth(dayjs(currentMonth).subtract(1, 'month').toDate());
  };

  const goToNextMonth = () => {
    setCurrentMonth(dayjs(currentMonth).add(1, 'month').toDate());
  };

  const goToToday = () => {
    setCurrentMonth(dayjs().toDate());
  };

  // Obtener información del mes
  const getMonthInfo = () => {
    const month = currentMonth.getMonth();
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const monthInfo = {
      name: monthNames[month],
      days: dayjs(currentMonth).daysInMonth(),
      weekdays: dayjs(currentMonth).startOf('month').day(),
      isCurrent: dayjs(currentMonth).isSame(dayjs(), 'month')
    };
    
    return monthInfo;
  };

  // Obtener clase CSS para el día
  const getDayClassName = (day: CalendarDay): string => {
    let classes = 'calendar-day';
    
    if (!day.isCurrentMonth) classes += ' other-month';
    if (day.isToday) classes += ' today';
    if (day.isPast) classes += ' past';
    if (day.isWeekend) classes += ' weekend';
    if (day.isHoliday) classes += ' holiday';
    if (day.isAvailable) classes += ' available';
    if (day.isBlocked) classes += ' blocked';
    if (day.isAppointment) classes += ' appointment';
    if (selectedDate && dayjs(day.date).isSame(selectedDate, 'day')) classes += ' selected';
    
    return classes;
  };

  // Obtener color de fondo para el día
  const getDayBackgroundColor = (day: CalendarDay): string => {
    // HOY siempre tiene prioridad - solo muestra su color especial
    if (day.isToday) return 'rgba(30, 64, 175, 0.2)'; // Azul marino suave
    
    // Para otros días, aplicar colores según la leyenda con paleta moderna
    if (day.isHoliday) return 'rgba(239, 68, 68, 0.15)'; // Rojo moderno suave - Feriado
    if (day.isAppointment) return 'rgba(245, 158, 11, 0.15)'; // Ámbar moderno suave - Ocupado
    if (day.isAvailable) return 'rgba(34, 197, 94, 0.2)'; // Verde esmeralda suave - Disponible
    if (day.isBlocked) return 'rgba(156, 163, 175, 0.15)'; // Gris moderno suave - Bloqueado
    if (day.isWeekend) return 'rgba(255, 255, 255, 0.95)'; // Blanco muy claro - Fin de semana
    
    // Verificar si pasa de las 2 semanas
    const today = new Date();
    const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
    const todayStart = dayjs(peruTime).startOf('day');
    const dateStart = dayjs(day.date).startOf('day');
    const twoWeeksFromNow = dayjs(todayStart).add(14, 'day');
    
    if (dayjs(dateStart).isAfter(twoWeeksFromNow)) {
      return 'rgba(255, 255, 255, 0.95)'; // Blanco para más de 2 semanas
    }
    
    if (day.isPast) return 'rgba(255, 255, 255, 0.95)'; // Blanco para días pasados
    return 'rgba(248, 250, 252, 0.9)'; // Slate muy suave para días normales
  };

  // Obtener color del borde para el día
  const getDayBorderColor = (day: CalendarDay): string => {
    if (day.isToday) return '#1e40af'; // Azul marino para hoy
    if (day.isHoliday) return '#ef4444'; // Rojo moderno para feriados
    if (day.isAppointment) return '#f59e0b'; // Ámbar moderno para ocupado
    if (day.isAvailable) return '#22c55e'; // Verde esmeralda para disponible
    if (day.isBlocked) return '#9ca3af'; // Gris para bloqueado
    if (day.isWeekend) return '#9ca3af'; // Gris para fines de semana
    if (day.isPast) return '#e2e8f0'; // Gris claro para días pasados
    return '#f1f5f9'; // Borde slate muy suave por defecto
  };

  // Obtener temporada de Cusco
  const getSeason = () => {
    const month = currentMonth.getMonth() + 1;
    if (month >= 11 || month <= 4) {
      return {
        name: 'Temporada de Lluvias',
        description: 'Días nublados con lluvias ocasionales, clima fresco y húmedo.',
        icon: CloudRain,
        color: 'blue',
        primaryColor: '#3b82f6',
        secondaryColor: '#dbeafe',
        accentColor: '#1d4ed8'
      };
    } else {
      return {
        name: 'Temporada Seca',
        description: 'Días soleados y despejados, clima cálido y seco.',
        icon: Sun,
        color: 'amber',
        primaryColor: '#f59e0b',
        secondaryColor: '#fef3c7',
        accentColor: '#d97706'
      };
    }
  };

  // Manejar clic en día
  const handleDayClick = (day: CalendarDay) => {
    // Si es feriado, mostrar modal de feriado
    if (day.isHoliday && day.holidayData) {
      setSelectedHoliday({
        date: day.date,
        name: day.holidayData.name,
        description: day.holidayData.description
      });
      setShowHolidayModal(true);
      return;
    }
    
    // Si es fin de semana
    if (day.isWeekend) {
      setAlertMessage('Los fines de semana no se atiende.');
      setAlertType('info');
      setShowValidationAlert(true);
      return;
    }
    
    // Si está bloqueado
    if (day.isBlocked) {
      setAlertMessage('Este día está bloqueado por el psicólogo.');
      setAlertType('warning');
      setShowValidationAlert(true);
      return;
    }
    
    // Si es día pasado
    if (day.isPast) {
      setAlertMessage('No se puede seleccionar un día pasado.');
      setAlertType('warning');
      setShowValidationAlert(true);
      return;
    }
    
    // Si tiene disponibilidad, abrir modal de agendamiento directamente
    if (day.isAvailable) {
      setSelectedDateState(day.date);
      
      // Verificar si onDateSelect está disponible
      if (onDateSelect && typeof onDateSelect === 'function') {
        try {
          onDateSelect(day.date);
        } catch (error) {
          console.error('Error al ejecutar onDateSelect:', error);
          setAlertMessage('Error al abrir el modal de agendamiento. Intenta nuevamente.');
          setAlertType('error');
          setShowValidationAlert(true);
        }
      } else {
        // Mostrar mensaje más específico
        if (!onDateSelect) {
          setAlertMessage('Error: No se pudo abrir el modal de agendamiento. El sistema no está configurado correctamente.');
        } else if (typeof onDateSelect !== 'function') {
          setAlertMessage(`Error: El sistema de agendamiento no está configurado correctamente. Tipo recibido: ${typeof onDateSelect}`);
        } else {
          setAlertMessage('Error: Función de agendamiento no disponible. Contacta al administrador.');
        }
        setAlertType('error');
        setShowValidationAlert(true);
      }
      return;
    }
    
    // Si es hoy, verificar disponibilidad especial
    if (day.isToday) {
      const currentTime = new Date();
      const peruTime = new Date(currentTime.toLocaleString("en-US", {timeZone: "America/Lima"}));
      const currentHour = peruTime.getHours();
      const currentMinute = peruTime.getMinutes();
      const cutoffHour = 13;
      const cutoffMinute = 10;
      
      if (currentHour > cutoffHour || (currentHour === cutoffHour && currentMinute > cutoffMinute)) {
        setAlertMessage('Para hoy ya pasó la hora límite de agendamiento (13:10). Puedes agendar para mañana o días futuros.');
        setAlertType('warning');
        setShowValidationAlert(true);
      } else {
        // Verificar si hay al menos 60 minutos de anticipación
        const currentDateTime = dayjs(peruTime);
        const minimumTime = currentDateTime.add(60, 'minute');
        const minimumHour = minimumTime.hour();
        const minimumMinute = minimumTime.minute();
        
        const minutesDifference = minimumTime.diff(currentDateTime, 'minute', true);
        
        if (minutesDifference < 60) {
          setAlertMessage(`Para agendar una cita hoy mismo, necesitas hacer la reserva con al menos 60 minutos de anticipación. Los horarios disponibles son después de las ${minimumHour}:${minimumMinute.toString().padStart(2, '0')}. Puedes agendar para mañana o días futuros.`);
          setAlertType('info');
          setShowValidationAlert(true);
        } else {
          // Si hoy está disponible, abrir directamente el modal de agendamiento
          if (onDateSelect && typeof onDateSelect === 'function') {
            try {
              onDateSelect(day.date);
            } catch (error) {
              console.error('Error al ejecutar onDateSelect para hoy:', error);
              setAlertMessage('Error al abrir el modal de agendamiento. Intenta nuevamente.');
              setAlertType('error');
              setShowValidationAlert(true);
            }
          } else {
            setAlertMessage('Función de agendamiento no disponible. Contacta al administrador.');
            setAlertType('error');
            setShowValidationAlert(true);
          }
        }
      }
      return;
    }
    
    // Si no tiene disponibilidad, mostrar mensaje específico
    setAlertMessage('Este día no tiene horarios disponibles.');
    setAlertType('warning');
    setShowValidationAlert(true);
  };

  // Manejar búsqueda

  // Filtrar días según filtros activos
  const filteredDays = calendarDays.filter(day => {
    if (!activeFilters.showAvailable && day.isAvailable) return false;
    if (!activeFilters.showBlocked && day.isBlocked) return false;
    if (!activeFilters.showHolidays && day.isHoliday) return false;
    if (!activeFilters.showAppointments && day.isAppointment) return false;
    if (!activeFilters.showWeekends && day.isWeekend) return false;
    if (!activeFilters.showPast && day.isPast) return false;
    return true;
  });

  const monthInfo = getMonthInfo();
  const season = getSeason();

  return (
    <div className={`unified-calendar premium-design w-full ${className}`}>
      
      {/* Navegación Premium con Temporadas - Diseño Compacto */}
      {showNavigation && (
        <div className={`mb-1 premium-navigation overflow-hidden rounded-xl group/nav transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:-translate-y-0.5 ${
          season.name === 'Temporada de Lluvias' 
            ? 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 border-2 border-blue-200 shadow-md hover:border-blue-300'
            : 'bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-50 border-2 border-amber-200 shadow-md hover:border-amber-300'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-2 sm:py-2.5 px-4 sm:px-5 relative">
            {/* Patrón de fondo decorativo */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-current to-transparent rounded-full -translate-x-12 -translate-y-12"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-current to-transparent rounded-full translate-x-10 translate-y-10"></div>
            </div>
            
            {/* Controles de navegación y mes centrados */}
            <div className="flex items-center justify-center gap-2 xs:gap-3 sm:gap-4 relative z-10 flex-1 flex-wrap">
              {/* Flecha anterior */}
              {(() => {
                const currentDate = dayjs();
                const currentMonthDate = dayjs(currentMonth);
                const canGoBack = currentMonthDate.isAfter(currentDate.startOf('month')) && !currentMonthDate.isSame(currentDate, 'month');
                
                return canGoBack ? (
                  <Button
                    variant="outline"
                    onClick={goToPreviousMonth}
                    size="sm"
                    className="p-0.5 xs:p-1 hover:scale-110 transition-all duration-300"
                    style={{
                      borderColor: season.primaryColor,
                      color: season.primaryColor,
                      background: season.secondaryColor,
                      borderRadius: '8px',
                      minWidth: '24px',
                      width: '24px',
                      height: '24px',
                      padding: '2px'
                    }}
                  >
                    <ChevronLeft className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
                  </Button>
                ) : (
                  <div className="w-6 h-6 xs:w-7 xs:h-7"></div>
                );
              })()}
              
              {/* Botón Hoy */}
              <Button
                size="sm"
                onClick={goToToday}
                className="px-1.5 xs:px-2.5 py-0.5 xs:py-1 transition-all duration-300 font-bold text-[10px] xs:text-xs shadow-md hover:shadow-lg transform hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${season.primaryColor} 0%, ${season.accentColor} 100%)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: `0 3px 10px ${season.primaryColor}30`,
                  height: '24px'
                }}
              >
                <Calendar className="w-2.5 h-2.5 xs:w-3 xs:h-3 xs:mr-1" />
                <span className="hidden xs:inline">Hoy</span>
              </Button>
              
              {/* Mes y año */}
              <h3 
                className="text-xs xs:text-sm sm:text-base md:text-lg font-black transition-all duration-500 tracking-wide px-2 xs:px-3 sm:px-4"
                style={{
                  color: season.primaryColor,
                  textShadow: `0 1px 3px ${season.primaryColor}20`,
                  minWidth: '110px',
                  textAlign: 'center'
                }}
              >
                {(() => {
                  const monthNames = [
                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                  ];
                  const month = currentMonth.getMonth();
                  const year = currentMonth.getFullYear();
                  return `${monthNames[month]} ${year}`;
                })()}
              </h3>
              
              {/* Flecha siguiente */}
              <Button
                variant="outline"
                onClick={goToNextMonth}
                size="sm"
                className="p-0.5 xs:p-1 hover:scale-110 transition-all duration-300"
                style={{
                  borderColor: season.primaryColor,
                  color: season.primaryColor,
                  background: season.secondaryColor,
                  borderRadius: '8px',
                  minWidth: '24px',
                  width: '24px',
                  height: '24px',
                  padding: '2px'
                }}
              >
                <ChevronRight className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
              </Button>
            </div>
           
            {/* Temporada y descripción a la derecha - Diseño Compacto */}
            <div className="text-center relative z-10 w-full sm:w-auto flex-shrink-0">
              <button
                onClick={() => setShowSeasonDescription(!showSeasonDescription)}
                className="w-full sm:w-auto transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className={`p-0.5 rounded-md shadow-sm transition-all duration-300 hover:scale-105 active:scale-95`} style={{
                  background: `linear-gradient(135deg, ${season.secondaryColor} 0%, ${season.secondaryColor}80 100%)`,
                    border: `1.5px solid ${season.primaryColor}`,
                    boxShadow: `0 1px 5px ${season.primaryColor}25`
                }}>
                    <season.icon className="w-3 h-3" style={{ color: season.primaryColor }} />
                </div>
                  <span className="text-[10px] font-bold tracking-wide" style={{
                  color: season.primaryColor
                }}>
                  {season.name}
                </span>
              </div>
              </button>
              
              {/* Descripción - visible en desktop, colapsable en móvil */}
              <div className={`overflow-hidden transition-all duration-300 ${
                showSeasonDescription ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0 sm:max-h-16 sm:opacity-100'
              }`}>
                <p className="text-[10px] text-gray-700 italic px-1 py-0.5 rounded-md font-medium transition-all duration-300 mt-0.5" style={{
                background: `linear-gradient(135deg, ${season.secondaryColor}80 0%, ${season.secondaryColor}60 100%)`,
                border: `1px solid ${season.primaryColor}40`,
                color: season.primaryColor,
                  boxShadow: `0 1px 3px ${season.primaryColor}20`
              }}>
                "{season.description}"
              </p>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Calendario - Diseño Mejorado */}
      <div className="premium-calendar shadow-xl border-0 overflow-hidden w-full bg-white rounded-2xl">
        <div className="p-2 sm:p-3 bg-white w-full flex flex-col">
          {/* Headers de días - Diseño Premium Responsivo */}
          <div className="grid grid-cols-7 gap-0.5 mb-0.5 w-full">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
              <div
                key={day}
                className="text-center py-1 xs:py-1.5 sm:py-2 px-0.5 xs:px-1 font-black text-[9px] xs:text-[10px] sm:text-xs md:text-sm transition-all duration-300 rounded-lg xs:rounded-xl shadow-lg hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${season.secondaryColor} 0%, ${season.secondaryColor}80 100%)`,
                  color: season.primaryColor,
                  borderBottom: `2px solid ${season.primaryColor}`,
                  textShadow: `0 1px 2px ${season.primaryColor}20`
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Días del calendario - Diseño Mejorado */}
          <div className="grid grid-cols-7 gap-0.5 w-full">
            {filteredDays.map((day, index) => (
              <div
                key={index}
                className={`calendar-day-professional cursor-pointer transition-all duration-500 relative overflow-hidden rounded-lg xs:rounded-xl hover:scale-105 group aspect-square ${
                  !day.isCurrentMonth ? 'text-gray-400' : ''
                }`}
                style={{
                  background: getDayBackgroundColor(day),
                  border: `1px solid ${day.isToday ? '#3b82f6' : getDayBorderColor(day)}`,
                  width: '100%',
                  minHeight: '40px',
                  maxHeight: '60px',
                  maxWidth: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.15rem 0.05rem',
                  boxShadow: day.isToday 
                    ? `0 0 0 1px rgba(59, 130, 246, 0.3), 0 2px 6px rgba(59, 130, 246, 0.15)` 
                    : '0 2px 8px rgba(0, 0, 0, 0.06)',
                  backdropFilter: 'blur(10px)'
                }}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => setHoveredDate(day.date)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                {/* Número del día - Tipografía Mejorada Responsiva */}
                <div className="text-center w-full">
                  <span 
                    className={`text-xs xs:text-sm sm:text-base font-black transition-all duration-300 ${
                      day.isToday ? 'scale-110' : ''
                    }`}
                    style={{
                      color: day.isToday 
                        ? '#6366f1'
                        : day.isCurrentMonth ? '#1e293b' : '#94a3b8'
                    }}
                  >
                    {dayjs(day.date).format('D')}
                  </span>
                </div>

                {/* Indicador de estado - Diseño Mejorado Responsivo */}
                <div className="flex flex-col items-center gap-0.5 mt-0.5 xs:mt-1">
                  {/* HOY nunca muestra punto verde, solo borde azul */}
                  {day.isHoliday && (
                    <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-md animate-pulse border border-white transform group-hover:scale-125 transition-transform duration-300"></div>
                  )}
                  {day.isAppointment && (
                    <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-md animate-pulse border border-white transform group-hover:scale-125 transition-transform duration-300"></div>
                  )}
                  {/* Solo mostrar punto verde si NO es hoy y SÍ está disponible */}
                  {!day.isToday && day.isAvailable && (
                    <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-md animate-pulse border border-white transform group-hover:scale-125 transition-transform duration-300"></div>
                  )}
                  {day.isBlocked && (
                    <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full shadow-md border border-white transform group-hover:scale-125 transition-transform duration-300"></div>
                  )}
                  {day.isWeekend && (
                    <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full shadow-md transform group-hover:scale-125 transition-transform duration-300"></div>
                  )}
                  
                  {/* Indicador de disponibilidad adicional */}
                  {day.isAvailable && (
                    <div className="absolute top-0.5 right-0.5 xs:top-1 xs:right-1 w-1.5 h-1.5 xs:w-2 xs:h-2 bg-emerald-400 rounded-full animate-ping"></div>
                  )}
                </div>

                {/* Efecto de hover mejorado */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/10 group-hover:via-white/5 group-hover:to-white/0 transition-all duration-300 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leyenda del Calendario - Diseño Mejorado */}
      {showLegend && (
        <div className="mt-4 premium-legend shadow-xl border-0 overflow-hidden bg-white rounded-2xl">
          <div className="p-4 bg-white">
            <h4 className="text-lg font-black text-gray-900 mb-4 text-center border-b-2 border-gray-200 pb-3 tracking-wide">
              Leyenda del Sistema de Agendamiento
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Días Disponibles */}
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border-2 border-emerald-200 shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-lg animate-pulse"></div>
                <div>
                  <div className="font-bold text-emerald-700 text-sm">Disponible</div>
                  <div className="text-xs text-emerald-600">Horarios libres para agendar</div>
                </div>
              </div>
            
              {/* Día con Horarios No Disponibles */}
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl border-2 border-amber-200 shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-lg animate-pulse"></div>
                <div>
                  <div className="font-bold text-amber-700 text-sm">Ocupado</div>
                  <div className="text-xs text-amber-600">Sin horarios libres</div>
                </div>
              </div>
            
              {/* Feriados */}
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border-2 border-red-200 shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg animate-pulse"></div>
                <div>
                  <div className="font-bold text-red-700 text-sm">Feriado</div>
                  <div className="text-xs text-red-600">No se atiende</div>
                </div>
              </div>
            
              {/* Fines de Semana */}
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="w-4 h-4 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full shadow-lg"></div>
                <div>
                  <div className="font-bold text-slate-600 text-sm">Fin de Semana</div>
                  <div className="text-xs text-slate-500">No se atiende</div>
                </div>
              </div>
            
              {/* Día Actual */}
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-300 shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-lg"></div>
                <div>
                  <div className="font-bold text-blue-800 text-sm">Hoy</div>
                  <div className="text-xs text-blue-700">Día actual</div>
                </div>
              </div>
            
              {/* Días Bloqueados */}
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="w-4 h-4 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full shadow-lg"></div>
                <div>
                  <div className="font-bold text-slate-600 text-sm">Bloqueado</div>
                  <div className="text-xs text-slate-500">Por psicólogo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Alert Modal Ultra Formal - Diseño Corporativo */}
      {showValidationAlert && createPortal(
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 xs:p-4 z-[9999] animate-in fade-in duration-300">
          {/* Efecto de brillo en el fondo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* Modal Moderno y Elegante */}
          <div className="relative bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-[320px] xs:max-w-[360px] w-full transform transition-all duration-500 ease-out border border-slate-200/60 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 backdrop-blur-sm">
            {/* Línea decorativa superior animada */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              alertType === 'success' 
                ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600' 
                : alertType === 'warning' 
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600'
                : alertType === 'error' 
                ? 'bg-gradient-to-r from-red-400 via-red-500 to-red-600'
                : 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600'
            }`}></div>
            
            {/* Header Moderno y Elegante */}
            <div className={`px-5 xs:px-6 py-5 xs:py-6 text-center relative overflow-hidden ${
              alertType === 'success' 
                ? 'bg-gradient-to-br from-emerald-50 via-emerald-100/90 to-white border-b border-emerald-200/60' 
                : alertType === 'warning' 
                ? 'bg-gradient-to-br from-amber-50 via-amber-100/90 to-white border-b border-amber-200/60'
                : alertType === 'error' 
                ? 'bg-gradient-to-br from-red-50 via-red-100/90 to-white border-b border-red-200/60'
                : 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 border-b border-slate-700/60'
            }`}>
              {/* Patrón decorativo sutil */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-current to-transparent rounded-full blur-2xl -mr-16 -mt-16"></div>
              </div>
              
              <div className="flex flex-col items-center gap-3.5 xs:gap-4 relative z-10">
                {/* Icono Moderno con efecto 3D */}
                <div className={`relative p-3 xs:p-3.5 rounded-2xl border-2 shadow-xl transform transition-all duration-300 ${
                  alertType === 'success' 
                    ? 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-white border-emerald-300 shadow-emerald-200/50' 
                    : alertType === 'warning' 
                    ? 'bg-gradient-to-br from-amber-100 via-amber-50 to-white border-amber-300 shadow-amber-200/50'
                    : alertType === 'error' 
                    ? 'bg-gradient-to-br from-red-100 via-red-50 to-white border-red-300 shadow-red-200/50'
                    : 'bg-gradient-to-br from-slate-100 via-slate-50 to-white border-slate-300 shadow-slate-200/50'
                }`}>
                  {/* Efecto de brillo interno */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/50 to-transparent rounded-2xl"></div>
                  
                  {alertType === 'success' && <CheckCircle className="relative z-10 w-7 h-7 xs:w-8 xs:h-8 text-emerald-600 drop-shadow-md" strokeWidth={2.5} />}
                  {alertType === 'warning' && <AlertTriangle className="relative z-10 w-7 h-7 xs:w-8 xs:h-8 text-amber-600 drop-shadow-md" strokeWidth={2.5} />}
                  {alertType === 'error' && <AlertCircle className="relative z-10 w-7 h-7 xs:w-8 xs:h-8 text-red-600 drop-shadow-md" strokeWidth={2.5} />}
                  {alertType === 'info' && <Info className="relative z-10 w-7 h-7 xs:w-8 xs:h-8 text-slate-600 drop-shadow-md" strokeWidth={2.5} />}
                </div>
                
                {/* Título Moderno */}
                <div className="space-y-1.5">
                  <h3 className={`text-lg xs:text-xl font-black tracking-tight ${
                    alertType === 'success' 
                      ? 'text-emerald-900' 
                      : alertType === 'warning' 
                      ? 'text-amber-900'
                      : alertType === 'error' 
                      ? 'text-red-900'
                      : 'text-slate-800'
                  }`}>
                    {alertType === 'success' ? 'Éxito' :
                     alertType === 'warning' ? 'Advertencia' :
                     alertType === 'error' ? 'Error' :
                     'Información'}
                  </h3>
                  <div className={`h-1 w-14 mx-auto rounded-full ${
                    alertType === 'success' 
                      ? 'bg-emerald-400' 
                      : alertType === 'warning' 
                      ? 'bg-amber-400'
                      : alertType === 'error' 
                      ? 'bg-red-400'
                      : 'bg-slate-400'
                  }`}></div>
                </div>
              </div>
            </div>
            
            {/* Contenido Moderno */}
            <div className="p-5 xs:p-6 bg-gradient-to-br from-white via-slate-50/30 to-white relative">
              {/* Fondo decorativo sutil */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-transparent"></div>
              </div>
              
              <div className="text-center relative z-10">
                <p className={`text-sm xs:text-base leading-relaxed font-semibold mb-5 xs:mb-6 text-slate-700`}>
                  {alertMessage}
                </p>
                
                {/* Botón Moderno */}
                <button
                  onClick={() => setShowValidationAlert(false)}
                  className={`group relative w-full px-8 xs:px-10 py-3 xs:py-3.5 rounded-xl font-bold text-sm xs:text-base text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden ${
                    alertType === 'success' 
                      ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-700 shadow-emerald-500/40 focus:ring-emerald-500/50' 
                      : alertType === 'warning' 
                      ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-600 hover:from-amber-600 hover:via-amber-700 hover:to-amber-700 shadow-amber-500/40 focus:ring-amber-500/50'
                      : alertType === 'error' 
                      ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-600 hover:from-red-600 hover:via-red-700 hover:to-red-700 shadow-red-500/40 focus:ring-red-500/50'
                      : 'bg-gradient-to-r from-slate-600 via-slate-700 to-slate-700 hover:from-slate-700 hover:via-slate-800 hover:to-slate-800 shadow-slate-500/40 focus:ring-slate-500/50'
                  }`}
                >
                  {/* Efecto de brillo animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5" />
                    Entendido
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Feriado - Ajustado al Tamaño de la Imagen - Renderizado con Portal */}
      {showHolidayModal && selectedHoliday && createPortal(
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 xs:p-4 sm:p-6 z-[9999]">
          <div className="relative bg-white rounded-2xl xs:rounded-3xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] w-full max-w-[400px] max-h-[90vh] overflow-hidden animate-in zoom-in-95">
            {/* Botón cerrar */}
              <button
                onClick={() => setShowHolidayModal(false)}
              className="absolute top-3 right-3 xs:top-4 xs:right-4 w-8 h-8 xs:w-9 xs:h-9 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 hover:shadow-xl z-20 border-2 border-slate-200/60"
              >
              <X className="w-4 h-4 xs:w-5 xs:h-5 text-slate-700" strokeWidth={2.5} />
              </button>

            {/* IMAGEN COMPLETA - Tamaño Natural */}
            <div className="relative w-full overflow-visible bg-slate-100 flex items-center justify-center">
              <img
                src={getHolidayImage(selectedHoliday.name)}
                alt={selectedHoliday.name}
                className="w-full max-h-[50vh] h-auto object-contain transition-all duration-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const container = target.parentElement;
                  if (container) {
                    container.innerHTML = `
                      <div class="flex items-center justify-center w-full min-h-[200px] bg-gradient-to-br from-slate-200 to-slate-300">
                        <div class="text-center text-slate-600">
                          <div class="text-5xl xs:text-6xl mb-3">🎉</div>
                          <p class="text-sm xs:text-base font-bold">Feriado Nacional</p>
                        </div>
                      </div>
                    `;
                  }
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none"></div>
              
              {/* Badge Perú - Más abajo */}
              <div className="absolute top-20 left-3 xs:top-24 xs:left-4 z-10">
                <div className="bg-gradient-to-r from-orange-700 to-red-800 backdrop-blur-md px-3 py-1.5 xs:px-4 xs:py-2 rounded-lg xs:rounded-xl shadow-xl border-2 border-white/30">
                  <span className="text-[10px] xs:text-xs font-black text-white flex items-center gap-1.5 xs:gap-2 drop-shadow-lg">
                    <span className="text-xs xs:text-sm">🇵🇪</span>
                    <span>Perú</span>
                    </span>
                  </div>
                </div>
              
              {/* Badge Cívico/Religioso - Más abajo, inferior derecho */}
              <div className="absolute bottom-20 right-3 xs:bottom-24 xs:right-4 z-10">
                {getHolidayType(selectedHoliday.name).toLowerCase().includes('religioso') ? (
                  <div className="bg-gradient-to-r from-sky-200 to-sky-300 backdrop-blur-md px-3 py-1.5 xs:px-4 xs:py-2 rounded-lg xs:rounded-xl shadow-xl border-2 border-white/30">
                    <span className="text-[10px] xs:text-xs font-black text-slate-800 flex items-center gap-1.5 xs:gap-2 uppercase tracking-wide drop-shadow-lg">
                      <span className="text-xs xs:text-sm">⛪</span>
                      <span>Religioso</span>
                    </span>
                    </div>
                ) : (
                  <div className="bg-gradient-to-r from-slate-700 to-slate-800 backdrop-blur-md px-3 py-1.5 xs:px-4 xs:py-2 rounded-lg xs:rounded-xl shadow-xl border-2 border-white/30">
                    <span className="text-[10px] xs:text-xs font-black text-white flex items-center gap-1.5 xs:gap-2 uppercase tracking-wide drop-shadow-lg">
                      <span className="text-xs xs:text-sm">🏛️</span>
                      <span>Cívico</span>
                    </span>
                  </div>
                )}
              </div>
              
              {/* Título y fecha - Dentro de la imagen, fondo negro más transparente */}
              <div className="absolute bottom-0 left-0 right-0 p-3 xs:p-4 bg-black/30 backdrop-blur-sm">
                <div className="text-center">
                  <h3 className="text-base xs:text-lg sm:text-xl font-black text-white mb-1 xs:mb-1.5 leading-tight drop-shadow-lg">
                    {selectedHoliday.name}
                  </h3>
                  <div className="text-xs xs:text-sm text-white/90 font-bold drop-shadow-md">
                    {dayjs(selectedHoliday.date).locale('es').format('dddd, D [de] MMMM').replace(/^\w/, c => c.toUpperCase())}
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido inferior compacto */}
            <div className="p-3 xs:p-4 sm:p-5 space-y-2.5 xs:space-y-3 bg-white">
              {/* Descripción Histórica - Botón Colapsable Más Pequeño */}
              <div>
              <button
                onClick={() => toggleSection('description')}
                  className={`w-full bg-gradient-to-br from-slate-50 via-white to-slate-50/50 rounded-lg xs:rounded-xl p-2 xs:p-2.5 border-2 shadow-sm transition-all hover:shadow-md ${
                  openSection === 'description' 
                      ? 'border-[#6b1013]/40 shadow-[#6b1013]/20' 
                      : 'border-slate-200/60 hover:border-[#6b1013]/30'
                }`}
              >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 xs:gap-2.5">
                      <div className={`w-8 h-8 xs:w-9 xs:h-9 rounded-lg xs:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-all ${
                      openSection === 'description' 
                          ? 'bg-gradient-to-br from-[#6b1013] via-[#8e161a] to-[#b91c1c] scale-105' 
                          : 'bg-gradient-to-br from-slate-600 to-slate-700'
                    }`}>
                        <Info className="w-4 h-4 xs:w-5 xs:h-5 text-white" strokeWidth={2.5} />
                    </div>
                      <span className={`text-xs xs:text-sm font-bold ${
                        openSection === 'description' ? 'text-[#6b1013]' : 'text-slate-900'
                      }`}>
                        📚 Descripción
                      </span>
                    </div>
                    <span className={`text-base xs:text-lg transition-transform duration-300 ${
                      openSection === 'description' ? 'rotate-180' : ''
                    }`}>
                    ▼
                    </span>
                </div>
              </button>
              
                {/* Contenido colapsable */}
              {openSection === 'description' && (
                  <div className="mt-2 bg-[#6b1013]/5 rounded-lg xs:rounded-xl p-2.5 xs:p-3 border-2 border-[#6b1013]/20 animate-in slide-in-from-top-2">
                    <p className="text-[10px] xs:text-xs text-slate-700 leading-relaxed font-medium">
                      {selectedHoliday.description || getHolidayDescription(selectedHoliday.name)}
                  </p>
                </div>
              )}
              </div>

              {/* Información Importante - Más Compacto */}
              <div className="bg-gradient-to-r from-amber-50 via-amber-50/90 to-orange-50 rounded-lg xs:rounded-xl p-2.5 xs:p-3 border-2 border-amber-300/60 shadow-sm">
                <div className="flex items-start gap-2 xs:gap-3">
                  <div className="w-8 h-8 xs:w-9 xs:h-9 rounded-lg xs:rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center flex-shrink-0 shadow-md">
                    <AlertCircle className="w-4 h-4 xs:w-5 xs:h-5 text-white" strokeWidth={2.5} />
                    </div>
                  <p className="text-[10px] xs:text-xs text-amber-900 leading-relaxed font-semibold flex-1">
                    <strong>🚫 No se atiende</strong> en el servicio de psicología durante este feriado. Por favor, programa tu cita en un día hábil.
                  </p>
                    </div>
                  </div>
            </div>
          </div>
        </div>,
        document.body
      )}


    </div>
  );
};

