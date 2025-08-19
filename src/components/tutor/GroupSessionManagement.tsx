import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  School,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  BookOpen,
  RefreshCw,
  PlayCircle,
  Pause,
  StopCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { GroupSession, Student } from '../../types';

interface GroupSessionWithDetails extends GroupSession {
  enrolled_count?: number;
  attendance_count?: number;
  completion_rate?: number;
}

export function GroupSessionManagement() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GroupSessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterWeek, setFilterWeek] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<GroupSessionWithDetails | null>(null);

  // Datos del formulario de nueva sesión
  const [sessionForm, setSessionForm] = useState({
    classroom: (user as any)?.classroom || '',
    date: '',
    day_of_week: 'monday' as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
    topic: '',
    max_students: 30,
    notes: ''
  });

  useEffect(() => {
    if (user?.role === 'tutor') {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada a la API
      // const response = await fetch(`/api/tutors/${user?.id}/group-sessions`);
      // const data = await response.json();
      
      // Por ahora datos de ejemplo
      const mockSessions: GroupSessionWithDetails[] = [
        {
          id: '1',
          tutor_id: user?.id?.toString() || '1',
          classroom: 'A-101',
          date: '2025-08-20',
          start_time: '01:00',
          end_time: '02:00',
          day_of_week: 'tuesday',
          topic: 'Técnicas de Estudio Efectivo',
          max_students: 30,
          registered_students: ['1', '2', '3', '4', '5'],
          status: 'scheduled',
          notes: 'Sesión enfocada en métodos de estudio para estudiantes de sistemas.',
          created_at: '2025-08-15T10:00:00Z',
          updated_at: '2025-08-15T10:00:00Z',
          enrolled_count: 25,
          attendance_count: 0,
          completion_rate: 0
        },
        {
          id: '2',
          tutor_id: user?.id?.toString() || '1',
          classroom: 'A-101',
          date: '2025-08-19',
          start_time: '01:00',
          end_time: '02:00',
          day_of_week: 'monday',
          topic: 'Manejo del Estrés Académico',
          max_students: 30,
          registered_students: ['1', '2', '3'],
          status: 'completed',
          notes: 'Excelente participación de los estudiantes.',
          created_at: '2025-08-12T09:00:00Z',
          updated_at: '2025-08-19T15:00:00Z',
          enrolled_count: 28,
          attendance_count: 26,
          completion_rate: 93
        },
        {
          id: '3',
          tutor_id: user?.id?.toString() || '1',
          classroom: 'A-101',
          date: '2025-08-21',
          start_time: '01:00',
          end_time: '02:00',
          day_of_week: 'wednesday',
          topic: 'Comunicación Efectiva en Equipo',
          max_students: 30,
          registered_students: ['1', '2'],
          status: 'in_progress',
          notes: 'Sesión en curso.',
          created_at: '2025-08-16T11:00:00Z',
          updated_at: '2025-08-21T13:30:00Z',
          enrolled_count: 22,
          attendance_count: 20,
          completion_rate: 0
        },
        {
          id: '4',
          tutor_id: user?.id?.toString() || '1',
          classroom: 'A-101',
          date: '2025-08-22',
          start_time: '01:00',
          end_time: '02:00',
          day_of_week: 'thursday',
          topic: 'Planificación de Carrera Profesional',
          max_students: 30,
          registered_students: [],
          status: 'scheduled',
          notes: 'Sesión especial con invitado del sector empresarial.',
          created_at: '2025-08-17T14:00:00Z',
          updated_at: '2025-08-17T14:00:00Z',
          enrolled_count: 15,
          attendance_count: 0,
          completion_rate: 0
        }
      ];
      
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar llamada a la API
      console.log('Creating session:', sessionForm);
      
      // Simular creación exitosa
      await loadSessions();
      setShowCreateModal(false);
      setSessionForm({
        classroom: (user as any)?.classroom || '',
        date: '',
        day_of_week: 'monday',
        topic: '',
        max_students: 30,
        notes: ''
      });
      
      alert('Sesión grupal creada exitosamente');
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Error al crear la sesión');
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      // TODO: Implementar llamada a la API
      console.log('Starting session:', sessionId);
      
      // Actualizar estado local
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'in_progress' as const }
          : session
      ));
      
      alert('Sesión iniciada');
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Error al iniciar la sesión');
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      // TODO: Implementar llamada a la API
      console.log('Completing session:', sessionId);
      
      // Actualizar estado local
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'completed' as const }
          : session
      ));
      
      alert('Sesión marcada como completada');
    } catch (error) {
      console.error('Error completing session:', error);
      alert('Error al completar la sesión');
    }
  };

  const handleViewDetail = (session: GroupSessionWithDetails) => {
    setSelectedSession(session);
    setShowDetailModal(true);
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.classroom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    
    let matchesWeek = true;
    if (filterWeek !== 'all') {
      const sessionDate = new Date(session.date);
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      if (filterWeek === 'this_week') {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        matchesWeek = sessionDate >= startOfWeek && sessionDate <= endOfWeek;
      } else if (filterWeek === 'next_week') {
        const nextWeekStart = new Date(startOfWeek);
        nextWeekStart.setDate(startOfWeek.getDate() + 7);
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
        matchesWeek = sessionDate >= nextWeekStart && sessionDate <= nextWeekEnd;
      }
    }
    
    return matchesSearch && matchesStatus && matchesWeek;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="info" className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Programada
        </Badge>;
      case 'in_progress':
        return <Badge variant="warning" className="flex items-center gap-1">
          <PlayCircle className="w-3 h-3" />
          En Curso
        </Badge>;
      case 'completed':
        return <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Completada
        </Badge>;
      case 'cancelled':
        return <Badge variant="danger" className="flex items-center gap-1">
          <X className="w-3 h-3" />
          Cancelada
        </Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getDayInSpanish = (day: string) => {
    const days: { [key: string]: string } = {
      'monday': 'Lunes',
      'tuesday': 'Martes',
      'wednesday': 'Miércoles',
      'thursday': 'Jueves',
      'friday': 'Viernes'
    };
    return days[day] || day;
  };

  const getStats = () => {
    const total = sessions.length;
    const scheduled = sessions.filter(s => s.status === 'scheduled').length;
    const inProgress = sessions.filter(s => s.status === 'in_progress').length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const totalStudents = sessions.reduce((sum, s) => sum + (s.enrolled_count || 0), 0);
    
    return { total, scheduled, inProgress, completed, totalStudents };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-granate-800"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-granate-800">Sesiones Grupales</h1>
          <p className="text-azul-marino-700 mt-1">
            Gestiona las sesiones grupales programadas de 1:00 AM - 2:00 AM
          </p>
          {user && (
            <div className="flex items-center gap-2 mt-2">
              <School className="w-4 h-4 text-granate-800" />
              <span className="text-sm text-gray-600">
                Aula: {(user as any).classroom} - Horario: Lunes a Viernes 1:00-2:00 AM
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={loadSessions}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Sesión
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-azul-marino-100 rounded-lg">
              <Calendar className="w-5 h-5 text-azul-marino-800" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-granate-800">{stats.total}</h3>
              <p className="text-xs text-gray-600">Total Sesiones</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-granate-800">{stats.scheduled}</h3>
              <p className="text-xs text-gray-600">Programadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <PlayCircle className="w-5 h-5 text-yellow-800" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-granate-800">{stats.inProgress}</h3>
              <p className="text-xs text-gray-600">En Curso</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-800" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-granate-800">{stats.completed}</h3>
              <p className="text-xs text-gray-600">Completadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-800" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-granate-800">{stats.totalStudents}</h3>
              <p className="text-xs text-gray-600">Estudiantes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por tema, aula o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
              />
            </div>
          </div>
          <div className="lg:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programada</option>
              <option value="in_progress">En Curso</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div className="lg:w-48">
            <select
              value={filterWeek}
              onChange={(e) => setFilterWeek(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
            >
              <option value="all">Todas las semanas</option>
              <option value="this_week">Esta semana</option>
              <option value="next_week">Próxima semana</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de sesiones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSessions.map((session) => (
          <Card key={session.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{session.topic}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {getDayInSpanish(session.day_of_week)} • {new Date(session.date).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  {getStatusBadge(session.status)}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <School className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Aula: {session.classroom}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{session.start_time} - {session.end_time}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {session.enrolled_count || 0} / {session.max_students} estudiantes
                </span>
              </div>

              {session.status === 'completed' && session.completion_rate && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">
                    Asistencia: {session.attendance_count} ({session.completion_rate}%)
                  </span>
                </div>
              )}
            </div>

            {session.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{session.notes}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleViewDetail(session)}
                className="flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Ver
              </Button>
              
              {session.status === 'scheduled' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleStartSession(session.id)}
                  className="flex items-center gap-1"
                >
                  <PlayCircle className="w-4 h-4" />
                  Iniciar
                </Button>
              )}

              {session.status === 'in_progress' && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleCompleteSession(session.id)}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Completar
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <Card className="p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No se encontraron sesiones</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all' || filterWeek !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No tienes sesiones grupales programadas aún'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && filterWeek === 'all' && (
            <Button onClick={() => setShowCreateModal(true)}>
              Programar primera sesión
            </Button>
          )}
        </Card>
      )}

      {/* Modal para Nueva Sesión */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-granate-800">Nueva Sesión Grupal</h2>
              <p className="text-gray-600 mt-1">Programa una nueva sesión de 1:00 AM - 2:00 AM</p>
            </div>
            
            <form onSubmit={handleCreateSession} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aula/Salón <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={sessionForm.classroom}
                    onChange={e => setSessionForm(prev => ({ ...prev, classroom: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                    placeholder="Ej: A-101"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={sessionForm.date}
                    onChange={e => setSessionForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Día de la semana
                </label>
                <select
                  value={sessionForm.day_of_week}
                  onChange={e => setSessionForm(prev => ({ ...prev, day_of_week: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                >
                  <option value="monday">Lunes</option>
                  <option value="tuesday">Martes</option>
                  <option value="wednesday">Miércoles</option>
                  <option value="thursday">Jueves</option>
                  <option value="friday">Viernes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema de la sesión <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sessionForm.topic}
                  onChange={e => setSessionForm(prev => ({ ...prev, topic: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                  placeholder="Ej: Técnicas de estudio, Manejo del estrés"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de estudiantes
                </label>
                <input
                  type="number"
                  value={sessionForm.max_students}
                  onChange={e => setSessionForm(prev => ({ ...prev, max_students: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales
                </label>
                <textarea
                  value={sessionForm.notes}
                  onChange={e => setSessionForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                  rows={3}
                  placeholder="Información adicional sobre la sesión..."
                />
              </div>

              <div className="bg-azul-marino-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-azul-marino-800 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-azul-marino-900">Horario fijo</h4>
                    <p className="text-sm text-azul-marino-700 mt-1">
                      Todas las sesiones grupales se realizan de <strong>1:00 AM a 2:00 AM</strong>, 
                      únicamente de <strong>lunes a viernes</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Programar Sesión
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetailModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-granate-800">Detalles de la Sesión</h2>
              <p className="text-gray-600 mt-1">{selectedSession.topic}</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Estado:</h4>
                  {getStatusBadge(selectedSession.status)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Fecha y hora:</h4>
                  <p className="text-gray-700">
                    {getDayInSpanish(selectedSession.day_of_week)}, {new Date(selectedSession.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {selectedSession.start_time} - {selectedSession.end_time}
                  </p>
                </div>
              </div>

              {/* Ubicación y capacidad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Aula:</h4>
                  <p className="text-gray-700">{selectedSession.classroom}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Capacidad:</h4>
                  <p className="text-gray-700">
                    {selectedSession.enrolled_count || 0} / {selectedSession.max_students} estudiantes
                  </p>
                </div>
              </div>

              {/* Estadísticas de asistencia */}
              {selectedSession.status === 'completed' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Estadísticas de Asistencia</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-green-700">Inscritos:</span>
                      <p className="font-medium text-green-900">{selectedSession.enrolled_count}</p>
                    </div>
                    <div>
                      <span className="text-sm text-green-700">Asistieron:</span>
                      <p className="font-medium text-green-900">{selectedSession.attendance_count}</p>
                    </div>
                    <div>
                      <span className="text-sm text-green-700">Porcentaje:</span>
                      <p className="font-medium text-green-900">{selectedSession.completion_rate}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedSession.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notas:</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedSession.notes}
                  </p>
                </div>
              )}

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Creada:</h4>
                  <p className="text-gray-700">
                    {new Date(selectedSession.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Última actualización:</h4>
                  <p className="text-gray-700">
                    {new Date(selectedSession.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              {selectedSession.status === 'scheduled' && (
                <Button 
                  variant="primary"
                  onClick={() => {
                    handleStartSession(selectedSession.id);
                    setShowDetailModal(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Iniciar Sesión
                </Button>
              )}
              
              {selectedSession.status === 'in_progress' && (
                <Button 
                  variant="success"
                  onClick={() => {
                    handleCompleteSession(selectedSession.id);
                    setShowDetailModal(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Completar Sesión
                </Button>
              )}
              
              <Button 
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedSession(null);
                }}
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
