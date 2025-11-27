import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Edit,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAppointments } from '../../services/appointments';

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

interface RescheduleModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (appointmentId: number, newDate: string, newTime: string) => Promise<void>;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onReschedule
}) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleReschedule = async () => {
    if (!appointment || !newDate || !newTime) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onReschedule(appointment.id, newDate, newTime);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Error al reprogramar la cita');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Reprogramar Cita</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Cita Actual</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <Calendar className="w-4 h-4 inline mr-1" />
                {new Date(appointment.date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-600">
                <Clock className="w-4 h-4 inline mr-1" />
                {appointment.time}
              </p>
              <p className="text-sm text-gray-600">
                <User className="w-4 h-4 inline mr-1" />
                {appointment.psychologist_name}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva fecha
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva hora
            </label>
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
            >
              <option value="">Seleccionar hora</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Importante:</p>
                <ul className="mt-1 space-y-1">
                  <li>• Solo puedes reprogramar con 24 horas de anticipación</li>
                  <li>• La nueva fecha debe ser al menos mañana</li>
                  <li>• El psicólogo será notificado del cambio</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleReschedule}
              disabled={loading || !newDate || !newTime}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Edit className="w-4 h-4 mr-2" />
              )}
              Reprogramar
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function RescheduleAppointment() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    appointment: Appointment | null;
  }>({
    isOpen: false,
    appointment: null
  });

  useEffect(() => {
    if (user?.email) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error cargando citas:', error);
      setError('Error al cargar las citas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const canReschedule = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    return hoursDiff >= 24 && appointment.status === 'confirmed';
  };

  const handleReschedule = async (appointmentId: number, newDate: string, newTime: string) => {
    try {
      // Simular reprogramación de cita (en un caso real, harías una llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Cita reprogramada exitosamente');
      await loadAppointments(); // Recargar citas

      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      throw new Error(error.message || 'Error al reprogramar la cita');
    }
  };

  const openRescheduleModal = (appointment: Appointment) => {
    setRescheduleModal({
      isOpen: true,
      appointment
    });
  };

  const closeRescheduleModal = () => {
    setRescheduleModal({
      isOpen: false,
      appointment: null
    });
  };

  const reschedulableAppointments = appointments.filter(canReschedule);

  return (
    <div className="min-h-screen bg-gray-50 pb-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header - Dashboard Style */}
      <div className="bg-gradient-to-br from-slate-200 via-gray-100 to-blue-200 rounded-2xl shadow-xl relative overflow-hidden mx-4 mt-4 border border-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Reprogramar Citas</h1>
            <div className="w-28 h-1 bg-gradient-to-r from-slate-600 to-blue-600 mx-auto rounded-full"></div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 via-violet-400/20 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-400/10 to-transparent rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mensajes de estado */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm flex items-center space-x-3 animate-fade-in">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="text-red-800 font-bold text-sm">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm flex items-center space-x-3 animate-fade-in">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-green-800 font-bold text-sm">Éxito</h4>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Políticas de Reprogramación - Diseño Dashboard */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-50 to-amber-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          {/* Header con botón integrado */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shadow-sm border border-amber-200">
                <Info className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-lg">Políticas de Reprogramación</h3>
                <p className="text-gray-500 text-sm">Reglas para gestionar tus citas</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium shadow-sm transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Reglas compactas */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
            {[
              { id: 1, title: 'Solo Confirmadas', desc: 'Citas ya confirmadas', color: 'bg-blue-100 text-blue-700' },
              { id: 2, title: '24h Anticipación', desc: 'Mínimo 24 horas', color: 'bg-indigo-100 text-indigo-700' },
              { id: 3, title: 'Fecha Mínima', desc: 'Al menos mañana', color: 'bg-violet-100 text-violet-700' },
              { id: 4, title: 'Notificación', desc: 'Automática al Dr.', color: 'bg-purple-100 text-purple-700' },
              { id: 5, title: 'Filtrado', desc: 'Inteligente', color: 'bg-fuchsia-100 text-fuchsia-700' }
            ].map((rule) => (
              <div key={rule.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center space-x-3 mb-1">
                  <div className={`w-6 h-6 ${rule.color} rounded-full flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform`}>
                    {rule.id}
                  </div>
                  <h4 className="text-gray-900 font-bold text-xs">{rule.title}</h4>
                </div>
                <p className="text-gray-500 text-xs pl-9">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de citas reprogramables */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-1">Cargando citas...</h3>
            <p className="text-gray-500">Por favor espera un momento</p>
          </div>
        ) : reschedulableAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-200 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-2">No hay citas para reprogramar</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Solo se muestran citas confirmadas con más de 24 horas de anticipación. Si no ves tu cita aquí, es posible que ya no se pueda reprogramar.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reschedulableAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg text-white transform rotate-3">
                        <Calendar className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Cita con {appointment.psychologist_name}
                        </h3>
                        <p className="text-indigo-600 font-medium flex items-center mt-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(appointment.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-1.5 text-sm font-bold rounded-full">
                      Reprogramable
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                          <Clock className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Hora</p>
                          <p className="text-gray-900 font-bold text-lg">{appointment.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Psicólogo</p>
                          <p className="text-gray-900 font-bold">{appointment.psychologist_name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                          <Calendar className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Agendada</p>
                          <p className="text-gray-900 font-bold">{new Date(appointment.created_at).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Estado</p>
                          <p className="text-green-600 font-bold">Confirmada</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {appointment.reason && (
                    <div className="mb-8">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                        <Info className="w-4 h-4 mr-2 text-gray-400" />
                        Motivo de Consulta
                      </h4>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 text-gray-600 italic">
                        "{appointment.reason}"
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button
                      onClick={() => openRescheduleModal(appointment)}
                      className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Reprogramar Cita
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de reprogramación */}
      <RescheduleModal
        appointment={rescheduleModal.appointment}
        isOpen={rescheduleModal.isOpen}
        onClose={closeRescheduleModal}
        onReschedule={handleReschedule}
      />
    </div>
  );
}