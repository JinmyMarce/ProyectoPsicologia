import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Phone, Mail, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { createAppointment, getPsychologists, getAvailableSlots } from '../../services/appointments';
import { PageHeader } from '../ui/PageHeader';

interface Psychologist {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  available: boolean;
}

interface TimeSlot {
  id: number;
  time: string;
  available: boolean;
}

interface AppointmentForm {
  psychologist_id: number;
  date: string;
  time: string;
  reason: string;
  notes: string;
}

export function AppointmentBooking() {
  const { user } = useAuth();
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedPsychologist, setSelectedPsychologist] = useState<Psychologist | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState<AppointmentForm>({
    psychologist_id: 0,
    date: '',
    time: '',
    reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPsychologists();
  }, []);

  useEffect(() => {
    if (selectedPsychologist && selectedDate) {
      loadAvailableSlots(selectedPsychologist.id, selectedDate);
    }
  }, [selectedPsychologist, selectedDate]);

  const loadPsychologists = async () => {
    try {
      const data = await getPsychologists();
      setPsychologists(data);
    } catch (error) {
      console.error('Error cargando psicólogos:', error);
      setError('Error al cargar los psicólogos disponibles');
    }
  };

  const loadAvailableSlots = async (psychologistId: number, date: string) => {
    try {
      const slots = await getAvailableSlots(psychologistId, date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error cargando horarios:', error);
      setError('Error al cargar los horarios disponibles');
    }
  };

  const handlePsychologistSelect = (psychologist: Psychologist) => {
    setSelectedPsychologist(psychologist);
    setFormData(prev => ({ ...prev, psychologist_id: psychologist.id }));
    setSelectedTime('');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, date }));
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setFormData(prev => ({ ...prev, time }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!user?.email) {
        throw new Error('Usuario no autenticado');
      }

      const appointmentData = {
        ...formData,
        user_email: user.email,
        status: 'pending'
      };

      await createAppointment(appointmentData);
      setSuccess('Cita agendada exitosamente');
      
      // Limpiar formulario
      setFormData({
        psychologist_id: 0,
        date: '',
        time: '',
        reason: '',
        notes: ''
      });
      setSelectedPsychologist(null);
      setSelectedDate('');
      setSelectedTime('');
    } catch (error: any) {
      setError(error.message || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8e161a] via-cyan-400/30 to-violet-700/40 animate-gradient-shift p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        <PageHeader 
          title="Agendar Cita"
          subtitle="Sistema de Gestión de Citas Psicológicas"
        >
          <p className="text-xl text-gray-500 font-semibold text-center">
            Instituto Túpac Amaru
          </p>
        </PageHeader>

        {/* Mensajes de estado */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-center space-x-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <p className="text-red-800 font-bold text-lg">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 flex items-center space-x-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <p className="text-green-800 font-bold text-lg">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Selección de Psicólogo */}
          <Card className="p-8">
            <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center">
              <User className="w-10 h-10 mr-4 text-[#8e161a]" />
              Seleccionar Psicólogo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {psychologists.map((psychologist) => (
                <div
                  key={psychologist.id}
                  className={`p-6 rounded-2xl border-4 cursor-pointer transition-all duration-300 hover:shadow-2xl ${
                    selectedPsychologist?.id === psychologist.id
                      ? 'border-[#8e161a] bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 shadow-2xl'
                      : 'border-gray-200 hover:border-[#8e161a]/50 bg-white'
                  }`}
                  onClick={() => handlePsychologistSelect(psychologist)}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{psychologist.name}</h3>
                    <p className="text-gray-600 font-semibold mb-2">{psychologist.specialization}</p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 flex items-center justify-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {psychologist.email}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center justify-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {psychologist.phone}
                      </p>
                    </div>
                    <Badge 
                      variant={psychologist.available ? "success" : "warning"}
                      className="mt-4"
                    >
                      {psychologist.available ? 'Disponible' : 'No disponible'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Selección de Fecha y Hora */}
          {(selectedPsychologist && selectedPsychologist.available) && (
            <Card className="p-8">
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center">
                <Calendar className="w-10 h-10 mr-4 text-[#8e161a]" />
                Seleccionar Fecha y Hora
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fecha */}
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">
                    Fecha de la cita
                  </label>
                  <input
                    type="date"
                    min={getMinDate()}
                    max={getMaxDate()}
                    value={selectedDate}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-2xl text-lg font-semibold focus:border-[#8e161a] focus:ring-4 focus:ring-[#8e161a]/20 transition-all duration-300"
                  />
                </div>

                {/* Hora */}
                {selectedDate && (
                  <div>
                    <label className="block text-xl font-bold text-gray-700 mb-4">
                      Hora de la cita
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => handleTimeSelect(slot.time)}
                          disabled={!slot.available}
                          className={`p-4 rounded-2xl border-2 font-bold text-lg transition-all duration-300 ${
                            selectedTime === slot.time
                              ? 'border-[#8e161a] bg-[#8e161a] text-white shadow-2xl'
                              : slot.available
                              ? 'border-gray-300 hover:border-[#8e161a] hover:bg-[#8e161a]/5'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Información de la Cita */}
          {(selectedPsychologist && selectedDate && selectedTime) && (
            <Card className="p-8">
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center">
                <Plus className="w-10 h-10 mr-4 text-[#8e161a]" />
                Información de la Cita
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">
                    Motivo de la consulta
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    rows={4}
                    className="w-full p-4 border-2 border-gray-300 rounded-2xl text-lg font-semibold focus:border-[#8e161a] focus:ring-4 focus:ring-[#8e161a]/20 transition-all duration-300 resize-none"
                    placeholder="Describe el motivo de tu consulta..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="w-full p-4 border-2 border-gray-300 rounded-2xl text-lg font-semibold focus:border-[#8e161a] focus:ring-4 focus:ring-[#8e161a]/20 transition-all duration-300 resize-none"
                    placeholder="Información adicional que consideres importante..."
                  />
                </div>
              </div>

              {/* Resumen de la cita */}
              <div className="mt-8 p-6 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 rounded-2xl border-2 border-[#8e161a]/20">
                <h3 className="text-2xl font-black text-gray-900 mb-4">Resumen de la Cita</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-4">
                    <User className="w-8 h-8 text-[#8e161a]" />
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Psicólogo</p>
                      <p className="text-lg font-bold text-gray-900">{selectedPsychologist.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-8 h-8 text-[#8e161a]" />
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Fecha</p>
                      <p className="text-lg font-bold text-gray-900">{selectedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Clock className="w-8 h-8 text-[#8e161a]" />
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Hora</p>
                      <p className="text-lg font-bold text-gray-900">{selectedTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Botón de envío */}
          {(selectedPsychologist && selectedDate && selectedTime && formData.reason) && (
            <div className="text-center">
              <Button
                type="submit"
                disabled={loading}
                className="px-16 py-6 text-2xl font-black rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center space-x-4">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Agendando cita...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="w-8 h-8" />
                    <span>Confirmar Cita</span>
                  </div>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}