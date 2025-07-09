import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface TimeSlot {
  id: number;
  time: string;
  available: boolean;
}

interface BookAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onBook: (time: string, reason: string) => void;
  date: string;
  availableSlots: TimeSlot[];
  isFirstAppointment: boolean;
  loading: boolean;
  error: string;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  open,
  onClose,
  onBook,
  date,
  availableSlots,
  isFirstAppointment,
  loading,
  error,
}) => {
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelectedTime('');
    setReason('');
    setSubmitted(false);
  }, [open, date]);

  const handleBook = () => {
    setSubmitted(true);
    if (!selectedTime) return;
    if (isFirstAppointment && !reason.trim()) return;
    onBook(selectedTime, reason);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Agendar cita para ${date}`}>
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center space-x-2 mb-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-semibold">{error}</span>
        </div>
      )}
      <div className="mb-4">
        <div className="font-bold mb-2">Selecciona una hora disponible:</div>
        <div className="grid grid-cols-3 gap-2">
          {availableSlots.length === 0 && (
            <div className="col-span-3 text-gray-500">No hay horarios disponibles para este día.</div>
          )}
          {availableSlots.map(slot => (
            <button
              key={slot.id}
              type="button"
              className={`p-2 rounded-lg border text-sm font-semibold transition-all
                ${selectedTime === slot.time ? 'bg-[#8e161a] text-white border-[#8e161a]' : ''}
                ${slot.available ? 'bg-green-50 border-green-400 hover:bg-green-100' : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'}
              `}
              disabled={!slot.available}
              onClick={() => slot.available && setSelectedTime(slot.time)}
            >
              {slot.time}
            </button>
          ))}
        </div>
        {submitted && !selectedTime && (
          <div className="text-xs text-red-500 mt-2">Debes seleccionar una hora disponible.</div>
        )}
      </div>
      {isFirstAppointment && (
        <div className="mb-4">
          <div className="font-bold mb-2">Motivo de la cita <span className="text-red-600">*</span></div>
          <textarea
            className="w-full border rounded-lg p-2"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Describe el motivo de tu consulta..."
            rows={3}
            required
          />
          {submitted && !reason.trim() && (
            <div className="text-xs text-red-500 mt-2">El motivo de la cita es obligatorio.</div>
          )}
        </div>
      )}
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button type="button" onClick={handleBook} loading={loading}>
          Confirmar Cita
        </Button>
      </div>
    </Modal>
  );
};
