import { useState } from 'react';
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl p-5 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-50 to-transparent rounded-full -mr-12 -mt-12 blur-2xl group-hover:from-cyan-100 transition-all duration-500"></div>
          
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Calendar className="w-6 h-6 text-cyan-700" />
            </div>
            <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full uppercase tracking-wider">Total</span>
          </div>

          <div className="relative z-10">
            <p className="text-4xl font-black text-slate-900 tracking-tight mb-1">{totalSessions}</p>
            <p className="text-sm font-semibold text-slate-600">Total de Sesiones</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl p-5 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-transparent rounded-full -mr-12 -mt-12 blur-2xl group-hover:from-emerald-100 transition-all duration-500"></div>
          
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <CheckCircle className="w-6 h-6 text-emerald-700" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">Completadas</span>
          </div>

          <div className="relative z-10">
            <p className="text-4xl font-black text-slate-900 tracking-tight mb-1">{completedSessions}</p>
            <p className="text-sm font-semibold text-slate-600">Sesiones Realizadas</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl p-5 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-12 -mt-12 blur-2xl group-hover:from-blue-100 transition-all duration-500"></div>
          
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <ClockIcon className="w-6 h-6 text-blue-700" />
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Próximas</span>
          </div>

          <div className="relative z-10">
            <p className="text-4xl font-black text-slate-900 tracking-tight mb-1">{scheduledSessions}</p>
            <p className="text-sm font-semibold text-slate-600">Sesiones Programadas</p>
          </div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-violet-200 rounded-xl flex items-center justify-center shadow-sm">
            <Search className="w-5 h-5 text-violet-700" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Buscar y Filtrar
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de búsqueda
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'email' | 'dni' | 'career')}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 bg-white shadow-sm font-medium"
            >
              <option value="email">Correo Electrónico</option>
              <option value="dni">DNI</option>
              <option value="career">Programa de Estudios</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Término de búsqueda
            </label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder={`Buscar por ${searchType === 'email' ? 'correo' : searchType === 'dni' ? 'DNI' : 'programa'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 shadow-sm"
              />
              <Button
                onClick={handleSearch}
                disabled={!searchTerm.trim()}
                className="px-6 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 bg-white shadow-sm font-medium"
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
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 text-lg">{selectedPatient.name}</h3>
                  <p className="text-sm text-blue-700 font-medium">
                    {selectedPatient.career} - {selectedPatient.semester}° Semestre
                  </p>
                  <p className="text-sm text-blue-700">
                    DNI: {selectedPatient.dni} | {selectedPatient.total_sessions} sesiones
                  </p>
                  <p className="text-sm text-blue-600">{selectedPatient.email}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Badge variant="info" className="text-xs font-bold">Paciente Seleccionado</Badge>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPatient(null)}
                    className="rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  >
                    ✖
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPatientDetails(true)}
                    title="Ver detalles del paciente"
                    className="rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de sesiones */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-md p-8 border border-slate-200">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600"></Loader2>
            <span className="ml-3 text-gray-600 font-medium">Cargando sesiones...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl shadow-md p-8 border border-red-200">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 font-bold text-lg">{error}</p>
          </div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-8 border border-slate-200">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-bold text-lg">No se encontraron sesiones</p>
            <p className="text-gray-500 text-sm mt-2">Ajusta los filtros de búsqueda</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl p-6 border border-slate-200 hover:border-slate-300 transition-all duration-300">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all duration-300">
                    <User className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                      {session.patient_name}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {session.patient_career} - {session.patient_semester}° Semestre
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(session.estado)}
                  <Badge variant={getStatusColor(session.estado)} className="font-semibold px-3 py-1">
                    {getStatusText(session.estado)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 font-medium flex items-center">
                    <Calendar className="w-4 h-4 inline mr-2 text-cyan-600" />
                    {new Date(session.fecha_sesion).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-700 font-medium flex items-center">
                    <Clock className="w-4 h-4 inline mr-2 text-blue-600" />
                    {session.hora_sesion} - {session.duracion_minutos} minutos
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 font-medium flex items-center">
                    <User className="w-4 h-4 inline mr-2 text-violet-600" />
                    DNI: {session.patient_dni}
                  </p>
                  <p className="text-sm text-gray-700 font-medium flex items-center">
                    <FileText className="w-4 h-4 inline mr-2 text-emerald-600" />
                    {session.tipo_sesion}
                  </p>
                </div>
              </div>

              {session.temas_tratados && (
                <div className="mb-5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-amber-600" />
                    Temas Tratados
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {session.temas_tratados}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewSessionDetails(session)}
                  className="bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border-slate-300 rounded-xl px-4 py-2 font-semibold transition-all duration-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalles
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detalles de la Sesión - Modal */}
      {selectedSession && (
        <Modal 
          open={showSessionDetails} 
          onClose={() => setShowSessionDetails(false)} 
          title={`Detalles de la Sesión con ${selectedSession?.patient_name || 'Paciente'}`}
        >
          <div className="space-y-6">
            {/* Información General */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-blue-900 tracking-tight">Información General</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white/70 rounded-xl p-3 border border-blue-100">
                  <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">Paciente</label>
                  <p className="text-blue-900 font-semibold mt-1">{selectedSession?.patient_name || 'No especificado'}</p>
                </div>
                <div className="bg-white/70 rounded-xl p-3 border border-blue-100">
                  <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">DNI</label>
                  <p className="text-blue-900 font-semibold mt-1">{selectedSession?.patient_dni || 'No especificado'}</p>
                </div>
                <div className="bg-white/70 rounded-xl p-3 border border-blue-100">
                  <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">Correo Electrónico</label>
                  <p className="text-blue-900 font-semibold mt-1">{selectedSession?.patient_email || 'No especificado'}</p>
                </div>
                <div className="bg-white/70 rounded-xl p-3 border border-blue-100">
                  <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">Programa de Estudios</label>
                  <p className="text-blue-900 font-semibold mt-1">{selectedSession?.patient_career || 'No especificado'}</p>
                </div>
                <div className="bg-white/70 rounded-xl p-3 border border-blue-100">
                  <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">Semestre</label>
                  <p className="text-blue-900 font-semibold mt-1">{selectedSession?.patient_semester || 'No especificado'}°</p>
                </div>
              </div>
            </div>

            {/* Detalles de la Sesión */}
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg border border-emerald-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-emerald-900 tracking-tight">Detalles de la Sesión</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white/70 rounded-xl p-3 border border-emerald-100">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Fecha</label>
                  <p className="text-emerald-900 font-semibold mt-1">{selectedSession?.fecha_sesion || 'No especificado'}</p>
                </div>
                <div className="bg-white/70 rounded-xl p-3 border border-emerald-100">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Hora</label>
                  <p className="text-emerald-900 font-semibold mt-1">{selectedSession?.hora_sesion || 'No especificado'}</p>
                </div>
                <div className="bg-white/70 rounded-xl p-3 border border-emerald-100">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Duración</label>
                  <p className="text-emerald-900 font-semibold mt-1">{selectedSession?.duracion_minutos || 'No especificado'} minutos</p>
                </div>
                <div className="bg-white/70 rounded-xl p-3 border border-emerald-100">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Estado</label>
                  <div className="mt-1">
                    <Badge variant={getStatusColor(selectedSession?.estado || '')} className="font-semibold">
                      {getStatusText(selectedSession?.estado || '')}
                    </Badge>
                  </div>
                </div>
                <div className="bg-white/70 rounded-xl p-3 border border-emerald-100 md:col-span-2">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Tipo de Sesión</label>
                  <p className="text-emerald-900 font-semibold mt-1">{selectedSession?.tipo_sesion || 'No especificado'}</p>
                </div>
              </div>
            </div>

            {/* Temas Tratados */}
            {selectedSession?.temas_tratados && (
              <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-lg border border-amber-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-amber-900 tracking-tight">Temas Tratados</h3>
                </div>
                <p className="text-amber-800 bg-white/70 p-4 rounded-xl border border-amber-100 leading-relaxed font-medium">{selectedSession.temas_tratados}</p>
              </div>
            )}

            {/* Notas y Conclusiones */}
            <div className="bg-gradient-to-br from-white to-violet-50 rounded-2xl shadow-lg border border-violet-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-violet-900 tracking-tight">Notas y Conclusiones</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white/70 rounded-xl p-4 border border-violet-100">
                  <label className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-2 block">Notas</label>
                  <p className="text-violet-800 leading-relaxed font-medium">{selectedSession?.notas || 'No especificadas'}</p>
                </div>
                <div className="bg-white/70 rounded-xl p-4 border border-violet-100">
                  <label className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-2 block">Conclusiones</label>
                  <p className="text-violet-800 leading-relaxed font-medium">{selectedSession?.conclusiones || 'No especificadas'}</p>
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