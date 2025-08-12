import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BlockedSchedule, getBlockedSchedules } from '../services/schedule';

interface ScheduleContextType {
  blockedSchedules: BlockedSchedule[];
  addBlockedSchedule: (schedule: BlockedSchedule) => void;
  removeBlockedSchedule: (scheduleId: string) => void;
  refreshBlockedSchedules: () => void;
  isDateBlocked: (date: string) => boolean;
  getBlockedDates: () => string[];
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

interface ScheduleProviderProps {
  children: ReactNode;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children }) => {
  const [blockedSchedules, setBlockedSchedules] = useState<BlockedSchedule[]>([]);

  // Cargar horarios bloqueados al inicializar
  useEffect(() => {
    loadBlockedSchedules();
  }, []);

  const loadBlockedSchedules = async () => {
    try {
      // Calcular fechas para la semana actual
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 21);
      
      // Cargar datos reales del backend
      const schedules = await getBlockedSchedules(1, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
      setBlockedSchedules(schedules);
    } catch (error) {
      console.error('Error loading blocked schedules:', error);
    }
  };

  const addBlockedSchedule = (schedule: BlockedSchedule) => {
    setBlockedSchedules(prev => [...prev, schedule]);
    
    // Emitir evento para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('scheduleBlocked', { 
      detail: { schedule } 
    }));
  };

  const removeBlockedSchedule = (scheduleId: string) => {
    setBlockedSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
    
    // Emitir evento para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('scheduleUnblocked', { 
      detail: { scheduleId } 
    }));
  };

  const refreshBlockedSchedules = () => {
    loadBlockedSchedules();
  };

  const isDateBlocked = (date: string): boolean => {
    return blockedSchedules.some(schedule => 
      schedule.date === date && schedule.isFullDayBlocked
    );
  };

  const getBlockedDates = (): string[] => {
    return blockedSchedules
      .filter(schedule => schedule.isFullDayBlocked)
      .map(schedule => schedule.date);
  };

  const value: ScheduleContextType = {
    blockedSchedules,
    addBlockedSchedule,
    removeBlockedSchedule,
    refreshBlockedSchedules,
    isDateBlocked,
    getBlockedDates
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}; 