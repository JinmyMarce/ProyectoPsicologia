import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createAppointment, getPsychologists, getUserAppointments, getAvailableSlots } from '../../services/appointments';
import { PageHeader } from '../ui/PageHeader';
import { CalendarAvailability } from './CalendarAvailability';
import { BookAppointmentModal } from './BookAppointmentModal';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

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

interface Appointment {
  id: number;
  user_email: string;
  psychologist_name: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  created_at: string;
}

export function AppointmentBooking() {
  const { user } = useAuth();
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFirstAppointment, setIsFirstAppointment] = useState<boolean | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (psychologist && modalOpen && modalDate) {
      loadAvailableSlots(psychologist.id, modalDate);
    }
  }, [psychologist, modalOpen, modalDate]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      setError('');
      
      // Cargar psicólogo y citas del usuario en paralelo
      const [psychologistData, appointmentsData] = await Promise.all([
        loadPsychologist(),
        loadUserAppointments()
      ]);
      
      // Verificar si es la primera cita
      setIsFirstAppointment(appointmentsData.length === 0);
      
      // Obtener las 3 citas más recientes
      const recent = appointmentsData
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);
      setRecentAppointments(recent);
      
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoadingData(false);
    }
  };

  const loadPsychologist = async () => {
    try {
      const data = await getPsychologists();
      if (Array.isArray(data) && data.length > 0) {
        setPsychologist(data[0]);
        return data[0];
      } else {
        setError('No hay psicólogo disponible');
        return null;
      }
    } catch (error) {
      console.error('Error cargando psicólogo:', error);
      setError('Error al cargar el psicólogo disponible');
      setPsychologist(null);
      return null;
    }
  };

  const loadUserAppointments = async () => {
    try {
      const appointments = await getUserAppointments();
      return appointments;
    } catch (error) {
      console.error('Error cargando citas del usuario:', error);
      return [];
    }
  };

  const loadAvailableSlots = async (psychologistId: number, date: string) => {
    try {
      const slots = await getAvailableSlots(psychologistId, date);
      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch (error) {
      console.error('Error cargando horarios:', error);
      setError('Error al cargar los horarios disponibles');
      setAvailableSlots([]);
    }
  };

  const handleDateSelect = (date: string) => {
    setModalDate(date);
    setModalOpen(true);
  };

  const handleBookFromModal = async (time: string, reason: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!user?.email) {
        throw new Error('Usuario no autenticado');
      }
      if (!psychologist) {
        throw new Error('No hay psicólogo disponible');
      }
      if (!modalDate) {
        throw new Error('Debes seleccionar una fecha');
      }
      if (!time) {
        throw new Error('Debes seleccionar una hora disponible');
      }
      if (isFirstAppointment && !reason.trim()) {
        throw new Error('El motivo de la cita es obligatorio');
      }

      const appointmentData = {
        psychologist_id: psychologist.id,
        date: modalDate,
        time,
        reason,
        notes: '',
        user_email: user.email,
        status: 'pending'
      };

      await createAppointment(appointmentData);
      setSuccess('Cita agendada exitosamente');
      setModalOpen(false);
      setModalDate('');
      setAvailableSlots([]);
      setSelectedDate('');

      // Recargar datos para actualizar la lista de citas recientes
      await loadInitialData();

    } catch (error: any) {
      setError(error.message || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#8e161a]/30 border-t-[#8e161a] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendario para agendar cita */}
        <div className="lg:col-span-2">
          <Card className="p-8">
            <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center">
              <Calendar className="w-10 h-10 mr-4 text-[#8e161a]" />
              Agenda tu cita
            </h2>
            
            {psychologist && (
              <div className="mb-6 p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 rounded-lg border border-[#8e161a]/20">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Dr. {psychologist.name}</h3>
                    <p className="text-sm text-gray-600">{psychologist.specialization}</p>
                    <p className="text-xs text-gray-500">{psychologist.email}</p>
                  </div>
                </div>
              </div>
            )}

            <CalendarAvailability
              psychologistId={psychologist ? psychologist.id.toString() : ''}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
          </Card>
        </div>

        {/* Panel lateral con información */}
        <div className="space-y-6">
          {/* Información del usuario */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-[#8e161a]" />
              Información Personal
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Nombre</p>
                <p className="text-base font-semibold text-gray-900">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-base font-semibold text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rol</p>
                <p className="text-base font-semibold text-gray-900 capitalize">{user?.role}</p>
              </div>
            </div>
          </Card>

          {/* Citas recientes */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-[#8e161a]" />
              Citas Recientes
            </h3>
            
            {recentAppointments.length === 0 ? (
              <div className="text-center py-4">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No tienes citas recientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAppointments.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Dr. {appointment.psychologist_name}
                      </h4>
                      <Badge variant={getStatusColor(appointment.status)} className="text-xs">
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>📅 {new Date(appointment.date).toLocaleDateString('es-ES')}</p>
                      <p>🕐 {appointment.time}</p>
                      <p>💬 {appointment.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Información importante */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
              Información Importante
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">•</span>
                <p>Las citas se confirman automáticamente</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">•</span>
                <p>Puedes cancelar hasta 24 horas antes</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">•</span>
                <p>Llega 10 minutos antes de tu cita</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">•</span>
                <p>Trae tu documento de identidad</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <BookAppointmentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalDate('');
          setAvailableSlots([]);
        }}
        onBook={handleBookFromModal}
        date={modalDate}
        availableSlots={availableSlots}
        isFirstAppointment={isFirstAppointment === true}
        loading={loading}
        error={error}
      />
    </div>
  );
}