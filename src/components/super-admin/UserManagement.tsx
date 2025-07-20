import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Mail, 
  Lock, 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'psychologist' | 'admin' | 'super_admin';
  verified: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  specialization?: string;
  career?: string;
  semester?: number;
  dni?: string; // Added dni to User interface
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dni: string;
  role: 'psychologist' | 'admin';
  specialization?: string;
}

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Estados para el modal de creación
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dni: '',
    role: 'psychologist'
  });

  // Estados para el modal de restablecimiento de contraseña
  const [resetEmail, setResetEmail] = useState('');
  
  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estado para errores de validación
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [dniError, setDniError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal de desactivación
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);

  // Estado para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserData, setEditUserData] = useState<CreateUserData | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      console.log('Token:', token ? 'Presente' : 'Ausente');
      
      const response = await fetch('http://localhost:8000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        let errorMessage = 'Error al obtener usuarios';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || 'Error al obtener usuarios';
          } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError);
            errorMessage = `Error del servidor (${response.status})`;
          }
        } else {
          // Si no es JSON, probablemente es HTML
          const textResponse = await response.text();
          console.error('HTML Response:', textResponse);
          errorMessage = `Error del servidor (${response.status}): Respuesta no válida`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      setError('Error al cargar usuarios');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar DNI
    if (!/^\d{8}$/.test(createUserData.dni)) {
      setDniError('El DNI debe ser numérico y tener 8 dígitos');
      return;
    }
    setDniError(null);

    // Validar que las contraseñas coincidan
    if (createUserData.password !== createUserData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud mínima de contraseña
    if (createUserData.password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setPasswordError(null);

    try {
      const response = await fetch('http://localhost:8000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: createUserData.name,
          email: createUserData.email,
          password: createUserData.password,
          dni: createUserData.dni,
          role: createUserData.role,
          specialization: createUserData.specialization,
          verified: true
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        let errorMessage = 'Error al crear usuario';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || 'Error al crear usuario';
          } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError);
            errorMessage = `Error del servidor (${response.status})`;
          }
        } else {
          // Si no es JSON, probablemente es HTML
          const textResponse = await response.text();
          console.error('HTML Response:', textResponse);
          errorMessage = `Error del servidor (${response.status}): Respuesta no válida`;
        }
        
        throw new Error(errorMessage);
      }

      await fetchUsers();
      setShowCreateModal(false);
      setCreateUserData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        dni: '',
        role: 'psychologist'
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
      setSuccessMessage('Usuario creado exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean, reason?: string) => {
    try {
      const action = currentStatus ? 'deactivate' : 'reactivate';
      const response = await fetch(`http://localhost:8000/api/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: currentStatus ? (reason || 'Desactivado por super administrador') : 'Reactivado por super administrador'
        })
      });

      if (!response.ok) {
        throw new Error('Error al cambiar estado del usuario');
      }

      await fetchUsers();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:8000/api/users/${selectedUser?.id}/send-password-reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al enviar correo de restablecimiento');
      }

      setShowPasswordModal(false);
      setSelectedUser(null);
      setResetEmail('');
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
      setSuccessMessage('Usuario verificado exitosamente');
      fetchUsers();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'psychologist':
        return 'bg-green-100 text-green-800';
      case 'student':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Administrador';
      case 'psychologist':
        return 'Psicólogo';
      case 'student':
        return 'Estudiante';
      default:
        return role;
    }
  };

  const filteredUsers = users.filter(user => {
    const isAllowedRole = user.role === 'psychologist' || user.role === 'admin' || user.role === 'super_admin';
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.active) ||
                         (statusFilter === 'inactive' && !user.active);
    
    return isAllowedRole && matchesSearch && matchesRole && matchesStatus;
  });

  // Validación de email único
  const emailExists = users.some(u => u.email.toLowerCase() === createUserData.email.toLowerCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8e161a]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-[#8e161a]" />
            Gestión de Usuarios
          </h1>
        </div>
        <Button
          onClick={() => {
            setShowCreateModal(true);
            setPasswordError(null);
            setShowPassword(false);
            setShowConfirmPassword(false);
            setDniError(null);
          }}
          className="flex items-center bg-[#8e161a] hover:bg-[#6b1115]"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Crear Usuario
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a]"
            >
              <option value="all">Todos los roles</option>
              <option value="psychologist">Psicólogos</option>
              <option value="admin">Administradores</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a]"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={fetchUsers}
              variant="outline"
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de usuarios */}
      <div className="grid gap-3">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-3 border-2 border-[#8e161a] rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3 w-full">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8e161a] to-[#d3b7a0] rounded-full flex items-center justify-center text-base font-bold">
                <span className="text-white">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                  {user.verified && (
                    <Badge variant="success" className="text-xs px-2 py-0.5">Verificado</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getRoleBadgeColor(user.role) + ' text-xs px-2 py-0.5'}>{getRoleLabel(user.role)}</Badge>
                  <Badge variant={user.active ? "success" : "danger"} className="text-xs px-2 py-0.5">
                    {user.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
              {/* Opciones solo para admin y psicólogo */}
              {user.role !== 'super_admin' && (
                <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0 ml-2">
                  {/* Botón Editar */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUserToEdit(user);
                      setEditUserData({
                        name: user.name,
                        email: user.email,
                        password: '',
                        confirmPassword: '',
                        dni: user.dni || '',
                        role: user.role as 'psychologist' | 'admin',
                        specialization: user.specialization || ''
                      });
                      setShowEditModal(true);
                    }}
                    className="flex items-center border-[#8e161a] text-[#8e161a] hover:bg-[#f3e7e8] font-semibold px-3 py-1 text-xs"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  {/* Botón Reactivar si está inactivo */}
                  {!user.active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleUserStatus(user.id, user.active)}
                      className="flex items-center border-[#8e161a] text-[#8e161a] hover:bg-green-50 font-semibold px-3 py-1 text-xs"
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Reactivar
                    </Button>
                  )}
                  {/* Botón Restablecer */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setResetEmail(user.email);
                      setShowPasswordModal(true);
                    }}
                    className="flex items-center border-[#8e161a] text-[#8e161a] hover:bg-[#f3e7e8] font-semibold px-3 py-1 text-xs"
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Restablecer
                  </Button>
                  {/* Botón Desactivar/Activar */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (user.active) {
                        setUserToDeactivate(user);
                        setDeactivateReason('');
                        setShowDeactivateModal(true);
                      } else {
                        handleToggleUserStatus(user.id, user.active);
                      }
                    }}
                    className={`flex items-center border-[#8e161a] text-[#8e161a] hover:bg-[#f3e7e8] font-semibold px-3 py-1 text-xs ${user.active ? 'hover:text-red-700' : 'hover:text-green-700'}`}
                  >
                    {user.active ? (
                      <>
                        <UserX className="w-4 h-4 mr-1" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 mr-1" />
                        Activar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de creación de usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-all duration-500">
            <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 border border-gray-200 animate-fade-in-up">
              <div className="p-0">
                <div className="rounded-t-2xl mb-0 shadow-md overflow-hidden border-b-4 border-[#8e161a]" style={{background: 'linear-gradient(90deg, #6b1115 0%, #8e161a 100%)'}}>
                 <h2 className="text-2xl font-extrabold text-white tracking-wide text-center py-6">Crear Nuevo Usuario</h2>
                </div>
                <div className="px-8 py-8">
                  <form onSubmit={handleCreateUser} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 tracking-wide">Nombre completo</label>
                      <input
                        type="text"
                        value={createUserData.name}
                        onChange={(e) => setCreateUserData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] shadow-sm focus:shadow transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 tracking-wide">Email</label>
                      <input
                        type="email"
                        value={createUserData.email}
                        onChange={(e) => setCreateUserData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] shadow-sm focus:shadow transition-all duration-200"
                        required
                      />
                    {emailExists && (
                      <div className="text-white text-xs bg-[#ef4444] border border-[#b91c1c] rounded-lg p-2 mt-1 font-semibold shadow">Este correo ya está registrado. Usa uno diferente.</div>
                    )}
                    {error && error.toLowerCase().includes('correo ya está registrado') && (
                      <div className="text-white text-xs bg-[#ef4444] border border-[#b91c1c] rounded-lg p-2 mt-1 font-semibold shadow">{error}</div>
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row md:space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1 tracking-wide">DNI</label>
                      <input
                        type="text"
                        value={createUserData.dni}
                        maxLength={8}
                        onChange={(e) => setCreateUserData(prev => ({ ...prev, dni: e.target.value.replace(/[^0-9]/g, '') }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] shadow-sm focus:shadow transition-all duration-200"
                        required
                      />
                      {dniError && (
                        <div className="text-white text-xs bg-[#ef4444] border border-[#b91c1c] rounded-lg p-2 mt-1 font-semibold shadow">{dniError}</div>
                      )}
                    </div>
                    <div className="flex-1 mt-4 md:mt-0">
                      <label className="block text-sm font-semibold text-gray-700 mb-1 tracking-wide">Rol</label>
                      <select
                        value={createUserData.role}
                        onChange={(e) => setCreateUserData(prev => ({ ...prev, role: e.target.value as 'psychologist' | 'admin' }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] shadow-sm focus:shadow transition-all duration-200"
                      >
                        <option value="psychologist">Psicólogo</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 tracking-wide">Contraseña</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={createUserData.password}
                          onChange={(e) => setCreateUserData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] shadow-sm focus:shadow transition-all duration-200"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 tracking-wide">Confirmar Contraseña</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={createUserData.confirmPassword}
                          onChange={(e) => setCreateUserData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] shadow-sm focus:shadow transition-all duration-200"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {passwordError && (
                      <div className="text-white text-xs bg-[#ef4444] border border-[#b91c1c] rounded-lg p-3 font-semibold shadow-md">{passwordError}</div>
                    )}
                    {createUserData.role === 'psychologist' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 tracking-wide">Especialización</label>
                        <input
                          type="text"
                          value={createUserData.specialization || ''}
                          onChange={(e) => setCreateUserData(prev => ({ ...prev, specialization: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] shadow-sm focus:shadow transition-all duration-200"
                          placeholder="Ej: Psicología Clínica"
                        />
                      </div>
                    )}
                    <div className="flex space-x-3 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateModal(false);
                          setPasswordError(null);
                          setShowPassword(false);
                          setShowConfirmPassword(false);
                          setDniError(null);
                        }}
                        className="flex-1 border-[#8e161a] text-[#8e161a] hover:bg-[#f3e7e8] font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-[#8e161a] hover:bg-[#6b1115] text-white font-bold shadow-md transition-all duration-200 shadow-sm hover:shadow-lg"
                        disabled={emailExists}
                      >
                        Crear Usuario
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Modal de restablecimiento de contraseña */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 border border-gray-200 animate-fade-in-up">
            <div className="rounded-t-2xl mb-0 shadow-md overflow-hidden border-b-4 border-[#8e161a]" style={{background: 'linear-gradient(90deg, #6b1115 0%, #8e161a 100%)'}}>
              <h2 className="text-xl font-extrabold text-white tracking-wide text-center py-5">Restablecer Contraseña</h2>
            </div>
            <div className="px-8 py-8">
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 tracking-wide">Email del usuario</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] shadow-sm focus:shadow transition-all duration-200"
                    required
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Envío de correo</p>
                      <p className="text-sm text-blue-700 mt-1">Se enviará un correo al usuario con instrucciones para restablecer su contraseña.</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 border-[#8e161a] text-[#8e161a] hover:bg-[#f3e7e8] font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#8e161a] hover:bg-[#6b1115] text-white font-bold shadow-md transition-all duration-200 shadow-sm hover:shadow-lg"
                  >
                    Enviar Correo
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Error modal */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="text-center">
                <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <UserX className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button
                  onClick={() => setError(null)}
                  className="bg-[#8e161a] hover:bg-[#6b1115]"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-100 border border-green-400 text-green-800 px-6 py-3 rounded-lg shadow-lg">
            {successMessage}
          </div>
        </div>
      )}

      {/* Modal de desactivación de usuario */}
      {showDeactivateModal && userToDeactivate && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-all duration-500">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 border border-gray-200 animate-fade-in-up">
            <div className="rounded-t-2xl mb-0 shadow-md overflow-hidden border-b-4 border-[#8e161a]" style={{background: 'linear-gradient(90deg, #6b1115 0%, #8e161a 100%)'}}>
              <h2 className="text-xl font-extrabold text-white tracking-wide text-center py-5">Desactivar Usuario</h2>
            </div>
            <div className="px-8 py-8">
              <div className="mb-4">
                <p className="text-base text-gray-800 font-semibold mb-1">{userToDeactivate.name}</p>
                <p className="text-sm text-gray-600 mb-4">{userToDeactivate.email}</p>
                <label className="block text-sm font-semibold text-gray-700 mb-1 tracking-wide">Motivo de desactivación <span className="text-red-600">*</span></label>
                <textarea
                  value={deactivateReason}
                  onChange={e => setDeactivateReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] shadow-sm focus:shadow transition-all duration-200 min-h-[80px] resize-none"
                  required
                  placeholder="Ej: Incumplimiento de normas, solicitud del usuario, etc."
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeactivateModal(false);
                    setUserToDeactivate(null);
                    setDeactivateReason('');
                  }}
                  className="flex-1 border-[#8e161a] text-[#8e161a] hover:bg-[#f3e7e8] font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-[#8e161a] hover:bg-[#6b1115] text-white font-bold shadow-md transition-all duration-200 shadow-sm hover:shadow-lg"
                  disabled={deactivateReason.trim().length < 5}
                  onClick={async () => {
                    if (userToDeactivate) {
                      await handleToggleUserStatus(userToDeactivate.id, true, deactivateReason);
                      setShowDeactivateModal(false);
                      setUserToDeactivate(null);
                      setDeactivateReason('');
                    }
                  }}
                >
                  Desactivar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de usuario */}
      {showEditModal && editUserData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-all duration-500">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 border border-gray-200 animate-fade-in-up">
            <div className="rounded-t-2xl mb-0 shadow-md overflow-hidden border-b-4 border-[#8e161a]" style={{background: 'linear-gradient(90deg, #6b1115 0%, #8e161a 100%)'}}>
              <h2 className="text-2xl font-extrabold text-white tracking-wide text-center py-6">Editar Usuario</h2>
            </div>
            <div className="px-8 py-8">
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 tracking-wide">Nombre completo</label>
                  <input
                    type="text"
                    value={editUserData.name}
                    onChange={e => setEditUserData(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] shadow-sm focus:shadow transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 tracking-wide">Email</label>
                  <input
                    type="email"
                    value={editUserData.email}
                    onChange={e => setEditUserData(prev => prev ? {...prev, email: e.target.value} : null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] shadow-sm focus:shadow transition-all duration-200"
                    required
                  />
                </div>
                <div className="flex flex-col md:flex-row md:space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1 tracking-wide">DNI</label>
                    <input
                      type="text"
                      value={editUserData.dni || ''}
                      maxLength={8}
                      onChange={e => setEditUserData(prev => prev ? {...prev, dni: e.target.value.replace(/[^0-9]/g, '')} : null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] shadow-sm focus:shadow transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="flex-1 mt-4 md:mt-0">
                    <label className="block text-sm font-semibold text-gray-700 mb-1 tracking-wide">Rol</label>
                    <select
                      value={editUserData.role}
                      onChange={e => setEditUserData(prev => prev ? {...prev, role: e.target.value as 'psychologist' | 'admin'} : null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] shadow-sm focus:shadow transition-all duration-200"
                    >
                      <option value="psychologist">Psicólogo</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                {editUserData.role === 'psychologist' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 tracking-wide">Especialización</label>
                    <input
                      type="text"
                      value={editUserData.specialization || ''}
                      onChange={e => setEditUserData(prev => prev ? {...prev, specialization: e.target.value} : null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] shadow-sm focus:shadow transition-all duration-200"
                      placeholder="Ej: Psicología Clínica"
                    />
                  </div>
                )}
                <div className="flex space-x-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 border-[#8e161a] text-[#8e161a] hover:bg-[#f3e7e8] font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-[#8e161a] hover:bg-[#6b1115] text-white font-bold shadow-md transition-all duration-200 shadow-sm hover:shadow-lg"
                    // Aquí iría la lógica de guardar cambios si se implementa
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 