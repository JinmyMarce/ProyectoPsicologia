import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/users';
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
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Shield,
  UserCheck,
  UserX,
  History
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  verified: boolean;
  created_at: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  celular?: string;
  fecha_nacimiento?: string;
}

interface UserStats {
  total_users: number;
  active_users: number;
  by_role: {
    psychologists: number;
    students: number;
    admins: number;
  };
  by_status: {
    verified: number;
    unverified: number;
  };
}

export function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'psychologist' | 'student' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  
  // Modales
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState<User | null>(null);
  const [showUserHistory, setShowUserHistory] = useState<User | null>(null);
  
  // Formularios
  const [addForm, setAddForm] = useState({
    name: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    password: '',
    role: 'student',
    celular: '',
    fecha_nacimiento: '',
    verified: false
  });
  
  const [editForm, setEditForm] = useState({
    name: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    role: '',
    celular: '',
    fecha_nacimiento: '',
    verified: false
  });
  
  const [deactivateReason, setDeactivateReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'super_admin' || user?.role === 'admin') {
      loadUsers();
      loadStats();
    }
  }, [user, searchTerm, roleFilter, statusFilter, verifiedFilter]);

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers({
        search: searchTerm,
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        verified: verifiedFilter === 'all' ? undefined : verifiedFilter === 'verified'
      });
      setUsers(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await userService.getUserStats();
      setStats(response.data);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('add');
    setError(null);
    setSuccess(null);
    
    try {
      await userService.createUser(addForm);
      setSuccess('Usuario creado exitosamente');
      setShowAddUser(false);
      setAddForm({
        name: '', apellido_paterno: '', apellido_materno: '', email: '', 
        password: '', role: 'student', celular: '', fecha_nacimiento: '', verified: false
      });
      await loadUsers();
      await loadStats();
    } catch (e: any) {
      setError(e.message || 'Error al crear usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditUser) return;
    
    setActionLoading('edit-' + showEditUser.id);
    setError(null);
    setSuccess(null);
    
    try {
      await userService.updateUser(showEditUser.id.toString(), editForm);
      setSuccess('Usuario actualizado exitosamente');
      setShowEditUser(null);
      await loadUsers();
      await loadStats();
    } catch (e: any) {
      setError(e.message || 'Error al actualizar usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivateUser = async (userId: string, reason: string) => {
    setActionLoading('deactivate-' + userId);
    setError(null);
    setSuccess(null);
    
    try {
      await userService.deactivateUser(userId, reason);
      setSuccess('Usuario desactivado exitosamente');
      await loadUsers();
      await loadStats();
    } catch (e: any) {
      setError(e.message || 'Error al desactivar usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateUser = async (userId: string) => {
    setActionLoading('reactivate-' + userId);
    setError(null);
    setSuccess(null);
    
    try {
      await userService.reactivateUser(userId);
      setSuccess('Usuario reactivado exitosamente');
      await loadUsers();
      await loadStats();
    } catch (e: any) {
      setError(e.message || 'Error al reactivar usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setActionLoading('delete-' + userId);
    setError(null);
    setSuccess(null);
    
    try {
      await userService.deleteUser(userId);
      setSuccess('Usuario eliminado exitosamente');
      await loadUsers();
      await loadStats();
    } catch (e: any) {
      setError(e.message || 'Error al eliminar usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendVerification = async (userId: string) => {
    setActionLoading('verify-' + userId);
    setError(null);
    setSuccess(null);
    
    try {
      await userService.sendVerificationEmail(userId);
      setSuccess('Email de verificación enviado exitosamente');
    } catch (e: any) {
      setError(e.message || 'Error al enviar email de verificación');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (user: User) => {
    setEditForm({
      name: user.name,
      apellido_paterno: user.apellido_paterno || '',
      apellido_materno: user.apellido_materno || '',
      email: user.email,
      role: user.role,
      celular: user.celular || '',
      fecha_nacimiento: user.fecha_nacimiento || '',
      verified: user.verified
    });
    setShowEditUser(user);
  };

  const getStatusBadge = (user: User) => {
    if (!user.active) {
      return <Badge variant="danger">Inactivo</Badge>;
    }
    if (!user.verified) {
      return <Badge variant="warning">Pendiente</Badge>;
    }
    return <Badge variant="success">Activo</Badge>;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="danger">Super Admin</Badge>;
      case 'admin':
        return <Badge variant="danger">Administrador</Badge>;
      case 'psychologist':
        return <Badge variant="info">Psicólogo</Badge>;
      case 'student':
        return <Badge>Estudiante</Badge>;
      default:
        return <Badge>Desconocido</Badge>;
    }
  };

  if (user?.role !== 'super_admin' && user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md mx-auto">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Acceso Restringido</h2>
          <p className="text-red-600">Solo administradores pueden gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#8e161a] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Cargando usuarios...</p>
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
            <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
            <p className="text-white/90">Administra usuarios, psicólogos, estudiantes y permisos del sistema</p>
          </div>
          <Button 
            onClick={() => setShowAddUser(true)}
            className="bg-white text-[#8e161a] hover:bg-gray-100 font-semibold"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Agregar Usuario
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
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-900">{stats.total_users}</p>
                <p className="text-sm text-blue-700 font-semibold">Total Usuarios</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-xl">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-900">{stats.active_users}</p>
                <p className="text-sm text-green-700 font-semibold">Activos</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-purple-900">{stats.by_role?.psychologists || 0}</p>
                <p className="text-sm text-purple-700 font-semibold">Psicólogos</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500 rounded-xl">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-yellow-900">{stats.by_role?.students || 0}</p>
                <p className="text-sm text-yellow-700 font-semibold">Estudiantes</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-500 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-red-900">{stats.by_role?.admins || 0}</p>
                <p className="text-sm text-red-700 font-semibold">Administradores</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
            >
              <option value="all">Todos los roles</option>
              <option value="psychologist">Psicólogos</option>
              <option value="student">Estudiantes</option>
              <option value="admin">Administradores</option>
            </select>
            
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
              onClick={() => { loadUsers(); loadStats(); }}
              variant="outline"
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de Usuarios */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                          {user.apellido_paterno && ` ${user.apellido_paterno}`}
                          {user.apellido_materno && ` ${user.apellido_materno}`}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {user.email}
                        </div>
                        {user.celular && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {user.celular}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      {user.role === 'psychologist' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowUserHistory(user)}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {!user.verified && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendVerification(user.id.toString())}
                          disabled={actionLoading === 'verify-' + user.id}
                        >
                          {actionLoading === 'verify-' + user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Mail className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      
                      {user.active ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeactivateUser(user.id.toString(), 'Desactivado por administrador')}
                          disabled={actionLoading === 'deactivate-' + user.id}
                        >
                          {actionLoading === 'deactivate-' + user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReactivateUser(user.id.toString())}
                          disabled={actionLoading === 'reactivate-' + user.id}
                        >
                          {actionLoading === 'reactivate-' + user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteUser(user.id.toString())}
                        disabled={actionLoading === 'delete-' + user.id}
                      >
                        {actionLoading === 'delete-' + user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay usuarios</h3>
              <p className="text-gray-600">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || verifiedFilter !== 'all'
                  ? 'No se encontraron usuarios con los filtros aplicados'
                  : 'Crea el primer usuario del sistema'
                }
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Modal Agregar Usuario */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Agregar Usuario</h2>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <Input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno</label>
                  <Input
                    type="text"
                    value={addForm.apellido_paterno}
                    onChange={(e) => setAddForm(f => ({ ...f, apellido_paterno: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                  <Input
                    type="text"
                    value={addForm.apellido_materno}
                    onChange={(e) => setAddForm(f => ({ ...f, apellido_materno: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <Input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                <Input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
                  required
                >
                  <option value="student">Estudiante</option>
                  <option value="psychologist">Psicólogo</option>
                  {user?.role === 'super_admin' && <option value="admin">Administrador</option>}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                <Input
                  type="text"
                  value={addForm.celular}
                  onChange={(e) => setAddForm(f => ({ ...f, celular: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <Input
                  type="date"
                  value={addForm.fecha_nacimiento}
                  onChange={(e) => setAddForm(f => ({ ...f, fecha_nacimiento: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verified"
                  checked={addForm.verified}
                  onChange={(e) => setAddForm(f => ({ ...f, verified: e.target.checked }))}
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
                  onClick={() => setShowAddUser(false)}
                  disabled={actionLoading === 'add'}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading === 'add'}
                >
                  {actionLoading === 'add' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Usuario'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {showEditUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Usuario</h2>
            
            <form onSubmit={handleEditUser} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
                  required
                >
                  <option value="student">Estudiante</option>
                  <option value="psychologist">Psicólogo</option>
                  {user?.role === 'super_admin' && <option value="admin">Administrador</option>}
                </select>
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
                  onClick={() => setShowEditUser(null)}
                  disabled={actionLoading === 'edit-' + showEditUser.id}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading === 'edit-' + showEditUser.id}
                >
                  {actionLoading === 'edit-' + showEditUser.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar Usuario'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Historial */}
      {showUserHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Historial de {showUserHistory.name}
            </h2>
            
            <div className="text-center py-8">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Funcionalidad de historial en desarrollo...</p>
            </div>
            
            <div className="flex justify-end pt-6">
              <Button
                variant="outline"
                onClick={() => setShowUserHistory(null)}
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