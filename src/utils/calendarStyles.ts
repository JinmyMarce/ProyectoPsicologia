import { startOfDay, addDays, isBefore, isAfter } from 'date-fns';
import { localHolidayService } from '../services/holidaysLocal';
import { Holiday } from '../services/holidays';

export interface DayStyle {
  style: React.CSSProperties;
}

export const getDayStyle = (
  date: Date, 
  holidays: Holiday[], 
  isAvailable: boolean = false,
  isToday: boolean = false,
  currentMonth?: Date
): DayStyle => {
  const today = new Date();
  const peruTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Lima"}));
  const todayStart = startOfDay(peruTime);
  const futureLimit = addDays(todayStart, 14);
  const dayOfWeek = date.getDay();
  
  // Verificar si el día pertenece al mes actual
  const isCurrentMonth = currentMonth ? 
    date.getMonth() === currentMonth.getMonth() && 
    date.getFullYear() === currentMonth.getFullYear() : true;
  
  // Si no es del mes actual, aplicar estilo de días fuera del mes
  if (!isCurrentMonth) {
    return {
      style: {
        background: 'transparent',
        color: '#9ca3af',
        fontWeight: 400,
        opacity: 0.5,
        cursor: 'not-allowed',
        pointerEvents: 'none'
      }
    };
  }
  
  // Verificar si es feriado
  const holiday = localHolidayService.isHolidayDate(date, holidays);
  
  // Día actual
  if (isToday) {
    return {
      style: {
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
        color: '#1e40af',
        fontWeight: 800,
        borderRadius: 12,
        border: '3px solid #3b82f6',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        cursor: isAvailable ? 'pointer' : 'not-allowed',
        position: 'relative',
        transform: 'scale(1.05)',
        transition: 'all 0.3s ease',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)'
      }
    };
  }
  
  // Día feriado
  if (holiday) {
    const isNational = holiday.is_national;
    return {
      style: {
        background: isNational 
          ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.95) 0%, rgba(245, 158, 11, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(168, 85, 247, 0.95) 0%, rgba(139, 92, 246, 0.9) 100%)',
        color: isNational ? '#92400e' : '#581c87',
        fontWeight: 800,
        borderRadius: 16,
        boxShadow: isNational 
          ? '0 8px 25px rgba(251, 191, 36, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          : '0 8px 25px rgba(168, 85, 247, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        border: isNational 
          ? '3px solid #f59e0b'
          : '3px solid #8b5cf6',
        cursor: 'not-allowed',
        pointerEvents: 'none',
        position: 'relative',
        transform: 'scale(1.05)',
        transition: 'all 0.3s ease',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }
    };
  }
  
  // Fin de semana
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      style: {
        background: 'linear-gradient(135deg, rgba(253, 186, 116, 0.9) 0%, rgba(251, 146, 60, 0.8) 100%)',
        color: '#c2410c',
        pointerEvents: 'none',
        cursor: 'not-allowed',
        fontWeight: 700,
        borderRadius: 12,
        boxShadow: '0 6px 20px rgba(253, 186, 116, 0.4)',
        border: '2px solid #f97316',
        opacity: 0.9,
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)'
      }
    };
  }
  
  // Día pasado
  if (isBefore(date, todayStart)) {
    return {
      style: {
        background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.7) 0%, rgba(107, 114, 128, 0.6) 100%)',
        color: '#374151',
        fontWeight: 600,
        borderRadius: 12,
        boxShadow: '0 4px 15px rgba(156, 163, 175, 0.3)',
        border: '1px solid #9ca3af',
        cursor: 'not-allowed',
        opacity: 0.7,
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)'
      }
    };
  }
  
  // Día fuera del límite de 2 semanas
  if (isAfter(date, futureLimit)) {
    return {
      style: {
        background: 'linear-gradient(135deg, rgba(253, 224, 71, 0.7) 0%, rgba(250, 204, 21, 0.6) 100%)',
        color: '#a16207',
        fontWeight: 600,
        opacity: 0.8,
        borderRadius: 12,
        boxShadow: '0 4px 15px rgba(253, 224, 71, 0.3)',
        border: '1px solid #facc15',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)'
      }
    };
  }
  
  // Día disponible
  if (isAvailable) {
    return {
      style: {
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.8) 100%)',
        color: '#064e3b',
        fontWeight: 700,
        borderRadius: 12,
        boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4)',
        border: '2px solid #16a34a',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        position: 'relative'
      }
    };
  }
  
  // Día no disponible (ocupado) - días normales de semana
  return {
    style: {
      background: 'linear-gradient(135deg, rgba(196, 181, 253, 0.3) 0%, rgba(167, 139, 250, 0.2) 100%)',
      color: '#7c3aed',
      fontWeight: 600,
      borderRadius: 12,
      boxShadow: '0 4px 15px rgba(124, 58, 237, 0.15)',
      border: '1px solid #a78bfa',
      cursor: 'not-allowed',
      opacity: 0.9,
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)'
    }
  };
};

export const getEventStyle = (
  eventType: 'holiday' | 'appointment' | 'availability',
  status?: string,
  isNational?: boolean
): React.CSSProperties => {
  switch (eventType) {
    case 'holiday':
      return {
        background: isNational 
          ? 'linear-gradient(135deg, rgba(251, 191, 36, 1) 0%, rgba(245, 158, 11, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(168, 85, 247, 1) 0%, rgba(139, 92, 246, 0.95) 100%)',
        color: isNational ? '#92400e' : '#581c87',
        borderRadius: 12,
        border: isNational 
          ? '3px solid #f59e0b'
          : '3px solid #8b5cf6',
        fontWeight: 800,
        fontSize: '12px',
        padding: '8px 12px',
        textAlign: 'center',
        boxShadow: isNational 
          ? '0 8px 25px rgba(251, 191, 36, 0.7)'
          : '0 8px 25px rgba(168, 85, 247, 0.7)',
        minHeight: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        transform: 'scale(1.02)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      };
      
    case 'appointment':
      if (status === 'confirmed' || status === 'completed') {
        return {
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.9) 100%)',
          color: '#ffffff',
          borderRadius: 10,
          border: '2px solid #dc2626',
          fontWeight: 700,
          boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          fontSize: '11px',
          padding: '4px 6px'
        };
      } else if (status === 'pending' || status === 'pendiente') {
        return {
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.9) 100%)',
          color: '#ffffff',
          borderRadius: 10,
          border: '2px solid #d97706',
          fontWeight: 700,
          boxShadow: '0 6px 20px rgba(245, 158, 11, 0.5)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          fontSize: '11px',
          padding: '4px 6px'
        };
      }
      return {
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.9) 100%)',
        color: '#ffffff',
        borderRadius: 10,
        border: '2px solid #16a34a',
        fontWeight: 700,
        boxShadow: '0 6px 20px rgba(34, 197, 94, 0.5)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        fontSize: '11px',
        padding: '4px 6px'
      };
      
    case 'availability':
      return {
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.8) 100%)',
        color: '#ffffff',
        borderRadius: 8,
        border: '2px solid #16a34a',
        fontWeight: 700,
        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
        fontSize: '11px',
        padding: '4px 6px'
      };
      
    default:
      return {
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.8) 100%)',
        color: '#ffffff',
        borderRadius: 8,
        border: '2px solid #16a34a',
        fontWeight: 700,
        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
        fontSize: '11px',
        padding: '4px 6px'
      };
  }
};
