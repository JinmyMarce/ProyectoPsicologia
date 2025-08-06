import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, RefreshCw, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { psychologicalSessionsService, PsychologicalSession } from '../../services/psychologicalSessions';
import { SessionRegistration } from './SessionRegistration';

export function SessionList() {
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
    <div className="min-h-screen bg-white p-1">
      <div className="max-w-full mx-auto">
        <div className="px-0 pb-2">
          {/* Título */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-[#8e161a] flex-1">Sesiones Psicológicas</h1>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white rounded-xl p-2 mb-3 border border-[#8e161a] shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-[#8e161a]" />
              <h3 className="text-base font-bold text-[#8e161a]">Buscar Sesiones</h3>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-base bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-base"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-base bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-base bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-base bg-white"
                />
              </div>

              {/* Botón de búsqueda */}
              <div className="flex items-end gap-2">
                <Button
                  onClick={handleSearch}
                  className="bg-[#8e161a] text-white font-bold shadow-md hover:bg-[#6d1115] transition-all duration-300 px-4 py-2 text-sm rounded-lg"
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
              className="border-2 border-[#8e161a] text-[#8e161a] font-semibold bg-white hover:bg-[#8e161a] hover:text-white transition-all duration-300 px-4 py-2 text-sm rounded-lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button
              onClick={() => setShowRegistrationModal(true)}
              className="bg-[#8e161a] text-white font-semibold shadow-md hover:bg-[#6d1115] transition-all duration-300 px-4 py-2 text-sm rounded-lg"
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

      {/* Modal de Registro de Sesión */}
      <SessionRegistration
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={() => {
          loadSessions(currentPage, searchTerm, filters);
          setShowRegistrationModal(false);
        }}
      />
    </div>
  );
} 