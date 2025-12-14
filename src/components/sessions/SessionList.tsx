import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, RefreshCw, Plus, Sparkles, User, X, AlertTriangle, Clock, Calendar, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { psychologicalSessionsService, PsychologicalSession, UpdateSessionData } from '../../services/psychologicalSessions';
import { SessionRegistration } from './SessionRegistration';
import { useNavigate } from 'react-router-dom';

export function SessionList() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<PsychologicalSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('paciente'); // 'paciente', 'dni', 'email'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    estado: '',
    date_from: '',
    date_to: ''
  });
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [sessionToDeleteId, setSessionToDeleteId] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<PsychologicalSession | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateSessionData>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const loadSessions = async (page = 1, search = '', filters = {}) => {
    setLoading(true);
    setError('');

    try {
      const response = await psychologicalSessionsService.getSessions({
        search: search.trim() || undefined,
        page,
        per_page: 10,
        ...filters
      } as any);

      if (response.success) {
        setSessions(response.data);
        setTotalPages(response.pagination?.last_page || 1);
        setCurrentPage(response.pagination?.current_page || 1);
      } else {
        setError('Error al cargar sesiones');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    loadSessions(1, searchTerm, filters);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadSessions(page, searchTerm, filters);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilters({
      estado: '',
      date_from: '',
      date_to: ''
    });
    setCurrentPage(1);
    loadSessions(1, '', { estado: '', date_from: '' });
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'dni':
        return '12345678';
      case 'email':
        return 'estudiante@istta.edu.pe';
      case 'paciente':
        return 'Buscar por nombre del paciente...';
      default:
        return 'Buscar...';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    try {
      await psychologicalSessionsService.deleteSession(sessionId);
      loadSessions(currentPage, searchTerm, filters);
      setDeleteConfirmationOpen(false);
      setSessionToDeleteId(null);
    } catch (err: any) {
      setError('Error al eliminar la sesión');
    }
  };

  const handleViewDetails = (session: PsychologicalSession) => {
    setSelectedSession(session);
    setDetailsModalOpen(true);
  };

  const handleEditSession = (session: PsychologicalSession) => {
    setSelectedSession(session);
    // Preparar datos del formulario con los valores actuales
    const fechaHora = new Date(session.fecha_sesion);
    const fecha = fechaHora.toISOString().split('T')[0];
    const hora = fechaHora.toTimeString().slice(0, 5);
    
    setEditFormData({
      fecha_sesion: fecha,
      hora_sesion: hora,
      estado: session.estado,
      duracion_minutos: session.duracion_minutos || 60,
      tipo_sesion: session.tipo_sesion || '',
      temas_tratados: session.temas_tratados || '',
      objetivos: session.objetivos || '',
      conclusiones: session.conclusiones || '',
      notas: session.notas || ''
    });
    setEditError('');
    setEditModalOpen(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateSession = async () => {
    if (!selectedSession) return;

    setEditError('');
    setEditLoading(true);

    try {
      // Combinar fecha y hora
      const fechaHora = editFormData.fecha_sesion && editFormData.hora_sesion
        ? `${editFormData.fecha_sesion} ${editFormData.hora_sesion}:00`
        : selectedSession.fecha_sesion;

      const updateData: UpdateSessionData = {
        fecha_sesion: fechaHora,
        estado: editFormData.estado,
        duracion_minutos: editFormData.duracion_minutos ? parseInt(String(editFormData.duracion_minutos)) : undefined,
        tipo_sesion: editFormData.tipo_sesion,
        temas_tratados: editFormData.temas_tratados,
        objetivos: editFormData.objetivos,
        conclusiones: editFormData.conclusiones,
        notas: editFormData.notas
      };

      const response = await psychologicalSessionsService.updateSession(selectedSession.id, updateData);
      
      if (response.success) {
        setEditModalOpen(false);
        setSelectedSession(null);
        setEditFormData({});
        loadSessions(currentPage, searchTerm, filters);
      } else {
        setEditError(response.message || 'Error al actualizar la sesión');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar la sesión';
      setEditError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Programada':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Programada</span>;
      case 'Realizada':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">Realizada</span>;
      case 'Cancelada':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">Cancelada</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">{estado}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 font-sans selection:bg-cyan-50 selection:text-cyan-800">
        {/* Header Section - Celeste Suave (igual al dashboard del psicólogo) - Responsivo */}
        <div className="bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-50 rounded-xl sm:rounded-2xl shadow-2xl relative overflow-hidden mx-2 xs:mx-3 sm:mx-4 mt-2 sm:mt-3 border border-cyan-200/40">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100/50 via-transparent to-sky-100/30 animate-pulse"></div>

          {/* Minimal decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-100/50 via-sky-100/30 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-sky-100/40 to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

          {/* Subtle dots */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-12 left-16 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-32 w-1 h-1 bg-sky-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-5 md:pt-6 pb-6 sm:pb-7 md:pb-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1.5 sm:mb-2">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/70 text-cyan-700 text-[9px] sm:text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-cyan-300/50 hover:bg-white/80 transition-all duration-300 backdrop-blur-xl">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                    SAPTA - Psicología
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-cyan-900 mb-1 sm:mb-1.5 leading-tight">
                  Sesiones Psicológicas
                </h1>
                <p className="text-cyan-800 text-[11px] sm:text-xs md:text-sm max-w-2xl font-medium leading-relaxed">
                  Gestiona y visualiza todas tus sesiones.
                  <span className="hidden sm:inline text-cyan-700"> Registra y administra sesiones psicológicas.</span>
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full md:w-auto justify-end md:justify-start">
                <button
                  onClick={() => loadSessions(currentPage, searchTerm, filters)}
                  className="px-3 sm:px-4 py-2 bg-white rounded-lg border border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300 flex items-center gap-2 font-semibold text-xs sm:text-sm shadow-sm"
                  title="Actualizar lista"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Actualizar</span>
                </button>
                <button
                  onClick={() => setShowRegistrationModal(true)}
                  className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white rounded-lg border border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 font-semibold text-[11px] sm:text-xs md:text-sm shadow-sm"
                  title="Nueva Sesión"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Nueva Sesión</span>
                  <span className="sm:hidden">Nueva</span>
                </button>
              </div>
            </div>
          </div>

          {/* Wave pattern */}
          <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden pointer-events-none">
            <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="white" fillOpacity="0.08" />
              <path d="M0,20 C200,100 400,100 600,60 C800,20 1000,20 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity="0.04" />
            </svg>
          </div>
        </div>

        {/* Contenido colgando del header */}
        <div className="w-full px-2 xs:px-3 sm:px-4 lg:px-6 -mt-4 relative z-20">

          {/* Filtros y búsqueda - Organizados */}
          <div className="bg-white rounded-xl shadow-lg border border-cyan-200/50 p-3 sm:p-4 md:p-5 mb-4 sm:mb-6">
            <h2 className="text-sm sm:text-base md:text-lg font-black text-cyan-900 mb-3 sm:mb-4 md:mb-5 flex items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-slate-900 rounded-lg flex items-center justify-center mr-2 sm:mr-3 shadow-md flex-shrink-0">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="text-xs sm:text-sm md:text-lg">Buscar Sesiones</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Combo de tipo de búsqueda */}
              <div className="flex-shrink-0 sm:w-36">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 sm:mb-2">
                  Tipo de búsqueda
                </label>
                <select
                  value={searchType}
                  onChange={(e) => {
                    setSearchType(e.target.value);
                    setSearchTerm('');
                  }}
                  className="w-full px-3 py-2 sm:py-2.5 border-2 border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-cyan-300"
                >
                  <option value="paciente">Paciente</option>
                  <option value="dni">DNI</option>
                  <option value="email">Correo</option>
                </select>
              </div>

              {/* Campo de búsqueda - Un poco más ancho */}
              <div className="flex-shrink-0 sm:w-56 md:w-64">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 sm:mb-2">
                  {searchType === 'dni' ? 'DNI del paciente' : searchType === 'email' ? 'Correo electrónico' : 'Nombre del paciente'}
                </label>
                <input
                  type={searchType === 'dni' ? 'text' : searchType === 'email' ? 'email' : 'text'}
                  inputMode={searchType === 'dni' ? 'numeric' : searchType === 'email' ? 'email' : 'text'}
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => {
                    if (searchType === 'dni') {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setSearchTerm(value);
                    } else {
                      setSearchTerm(e.target.value);
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-cyan-300 focus:outline-none"
                />
              </div>

              {/* Filtro de estado */}
              <div className="flex-shrink-0 sm:w-40 lg:w-44">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 sm:mb-2">
                  Estado
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 border-2 border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-cyan-300"
                >
                  <option value="">Todos</option>
                  <option value="Programada">Programada</option>
                  <option value="Realizada">Realizada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              {/* Filtro por fecha */}
              <div className="flex-shrink-0 sm:w-40 lg:w-44">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 sm:mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 border-2 border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-cyan-300"
                />
              </div>

              {/* Botón de buscar - Después del campo Estado */}
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={loading || !searchTerm.trim()}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] text-xs sm:text-sm"
                  title="Buscar"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                      <span className="hidden sm:inline">Buscando...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Buscar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mensajes de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p>{error}</p>
            </div>
          )}

          {/* Tabla de sesiones - Diseño copiado de gestión de pacientes */}
          <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-slate-200 w-full">
            {/* Vista de tabla para pantallas grandes */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-slate-700">
                    <th className="px-2 py-2.5 text-center font-bold text-xs uppercase tracking-wider text-white">Paciente</th>
                    <th className="px-2 py-2.5 text-center font-bold text-xs uppercase tracking-wider text-white">Fecha y Hora</th>
                    <th className="px-2 py-2.5 text-center font-bold text-xs uppercase tracking-wider text-white">Tipo</th>
                    <th className="px-2 py-2.5 text-center font-bold text-xs uppercase tracking-wider text-white">Duración</th>
                    <th className="px-2 py-2.5 text-center font-bold text-xs uppercase tracking-wider text-white">Estado</th>
                    <th className="px-2 py-2.5 text-center font-bold text-xs uppercase tracking-wider text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-4 text-center text-slate-500">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-slate-400" />
                          <span className="text-sm font-medium">Cargando sesiones...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-4 text-center text-slate-500">
                        <span className="text-sm font-medium">No se encontraron sesiones</span>
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100">
                        <td className="px-2 py-2.5 text-center">
                          <div>
                            <p className="font-semibold text-xs text-slate-900">{session.patient?.name || 'N/A'}</p>
                            <p className="text-xs text-slate-600">{session.patient?.dni || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-xs text-slate-700 text-center">
                          {formatDate(session.fecha_sesion)}
                        </td>
                        <td className="px-2 py-2.5 text-xs text-slate-700 text-center">
                          {session.tipo_sesion}
                        </td>
                        <td className="px-2 py-2.5 text-xs text-slate-700 text-center">
                          {session.duracion_minutos} min
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          {getStatusBadge(session.estado)}
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleViewDetails(session)}
                              className="p-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditSession(session)}
                              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200"
                              title="Editar sesión"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setSessionToDeleteId(session.id);
                                setDeleteConfirmationOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                              title="Eliminar sesión"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Vista de cards para móvil */}
            <div className="md:hidden space-y-3 p-3">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2 text-slate-400" />
                  <span className="text-sm font-medium">Cargando sesiones...</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <span className="text-sm font-medium">No se encontraron sesiones</span>
                </div>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">{session.patient?.name || 'N/A'}</h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">DNI: {session.patient?.dni || 'N/A'}</p>
                        <p className="text-xs sm:text-sm text-slate-600">{formatDate(session.fecha_sesion)}</p>
                        <p className="text-xs sm:text-sm text-slate-600">Tipo: {session.tipo_sesion}</p>
                        <p className="text-xs sm:text-sm text-slate-600">Duración: {session.duracion_minutos} min</p>
                      </div>
                      <div className="sm:ml-2 flex-shrink-0 self-start sm:self-auto">
                        {getStatusBadge(session.estado)}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 sm:pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleViewDetails(session)}
                        className="p-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditSession(session)}
                        className="p-1.5 rounded-lg text-slate-700 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200"
                        title="Editar sesión"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSessionToDeleteId(session.id);
                          setDeleteConfirmationOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                        title="Eliminar sesión"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Paginación - Responsiva */}
          {sessions.length > 0 && totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0 sm:space-x-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm w-full sm:w-auto">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  variant="outline"
                  className="px-3 py-1.5 text-xs sm:text-sm disabled:opacity-50 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 w-full sm:w-auto"
                >
                  Anterior
                </Button>
                <span className="px-2 sm:px-4 py-1 text-xs sm:text-sm text-slate-700 font-semibold text-center whitespace-nowrap">
                  <span className="hidden sm:inline">Página {currentPage} de {totalPages} (10 por página)</span>
                  <span className="sm:hidden">{currentPage}/{totalPages}</span>
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  variant="outline"
                  className="px-3 py-1.5 text-xs sm:text-sm disabled:opacity-50 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 w-full sm:w-auto"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {/* Información de resultados - Responsiva */}
          {!loading && (
            <div className="text-center mt-3 text-xs sm:text-sm text-slate-600 px-2">
              <span className="block sm:inline">Mostrando {sessions.length} sesión{sessions.length !== 1 ? 'es' : ''}</span>
              {totalPages > 1 && (
                <span className="block sm:inline mt-1 sm:mt-0 sm:ml-1">
                  <span className="hidden sm:inline">(página {currentPage} de {totalPages}, 10 por página)</span>
                  <span className="sm:hidden"> - Pág. {currentPage}/{totalPages}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Registro de Sesión */}
      <SessionRegistration
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={() => {
          loadSessions(currentPage, searchTerm, filters);
          setShowRegistrationModal(false);
        }}
      />

      {/* Modal de Detalles de Sesión - Compacto y Responsivo */}
      {detailsModalOpen && selectedSession && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-3" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setDetailsModalOpen(false);
            setSelectedSession(null);
          }
        }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-full sm:max-w-lg lg:max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-300 mx-2">
            {/* Header compacto - Azul marino oscuro */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-0">
              <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 pb-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
                  </div>
                  <div className="text-xs sm:text-sm md:text-base font-semibold text-white/80 leading-tight">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                      <span>Detalles de la Sesión</span>
                      <div className="flex items-center gap-2">
                        <span className="font-normal text-[10px] sm:text-xs text-white/70">{selectedSession.patient?.name || 'N/A'}</span>
                        {getStatusBadge(selectedSession.estado)}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setSelectedSession(null);
                  }}
                  className="text-white hover:bg-white/20 transition-all duration-300 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 px-3 sm:px-4 md:px-6 pb-2 sm:pb-3 justify-start">
                <span className="text-[#f5d7d7] text-[10px] sm:text-xs font-semibold">FECHA: <span className="font-bold text-white text-[10px] sm:text-xs">{formatDate(selectedSession.fecha_sesion)}</span></span>
                <span className="text-[#f5d7d7] text-[10px] sm:text-xs font-semibold">DURACIÓN: <span className="font-bold text-white text-[10px] sm:text-xs">{selectedSession.duracion_minutos} min</span></span>
                <span className="text-[#f5d7d7] text-[10px] sm:text-xs font-semibold">TIPO: <span className="font-bold text-white text-[10px] sm:text-xs">{selectedSession.tipo_sesion || 'N/A'}</span></span>
              </div>
            </div>

            {/* Body compacto */}
            <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 bg-white overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {/* Información del Paciente */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-lg px-2 sm:px-3 py-1.5">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    <span className="text-white font-bold uppercase text-[10px] sm:text-xs">Paciente</span>
                  </div>
                  <div className="p-2 sm:p-3 space-y-1.5">
                    <div>
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-600">Nombre:</span>
                      <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedSession.patient?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-600">DNI:</span>
                      <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedSession.patient?.dni || 'N/A'}</p>
                    </div>
                    {selectedSession.patient?.email && (
                      <div>
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-600">Correo:</span>
                        <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{selectedSession.patient.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información de la Sesión */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-lg px-2 sm:px-3 py-1.5">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    <span className="text-white font-bold uppercase text-[10px] sm:text-xs">Sesión</span>
                  </div>
                  <div className="p-2 sm:p-3 space-y-1.5">
                    <div>
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-600">Fecha y Hora:</span>
                      <p className="text-xs sm:text-sm font-medium text-slate-900">{formatDate(selectedSession.fecha_sesion)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-600">Duración:</span>
                      <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedSession.duracion_minutos} min</p>
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-600">Tipo:</span>
                      <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedSession.tipo_sesion || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-600">Estado:</span>
                      <div className="mt-0.5">{getStatusBadge(selectedSession.estado)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas o Observaciones si existen */}
              {(selectedSession as any).notas && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-lg px-2 sm:px-3 py-1.5">
                    <span className="text-white font-bold uppercase text-[10px] sm:text-xs">Notas</span>
                  </div>
                  <div className="p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap">{(selectedSession as any).notas}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Sesión - Compacto y Responsivo */}
      {editModalOpen && selectedSession && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-3" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setEditModalOpen(false);
            setSelectedSession(null);
            setEditFormData({});
          }
        }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-full sm:max-w-lg lg:max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-300 mx-2">
            {/* Header compacto - Azul marino oscuro */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-0">
              <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 pb-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
                  </div>
                  <div className="text-xs sm:text-sm md:text-base font-semibold text-white/80 leading-tight">
                    <span>Editar Sesión</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedSession(null);
                    setEditFormData({});
                  }}
                  className="text-white hover:bg-white/20 transition-all duration-300 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Body compacto */}
            <div className="p-2 sm:p-3 md:p-4 bg-white overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="space-y-2 sm:space-y-3">
                {/* Información del Paciente (solo lectura) */}
                <div className="bg-slate-50 rounded-lg p-2 sm:p-3 border border-slate-200">
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-600 mb-1">Paciente:</p>
                  <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedSession.patient?.name || 'N/A'}</p>
                  <p className="text-[10px] sm:text-xs text-slate-600">DNI: {selectedSession.patient?.dni || 'N/A'}</p>
                </div>

                {/* Fecha y Hora */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                      Fecha <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="fecha_sesion"
                      value={editFormData.fecha_sesion || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                      Hora <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="hora_sesion"
                      value={editFormData.hora_sesion || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Estado y Duración */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                      Estado <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="estado"
                      value={editFormData.estado || 'Programada'}
                      onChange={handleEditInputChange}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300"
                      required
                    >
                      <option value="Programada">Programada</option>
                      <option value="Realizada">Realizada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                      Duración (minutos)
                    </label>
                    <input
                      type="number"
                      name="duracion_minutos"
                      value={editFormData.duracion_minutos || ''}
                      onChange={handleEditInputChange}
                      min="15"
                      max="300"
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tipo de Sesión */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Tipo de Sesión
                  </label>
                  <input
                    type="text"
                    name="tipo_sesion"
                    value={editFormData.tipo_sesion || ''}
                    onChange={handleEditInputChange}
                    placeholder="Ej: Terapia individual, Terapia grupal..."
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none"
                  />
                </div>

                {/* Temas Tratados */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Temas Tratados
                  </label>
                  <textarea
                    name="temas_tratados"
                    value={editFormData.temas_tratados || ''}
                    onChange={handleEditInputChange}
                    rows={3}
                    placeholder="Describe los temas tratados en la sesión..."
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none resize-none"
                  />
                </div>

                {/* Objetivos */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Objetivos
                  </label>
                  <textarea
                    name="objetivos"
                    value={editFormData.objetivos || ''}
                    onChange={handleEditInputChange}
                    rows={2}
                    placeholder="Objetivos de la sesión..."
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none resize-none"
                  />
                </div>

                {/* Conclusiones */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Conclusiones
                  </label>
                  <textarea
                    name="conclusiones"
                    value={editFormData.conclusiones || ''}
                    onChange={handleEditInputChange}
                    rows={2}
                    placeholder="Conclusiones de la sesión..."
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none resize-none"
                  />
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    name="notas"
                    value={editFormData.notas || ''}
                    onChange={handleEditInputChange}
                    rows={3}
                    placeholder="Notas adicionales..."
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none resize-none"
                  />
                </div>

                {/* Mensaje de error */}
                {editError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                    <p className="text-xs sm:text-sm">{editError}</p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-semibold w-full sm:w-auto"
                    onClick={() => {
                      setEditModalOpen(false);
                      setSelectedSession(null);
                      setEditFormData({});
                      setEditError('');
                    }}
                    disabled={editLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg w-full sm:w-auto flex items-center justify-center gap-2"
                    onClick={handleUpdateSession}
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <>
                        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación - Compacto y Responsivo */}
      {deleteConfirmationOpen && sessionToDeleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-3" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setDeleteConfirmationOpen(false);
            setSessionToDeleteId(null);
          }
        }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-full sm:max-w-md w-full overflow-hidden border border-red-200 mx-2">
            {/* Header rojo */}
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-3 sm:p-4 md:p-5">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-black text-center text-white mb-1">
                ¿Eliminar esta sesión?
              </h3>
              <p className="text-[10px] sm:text-xs text-red-100 text-center">
                Esta acción eliminará permanentemente la sesión
              </p>
            </div>
            
            {/* Body */}
            <div className="p-3 sm:p-4 md:p-5 bg-white">
              <p className="text-xs sm:text-sm text-gray-700 text-center mb-3 sm:mb-4 leading-relaxed">
                La sesión será eliminada permanentemente del sistema. Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-semibold w-full sm:w-auto"
                  onClick={() => {
                    setDeleteConfirmationOpen(false);
                    setSessionToDeleteId(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg w-full sm:w-auto"
                  onClick={() => {
                    if (sessionToDeleteId) {
                      handleDeleteSession(sessionToDeleteId);
                    }
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}