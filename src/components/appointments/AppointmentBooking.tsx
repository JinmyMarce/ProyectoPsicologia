import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getPsychologists, getUserAppointments } from '../../services/appointments';
import { PageHeader } from '../ui/PageHeader';
import { CalendarAvailability } from './CalendarAvailability';
import { MultiStepAppointmentModal } from './MultiStepAppointmentModal';
import { AvailabilityStats } from './AvailabilityStats';
import { TestAuth } from './TestAuth';
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

  const handleDateSelect = (date: string) => {
    setModalDate(date);
    setModalOpen(true);
  };

  const handleAppointmentSuccess = () => {
    setSuccess('Cita agendada exitosamente');
    setModalOpen(false);
    setModalDate('');
    setSelectedDate('');
    
    // Recargar datos para actualizar la lista de citas recientes
    loadInitialData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Agendar Cita" 
          subtitle="Selecciona una fecha disponible para tu consulta psicológica"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8e161a]"></div>
            <span className="ml-3 text-gray-600">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!psychologist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Agendar Cita" 
          subtitle="Selecciona una fecha disponible para tu consulta psicológica"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay psicólogo disponible</h3>
              <p className="text-gray-600">Por favor, intenta más tarde.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Agendar Cita" 
        subtitle="Selecciona una fecha disponible para tu consulta psicológica"
      >
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            <strong>Horarios de atención:</strong> Lunes a Viernes de 8:00 AM a 6:00 PM
          </p>
          <p className="text-xs text-red-600 mt-1">
            No se atiende sábados ni domingos
          </p>
        </div>
      </PageHeader>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensajes de éxito y error */}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center space-x-2 mb-6">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-semibold">{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-2 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-semibold">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal - Calendario */}
          <div className="lg:col-span-2">
            <CalendarAvailability
              psychologistId={psychologist.id.toString()}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
          </div>

          {/* Columna lateral - Información y estadísticas */}
          <div className="space-y-6">
            {/* Información del psicólogo */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-[#8e161a] p-2 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Psicólogo Asignado</h3>
                  <p className="text-sm text-gray-600">Profesional disponible</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Nombre</p>
                  <p className="text-gray-900">{psychologist.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Especialización</p>
                  <p className="text-gray-900">{psychologist.specialization}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Estado</p>
                  <Badge className={psychologist.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {psychologist.available ? 'Disponible' : 'No disponible'}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Estadísticas de disponibilidad */}
            <AvailabilityStats psychologist={psychologist} />

            {/* Citas recientes */}
            {recentAppointments.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Citas Recientes</h3>
                <div className="space-y-3">
                  {recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(appointment.date).toLocaleDateString('es-ES')}
                        </span>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{appointment.time}</p>
                      {appointment.reason && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {appointment.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Test de autenticación */}
            <TestAuth />
          </div>
        </div>
      </div>

      {/* Modal de múltiples pasos */}
      {modalOpen && psychologist && (
        <MultiStepAppointmentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          psychologistId={psychologist.id}
          selectedDate={modalDate}
          isFirstAppointment={isFirstAppointment || false}
          onSuccess={handleAppointmentSuccess}
        />
      )}
    </div>
  );
}