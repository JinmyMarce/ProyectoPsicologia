import React, { useState } from 'react';
import { AppointmentCalendar } from './AppointmentCalendar';
import { AppointmentHistory } from './AppointmentHistory';
import { AppointmentBooking } from './AppointmentBooking';
import { Button } from '../ui/Button';

export default function AppointmentsPage() {
  const [show, setShow] = useState<'calendar' | 'history' | 'booking'>('calendar');

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-10">
      <div className="flex justify-center gap-4 mb-8">
        <Button variant={show === 'calendar' ? 'primary' : 'outline'} onClick={() => setShow('calendar')}>Ver Calendario</Button>
        <Button variant={show === 'history' ? 'primary' : 'outline'} onClick={() => setShow('history')}>Historial de Citas</Button>
        <Button variant={show === 'booking' ? 'primary' : 'outline'} onClick={() => setShow('booking')}>Agendar Cita</Button>
      </div>
      {show === 'calendar' && <AppointmentCalendar />}
      {show === 'history' && <AppointmentHistory />}
      {show === 'booking' && <AppointmentBooking />}
    </div>
  );
}
