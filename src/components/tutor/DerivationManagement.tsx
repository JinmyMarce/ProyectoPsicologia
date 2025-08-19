import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Send, 
  Search, 
  Filter, 
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
  Eye,
  Edit,
  Plus,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { Derivation, Student, Psychologist } from '../../types';

interface DerivationWithDetails extends Derivation {
  student_name?: string;
  student_email?: string;
  psychologist_name?: string;
  assigned_date?: string;
  completion_date?: string;
}

export function DerivationManagement() {
  const { user } = useAuth();
  const [derivations, setDerivations] = useState<DerivationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [selectedDerivation, setSelectedDerivation] = useState<DerivationWithDetails | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (user?.role === 'tutor') {
      loadDerivations();
    }
  }, [user]);

  const loadDerivations = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada a la API
      // const response = await fetch(`/api/tutors/${user?.id}/derivations`);
      // const data = await response.json();
      
      // Por ahora datos de ejemplo
      const mockDerivations: DerivationWithDetails[] = [
        {
          id: '1',
          student_id: '1',
          tutor_id: user?.id?.toString() || '1',
          psychologist_id: '1',
          reason: 'El estudiante presenta signos de ansiedad durante las evaluaciones. Ha reportado dificultades para concentrarse y ha mostrado comportamiento nervioso.',
          urgency: 'high',
          status: 'assigned',
          notes: 'Estudiante muy responsable, pero últimamente ha mostrado signos de estrés.',
          created_at: '2025-08-15T10:00:00Z',
          updated_at: '2025-08-16T14:30:00Z',
          student_name: 'María González López',
          student_email: 'maria.gonzalez@istta.edu.pe',
          psychologist_name: 'Dr. Ana Ruiz',
          assigned_date: '2025-08-16T14:30:00Z'
        },
        {
          id: '2',
          student_id: '2',
          tutor_id: user?.id?.toString() || '1',
          reason: 'Problemas de integración social con compañeros de clase. El estudiante se muestra retraído durante las actividades grupales.',
          urgency: 'medium',
          status: 'in_progress',
          notes: 'Primera sesión completada. Se requiere seguimiento.',
          created_at: '2025-08-10T09:30:00Z',
          updated_at: '2025-08-18T11:00:00Z',
          student_name: 'Carlos Mendoza Ruiz',
          student_email: 'carlos.mendoza@istta.edu.pe',
          psychologist_name: 'Dr. Luis Vega',
          assigned_date: '2025-08-12T16:00:00Z'
        },
        {
          id: '3',
          student_id: '3',
          tutor_id: user?.id?.toString() || '1',
          reason: 'Dificultades académicas significativas. Bajo rendimiento en múltiples materias y falta de motivación.',
          urgency: 'medium',
          status: 'completed',
          notes: 'Caso resuelto satisfactoriamente. Se estableció plan de estudios personalizado.',
          created_at: '2025-08-05T08:00:00Z',
          updated_at: '2025-08-17T17:00:00Z',
          student_name: 'Ana Flores Sánchez',
          student_email: 'ana.flores@istta.edu.pe',
          psychologist_name: 'Dr. Ana Ruiz',
          assigned_date: '2025-08-06T10:00:00Z',
          completion_date: '2025-08-17T17:00:00Z'
        },
        {
          id: '4',
          student_id: '4',
          tutor_id: user?.id?.toString() || '1',
          reason: 'Estudiante reporta problemas familiares que están afectando su rendimiento académico y asistencia.',
          urgency: 'critical',
          status: 'pending',
          notes: 'Requiere atención urgente. Situación familiar compleja.',
          created_at: '2025-08-19T12:00:00Z',
          updated_at: '2025-08-19T12:00:00Z',
          student_name: 'Pedro Sánchez Torres',
          student_email: 'pedro.sanchez@istta.edu.pe'
        }
      ];
      
      setDerivations(mockDerivations);
    } catch (error) {
      console.error('Error loading derivations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadDerivations();
  };

  const handleViewDetail = (derivation: DerivationWithDetails) => {
    setSelectedDerivation(derivation);
    setShowDetailModal(true);
  };

  const filteredDerivations = derivations.filter(derivation => {
    const matchesSearch = 
      derivation.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      derivation.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      derivation.psychologist_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || derivation.status === filterStatus;
    const matchesUrgency = filterUrgency === 'all' || derivation.urgency === filterUrgency;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pendiente
        </Badge>;
      case 'assigned':
        return <Badge variant="info" className="flex items-center gap-1">
          <ArrowRight className="w-3 h-3" />
          Asignada
        </Badge>;
      case 'in_progress':
        return <Badge variant="primary" className="flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          En Progreso
        </Badge>;
      case 'completed':
        return <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Completada
        </Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelada</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <Badge variant="danger">Crítica</Badge>;
      case 'high':
        return <Badge variant="warning">Alta</Badge>;
      case 'medium':
        return <Badge variant="info">Media</Badge>;
      case 'low':
        return <Badge variant="success">Baja</Badge>;
      default:
        return <Badge variant="default">{urgency}</Badge>;
    }
  };

  const getStats = () => {
    const total = derivations.length;
    const pending = derivations.filter(d => d.status === 'pending').length;
    const inProgress = derivations.filter(d => d.status === 'in_progress').length;
    const completed = derivations.filter(d => d.status === 'completed').length;
    const critical = derivations.filter(d => d.urgency === 'critical').length;
    
    return { total, pending, inProgress, completed, critical };
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
          <h1 className="text-3xl font-bold text-granate-800">Gestión de Derivaciones</h1>
          <p className="text-azul-marino-700 mt-1">
            Monitorea y gestiona las derivaciones realizadas al área de psicología
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          <Button 
            onClick={() => window.location.href = '/students'}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Derivación
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-azul-marino-100 rounded-lg">
              <Send className="w-5 h-5 text-azul-marino-800" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-granate-800">{stats.total}</h3>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-800" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-granate-800">{stats.pending}</h3>
              <p className="text-xs text-gray-600">Pendientes</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-granate-800">{stats.inProgress}</h3>
              <p className="text-xs text-gray-600">En Progreso</p>
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
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-800" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-granate-800">{stats.critical}</h3>
              <p className="text-xs text-gray-600">Críticas</p>
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
                placeholder="Buscar por estudiante, motivo o psicólogo..."
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
              <option value="pending">Pendiente</option>
              <option value="assigned">Asignada</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div className="lg:w-48">
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
            >
              <option value="all">Todas las urgencias</option>
              <option value="critical">Crítica</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de derivaciones */}
      <div className="space-y-4">
        {filteredDerivations.map((derivation) => (
          <Card key={derivation.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {derivation.student_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {derivation.reason}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {getUrgencyBadge(derivation.urgency)}
                    {getStatusBadge(derivation.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Creada: {new Date(derivation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {derivation.psychologist_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Asignada a: {derivation.psychologist_name}
                      </span>
                    </div>
                  )}

                  {derivation.assigned_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Asignada: {new Date(derivation.assigned_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetail(derivation)}
                  className="flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Ver Detalles
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredDerivations.length === 0 && (
        <Card className="p-12 text-center">
          <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No se encontraron derivaciones</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all' || filterUrgency !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No has realizado ninguna derivación aún'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && filterUrgency === 'all' && (
            <Button onClick={() => window.location.href = '/students'}>
              Crear primera derivación
            </Button>
          )}
        </Card>
      )}

      {/* Modal de detalles */}
      {showDetailModal && selectedDerivation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-granate-800">Detalles de la Derivación</h2>
              <p className="text-gray-600 mt-1">
                Información completa de la derivación #{selectedDerivation.id}
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información del estudiante */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Estudiante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Nombre:</span>
                    <p className="font-medium">{selectedDerivation.student_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="font-medium">{selectedDerivation.student_email}</p>
                  </div>
                </div>
              </div>

              {/* Estado y urgencia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Estado actual:</h4>
                  {getStatusBadge(selectedDerivation.status)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Nivel de urgencia:</h4>
                  {getUrgencyBadge(selectedDerivation.urgency)}
                </div>
              </div>

              {/* Motivo */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Motivo de la derivación:</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {selectedDerivation.reason}
                </p>
              </div>

              {/* Notas */}
              {selectedDerivation.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notas adicionales:</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedDerivation.notes}
                  </p>
                </div>
              )}

              {/* Información del psicólogo */}
              {selectedDerivation.psychologist_name && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Psicólogo Asignado
                  </h4>
                  <p className="font-medium">{selectedDerivation.psychologist_name}</p>
                  {selectedDerivation.assigned_date && (
                    <p className="text-sm text-gray-600 mt-1">
                      Asignado el: {new Date(selectedDerivation.assigned_date).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Fechas importantes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Fecha de creación:</h4>
                  <p className="text-gray-700">
                    {new Date(selectedDerivation.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Última actualización:</h4>
                  <p className="text-gray-700">
                    {new Date(selectedDerivation.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedDerivation.completion_date && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Fecha de Completación
                  </h4>
                  <p className="text-green-700">
                    {new Date(selectedDerivation.completion_date).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedDerivation(null);
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
