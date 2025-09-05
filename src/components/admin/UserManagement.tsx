import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Users, Plus, Edit, Trash2, UserCheck, UserX, Mail, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { User as UserType } from '../../types';

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const paginatedUsers = users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // 1. Estados para errores por campo en el modal de crear usuario
  const [addUserFieldErrors, setAddUserFieldErrors] = useState({
    name: '',
    email: '',
    dni: '',
    birthdate: '',
    gender: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // 2. Validación manual para crear usuario
  const validateAddUserForm = (form: any) => {
    const errors: any = {};
    if (!form.name?.trim()) errors.name = 'El nombre completo es obligatorio.';
    if (!form.email?.trim()) errors.email = 'El email es obligatorio.';
    if (!form.dni?.trim()) errors.dni = 'El DNI es obligatorio.';
    if (form.dni && form.dni.length !== 8) errors.dni = 'El DNI debe tener 8 dígitos.';
    if (!form.birthdate?.trim()) errors.birthdate = 'La fecha de nacimiento es obligatoria.';
    if (form.birthdate && new Date().getFullYear() - new Date(form.birthdate).getFullYear() < 20) errors.birthdate = 'Debes tener más de 20 años.';
    if (!form.gender?.trim()) errors.gender = 'El género es obligatorio.';
    if (!form.phone?.trim()) errors.phone = 'El celular es obligatorio.';
    if (form.phone && form.phone.length !== 9) errors.phone = 'El celular debe tener 9 dígitos.';
    if (!form.password?.trim()) errors.password = 'La contraseña es obligatoria.';
    if (!form.confirmPassword?.trim()) errors.confirmPassword = 'Confirma la contraseña.';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden.';
    setAddUserFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  function mapUser(u: UserType): UserType {
    return {
      ...u,
      active: typeof u.active === 'boolean' ? u.active : true,
      verified: typeof u.verified === 'boolean' ? u.verified : true
    };
  }

  const loadUsers = async () => {
    try {
      setLoading(true);
      let allUsers = await fetch('http://localhost:8000/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()).then(res => res.data || []) as UserType[];
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

  useEffect(() => {
    loadUsers();
  }, [searchTerm, roleFilter, statusFilter]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-gray-100 text-gray-800';
      case 'admin':
        return 'bg-gray-100 text-gray-700';
      case 'psychologist':
        return 'bg-gray-100 text-gray-600';
      case 'student':
        return 'bg-gray-100 text-gray-500';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8e161a]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Título Principal */}
      <div className="text-center mb-6">
        <div className="inline-block px-20 py-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
            Gestión de Usuarios del Sistema
          </h1>
          <div className="w-28 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto rounded-full"></div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div></div>
        <Button
          onClick={() => setShowAddUser(true)}
          className="flex items-center bg-[#8e161a] hover:bg-[#6b1115]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Usuario
        </Button>
      </div>
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a]"
            >
              <option value="all">Todos los roles</option>
              <option value="psychologist">Psicólogos</option>
              <option value="admin">Administradores</option>
              <option value="student">Estudiantes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
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
              onClick={loadUsers}
              variant="outline"
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-4 flex flex-col gap-3">
          {paginatedUsers.map((user) => (
            <Card
              key={user.id}
              className={`p-2 border rounded-xl flex items-center justify-between shadow-sm border-[#8e161a]`}
            >
              <div className="flex items-center space-x-2 w-full">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8e161a] to-[#d3b7a0] rounded-full flex items-center justify-center text-base font-bold">
                  <span className="text-white">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getRoleBadgeColor(user.role) + ' text-xs px-2 py-0.5'}>{getRoleLabel(user.role)}</Badge>
                    {user.verified && (
                      <Badge variant="success" className="text-xs px-2 py-0.5">Verificado</Badge>
                    )}
                    <Badge variant={user.active ? "success" : "danger"} className="text-xs px-2 py-0.5">
                      {user.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
                {user.role !== 'student' && (
                  <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditUser(true);
                      }}
                      className="flex items-center border-[#8e161a] text-[#8e161a] hover:bg-[#f3e7e8] font-semibold px-3 py-1 text-xs"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                )}
                <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0 ml-2">
                  {user.active ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const reason = prompt('Motivo de desactivación:');
                        if (reason) {
                          // handleDeactivateUser(user.id);
                        }
                      }}
                      className="flex items-center border-[#8e161a] text-[#8e161a] hover:text-red-700 hover:bg-[#f3e7e8] font-semibold px-3 py-1 text-xs"
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Desactivar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* handleReactivateUser(user.id) */}}
                      className="flex items-center border-[#8e161a] text-[#8e161a] hover:text-green-700 hover:bg-green-50 font-semibold px-3 py-1 text-xs"
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Reactivar
                    </Button>
                  )}
                </div>
                <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* handleDeleteUser(user.id) */}}
                    className="flex items-center border-[#8e161a] text-[#8e161a] font-semibold px-3 py-1 text-xs"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="md:col-span-1">
          {currentUser && (
            <Card className="p-4 border-2 border-purple-700 bg-purple-50 rounded-xl shadow-sm w-full mb-2 flex flex-col gap-2 items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-700 to-purple-300 rounded-full flex items-center justify-center text-2xl font-bold mb-4 overflow-hidden">
                <span className="text-white">{currentUser.name.charAt(0).toUpperCase()}</span>
              </div>
              <h3 className="font-bold text-lg text-purple-900 mb-2">{currentUser.name}</h3>
              <p className="text-xs text-gray-700 mb-2">{currentUser.email}</p>
              <p className="text-xs text-gray-700 mb-2 flex items-center justify-center"><span className="font-semibold mr-1">Celular:</span> {currentUser.phone ? currentUser.phone.replace(/^\+?51/, '') : 'No registrado'}</p>
              <div className="flex flex-wrap items-center justify-center gap-2 my-2">
                <Badge className="bg-orange-200 text-orange-800 text-xs px-2 py-0.5">Administrador</Badge>
                {currentUser.verified && <Badge variant="success" className="text-xs px-2 py-0.5">Verificado</Badge>}
                <Badge variant={currentUser.active ? "success" : "danger"} className="text-xs px-2 py-0.5">
                  {currentUser.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-2">Registrado: {new Date(currentUser.created_at).toLocaleDateString()}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-purple-700 text-purple-700 hover:bg-purple-100 font-semibold px-3 py-1 text-xs"
                onClick={() => {
                  setSelectedUser(currentUser);
                  setShowEditUser(true);
                }}
              >
                <Edit className="w-4 h-4 mr-1" /> Editar
              </Button>
            </Card>
          )}
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>
          <span className="px-3 py-1 text-sm font-semibold text-gray-700">Página {currentPage} de {totalPages}</span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
      {showEditUser && selectedUser && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-all duration-500">
    <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-2 border border-gray-200 animate-fade-in-up">
      <div className="p-0">
        <div className="rounded-t-2xl mb-0 shadow-md overflow-hidden border-b-4 border-[#8e161a]" style={{background: 'linear-gradient(90deg, #6b1115 0%, #8e161a 100%)'}}>
          <h2 className="text-xl font-extrabold text-white tracking-wide text-center py-4">Editar Usuario</h2>
        </div>
        <div className="px-4 py-4">
          <form className="flex flex-col gap-4 items-center w-full">
            <div className="w-full max-w-xs space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre completo <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={e => setSelectedUser({...selectedUser, name: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  readOnly
                  className="w-full border rounded-lg p-2 bg-gray-100 text-gray-700 text-sm cursor-not-allowed"
                />
              </div>
              <div className="flex gap-2 w-full">
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">País</label>
                  <input
                    type="text"
                    value="Perú"
                    readOnly
                    className="w-full border rounded-lg p-2 bg-gray-100 text-gray-700 text-sm cursor-not-allowed"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Celular <span className="text-red-600">*</span></label>
                  <div className="flex items-center">
                    <span className="px-2 py-2 border border-gray-300 rounded-l-lg bg-gray-100 text-gray-700 select-none text-sm h-[36px] flex items-center">+51</span>
                    <input
                      type="text"
                      value={selectedUser.phone ? selectedUser.phone.replace(/^\+?51/, '') : ''}
                      maxLength={9}
                      onChange={e => setSelectedUser({...selectedUser, phone: e.target.value.replace(/[^0-9]/g, '')})}
                      className="pl-2 w-full border-t border-b border-r border-gray-300 rounded-r-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-sm h-[36px]"
                      placeholder="987654321"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between w-full pt-3 gap-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditUser(false)}
                className="border-[#8e161a] text-[#8e161a] hover:bg-[#f3e7e8] font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-sm py-2 px-6"
                style={{ minWidth: '120px' }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-[#8e161a] hover:bg-[#6b1115] text-white font-bold shadow-md transition-all duration-200 shadow-sm hover:shadow-lg text-sm py-2 px-6"
                style={{ minWidth: '120px' }}
                onClick={() => setShowEditUser(false)}
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
)}
      {showAddUser && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-all duration-500">
    <div className="bg-white rounded-2xl shadow-lg max-w-3xl w-full mx-4 border border-gray-200 animate-fade-in-up">
      <div className="p-0">
        <div className="rounded-t-2xl mb-0 shadow-md overflow-hidden border-b-4 border-[#8e161a]" style={{background: 'linear-gradient(90deg, #6b1115 0%, #8e161a 100%)'}}>
          <h2 className="text-2xl font-extrabold text-white tracking-wide text-center py-6">Crear Nuevo Usuario</h2>
        </div>
        <div className="px-8 py-8">
          <form className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  // value, onChange, etc. según tu estado
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                />
                {addUserFieldErrors.name && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-800 text-xs font-semibold">{addUserFieldErrors.name}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  // value, onChange, etc. según tu estado
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                />
                {addUserFieldErrors.email && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-800 text-xs font-semibold">{addUserFieldErrors.email}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DNI <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  // value, onChange, etc. según tu estado
                  maxLength={8}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                />
                {addUserFieldErrors.dni && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-800 text-xs font-semibold">{addUserFieldErrors.dni}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento <span className="text-red-600">*</span></label>
                <input
                  type="date"
                  // value, onChange, etc. según tu estado
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                />
                {addUserFieldErrors.birthdate && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-800 text-xs font-semibold">{addUserFieldErrors.birthdate}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Género <span className="text-red-600">*</span></label>
                <select
                  // value, onChange, etc. según tu estado
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                >
                  <option value="">Seleccionar género</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
                {addUserFieldErrors.gender && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-800 text-xs font-semibold">{addUserFieldErrors.gender}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular <span className="text-red-600">*</span></label>
                <div className="flex items-center">
                  <span className="px-3 py-3 border border-gray-300 rounded-l-lg bg-gray-100 text-gray-700 select-none text-base h-[48px] flex items-center">+51</span>
                  <input
                    type="text"
                    // value, onChange, etc. según tu estado
                    maxLength={9}
                    className="pl-3 w-full border-t border-b border-r border-gray-300 rounded-r-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all text-base h-[48px]"
                    placeholder="987654321"
                  />
                </div>
                {addUserFieldErrors.phone && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-800 text-xs font-semibold">{addUserFieldErrors.phone}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol <span className="text-red-600">*</span></label>
                <select
                  value="psychologist"
                  disabled
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all bg-gray-100 text-gray-700 cursor-not-allowed"
                >
                  <option value="psychologist">Psicólogo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialización</label>
                <input
                  type="text"
                  // value, onChange, etc. según tu estado
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                  placeholder="Ej: Psicología Clínica"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña <span className="text-red-600">*</span></label>
                <div className="relative">
                  <input
                    type="password"
                    // value, onChange, etc. según tu estado
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all pr-10"
                  />
                </div>
                {addUserFieldErrors.password && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-800 text-xs font-semibold">{addUserFieldErrors.password}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña <span className="text-red-600">*</span></label>
                <div className="relative">
                  <input
                    type="password"
                    // value, onChange, etc. según tu estado
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all pr-10"
                  />
                </div>
                {addUserFieldErrors.confirmPassword && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-800 text-xs font-semibold">{addUserFieldErrors.confirmPassword}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddUser(false)}
                className="flex-1 border-[#8e161a] text-[#8e161a] hover:bg-[#f3e7e8] font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#8e161a] hover:bg-[#6b1115] text-white font-bold shadow-md transition-all duration-200 shadow-sm hover:shadow-lg"
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
    </div>
  );
}