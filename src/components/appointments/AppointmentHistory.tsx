import React, { useState, useEffect } from 'react';
import { getAppointments, getPsychologists, cancelAppointment } from '../../services/appointments';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Trash2,
  Eye
} from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';

interface Appointment {
  id: number;
  user_email: string;
  psychologist_id: number;
  psychologist_name: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface Psychologist {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  available: boolean;
}

export function AppointmentHistory() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [psychologistFilter, setPsychologistFilter] = useState<string>('all');

  useEffect(() => {
    loadHistoryData();
  }, []);

  const loadHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [appointmentsData, psychologistsData] = await Promise.all([
        getAppointments(),
        getPsychologists()
      ]);
      
      setAppointments(appointmentsData);
      setPsychologists(psychologistsData);
    } catch (error: any) {
      setError('Error al cargar el historial de citas');
      console.error('Error loading history data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      return;
    }

    try {
      await cancelAppointment(appointmentId);
      
      // Actualizar la lista de citas
      setAppointments(prev => 
        prev.map(app => 
          app.id === appointmentId 
            ? { ...app, status: 'cancelled' as const }
            : app
        )
      );
    } catch (error: any) {
      setError('Error al cancelar la cita');
      console.error('Error cancelling appointment:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'confirmed':
        return <Badge variant="success">Confirmada</Badge>;
      case 'completed':
        return <Badge variant="info">Completada</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelada</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Filtrar citas
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.psychologist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesPsychologist = psychologistFilter === 'all' || 
      appointment.psychologist_id.toString() === psychologistFilter;
    
    return matchesSearch && matchesStatus && matchesPsychologist;
  });

  // Ordenar por fecha más reciente
  const sortedAppointments = filteredAppointments.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Historial de Citas"
        subtitle="Registro Completo de Citas"
      >
        <p className="text-base text-gray-500 font-medium text-center">
          Instituto Túpac Amaru - Psicología Clínica
        </p>
      </PageHeader>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-[#8e161a]" />
          Filtros y Búsqueda
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por psicólogo, estudiante o motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#8e161a] focus:ring-2 focus:ring-[#8e161a]/20 transition-all duration-300"
            />
          </div>

          {/* Filtro por estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#8e161a] focus:ring-2 focus:ring-[#8e161a]/20 transition-all duration-300"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>

          {/* Filtro por psicólogo */}
          <select
            value={psychologistFilter}
            onChange={(e) => setPsychologistFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#8e161a] focus:ring-2 focus:ring-[#8e161a]/20 transition-all duration-300"
          >
            <option value="all">Todos los psicólogos</option>
            {psychologists.map(psychologist => (
              <option key={psychologist.id} value={psychologist.id.toString()}>
                {psychologist.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Lista de citas */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-[#8e161a]" />
          Citas ({sortedAppointments.length})
        </h2>

        {sortedAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">No se encontraron citas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 rounded-lg border border-[#8e161a]/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-900 mb-1">
                        Dr. {appointment.psychologist_name}
                      </h3>
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        {appointment.user_email}
                      </p>
                      <div className="flex items-center space-x-4 text-xs font-medium text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(appointment.date)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(appointment.time)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        Motivo: {appointment.reason}
                      </p>
                      {appointment.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          Notas: {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(appointment.status)}
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-xs"
                        onClick={() => window.location.href = `/appointments/${appointment.id}`}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      {appointment.status === 'pending' && (
                        <Button 
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-xs text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}