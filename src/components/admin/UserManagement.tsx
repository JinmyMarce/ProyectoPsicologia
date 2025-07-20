import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, UserCheck, UserX, Mail, Eye, History } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { getUsers, getUserStats, deactivateUser, reactivateUser, deleteUser } from '../../services/users';
import type { User as UserType } from '../../types';

export function UserManagement() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserData, setAddUserData] = useState({
    name: '',
    email: '',
    dni: '',
    password: '',
    confirmPassword: '',
    role: 'psychologist',
    specialization: ''
  });
  const [addUserPasswordError, setAddUserPasswordError] = useState<string | null>(null);
  const [addUserDniError, setAddUserDniError] = useState<string | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState<string | null>(null);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showUserHistory, setShowUserHistory] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [stats, setStats] = useState<any>(null);

  function mapUser(u: any): UserType {
    return {
      ...u,
      active: typeof u.active === 'boolean' ? u.active : true,
      verified: typeof u.verified === 'boolean' ? u.verified : true
    };
  }

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      let allUsers = await getUsers();
      allUsers = allUsers.map(mapUser);
      if (roleFilter !== 'all') {
        allUsers = allUsers.filter(u => u.role === roleFilter);
      }
      if (statusFilter !== 'all') {
        allUsers = allUsers.filter(u => (statusFilter === 'active' ? u.active : !u.active));
      }
      if (searchTerm) {
        allUsers = allUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      setUsers(allUsers);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const statsData = await getUserStats();
      setStats(statsData);
    } catch (err: unknown) {
      console.error('Error loading stats:', err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [searchTerm, roleFilter, statusFilter]);

  const getStatusBadge = (user: UserType) => {
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

  const handleDeactivateUser = async (userId: string) => {
    try {
      await deactivateUser(Number(userId));
      loadUsers();
      loadStats();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al desactivar usuario');
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      await reactivateUser(Number(userId));
      loadUsers();
      loadStats();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al reactivar usuario');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUser(Number(userId));
        loadUsers();
        loadStats();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
      }
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validar DNI
    if (!/^\d{8}$/.test(addUserData.dni)) {
      setAddUserDniError('El DNI debe ser numérico y tener 8 dígitos');
      return;
    }
    setAddUserDniError(null);
    // Validar contraseñas
    if (addUserData.password !== addUserData.confirmPassword) {
      setAddUserPasswordError('Las contraseñas no coinciden');
      return;
    }
    if (addUserData.password.length < 8) {
      setAddUserPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setAddUserPasswordError(null);
    try {
      const response = await fetch('http://localhost:8000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: addUserData.name,
          email: addUserData.email,
          dni: addUserData.dni,
          password: addUserData.password,
          role: addUserData.role,
          specialization: addUserData.role === 'psychologist' ? addUserData.specialization : undefined,
          verified: true
        })
      });
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Error al crear usuario';
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || 'Error al crear usuario';
          } catch (jsonError) {
            errorMessage = `Error del servidor (${response.status})`;
          }
        } else {
          errorMessage = `Error del servidor (${response.status}): Respuesta no válida`;
        }
        throw new Error(errorMessage);
      }
      setShowAddUser(false);
      setAddUserData({
        name: '',
        email: '',
        dni: '',
        password: '',
        confirmPassword: '',
        role: 'psychologist',
        specialization: ''
      });
      setAddUserSuccess('Usuario creado exitosamente');
      setTimeout(() => setAddUserSuccess(null), 3000);
      loadUsers();
      loadStats();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleVerifyUser = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al verificar usuario');
      }
      setAddUserSuccess('Usuario verificado exitosamente');
      loadUsers();
      loadStats();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
          <p className="text-gray-600">
            Administra psicólogos, estudiantes y permisos del sistema
          </p>
        </div>
        <Button onClick={() => setShowAddUser(true)} icon={Plus}>
          Agregar Usuario
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card hoverable>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
              <p className="text-sm text-gray-600">Total Usuarios</p>
            </div>
          </Card>
          <Card hoverable>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.by_role?.psychologists || 0}</p>
              <p className="text-sm text-gray-600">Psicólogos</p>
            </div>
          </Card>
          <Card hoverable>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.by_role?.students || 0}</p>
              <p className="text-sm text-gray-600">Estudiantes</p>
            </div>
          </Card>
          <Card hoverable>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.active_users}</p>
              <p className="text-sm text-gray-600">Activos</p>
            </div>
          </Card>
          <Card hoverable>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.unverified_users}</p>
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          <Input
            placeholder="Buscar por nombre, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los roles</option>
            <option value="student">Estudiantes</option>
            <option value="psychologist">Psicólogos</option>
            <option value="admin">Administradores</option>
            <option value="super_admin">Super Administradores</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="pending">Pendientes</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            {users.length} usuarios encontrados
          </CardDescription>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="w-full">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.specialization && (
                          <div className="text-xs text-gray-400">{user.specialization}</div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditUser(true);
                        }}
                        icon={Edit}
                      >
                        Editar
                      </Button>
                      
                      {user.role === 'psychologist' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserHistory(true);
                          }}
                          icon={History}
                        >
                          Historial
                        </Button>
                      )}
                      
                      {user.active ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            const reason = prompt('Motivo de desactivación:');
                            if (reason) {
                              handleDeactivateUser(user.id);
                            }
                          }}
                          icon={UserX}
                        >
                          Desactivar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleReactivateUser(user.id)}
                          icon={UserCheck}
                        >
                          Reactivar
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteUser(user.id)}
                        icon={Trash2}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals would go here - Add User, Edit User, User History */}
      {/* These would be implemented as separate modal components */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Crear Nuevo Usuario</h2>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={addUserData.name}
                    onChange={e => setAddUserData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={addUserData.email}
                    onChange={e => setAddUserData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                  <input
                    type="text"
                    value={addUserData.dni}
                    maxLength={8}
                    onChange={e => setAddUserData(prev => ({ ...prev, dni: e.target.value.replace(/[^0-9]/g, '') }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    required
                  />
                  {addUserDniError && (
                    <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-2 mt-1">{addUserDniError}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={addUserData.password}
                    onChange={e => setAddUserData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                  <input
                    type="password"
                    value={addUserData.confirmPassword}
                    onChange={e => setAddUserData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    required
                  />
                  {addUserPasswordError && (
                    <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-2 mt-1">{addUserPasswordError}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    value={addUserData.role}
                    onChange={e => setAddUserData(prev => ({ ...prev, role: e.target.value as 'psychologist' | 'admin' }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  >
                    <option value="psychologist">Psicólogo</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                {addUserData.role === 'psychologist' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Especialización</label>
                    <input
                      type="text"
                      value={addUserData.specialization}
                      onChange={e => setAddUserData(prev => ({ ...prev, specialization: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      placeholder="Ej: Psicología Clínica"
                    />
                  </div>
                )}
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddUser(false);
                      setAddUserPasswordError(null);
                      setAddUserDniError(null);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Crear Usuario
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {addUserSuccess && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-100 border border-green-400 text-green-800 px-6 py-3 rounded-lg shadow-lg">
            {addUserSuccess}
          </div>
        </div>
      )}
    </div>
  );
}