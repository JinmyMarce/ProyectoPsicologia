import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, MessageSquare, RefreshCw, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { psychologicalSessionsService, PsychologicalSession } from '../../services/psychologicalSessions';

export function SessionList() {
  const [sessions, setSessions] = useState<PsychologicalSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    estado: '',
    date_from: '',
    date_to: ''
  });

  const loadSessions = async (page = 1, search = '', filters = {}) => {
    setLoading(true);
    setError('');

    try {
      const response = await psychologicalSessionsService.getSessions({
        search,
        page,
        per_page: 10,
        ...filters
      });

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

  const applyFilters = () => {
    setCurrentPage(1);
    loadSessions(1, searchTerm, filters);
  };

  const clearFilters = () => {
    setFilters({
      estado: '',
      date_from: '',
      date_to: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
    loadSessions(1, '', {});
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadSessions(page, searchTerm, filters);
  };

  const handleDeleteSession = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar esta sesión?')) {
      return;
    }

    try {
      const response = await psychologicalSessionsService.deleteSession(id);
      if (response.success) {
        loadSessions(currentPage, searchTerm, filters);
      } else {
        setError('Error al eliminar sesión');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar sesión');
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Programada':
        return <Badge className="bg-blue-100 text-blue-800 font-semibold">Programada</Badge>;
      case 'Realizada':
        return <Badge className="bg-green-100 text-green-800 font-semibold">Realizada</Badge>;
      case 'Cancelada':
        return <Badge variant="destructive" className="font-semibold">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
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
    <div className="min-h-screen bg-gradient-to-br from-[#f2f3c6] via-[#d3b7a0] to-[#8e161a] p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-2xl rounded-3xl border-0 bg-white/95 backdrop-blur-md overflow-hidden" padding="lg">
          {/* Header con icono grande */}
          <div className="text-center mb-8 bg-gradient-to-r from-[#8e161a]/10 to-[#d3b7a0]/10 p-8 rounded-t-3xl">
            <div className="flex items-center justify-center mx-auto mb-6">
              <div className="relative">
                <img 
                  src="/images/icons/psicologia.png"
                  alt="Logo Institucional"
                  className="w-24 h-24 object-contain drop-shadow-2xl filter brightness-110"
                />
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-[#8e161a] mb-3 tracking-tight drop-shadow-sm">
              Visualizar Sesiones
            </h1>
            <p className="text-gray-700 font-semibold text-lg">
              Sistema de Gestión de Citas - Psicología
            </p>
            <p className="text-[#8e161a] font-bold text-sm mt-2">
              Instituto Túpac Amaru
            </p>
          </div>

          <div className="px-8 pb-8">
            {/* Filtros y búsqueda */}
            <div className="space-y-6 mb-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Buscar por paciente, temas o notas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-12 focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a] text-lg"
                    />
                    <button
                      onClick={handleSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#d3b7a0] hover:text-[#8e161a] transition-colors"
                    >
                      <Search className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => loadSessions(currentPage, searchTerm, filters)}
                    variant="outline"
                    className="border-2 border-[#d3b7a0] hover:border-[#8e161a] text-[#8e161a] font-semibold bg-white hover:bg-[#f2f3c6] transition-all duration-300 px-6"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Actualizar
                  </Button>

                  <Button
                    className="bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] text-white font-bold shadow-lg hover:from-[#6d1115] hover:to-[#b89a8a] transition-all duration-300 px-6"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Nueva Sesión
                  </Button>
                </div>
              </div>

              {/* Filtros adicionales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Estado</label>
                  <select
                    value={filters.estado}
                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                    className="w-full px-4 py-3 border border-[#d3b7a0] rounded-xl focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-lg"
                  >
                    <option value="">Todos</option>
                    <option value="Programada">Programada</option>
                    <option value="Realizada">Realizada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Desde</label>
                  <Input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    className="focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a] text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Hasta</label>
                  <Input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    className="focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a] text-lg"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={applyFilters}
                    className="bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] text-white font-bold shadow-lg hover:from-[#6d1115] hover:to-[#b89a8a] transition-all duration-300 px-6"
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    Filtrar
                  </Button>

                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-[#d3b7a0] text-[#8e161a] hover:bg-[#f2f3c6] px-6"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl mb-6">
                <p className="text-red-600 font-semibold text-center text-lg">{error}</p>
              </div>
            )}

            {/* Tabla de sesiones */}
            <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] text-white">
                    <th className="px-6 py-4 text-left font-bold text-lg">Paciente</th>
                    <th className="px-6 py-4 text-left font-bold text-lg">Fecha y Hora</th>
                    <th className="px-6 py-4 text-left font-bold text-lg">Tipo</th>
                    <th className="px-6 py-4 text-left font-bold text-lg">Duración</th>
                    <th className="px-6 py-4 text-left font-bold text-lg">Estado</th>
                    <th className="px-6 py-4 text-left font-bold text-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-8 h-8 animate-spin mr-3" />
                          <span className="text-lg font-semibold">Cargando sesiones...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <span className="text-lg font-semibold">No se encontraron sesiones</span>
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session) => (
                      <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-lg">{session.patient?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-600">{session.patient?.dni || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span className="text-lg">{formatDate(session.fecha_sesion)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-lg">{session.tipo_sesion}</td>
                        <td className="px-6 py-4 text-lg font-semibold">{session.duracion_minutos} min</td>
                        <td className="px-6 py-4">
                          {getStatusBadge(session.estado)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                            >
                              <Eye className="w-5 h-5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:bg-green-50 transition-colors duration-200"
                            >
                              <Edit className="w-5 h-5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50 transition-colors duration-200"
                              onClick={() => handleDeleteSession(session.id)}
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
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
              <div className="flex justify-center mt-8">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-[#d3b7a0] text-[#8e161a] hover:bg-[#f2f3c6] px-6 py-3"
                  >
                    Anterior
                  </Button>
                  
                  <span className="px-6 py-3 text-lg text-gray-600 font-semibold">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-[#d3b7a0] text-[#8e161a] hover:bg-[#f2f3c6] px-6 py-3"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 