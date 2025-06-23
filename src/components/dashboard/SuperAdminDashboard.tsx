import React, { useState, useEffect } from 'react';
import { Psychologist, PsychologistHistory } from '../../types';
import { psychologistService } from '../../services/psychologist';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { 
  Users, 
  UserPlus, 
  History, 
  Edit, 
  Trash2, 
  RotateCcw,
  Star,
  Calendar,
  Mail,
  Phone,
  X
} from 'lucide-react';

export function SuperAdminDashboard() {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [history, setHistory] = useState<PsychologistHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState<string | null>(null);
  const [showDeactivateForm, setShowDeactivateForm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [psychologistsRes, historyRes] = await Promise.all([
        psychologistService.getPsychologists(),
        psychologistService.getPsychologistHistory()
      ]);

      if (psychologistsRes.success) {
        setPsychologists(psychologistsRes.data);
      }

      if (historyRes.success) {
        setHistory(historyRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePsychologist = async (data: {
    name: string;
    email: string;
    password: string;
    specialization: string;
    verified: boolean;
  }) => {
    try {
      setError(null);
      const response = await psychologistService.createPsychologist(data);
      if (response.success) {
        setShowCreateForm(false);
        setSuccess('Psicólogo creado exitosamente');
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error: any) {
      console.error('Error creating psychologist:', error);
      setError(error.message || 'Error al crear el psicólogo');
    }
  };

  const handleUpdatePsychologist = async (id: string, data: {
    name?: string;
    email?: string;
    specialization?: string;
    verified?: boolean;
    password?: string;
  }) => {
    try {
      setError(null);
      const response = await psychologistService.updatePsychologist(id, data);
      if (response.success) {
        setShowEditForm(null);
        setSuccess('Psicólogo actualizado exitosamente');
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error: any) {
      console.error('Error updating psychologist:', error);
      setError(error.message || 'Error al actualizar el psicólogo');
    }
  };

  const handleDeactivatePsychologist = async (id: string, reason: string) => {
    try {
      setError(null);
      const response = await psychologistService.deactivatePsychologist(id, { deactivation_reason: reason });
      if (response.success) {
        setShowDeactivateForm(null);
        setSuccess('Psicólogo desactivado exitosamente');
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error: any) {
      console.error('Error deactivating psychologist:', error);
      setError(error.message || 'Error al desactivar el psicólogo');
    }
  };

  const handleReactivatePsychologist = async (historyId: string) => {
    try {
      setError(null);
      const response = await psychologistService.reactivatePsychologist(historyId);
      if (response.success) {
        setSuccess('Psicólogo reactivado exitosamente');
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error: any) {
      console.error('Error reactivating psychologist:', error);
      setError(error.message || 'Error al reactivar el psicólogo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">SA</span>
          </div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Administrador</h1>
          <p className="text-gray-600">Gestión completa de psicólogos del sistema</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Psicólogo
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Psicólogos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{psychologists.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {psychologists.length > 0 
                  ? (psychologists.reduce((acc, p) => acc + p.rating, 0) / psychologists.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <History className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Historial</p>
              <p className="text-2xl font-bold text-gray-900">{history.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Psicólogos Activos ({psychologists.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Historial ({history.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {psychologists.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay psicólogos activos</h3>
              <p className="text-gray-600">Crea el primer psicólogo del sistema</p>
            </Card>
          ) : (
            psychologists.map((psychologist) => (
              <Card key={psychologist.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {psychologist.avatar ? (
                        <img src={psychologist.avatar} alt={psychologist.name} className="w-12 h-12 rounded-full" />
                      ) : (
                        <span className="text-gray-600 font-semibold">
                          {psychologist.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{psychologist.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {psychologist.email}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {psychologist.rating.toFixed(1)}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {psychologist.totalAppointments} citas
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Especialización: {psychologist.specialization}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={psychologist.verified ? 'success' : 'warning'}>
                      {psychologist.verified ? 'Verificado' : 'Pendiente'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditForm(psychologist.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeactivateForm(psychologist.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <Card className="p-8 text-center">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay historial</h3>
              <p className="text-gray-600">No se han desactivado psicólogos aún</p>
            </Card>
          ) : (
            history.map((record) => (
              <Card key={record.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {record.avatar ? (
                        <img src={record.avatar} alt={record.name} className="w-12 h-12 rounded-full" />
                      ) : (
                        <span className="text-gray-600 font-semibold">
                          {record.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{record.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {record.email}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {record.rating.toFixed(1)}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {record.totalAppointments} citas
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Desactivado el {new Date(record.deactivatedAt).toLocaleDateString()}
                        {record.deactivatedBy && ` por ${record.deactivatedBy}`}
                      </p>
                      {record.deactivationReason && (
                        <p className="text-sm text-red-600 mt-1">
                          Razón: {record.deactivationReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReactivatePsychologist(record.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reactivar
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateForm && (
        <CreatePsychologistModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreatePsychologist}
        />
      )}

      {showEditForm && (
        <EditPsychologistModal
          psychologist={psychologists.find(p => p.id === showEditForm)!}
          onClose={() => setShowEditForm(null)}
          onSubmit={(data) => handleUpdatePsychologist(showEditForm, data)}
        />
      )}

      {showDeactivateForm && (
        <DeactivatePsychologistModal
          psychologist={psychologists.find(p => p.id === showDeactivateForm)!}
          onClose={() => setShowDeactivateForm(null)}
          onSubmit={(reason) => handleDeactivatePsychologist(showDeactivateForm, reason)}
        />
      )}
    </div>
  );
}

// Componentes de modales funcionales
function CreatePsychologistModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    password: string;
    specialization: string;
    verified: boolean;
  }) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    verified: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Crear Nuevo Psicólogo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder="Dr. Juan Pérez"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              placeholder="juan.perez@gmail.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={6}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialización
            </label>
            <Input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              required
              placeholder="Psicología Clínica"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="verified"
              checked={formData.verified}
              onChange={(e) => setFormData({...formData, verified: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="verified" className="ml-2 text-sm text-gray-700">
              Verificado
            </label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Psicólogo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPsychologistModal({ psychologist, onClose, onSubmit }: {
  psychologist: Psychologist;
  onClose: () => void;
  onSubmit: (data: {
    name?: string;
    email?: string;
    specialization?: string;
    verified?: boolean;
    password?: string;
  }) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    name: psychologist.name,
    email: psychologist.email,
    specialization: psychologist.specialization,
    verified: psychologist.verified,
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const updateData: {
      name?: string;
      email?: string;
      specialization?: string;
      verified?: boolean;
      password?: string;
    } = { ...formData };
    if (!updateData.password) {
      updateData.password = undefined;
    }
    await onSubmit(updateData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Editar Psicólogo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña (opcional)
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Dejar vacío para mantener la actual"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialización
            </label>
            <Input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="verified"
              checked={formData.verified}
              onChange={(e) => setFormData({...formData, verified: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="verified" className="ml-2 text-sm text-gray-700">
              Verificado
            </label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeactivatePsychologistModal({ psychologist, onClose, onSubmit }: {
  psychologist: Psychologist;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(reason || 'Desactivado por super administrador');
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Desactivar Psicólogo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            ¿Estás seguro de que quieres desactivar a <strong>{psychologist?.name}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            El psicólogo será movido al historial y no podrá acceder al sistema.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón de desactivación (opcional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Especifica la razón de la desactivación..."
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="danger" 
              disabled={loading}
            >
              {loading ? 'Desactivando...' : 'Desactivar Psicólogo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 