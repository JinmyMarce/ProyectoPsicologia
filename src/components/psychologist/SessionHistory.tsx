import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Loader2,
  RefreshCw,
  FileText
} from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';
import { Modal } from '../ui/Modal';

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

export function getStatusColor(status: string): 'success' | 'info' | 'danger' | 'default' {
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
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'realizada':
      return 'Realizada';
    case 'programada':
      return 'Programada';
    case 'cancelada':
      return 'Cancelada';
    default:
      return 'Desconocido';
  }
}

export function SessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'dni' | 'career'>('email');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'realizada' | 'programada' | 'cancelada'>('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const handleSearch = (): void => {
    const foundPatient = patients.find((patient: Patient) => {
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
    } else {
      setError('Paciente no encontrado');
      setSelectedPatient(null);
    }
  };

  const setShowPatientDetails = (value: boolean): void => {
    console.warn(`setShowPatientDetails llamado con valor: ${value}`);
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

  const handleViewSessionDetails = (session: Session) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s: Session) => s.estado === 'realizada').length;
  const scheduledSessions = sessions.filter((s: Session) => s.estado === 'programada').length;

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
                  ✖
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPatientDetails(true)}
                  title="Ver detalles del paciente"
                >
                  <Eye className="w-4 h-4" />
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
      ) : sessions.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">No se encontraron sesiones</p>
            <p className="text-gray-500 text-sm mt-2">Ajusta los filtros de búsqueda</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
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

      {/* Detalles de la Sesión - Modal */}
      {selectedSession && (
        <Modal 
          open={showSessionDetails} 
          onClose={() => setShowSessionDetails(false)} 
          title={`Detalles de la Sesión con ${selectedSession?.patient_name || 'Paciente'}`}
          className="rounded-xl shadow-2xl border border-gray-300 bg-white p-8 transition-transform transform scale-100"
        >
          <div className="space-y-8">
            {/* Información General */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md border border-blue-200 p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-6">Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-blue-700">Paciente</label>
                  <p className="text-blue-900 font-medium">{selectedSession?.patient_name || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-blue-700">DNI</label>
                  <p className="text-blue-900 font-medium">{selectedSession?.patient_dni || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-blue-700">Correo Electrónico</label>
                  <p className="text-blue-900 font-medium">{selectedSession?.patient_email || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-blue-700">Programa de Estudios</label>
                  <p className="text-blue-900 font-medium">{selectedSession?.patient_career || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-blue-700">Semestre</label>
                  <p className="text-blue-900 font-medium">{selectedSession?.patient_semester || 'No especificado'}°</p>
                </div>
              </div>
            </div>

            {/* Detalles de la Sesión */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-md border border-green-200 p-6">
              <h3 className="text-xl font-bold text-green-900 mb-6">Detalles de la Sesión</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-green-700">Fecha</label>
                  <p className="text-green-900 font-medium">{selectedSession?.fecha_sesion || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-green-700">Hora</label>
                  <p className="text-green-900 font-medium">{selectedSession?.hora_sesion || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-green-700">Duración</label>
                  <p className="text-green-900 font-medium">{selectedSession?.duracion_minutos || 'No especificado'} minutos</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-green-700">Estado</label>
                  <p className={`text-green-900 font-semibold ${getStatusColor(selectedSession?.estado || '')}`}>{getStatusText(selectedSession?.estado || '')}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-green-700">Tipo de Sesión</label>
                  <p className="text-green-900 font-medium">{selectedSession?.tipo_sesion || 'No especificado'}</p>
                </div>
              </div>
            </div>

            {/* Temas Tratados */}
            {selectedSession?.temas_tratados && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg shadow-md border border-yellow-200 p-6">
                <h3 className="text-xl font-bold text-yellow-900 mb-6">Temas Tratados</h3>
                <p className="text-yellow-700 bg-yellow-50 p-4 rounded-lg">{selectedSession.temas_tratados}</p>
              </div>
            )}

            {/* Notas y Conclusiones */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg shadow-md border border-red-200 p-6">
              <h3 className="text-xl font-bold text-red-900 mb-6">Notas y Conclusiones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-red-700">Notas</label>
                  <p className="text-red-700 bg-red-50 p-4 rounded-lg">{selectedSession?.notas || 'No especificadas'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-red-700">Conclusiones</label>
                  <p className="text-red-700 bg-red-50 p-4 rounded-lg">{selectedSession?.conclusiones || 'No especificadas'}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function SessionDetailsModal({ open, onClose, session }: { open: boolean; onClose: () => void; session: Session | null }) {
  if (!open || !session) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Detalles de la Sesión con ${session.patient_name}`}>
      <div className="space-y-6">
        {/* Información General */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Paciente</label>
              <p className="text-gray-900">{session.patient_name}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">DNI</label>
              <p className="text-gray-900">{session.patient_dni}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Correo Electrónico</label>
              <p className="text-gray-900">{session.patient_email}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Programa de Estudios</label>
              <p className="text-gray-900">{session.patient_career}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Semestre</label>
              <p className="text-gray-900">{session.patient_semester}°</p>
            </div>
          </div>
        </div>

        {/* Detalles de la Sesión */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Detalles de la Sesión</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Fecha</label>
              <p className="text-gray-900">{new Date(session.fecha_sesion).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Hora</label>
              <p className="text-gray-900">{session.hora_sesion}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Duración</label>
              <p className="text-gray-900">{session.duracion_minutos} minutos</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Estado</label>
              <p className={`text-gray-900 font-semibold ${getStatusColor(session.estado)}`}>{getStatusText(session.estado)}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Tipo de Sesión</label>
              <p className="text-gray-900">{session.tipo_sesion}</p>
            </div>
          </div>
        </div>

        {/* Temas Tratados */}
        {session.temas_tratados && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Temas Tratados</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{session.temas_tratados}</p>
          </div>
        )}

        {/* Notas y Conclusiones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Notas y Conclusiones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Notas</label>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{session.notas || 'No especificadas'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Conclusiones</label>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{session.conclusiones || 'No especificadas'}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}