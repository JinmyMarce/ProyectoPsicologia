import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, UserCheck, UserX, Mail, Eye, History } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { userService, UserFilters } from '../../services/users';
import { User, CreateUserData, UpdateUserData } from '../../types';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showUserHistory, setShowUserHistory] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      const filters: UserFilters = {};
      
      if (roleFilter !== 'all') {
        filters.role = roleFilter;
      }
      
      if (statusFilter !== 'all') {
        filters.active = statusFilter === 'active';
      }
      
      if (searchTerm) {
        filters.search = searchTerm;
      }

      const response = await userService.getUsers(filters);
      setUsers(response.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await userService.getUserStats();
      setStats(response.data);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [searchTerm, roleFilter, statusFilter]);

  const getStatusBadge = (user: User) => {
    if (!user.active) {
      return <Badge variant="warning">Inactivo</Badge>;
    }
    if (!user.verified) {
      return <Badge variant="info">Pendiente</Badge>;
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

  const handleDeactivateUser = async (userId: string, reason: string) => {
    try {
      await userService.deactivateUser(userId, reason);
      loadUsers();
      loadStats();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      await userService.reactivateUser(userId);
      loadUsers();
      loadStats();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await userService.deleteUser(userId);
        loadUsers();
        loadStats();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleSendVerification = async (userId: string) => {
    try {
      await userService.sendVerificationEmail(userId);
      alert('Email de verificación enviado exitosamente');
    } catch (err: any) {
      setError(err.message);
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
                      
                      {!user.verified && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendVerification(user.id)}
                          icon={Mail}
                        >
                          Verificar
                        </Button>
                      )}
                      
                      {user.active ? (
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => {
                            const reason = prompt('Motivo de desactivación:');
                            if (reason) {
                              handleDeactivateUser(user.id, reason);
                            }
                          }}
                          icon={UserX}
                        >
                          Desactivar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="success"
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
    </div>
  );
}