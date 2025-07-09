import * as React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { esES } from '@mui/x-date-pickers/locales';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';

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
        shouldDisableDate={disableWeekends}
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
            borderRadius: '8px',
          },
          '& .MuiPickersDay-root': {
            borderRadius: '8px',
            fontWeight: 600,
          },
          '& .Mui-selected': {
            backgroundColor: '#8e161a !important',
            color: 'white !important',
          },
        }}
      />
    </LocalizationProvider>
  );
} 