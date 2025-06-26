import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { psychologistService } from '../../services/psychologist';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Edit, 
  Trash2, 
  RotateCcw,
  Star,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
  RefreshCw
} from 'lucide-react';

interface Psychologist {
  id: number;
  name: string;
  email: string;
  specialization: string;
  rating: number;
  total_appointments: number;
  verified: boolean;
  active: boolean;
  apellido_paterno?: string;
  apellido_materno?: string;
  celular?: string;
  fecha_nacimiento?: string;
  created_at: string;
}

interface PsychologistHistory {
  id: number;
  psychologist_id: number;
  action: string;
  reason: string;
  performed_by: number;
  created_at: string;
  psychologist: Psychologist;
}

export function PsychologistManagement() {
  const { user } = useAuth();
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [history, setHistory] = useState<PsychologistHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Psychologist | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState<Psychologist | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<Psychologist | null>(null);
  
  // Formularios
  const [createForm, setCreateForm] = useState({
    name: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    password: '',
    specialization: '',
    celular: '',
    fecha_nacimiento: '',
    verified: false
  });
  
  const [editForm, setEditForm] = useState({
    name: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    specialization: '',
    celular: '',
    fecha_nacimiento: '',
    verified: false
  });
  
  const [deactivateReason, setDeactivateReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [psychologistsRes, historyRes] = await Promise.all([
        psychologistService.getPsychologists(),
        psychologistService.getPsychologistHistory()
      ]);
      
      setPsychologists(psychologistsRes.data || []);
      setHistory(historyRes.data || []);
    } catch (e) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePsychologist = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('create');
    setError(null);
    setSuccess(null);
    
    try {
      await psychologistService.createPsychologist(createForm);
      setSuccess('Psicólogo creado exitosamente');
      setShowCreateModal(false);
      setCreateForm({
        name: '', apellido_paterno: '', apellido_materno: '', email: '', 
        password: '', specialization: '', celular: '', fecha_nacimiento: '', verified: false
      });
      await loadData();
    } catch (e: any) {
      setError(e.message || 'Error al crear psicólogo');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditPsychologist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    
    setActionLoading('edit-' + showEditModal.id);
    setError(null);
    setSuccess(null);
    
    try {
      await psychologistService.updatePsychologist(showEditModal.id.toString(), editForm);
      setSuccess('Psicólogo actualizado exitosamente');
      setShowEditModal(null);
      await loadData();
    } catch (e: any) {
      setError(e.message || 'Error al actualizar psicólogo');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivatePsychologist = async () => {
    if (!showDeactivateModal) return;
    
    setActionLoading('deactivate-' + showDeactivateModal.id);
    setError(null);
    setSuccess(null);
    
    try {
      await psychologistService.deactivatePsychologist(showDeactivateModal.id.toString(), {
        deactivation_reason: deactivateReason
      });
      setSuccess('Psicólogo desactivado exitosamente');
      setShowDeactivateModal(null);
      setDeactivateReason('');
      await loadData();
    } catch (e: any) {
      setError(e.message || 'Error al desactivar psicólogo');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivatePsychologist = async (historyId: string) => {
    setActionLoading('reactivate-' + historyId);
    setError(null);
    setSuccess(null);
    
    try {
      await psychologistService.reactivatePsychologist(historyId);
      setSuccess('Psicólogo reactivado exitosamente');
      await loadData();
    } catch (e: any) {
      setError(e.message || 'Error al reactivar psicólogo');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (psychologist: Psychologist) => {
    setEditForm({
      name: psychologist.name,
      apellido_paterno: psychologist.apellido_paterno || '',
      apellido_materno: psychologist.apellido_materno || '',
      email: psychologist.email,
      specialization: psychologist.specialization,
      celular: psychologist.celular || '',
      fecha_nacimiento: psychologist.fecha_nacimiento || '',
      verified: psychologist.verified
    });
    setShowEditModal(psychologist);
  };

  const openDeactivateModal = (psychologist: Psychologist) => {
    setShowDeactivateModal(psychologist);
    setDeactivateReason('');
  };

  const filteredPsychologists = psychologists.filter(psychologist => {
    const matchesSearch = psychologist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         psychologist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         psychologist.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && psychologist.active) ||
                         (statusFilter === 'inactive' && !psychologist.active);
    
    const matchesVerified = verifiedFilter === 'all' ||
                           (verifiedFilter === 'verified' && psychologist.verified) ||
                           (verifiedFilter === 'unverified' && !psychologist.verified);
    
    return matchesSearch && matchesStatus && matchesVerified;
  });

  if (user?.role !== 'super_admin') {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md mx-auto">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Acceso Restringido</h2>
          <p className="text-red-600">Solo el superadministrador puede gestionar psicólogos.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#8e161a] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Cargando psicólogos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión de Psicólogos</h1>
            <p className="text-white/90">Administra los psicólogos del sistema</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-[#8e161a] hover:bg-gray-100 font-semibold"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Nuevo Psicólogo
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center">
          <AlertCircle className="w-6 h-6 mr-3" />
          <p className="font-semibold">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-2 border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center">
          <CheckCircle className="w-6 h-6 mr-3" />
          <p className="font-semibold">{success}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-blue-900">{psychologists.length}</p>
              <p className="text-sm text-blue-700 font-semibold">Total Psicólogos</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-green-900">
                {psychologists.filter(p => p.active).length}
              </p>
              <p className="text-sm text-green-700 font-semibold">Activos</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-500 rounded-xl">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-yellow-900">
                {psychologists.filter(p => p.verified).length}
              </p>
              <p className="text-sm text-yellow-700 font-semibold">Verificados</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-purple-900">{history.length}</p>
              <p className="text-sm text-purple-700 font-semibold">En Historial</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Solo activos</option>
              <option value="inactive">Solo inactivos</option>
            </select>
            
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
            >
              <option value="all">Todos los verificados</option>
              <option value="verified">Solo verificados</option>
              <option value="unverified">Solo no verificados</option>
            </select>
            
            <Button
              onClick={loadData}
              variant="outline"
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-[#8e161a] text-[#8e161a]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Psicólogos Activos ({filteredPsychologists.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-[#8e161a] text-[#8e161a]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Historial ({history.length})
          </button>
        </nav>
      </div>

      {/* Contenido de las tabs */}
      {activeTab === 'active' ? (
        <div className="space-y-4">
          {filteredPsychologists.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay psicólogos</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || verifiedFilter !== 'all' 
                  ? 'No se encontraron psicólogos con los filtros aplicados'
                  : 'Crea el primer psicólogo del sistema'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && verifiedFilter === 'all' && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Crear Psicólogo
                </Button>
              )}
            </Card>
          ) : (
            filteredPsychologists.map((psychologist) => (
              <Card key={psychologist.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {psychologist.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {psychologist.name}
                        {psychologist.apellido_paterno && ` ${psychologist.apellido_paterno}`}
                        {psychologist.apellido_materno && ` ${psychologist.apellido_materno}`}
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {psychologist.email}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        {psychologist.specialization}
                      </p>
                      {psychologist.celular && (
                        <p className="text-gray-600 flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {psychologist.celular}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={psychologist.active ? "success" : "danger"}>
                          {psychologist.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge variant={psychologist.verified ? "success" : "warning"}>
                          {psychologist.verified ? 'Verificado' : 'Pendiente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Rating: {psychologist.rating.toFixed(1)} ⭐
                      </p>
                      <p className="text-sm text-gray-600">
                        Citas: {psychologist.total_appointments}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(psychologist)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowHistoryModal(psychologist)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => openDeactivateModal(psychologist)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {history.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay historial</h3>
              <p className="text-gray-600">No se han desactivado psicólogos aún.</p>
            </Card>
          ) : (
            history.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-bold text-lg">
                        {item.psychologist.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.psychologist.name}
                      </h3>
                      <p className="text-gray-600">{item.psychologist.email}</p>
                      <p className="text-sm text-gray-500">
                        {item.action === 'deactivated' ? 'Desactivado' : 'Reactivado'} el{' '}
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                      {item.reason && (
                        <p className="text-sm text-gray-500">Razón: {item.reason}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={item.action === 'deactivated' ? "danger" : "success"}>
                      {item.action === 'deactivated' ? 'Desactivado' : 'Reactivado'}
                    </Badge>
                    
                    {item.action === 'deactivated' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReactivatePsychologist(item.id.toString())}
                        disabled={actionLoading === 'reactivate-' + item.id}
                      >
                        {actionLoading === 'reactivate-' + item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal Crear Psicólogo */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Psicólogo</h2>
            
            <form onSubmit={handleCreatePsychologist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <Input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno *</label>
                  <Input
                    type="text"
                    value={createForm.apellido_paterno}
                    onChange={(e) => setCreateForm(f => ({ ...f, apellido_paterno: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno *</label>
                  <Input
                    type="text"
                    value={createForm.apellido_materno}
                    onChange={(e) => setCreateForm(f => ({ ...f, apellido_materno: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad *</label>
                <Input
                  type="text"
                  value={createForm.specialization}
                  onChange={(e) => setCreateForm(f => ({ ...f, specialization: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular *</label>
                <Input
                  type="text"
                  value={createForm.celular}
                  onChange={(e) => setCreateForm(f => ({ ...f, celular: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
                <Input
                  type="date"
                  value={createForm.fecha_nacimiento}
                  onChange={(e) => setCreateForm(f => ({ ...f, fecha_nacimiento: e.target.value }))}
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verified"
                  checked={createForm.verified}
                  onChange={(e) => setCreateForm(f => ({ ...f, verified: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="verified" className="text-sm font-medium text-gray-700">
                  Verificado
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={actionLoading === 'create'}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading === 'create'}
                >
                  {actionLoading === 'create' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Psicólogo'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Psicólogo */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Psicólogo</h2>
            
            <form onSubmit={handleEditPsychologist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <Input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno</label>
                  <Input
                    type="text"
                    value={editForm.apellido_paterno}
                    onChange={(e) => setEditForm(f => ({ ...f, apellido_paterno: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                  <Input
                    type="text"
                    value={editForm.apellido_materno}
                    onChange={(e) => setEditForm(f => ({ ...f, apellido_materno: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad *</label>
                <Input
                  type="text"
                  value={editForm.specialization}
                  onChange={(e) => setEditForm(f => ({ ...f, specialization: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                <Input
                  type="text"
                  value={editForm.celular}
                  onChange={(e) => setEditForm(f => ({ ...f, celular: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <Input
                  type="date"
                  value={editForm.fecha_nacimiento}
                  onChange={(e) => setEditForm(f => ({ ...f, fecha_nacimiento: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-verified"
                  checked={editForm.verified}
                  onChange={(e) => setEditForm(f => ({ ...f, verified: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="edit-verified" className="text-sm font-medium text-gray-700">
                  Verificado
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(null)}
                  disabled={actionLoading === 'edit-' + showEditModal.id}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading === 'edit-' + showEditModal.id}
                >
                  {actionLoading === 'edit-' + showEditModal.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar Psicólogo'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Desactivar Psicólogo */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Desactivar Psicólogo</h2>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que quieres desactivar a <strong>{showDeactivateModal.name}</strong>?
              </p>
              <p className="text-sm text-gray-500">
                El psicólogo será movido al historial y no podrá acceder al sistema.
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razón de desactivación (opcional)
              </label>
              <textarea
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
                rows={3}
                placeholder="Especifica la razón de la desactivación..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeactivateModal(null)}
                disabled={actionLoading === 'deactivate-' + showDeactivateModal.id}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDeactivatePsychologist}
                disabled={actionLoading === 'deactivate-' + showDeactivateModal.id}
              >
                {actionLoading === 'deactivate-' + showDeactivateModal.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Desactivando...
                  </>
                ) : (
                  'Desactivar Psicólogo'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Historial */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Historial de {showHistoryModal.name}
            </h2>
            
            <div className="space-y-4">
              {history
                .filter(item => item.psychologist_id === showHistoryModal.id)
                .map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.action === 'deactivated' ? 'Desactivado' : 'Reactivado'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                        {item.reason && (
                          <p className="text-sm text-gray-500 mt-1">
                            Razón: {item.reason}
                          </p>
                        )}
                      </div>
                      <Badge variant={item.action === 'deactivated' ? "danger" : "success"}>
                        {item.action === 'deactivated' ? 'Desactivado' : 'Reactivado'}
                      </Badge>
                    </div>
                  </Card>
                ))}
              
              {history.filter(item => item.psychologist_id === showHistoryModal.id).length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No hay historial para este psicólogo.
                </p>
              )}
            </div>
            
            <div className="flex justify-end pt-6">
              <Button
                variant="outline"
                onClick={() => setShowHistoryModal(null)}
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