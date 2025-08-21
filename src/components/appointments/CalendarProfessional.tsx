import * as React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { esES } from '@mui/x-date-pickers/locales';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { holidayLocalService } from '../../services/holidaysLocal';

interface CalendarProfessionalProps {
  value: Dayjs | null;
  onChange: (date: Dayjs | null) => void;
}

export default function CalendarProfessional({ value, onChange }: CalendarProfessionalProps) {
  // Función para deshabilitar sábados (6) y domingos (0)
  const disableWeekends = (date: Dayjs) => {
    const day = date.day();
    return day === 0 || day === 6;
  };

  // Función para verificar si es feriado
  const isHoliday = (date: Dayjs) => {
    const holidays = holidayLocalService.getAllHolidays();
    const dateString = date.format('YYYY-MM-DD');
    const holiday = holidays.find(h => h.date === dateString);
    return holiday;
  };

  // Función combinada para deshabilitar fines de semana y feriados
  const shouldDisableDate = (date: Dayjs) => {
    const isWeekend = disableWeekends(date);
    const holiday = isHoliday(date);
    return isWeekend || !!holiday;
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="es"
      localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <DatePicker
        label="Selecciona una fecha"
        value={value}
        onChange={onChange}
        shouldDisableDate={shouldDisableDate}
        slotProps={{
          textField: {
            fullWidth: true,
            variant: 'outlined',
            sx: { bgcolor: 'white', borderRadius: 2 }
          },
        }}
        sx={{
          '& .MuiPickersDay-root.Mui-disabled': {
            color: '#bbb !important',
            backgroundColor: '#f5f5f5 !important',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
          '& .MuiPickersDay-root': {
            borderRadius: '12px',
            fontWeight: 700,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }
          },
          '& .Mui-selected': {
            background: 'linear-gradient(135deg, rgba(142, 22, 26, 0.9) 0%, rgba(122, 20, 23, 0.8) 100%) !important',
            color: 'white !important',
            boxShadow: '0 6px 20px rgba(142, 22, 26, 0.4) !important',
            border: '2px solid #8e161a !important',
            transform: 'scale(1.05)',
          },
          // Estilos mejorados para días feriados
          '& .MuiPickersDay-root[data-holiday="national"]': {
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.95) 0%, rgba(245, 158, 11, 0.9) 100%) !important',
            color: '#92400e !important',
            border: '3px solid #f59e0b !important',
            fontWeight: 800,
            boxShadow: '0 8px 25px rgba(251, 191, 36, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important',
            transform: 'scale(1.08)',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          },
          '& .MuiPickersDay-root[data-holiday="regional"]': {
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.95) 0%, rgba(139, 92, 246, 0.9) 100%) !important',
            color: '#581c87 !important',
            border: '3px solid #8b5cf6 !important',
            fontWeight: 800,
            boxShadow: '0 8px 25px rgba(168, 85, 247, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important',
            transform: 'scale(1.08)',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          },
        }}
        slots={{
          day: (props) => {
            const { day, ...otherProps } = props;
            const holiday = isHoliday(day);
            
            if (holiday) {
              return (
                <div
                  {...otherProps}
                  data-holiday={holiday.is_national ? 'national' : 'regional'}
                  title={`🎉 ${holiday.name} - ${holiday.is_national ? 'Feriado Nacional' : 'Feriado Regional'}`}
                  style={{
                    position: 'relative',
                    cursor: 'not-allowed',
                    pointerEvents: 'none',
                    backgroundColor: holiday.is_national ? 'rgba(251, 191, 36, 0.25)' : 'rgba(168, 85, 247, 0.25)',
                    border: holiday.is_national ? '2px solid #f59e0b' : '2px solid #8b5cf6',
                    borderRadius: '8px',
                    color: holiday.is_national ? '#d97706' : '#7c3aed',
                    fontWeight: 700,
                    minHeight: '36px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 2px'
                  }}
                >
                  <div style={{ 
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      color: holiday.is_national ? '#92400e' : '#581c87'
                    }}>
                      {day.date()}
                    </span>
                    <span 
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        fontSize: '0.5rem',
                        color: holiday.is_national ? '#d97706' : '#7c3aed',
                        fontWeight: 900,
                      }}
                    >
                      ⭐
                    </span>
                    <div style={{
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      lineHeight: '0.9',
                      marginTop: '2px',
                      color: holiday.is_national ? '#92400e' : '#581c87',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {holiday.name}
                    </div>
                  </div>
                </div>
              );
            }
            
            return <div {...otherProps}>{day.date()}</div>;
          }
        }}
      />
    </LocalizationProvider>
  );
} 