import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, RefreshCw, Plus, Sparkles, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { psychologicalSessionsService, PsychologicalSession } from '../../services/psychologicalSessions';
import { SessionRegistration } from './SessionRegistration';
import { useNavigate } from 'react-router-dom';

export function SessionList() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<PsychologicalSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('paciente');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    estado: '',
    date_from: '',
    date_to: ''
  });
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

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
    loadSessions(1, '', {});
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'dni':
        return '12345678';
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
    if (window.confirm('¿Está seguro de que desea eliminar esta sesión?')) {
      try {
        await psychologicalSessionsService.deleteSession(sessionId);
        loadSessions(currentPage, searchTerm, filters);
      } catch (err: any) {
        setError('Error al eliminar la sesión');
      }
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Programada':
        return <Badge className="bg-blue-100 text-blue-800 font-semibold">Programada</Badge>;
      case 'Realizada':
        return <Badge className="bg-green-100 text-green-800 font-semibold">Realizada</Badge>;
      case 'Cancelada':
        return <Badge variant="danger" className="font-semibold">Cancelada</Badge>;
      default:
        return <Badge>{estado}</Badge>;
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
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section - Celeste Suave (igual al dashboard del psicólogo) */}
        <div className="bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-50 rounded-2xl shadow-2xl relative overflow-hidden mx-2 sm:mx-3 mt-3 border border-cyan-200/40">
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

          <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-white/70 text-cyan-700 text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-cyan-300/50 hover:bg-white/80 transition-all duration-300 backdrop-blur-xl">
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    SAPTA - Psicología
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-cyan-900 mb-1.5 leading-tight">
                  Sesiones Psicológicas
                </h1>
                <p className="text-cyan-800 text-sm max-w-2xl font-medium leading-relaxed">
                  Gestiona y visualiza todas tus sesiones.
                  <span className="hidden sm:inline text-cyan-700"> Registra y administra sesiones psicológicas.</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-white/80 backdrop-blur-xl rounded-xl px-4 py-2 border border-cyan-200/50 text-cyan-800 hover:bg-white/90 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 font-semibold text-sm"
                >
                  <User className="w-4 h-4" />
                  Mi Perfil
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
        <div className="w-full px-3 sm:px-4 lg:px-6 -mt-4 relative z-20">

          {/* Filtros y búsqueda */}
          <div className="bg-white rounded-xl p-2 mb-3 border border-cyan-200 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-cyan-600" />
              <h3 className="text-base font-bold text-cyan-700">Buscar Sesiones</h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2">
              {/* Combo de tipo de búsqueda */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Buscar por
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-base bg-white"
                >
                  <option value="paciente">Paciente</option>
                  <option value="dni">DNI</option>
                </select>
              </div>

              {/* Campo de búsqueda */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {searchType === 'dni' ? 'DNI' : 'Paciente'}
                </label>
                <Input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => {
                    if (searchType === 'dni') {
                      // Solo permitir números y máximo 8 dígitos
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setSearchTerm(value);
                    } else {
                      setSearchTerm(e.target.value);
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-base"
                />
              </div>

              {/* Filtro de estado */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-base bg-white"
                >
                  <option value="">Todos los estados</option>
                  <option value="Programada">Programada</option>
                  <option value="Realizada">Realizada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              {/* Filtros de fecha */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-base bg-white"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-base bg-white"
                />
              </div>

              {/* Botón de búsqueda */}
              <div className="flex items-end gap-2">
                <Button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-cyan-300 to-sky-300 hover:from-cyan-400 hover:to-sky-400 text-cyan-900 font-bold shadow-md transition-all duration-300 px-4 py-2 text-sm rounded-lg"
                >
                  <Search className="w-4 h-4 mr-1" />
                  Buscar
                </Button>
                {(searchTerm || filters.estado || filters.date_from || filters.date_to) && (
                  <Button
                    onClick={handleClearSearch}
                    variant="outline"
                    className="border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 px-3 py-2 text-sm rounded-lg"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mb-2">
            <Button
              onClick={() => loadSessions(currentPage, searchTerm, filters)}
              variant="outline"
              className="border-2 border-cyan-300 text-cyan-700 font-semibold bg-white hover:bg-cyan-50 hover:border-cyan-400 transition-all duration-300 px-4 py-2 text-sm rounded-lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button
              onClick={() => setShowRegistrationModal(true)}
              className="bg-gradient-to-r from-cyan-300 to-sky-300 hover:from-cyan-400 hover:to-sky-400 text-cyan-900 font-semibold shadow-md transition-all duration-300 px-4 py-2 text-sm rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Sesión
            </Button>
          </div>

          {/* Mensajes de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p>{error}</p>
            </div>
          )}

          {/* Tabla de sesiones */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        <span className="text-gray-500">Cargando sesiones...</span>
                      </div>
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No se encontraron sesiones
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-center">
                        <div>
                          <p className="font-medium text-gray-900">{session.patient?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{session.patient?.dni || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-900">{formatDate(session.fecha_sesion)}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">
                        {session.tipo_sesion}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">
                        {session.duracion_minutos} min
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(session.estado)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteSession && handleDeleteSession(session.id)}
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="px-3 py-1 text-sm disabled:opacity-50"
                >
                  Anterior
                </Button>
                <span className="px-4 py-1 text-sm text-gray-700 font-semibold">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="px-3 py-1 text-sm disabled:opacity-50"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {/* Información de resultados */}
          {!loading && (
            <div className="text-center mt-3 text-sm text-gray-600">
              Mostrando {sessions.length} sesión{sessions.length !== 1 ? 'es' : ''} 
              {totalPages > 1 && ` de ${totalPages} página${totalPages !== 1 ? 's' : ''}`}
            </div>
          )}
        </div>
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
    </>
  );
}