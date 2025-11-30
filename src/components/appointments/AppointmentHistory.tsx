import React, { useState, useEffect } from 'react';
import { getUserAppointments, cancelAppointment } from '../../services/appointments';
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
  Eye,
  Download,
  RefreshCw,
  FileText,
  X
} from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

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

export function AppointmentHistory() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [cancellingAppointment, setCancellingAppointment] = useState<number | null>(null);

  useEffect(() => {
    loadHistoryData();
  }, []);

  const loadHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const appointmentsData = await getUserAppointments();
      setAppointments(appointmentsData);
    } catch (error: any) {
      setError('Error al cargar el historial de citas');
      console.error('Error loading history data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistoryData();
    setRefreshing(false);
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      return;
    }

    try {
      setCancellingAppointment(appointmentId);
      await cancelAppointment(appointmentId);
      
      // Actualizar la lista de citas
      setAppointments(prev => 
        prev.map(app => 
          app.id === appointmentId 
            ? { ...app, status: 'cancelled' as const }
            : app
        )
      );
      setError('');
    } catch (error: any) {
      setError('Error al cancelar la cita');
      console.error('Error cancelling appointment:', error);
    } finally {
      setCancellingAppointment(null);
    }
  };

  const handleViewAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Hora', 'Psicólogo', 'Motivo', 'Estado', 'Creado'];
    const csvContent = [
      headers.join(','),
      ...filteredAppointments.map(app => [
        parseLocalDate(app.date).toLocaleDateString('es-ES'),
        app.time,
        app.psychologist_name,
        `"${app.reason}"`,
        getStatusText(app.status),
        parseLocalDate(app.created_at).toLocaleDateString('es-ES')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_citas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-[#c2b280] text-[#1e2a37] font-medium">Pendiente</Badge>;
      case 'confirmed':
        return <Badge className="bg-[#8e161a] text-white font-medium">Confirmada</Badge>;
      case 'completed':
        return <Badge className="bg-[#1e2a37] text-white font-medium">Completada</Badge>;
      case 'cancelled':
        return <Badge className="bg-[#4a0e10] text-white font-medium">Cancelada</Badge>;
      default:
        return <Badge className="bg-[#6d1115] text-white font-medium">{status}</Badge>;
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

  function parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // Filtrar citas
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.psychologist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.date.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Ordenar por fecha más reciente
  const sortedAppointments = filteredAppointments.sort((a, b) => 
    parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
  );

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#8e161a]" />
          <p className="text-gray-600 text-base">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-6 text-base" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
      {/* Título Principal - Mismo diseño que otras interfaces */}
      <div className="text-center mb-6">
        <div className="inline-block px-20 py-4 content-card border border-gray-200 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight mb-2">
            Historial de Citas
          </h1>
          <div className="w-28 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Botón de actualizar */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-[#c2b280] text-[#1e2a37] hover:bg-[#c2b280] hover:text-white font-medium"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          <p className="text-base font-medium">{error}</p>
        </div>
      )}

      {/* Estadísticas mejoradas con colores del sistema */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="text-4xl font-bold text-[#6d1115]">{stats.total}</div>
          <div className="text-lg text-[#1e2a37] font-medium">Total</div>
        </Card>
        <Card className="p-4 text-center bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="text-4xl font-bold text-[#c2b280]">{stats.pending}</div>
          <div className="text-lg text-[#1e2a37] font-medium">Pendientes</div>
        </Card>
        <Card className="p-4 text-center bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="text-4xl font-bold text-[#8e161a]">{stats.confirmed}</div>
          <div className="text-lg text-[#1e2a37] font-medium">Confirmadas</div>
        </Card>
        <Card className="p-4 text-center bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="text-4xl font-bold text-[#1e2a37]">{stats.completed}</div>
          <div className="text-lg text-[#1e2a37] font-medium">Completadas</div>
        </Card>
        <Card className="p-4 text-center bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="text-4xl font-bold text-[#4a0e10]">{stats.cancelled}</div>
          <div className="text-lg text-[#1e2a37] font-medium">Canceladas</div>
        </Card>
      </div>

      {/* Filtros mejorados */}
      <Card className="p-6 bg-white border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#1e2a37] flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6d1115] to-[#4a0e10] rounded-full flex items-center justify-center mr-3 shadow-md">
              <Filter className="w-4 h-4 text-white" />
            </div>
            Filtros y Búsqueda
          </h2>
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={filteredAppointments.length === 0}
            className="border-[#c2b280] text-[#1e2a37] hover:bg-[#c2b280] hover:text-white font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda mejorada */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#c2b280] w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por psicólogo, motivo o fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#c2b280] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d1115] focus:border-[#6d1115] text-[#1e2a37] font-medium text-lg"
            />
          </div>

          {/* Filtro por estado mejorado */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-[#c2b280] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d1115] focus:border-[#6d1115] text-[#1e2a37] font-medium text-lg"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de citas mejorada */}
      <Card className="p-6 bg-white border border-gray-200 shadow-lg">
        <h2 className="text-2xl font-bold text-[#1e2a37] mb-4 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6d1115] to-[#4a0e10] rounded-full flex items-center justify-center mr-3 shadow-md">
            <FileText className="w-4 h-4 text-white" />
          </div>
          Citas ({filteredAppointments.length})
        </h2>

        {sortedAppointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6d1115] to-[#4a0e10] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <p className="text-[#1e2a37] font-medium text-2xl">No se encontraron citas</p>
            <p className="text-[#c2b280] text-lg mt-1">Ajusta los filtros para ver más resultados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#8e161a] to-[#6d1115] rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#1e2a37] text-lg truncate">
                          {appointment.psychologist_name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#8e161a]" />
                            {parseLocalDate(appointment.date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#8e161a]" />
                            {appointment.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    {appointment.reason && (
                      <p className="text-sm text-gray-600 ml-[52px] truncate">
                        {appointment.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStatusBadge(appointment.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewAppointmentDetails(appointment)}
                      title="Ver detalles"
                      className="text-[#1e2a37] hover:text-[#8e161a] hover:bg-[#d3b7a0]/20 p-2"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de detalles de cita */}
      {showAppointmentDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAppointmentDetails(false)}>
          <div className="bg-white rounded-lg p-4 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
              <h3 className="text-lg font-bold text-[#1e2a37]">Detalles de la Cita</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAppointmentDetails(false)}
                className="p-1 h-auto hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-[#8e161a] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Psicólogo</p>
                  <p className="text-sm font-semibold text-[#1e2a37]">{selectedAppointment.psychologist_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-[#8e161a] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Fecha</p>
                  <p className="text-sm font-semibold text-[#1e2a37]">{parseLocalDate(selectedAppointment.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#8e161a] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Hora</p>
                  <p className="text-sm font-semibold text-[#1e2a37]">{selectedAppointment.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-[#8e161a] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Motivo</p>
                  <p className="text-sm text-[#1e2a37] break-words">{selectedAppointment.reason}</p>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-[#8e161a] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Notas</p>
                    <p className="text-sm text-[#1e2a37] break-words">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                <span className="text-xs text-gray-500">Estado:</span>
                {getStatusBadge(selectedAppointment.status)}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
              {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 border-red-200"
                  onClick={() => {
                    handleCancelAppointment(selectedAppointment.id);
                    setShowAppointmentDetails(false);
                  }}
                >
                  Cancelar Cita
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAppointmentDetails(false)}
                className="border-[#8e161a] text-[#8e161a] hover:bg-[#8e161a] hover:text-white"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}