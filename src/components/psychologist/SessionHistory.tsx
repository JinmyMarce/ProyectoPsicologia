import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Filter, 
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Loader2,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../ui/PageHeader';

interface Session {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_email: string;
  patient_dni: string;
  patient_career: string;
  patient_semester: string;
  fecha_sesion: string;
  hora_sesion: string;
  duracion_minutos: number;
  estado: string;
  tipo_sesion: string;
  temas_tratados: string;
  notas: string;
  objetivos: string;
  conclusiones: string;
  created_at: string;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  dni: string;
  career: string;
  semester: string;
  total_sessions: number;
}

export function SessionHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'dni' | 'career'>('email');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'realizada' | 'programada' | 'cancelada'>('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);

  useEffect(() => {
    loadSessions();
    loadPatients();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simular carga de sesiones (en un caso real, harías una llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSessions: Session[] = [
        {
          id: 1,
          patient_id: 1,
          patient_name: 'María González López',
          patient_email: 'maria.gonzalez@issta.edu.pe',
          patient_dni: '12345678',
          patient_career: 'Psicología',
          patient_semester: '5',
          fecha_sesion: '2024-01-15',
          hora_sesion: '09:00',
          duracion_minutos: 60,
          estado: 'realizada',
          tipo_sesion: 'Terapia individual',
          temas_tratados: 'Ansiedad académica y manejo del estrés',
          notas: 'La paciente mostró mejoría en la gestión del tiempo. Se recomienda continuar con técnicas de respiración.',
          objetivos: 'Reducir niveles de ansiedad y mejorar organización académica',
          conclusiones: 'Sesión productiva con avances significativos',
          created_at: '2024-01-10T10:00:00Z'
        },
        {
          id: 2,
          patient_id: 1,
          patient_name: 'María González López',
          patient_email: 'maria.gonzalez@issta.edu.pe',
          patient_dni: '12345678',
          patient_career: 'Psicología',
          patient_semester: '5',
          fecha_sesion: '2024-01-22',
          hora_sesion: '10:00',
          duracion_minutos: 60,
          estado: 'programada',
          tipo_sesion: 'Terapia individual',
          temas_tratados: '',
          notas: '',
          objetivos: 'Continuar trabajo en técnicas de relajación',
          conclusiones: '',
          created_at: '2024-01-15T14:00:00Z'
        },
        {
          id: 3,
          patient_id: 2,
          patient_name: 'Carlos Rodríguez Silva',
          patient_email: 'carlos.rodriguez@issta.edu.pe',
          patient_dni: '87654321',
          patient_career: 'Psicología',
          patient_semester: '3',
          fecha_sesion: '2024-01-18',
          hora_sesion: '14:00',
          duracion_minutos: 60,
          estado: 'realizada',
          tipo_sesion: 'Terapia individual',
          temas_tratados: 'Problemas de autoestima y relaciones interpersonales',
          notas: 'El paciente mostró apertura para trabajar en sus habilidades sociales.',
          objetivos: 'Mejorar autoestima y habilidades sociales',
          conclusiones: 'Buen progreso en la primera sesión',
          created_at: '2024-01-12T09:00:00Z'
        }
      ];
      
      setSessions(mockSessions);
    } catch (error: any) {
      setError('Error al cargar las sesiones');
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      // Simular carga de pacientes
      const mockPatients: Patient[] = [
        {
          id: 1,
          name: 'María González López',
          email: 'maria.gonzalez@issta.edu.pe',
          dni: '12345678',
          career: 'Psicología',
          semester: '5',
          total_sessions: 2
        },
        {
          id: 2,
          name: 'Carlos Rodríguez Silva',
          email: 'carlos.rodriguez@issta.edu.pe',
          dni: '87654321',
          career: 'Psicología',
          semester: '3',
          total_sessions: 1
        }
      ];
      
      setPatients(mockPatients);
    } catch (error: any) {
      console.error('Error loading patients:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setError('Por favor ingresa un término de búsqueda');
      return;
    }

    setError('');
    
    // Simular búsqueda de paciente
    const foundPatient = patients.find(patient => {
      switch (searchType) {
        case 'email':
          return patient.email.toLowerCase().includes(searchTerm.toLowerCase());
        case 'dni':
          return patient.dni.includes(searchTerm);
        case 'career':
          return patient.career.toLowerCase().includes(searchTerm.toLowerCase());
        default:
          return false;
      }
    });

    if (foundPatient) {
      setSelectedPatient(foundPatient);
      setSuccess('Paciente encontrado');
    } else {
      setError('Paciente no encontrado');
      setSelectedPatient(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'realizada':
        return 'success';
      case 'programada':
        return 'info';
      case 'cancelada':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'realizada':
        return 'Realizada';
      case 'programada':
        return 'Programada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'realizada':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'programada':
        return <ClockIcon className="w-4 h-4 text-blue-500" />;
      case 'cancelada':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesPatient = !selectedPatient || session.patient_id === selectedPatient.id;
    const matchesStatus = filterStatus === 'all' || session.estado === filterStatus;
    return matchesPatient && matchesStatus;
  });

  const handleViewSessionDetails = (session: Session) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.estado === 'realizada').length;
  const scheduledSessions = sessions.filter(s => s.estado === 'programada').length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Historial de Sesiones"
        subtitle="Visualiza todas las sesiones y filtra por estudiante"
      >
        <div className="flex items-center justify-between">
          <p className="text-base text-gray-500 font-medium text-center">
            Instituto Túpac Amaru - Psicología Clínica
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="ml-4"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </PageHeader>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 border border-[#8e161a]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{totalSessions}</p>
              <p className="text-sm font-medium text-gray-600">Total de Sesiones</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 border border-[#8e161a]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{completedSessions}</p>
              <p className="text-sm font-medium text-gray-600">Sesiones Realizadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 border border-[#8e161a]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{scheduledSessions}</p>
              <p className="text-sm font-medium text-gray-600">Sesiones Programadas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Búsqueda y filtros */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Search className="w-6 h-6 mr-3 text-[#8e161a]" />
          Buscar y Filtrar
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de búsqueda
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'email' | 'dni' | 'career')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
            >
              <option value="email">Correo Electrónico</option>
              <option value="dni">DNI</option>
              <option value="career">Programa de Estudios</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Término de búsqueda
            </label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder={`Buscar por ${searchType === 'email' ? 'correo' : searchType === 'dni' ? 'DNI' : 'programa'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={!searchTerm.trim()}
                className="px-6"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="realizada">Realizadas</option>
              <option value="programada">Programadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>

        {/* Paciente seleccionado */}
        {selectedPatient && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">{selectedPatient.name}</h3>
                <p className="text-sm text-blue-700">
                  {selectedPatient.career} - {selectedPatient.semester}° Semestre
                </p>
                <p className="text-sm text-blue-700">
                  DNI: {selectedPatient.dni} | {selectedPatient.total_sessions} sesiones
                </p>
                <p className="text-sm text-blue-700">{selectedPatient.email}</p>
              </div>
              <div className="flex space-x-2">
                <Badge variant="info">Paciente Seleccionado</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPatient(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Lista de sesiones */}
      {loading ? (
        <Card className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#8e161a]"></Loader2>
            <span className="ml-3 text-gray-600">Cargando sesiones...</span>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        </Card>
      ) : filteredSessions.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">No se encontraron sesiones</p>
            <p className="text-gray-500 text-sm mt-2">Ajusta los filtros de búsqueda</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Sesión con {session.patient_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {session.patient_career} - {session.patient_semester}° Semestre
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(session.estado)}
                  <Badge variant={getStatusColor(session.estado)}>
                    {getStatusText(session.estado)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {new Date(session.fecha_sesion).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {session.hora_sesion} - {session.duracion_minutos} minutos
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <User className="w-4 h-4 inline mr-1" />
                    DNI: {session.patient_dni}
                  </p>
                  <p className="text-sm text-gray-600">
                    <FileText className="w-4 h-4 inline mr-1" />
                    {session.tipo_sesion}
                  </p>
                </div>
              </div>

              {session.temas_tratados && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Temas Tratados</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {session.temas_tratados}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewSessionDetails(session)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalles
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalles de sesión */}
      {showSessionDetails && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Detalles de la Sesión</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSessionDetails(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Información del paciente */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Información del Paciente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="font-medium">{selectedSession.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">DNI</p>
                    <p className="font-medium">{selectedSession.patient_dni}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Programa</p>
                    <p className="font-medium">{selectedSession.patient_career}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Semestre</p>
                    <p className="font-medium">{selectedSession.patient_semester}°</p>
                  </div>
                </div>
              </div>

              {/* Información de la sesión */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Información de la Sesión</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Fecha</p>
                    <p className="font-medium">
                      {new Date(selectedSession.fecha_sesion).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hora</p>
                    <p className="font-medium">{selectedSession.hora_sesion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duración</p>
                    <p className="font-medium">{selectedSession.duracion_minutos} minutos</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <Badge variant={getStatusColor(selectedSession.estado)}>
                      {getStatusText(selectedSession.estado)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Sesión</p>
                    <p className="font-medium">{selectedSession.tipo_sesion}</p>
                  </div>
                </div>
              </div>

              {/* Contenido de la sesión */}
              {selectedSession.temas_tratados && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Temas Tratados</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedSession.temas_tratados}
                  </p>
                </div>
              )}

              {selectedSession.notas && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Notas</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedSession.notas}
                  </p>
                </div>
              )}

              {selectedSession.objetivos && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Objetivos</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedSession.objetivos}
                  </p>
                </div>
              )}

              {selectedSession.conclusiones && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Conclusiones</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedSession.conclusiones}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 