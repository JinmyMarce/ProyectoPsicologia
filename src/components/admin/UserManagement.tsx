import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CustomSelect } from '../ui/CustomSelect';
import { Users, Plus, Edit, Trash2, UserCheck, UserX, Mail, Search, Filter, Sparkles, RefreshCw, X, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createUser, deactivateUser, reactivateUser, deleteUser } from '../../services/users';
import type { User as UserType } from '../../types';

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [creatingUser, setCreatingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const usersPerPage = 4;
  const paginatedUsers = users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // 1. Estados para el formulario de crear usuario
  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    dni: '',
    birthdate: '',
    gender: '',
    marital_status: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    specialization: ''
  });

  // 2. Estados para errores por campo en el modal de crear usuario
  const [addUserFieldErrors, setAddUserFieldErrors] = useState({
    name: '',
    email: '',
    dni: '',
    birthdate: '',
    gender: '',
    marital_status: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Función para validar fortaleza de contraseña
  const validatePasswordStrength = (password: string): string | null => {
    if (!password) return 'La contraseña es obligatoria.';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (!/[A-Z]/.test(password)) return 'La contraseña debe contener al menos una mayúscula.';
    if (!/[a-z]/.test(password)) return 'La contraseña debe contener al menos una minúscula.';
    if (!/[0-9]/.test(password)) return 'La contraseña debe contener al menos un número.';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'La contraseña debe contener al menos un símbolo especial.';
    return null;
  };

  // 3. Validación manual para crear usuario
  const validateAddUserForm = (form: any) => {
    const errors: any = {};
    if (!form.name?.trim()) errors.name = 'El nombre completo es obligatorio.';
    if (!form.email?.trim()) errors.email = 'El email es obligatorio.';
    if (!form.dni?.trim()) errors.dni = 'El DNI es obligatorio.';
    if (form.dni && form.dni.length !== 8) errors.dni = 'El DNI debe tener 8 dígitos.';
    if (!form.birthdate?.trim()) errors.birthdate = 'La fecha de nacimiento es obligatoria.';
    if (form.birthdate && new Date().getFullYear() - new Date(form.birthdate).getFullYear() < 20) errors.birthdate = 'Debes tener más de 20 años.';
    if (!form.gender?.trim()) errors.gender = 'El género es obligatorio.';
    if (!form.marital_status?.trim()) errors.marital_status = 'El estado civil es obligatorio.';
    if (!form.phone?.trim()) errors.phone = 'El celular es obligatorio.';
    if (form.phone && form.phone.length !== 9) errors.phone = 'El celular debe tener 9 dígitos.';
    
    // Validar contraseña con requisitos de fortaleza
    const passwordError = validatePasswordStrength(form.password);
    if (passwordError) {
      errors.password = passwordError;
    }
    
    if (!form.confirmPassword?.trim()) {
      errors.confirmPassword = 'Confirma la contraseña.';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }
    
    setAddUserFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Función para formatear el teléfono con el prefijo +51 en formato +519xxxxxxxx
  const formatPhoneForBackend = (phone: string): string => {
    if (!phone) return '';
    // Remover cualquier carácter que no sea número
    const cleaned = phone.replace(/\D/g, '');
    
    // Si ya tiene el formato +519xxxxxxxx, devolverlo
    if (phone.startsWith('+51') && phone.length === 12) {
      return phone;
    }
    
    // Si tiene 9 dígitos, agregar +51 (formato: +519xxxxxxxx)
    if (cleaned.length === 9) {
      return `+51${cleaned}`;
    }
    
    // Si tiene 11 dígitos y empieza con 51, agregar el +
    if (cleaned.length === 11 && cleaned.startsWith('51')) {
      return `+${cleaned}`;
    }
    
    // Si tiene 10 dígitos y empieza con 9, agregar +51
    if (cleaned.length === 10 && cleaned.startsWith('9')) {
      return `+51${cleaned}`;
    }
    
    return phone;
  };

  // Función para resetear el formulario
  const resetAddUserForm = () => {
    setAddUserForm({
      name: '',
      email: '',
      dni: '',
      birthdate: '',
      gender: '',
      marital_status: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
      specialization: ''
    });
    setAddUserFieldErrors({
      name: '',
      email: '',
      dni: '',
      birthdate: '',
      gender: '',
      marital_status: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
  };

  // Función para crear usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateAddUserForm(addUserForm)) {
      return;
    }

    setCreatingUser(true);
    
    try {
      // Formatear el teléfono con el prefijo +51 en el formato correcto
      const formattedPhone = formatPhoneForBackend(addUserForm.phone);
      
      // Determinar nacionalidad según el género
      const nationality = addUserForm.gender === 'femenino' ? 'Peruana' : 'Peruano';

      const userData = {
        name: addUserForm.name,
        email: addUserForm.email,
        password: addUserForm.password,
        dni: addUserForm.dni,
        phone: formattedPhone,
        birthdate: addUserForm.birthdate,
        gender: addUserForm.gender,
        marital_status: addUserForm.marital_status,
        address: addUserForm.address,
        nationality: nationality,
        role: 'psychologist' as const,
        specialization: addUserForm.specialization || undefined
      };

      await createUser(userData);
      
      // Cerrar modal y resetear formulario primero
      resetAddUserForm();
      setShowAddUser(false);
      
      // Mostrar mensaje de éxito después de cerrar el modal
      setSuccess('Usuario registrado exitosamente');
      await loadUsers();
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: unknown) {
      console.error('Error creating user:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as { 
          response?: { 
            status?: number;
            data?: { 
              message?: string;
              errors?: Record<string, string[]>;
            } 
          } 
        };
        
        if (apiError.response?.status === 422 && apiError.response.data?.errors) {
          // Manejar errores de validación del backend
          const errors = apiError.response.data.errors;
          setAddUserFieldErrors({
            name: errors.name?.[0] || '',
            email: errors.email?.[0] || '',
            dni: errors.dni?.[0] || '',
            birthdate: errors.birthdate?.[0] || '',
            gender: errors.gender?.[0] || '',
            marital_status: errors.marital_status?.[0] || '',
            phone: errors.phone?.[0] || '',
            password: errors.password?.[0] || '',
            confirmPassword: ''
          });
        } else {
          setError(apiError.response?.data?.message || 'Error al crear el usuario');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Error al crear el usuario');
      }
    } finally {
      setCreatingUser(false);
    }
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
      
      // Si el usuario actual es admin, filtrar los super_admin
      if (currentUser?.role === 'admin') {
        allUsers = allUsers.filter(u => u.role !== 'super_admin');
      }
      
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

  const fadeInUp = "animate-fade-in";
  const stagger1 = "delay-[100ms]";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3 mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900 w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Header Section - Compact & Professional */}
      <div className="rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl relative overflow-hidden mt-2 sm:mt-3 lg:mt-4 border border-white/10" style={{
        background: 'linear-gradient(180deg, #1e3a5f 0%, #1a2f4f 50%, #0f1b2e 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/50 via-transparent to-indigo-900/30 animate-pulse"></div>

        {/* Minimal decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 via-indigo-500/5 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-cyan-600/8 to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

        {/* Subtle dots */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-12 left-16 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-32 w-1 h-1 bg-slate-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-5 lg:pt-6 pb-5 sm:pb-6 lg:pb-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
            <div className={`${fadeInUp} flex-1 min-w-0`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/15 backdrop-blur-xl text-white text-[9px] sm:text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-white/20 hover:bg-white/25 transition-all duration-300">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5 animate-pulse flex-shrink-0" />
                  <span className="hidden xs:inline">ADMINISTRADOR</span>
                  <span className="xs:hidden">ADMIN</span>
                </span>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight text-white mb-1 sm:mb-1.5 leading-tight drop-shadow-lg">
                Gestión de Usuarios
              </h1>
              <p className="text-blue-100 text-[10px] sm:text-[11px] md:text-xs lg:text-sm max-w-2xl font-medium leading-relaxed drop-shadow-md">
                Administra y gestiona todos los usuarios del sistema.
                <span className="hidden sm:inline text-blue-200/80"> Control completo de cuentas.</span>
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
              <button
                onClick={loadUsers}
                className="text-xs xs:text-sm font-bold rounded-lg px-3 xs:px-4 py-1.5 xs:py-2 transition-all hover:scale-105 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                Actualizar
              </button>
              <Button
                onClick={() => setShowAddUser(true)}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs xs:text-sm font-bold rounded-lg px-3 xs:px-4 py-1.5 xs:py-2 transition-all hover:scale-105 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                <span className="hidden xs:inline">Crear Usuario</span>
                <span className="xs:hidden">Crear</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="white" fillOpacity="0.08" />
            <path d="M0,20 C200,100 400,100 600,60 C800,20 1000,20 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity="0.04" />
          </svg>
        </div>
      </div>

      <div className="w-full -mt-4 relative z-20">
      <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
            >
              <option value="all">Todos los roles</option>
              <option value="psychologist">Psicólogos</option>
              <option value="admin">Administradores</option>
              <option value="student">Estudiantes</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="lg:col-span-4 flex flex-col gap-2.5 sm:gap-3">
          {paginatedUsers.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-sm sm:text-base font-semibold text-gray-500">No se encontraron usuarios</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Intenta ajustar los filtros de búsqueda</p>
            </Card>
          ) : (
            paginatedUsers.map((user) => {
              const UserAvatar = () => {
                const [imgError, setImgError] = React.useState(false);
                const avatarUrl = user.avatar || user.google_avatar;
                
                return (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-700 to-blue-300 rounded-full flex items-center justify-center text-sm sm:text-base font-bold flex-shrink-0 overflow-hidden relative">
                    {avatarUrl && !imgError ? (
                      <img
                        src={avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <span className="text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                );
              };

              return (
              <Card
                key={user.id}
                className={`p-2.5 sm:p-3 border rounded-xl shadow-sm border-blue-200 hover:border-blue-300 transition-all`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <UserAvatar />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{user.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mt-1">
                        <Badge className={`${getRoleBadgeColor(user.role)} text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5`}>{getRoleLabel(user.role)}</Badge>
                        {user.verified && (
                          <Badge variant="success" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">Verificado</Badge>
                        )}
                        <Badge variant={user.active ? "success" : "danger"} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                          {user.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 justify-end w-full sm:w-auto">
                    {/* Botones de acción - Solo iconos en móvil, con texto en pantallas más grandes */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {user.role !== 'student' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditUser(true);
                          }}
                          className="flex items-center justify-center border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold p-1.5 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs min-w-[32px] sm:min-w-auto"
                          title="Editar usuario"
                        >
                          <Edit className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 sm:mr-1" />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                      )}
                      {user.active ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeactivateModal(true);
                          }}
                          className="flex items-center justify-center border-orange-600 text-orange-600 hover:bg-orange-50 font-semibold p-1.5 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs min-w-[32px] sm:min-w-auto"
                          title="Desactivar usuario"
                        >
                          <UserX className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 sm:mr-1" />
                          <span className="hidden sm:inline">Desactivar</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowReactivateModal(true);
                          }}
                          className="flex items-center justify-center border-green-600 text-green-600 hover:bg-green-50 font-semibold p-1.5 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs min-w-[32px] sm:min-w-auto"
                          title="Reactivar usuario"
                        >
                          <UserCheck className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 sm:mr-1" />
                          <span className="hidden sm:inline">Reactivar</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        className="flex items-center justify-center border-red-600 text-red-600 hover:bg-red-50 font-semibold p-1.5 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs min-w-[32px] sm:min-w-auto"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
              );
            })
          )}
          {/* Paginación */}
          {users.length > usersPerPage && totalPages > 1 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-950 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-900 text-white/80 hover:bg-blue-950'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="text-gray-400 px-1">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-950 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          {currentUser && (
            <Card className="p-3 sm:p-4 border-2 border-blue-700 bg-blue-50 rounded-xl shadow-sm w-full mb-2 flex flex-col gap-2 items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-700 to-blue-300 rounded-full flex items-center justify-center text-2xl font-bold mb-4 overflow-hidden">
                <span className="text-white">{currentUser.name.charAt(0).toUpperCase()}</span>
              </div>
              <h3 className="font-bold text-lg text-blue-900 mb-2">{currentUser.name}</h3>
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
      {showEditUser && selectedUser && createPortal(
  <div 
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-500" 
    style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: '1rem',
      boxSizing: 'border-box',
      overflow: 'auto',
      zIndex: 9999
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowEditUser(false);
      }
    }}
  >
    <div 
      className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-xl w-full border border-gray-300 animate-fade-in-up max-h-[90vh] overflow-y-auto my-auto"
      onClick={(e) => e.stopPropagation()}
      style={{ margin: 'auto' }}
    >
      <div className="p-0">
        <div className="rounded-t-lg sm:rounded-t-xl mb-0 shadow-lg overflow-hidden relative" style={{
          background: 'linear-gradient(180deg, #0a0e17 0%, #020408 50%, #000000 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/50 via-transparent to-gray-900/30"></div>
          <div className="relative z-10 flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
            <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-wide drop-shadow-lg">Editar Usuario</h2>
            <button
              onClick={() => setShowEditUser(false)}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
          </div>
        </div>
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <form className="space-y-2.5 sm:space-y-3" onSubmit={(e) => {
            e.preventDefault();
            // Aquí iría la lógica para actualizar el usuario
            setShowEditUser(false);
          }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre completo <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={e => setSelectedUser({...selectedUser, name: e.target.value})}
                  className="w-full border rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  readOnly
                  className="w-full border rounded-md p-2 text-xs bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-2.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Celular <span className="text-red-600">*</span></label>
                <div className="flex items-center">
                  <span className="px-2 py-2 border border-gray-300 rounded-l-md bg-gray-100 text-gray-700 select-none text-xs h-[36px] flex items-center">+51</span>
                  <input
                    type="text"
                    value={selectedUser.phone ? selectedUser.phone.replace(/^\+?51/, '') : ''}
                    maxLength={9}
                    onChange={e => setSelectedUser({...selectedUser, phone: e.target.value.replace(/[^0-9]/g, '')})}
                    className="pl-2 w-full border-t border-b border-r border-gray-300 rounded-r-md bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-xs h-[36px]"
                    placeholder="987654321"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">País</label>
                <input
                  type="text"
                  value="Perú"
                  readOnly
                  className="w-full border rounded-md p-2 text-xs bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-3 mt-3 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditUser(false)}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200 text-xs py-2"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-md transition-all duration-200 text-xs py-2"
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  , document.body
)}
      {showAddUser && createPortal(
  <div 
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-500" 
    style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: '1rem',
      boxSizing: 'border-box',
      overflow: 'auto',
      zIndex: 9999
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowAddUser(false);
        resetAddUserForm();
      }
    }}
  >
    <div 
      className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-xl w-full border border-gray-300 animate-fade-in-up max-h-[90vh] overflow-y-auto my-auto"
      onClick={(e) => e.stopPropagation()}
      style={{ margin: 'auto' }}
    >
      <div className="p-0">
        <div className="rounded-t-lg sm:rounded-t-xl mb-0 shadow-lg overflow-hidden relative" style={{
          background: 'linear-gradient(180deg, #0a0e17 0%, #020408 50%, #000000 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/50 via-transparent to-gray-900/30"></div>
          <div className="relative z-10 flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
            <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-wide drop-shadow-lg">Crear Nuevo Usuario</h2>
            <button
              onClick={() => {
                setShowAddUser(false);
                resetAddUserForm();
              }}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
          </div>
        </div>
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          {/* Mensajes de estado */}
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-md p-2.5 shadow-sm flex items-center space-x-2.5 animate-fade-in">
              <div className="bg-red-500 p-1.5 rounded-md">
                <AlertCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h4 className="text-red-900 font-medium text-xs mb-0.5">Error</h4>
                <p className="text-red-800 text-xs">{error}</p>
              </div>
            </div>
          )}


          <form className="space-y-2.5 sm:space-y-3" onSubmit={handleCreateUser}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre completo <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={addUserForm.name}
                  onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
                  className="w-full border rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-600">*</span></label>
                <input
                  type="email"
                  value={addUserForm.email}
                  onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                  className="w-full border rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-2.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rol <span className="text-red-600">*</span></label>
                <select
                  value="psychologist"
                  disabled
                  className="w-full border rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all bg-gray-100 text-gray-700 cursor-not-allowed"
                >
                  <option value="psychologist">Psicólogo</option>
                </select>
              </div>
              <div className="relative" style={{ overflow: 'visible' }}>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estado Civil <span className="text-red-600">*</span></label>
                <CustomSelect
                  value={addUserForm.marital_status}
                  onChange={(value) => setAddUserForm({ ...addUserForm, marital_status: value })}
                  options={[
                    { value: 'soltero', label: 'Soltero/a' },
                    { value: 'casado', label: 'Casado/a' },
                    { value: 'divorciado', label: 'Divorciado/a' },
                    { value: 'viudo', label: 'Viudo/a' },
                    { value: 'conviviente', label: 'Conviviente' }
                  ]}
                  placeholder="Seleccionar estado civil"
                  focusColor="blue"
                />
                {addUserFieldErrors.marital_status && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-800 text-xs font-semibold">{addUserFieldErrors.marital_status}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 mt-2.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">DNI <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={addUserForm.dni}
                  onChange={(e) => setAddUserForm({ ...addUserForm, dni: e.target.value.replace(/[^0-9]/g, '') })}
                  maxLength={8}
                  className="w-full border rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha de nacimiento <span className="text-red-600">*</span></label>
                <input
                  type="date"
                  value={addUserForm.birthdate}
                  onChange={(e) => setAddUserForm({ ...addUserForm, birthdate: e.target.value })}
                  className="w-full border rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
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
              <div className="relative" style={{ overflow: 'visible' }}>
                <label className="block text-xs font-medium text-gray-700 mb-1">Género <span className="text-red-600">*</span></label>
                <CustomSelect
                  value={addUserForm.gender}
                  onChange={(value) => setAddUserForm({ ...addUserForm, gender: value })}
                  options={[
                    { value: 'masculino', label: 'Masculino' },
                    { value: 'femenino', label: 'Femenino' },
                    { value: 'otro', label: 'Otro' }
                  ]}
                  placeholder="Seleccionar género"
                  focusColor="blue"
                />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-2.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Celular <span className="text-red-600">*</span></label>
                <div className="flex items-center">
                  <span className="px-2 py-2 border border-gray-300 rounded-l-md bg-gray-100 text-gray-700 select-none text-xs h-[36px] flex items-center">+51</span>
                  <input
                    type="text"
                    value={addUserForm.phone}
                    onChange={(e) => setAddUserForm({ ...addUserForm, phone: e.target.value.replace(/[^0-9]/g, '').substring(0, 9) })}
                    maxLength={9}
                    className="pl-2 w-full border-t border-b border-r border-gray-300 rounded-r-md bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-xs h-[36px]"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Especialización</label>
                <input
                  type="text"
                  value={addUserForm.specialization}
                  onChange={(e) => setAddUserForm({ ...addUserForm, specialization: e.target.value })}
                  className="w-full border rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                  placeholder="Ej: Psicología Clínica"
                />
              </div>
            </div>
            <div className="mt-2.5">
              <label className="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                value={addUserForm.address}
                onChange={(e) => setAddUserForm({ ...addUserForm, address: e.target.value })}
                className="w-full border rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                placeholder="Ej: Av. Principal 123, Lima"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-2.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña <span className="text-red-600">*</span></label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={addUserForm.password}
                    onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                    className="w-full border rounded-md p-2 pr-9 text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                    placeholder="Mín. 8 caracteres, mayúscula, número y símbolo"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirmar Contraseña <span className="text-red-600">*</span></label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={addUserForm.confirmPassword}
                    onChange={(e) => setAddUserForm({ ...addUserForm, confirmPassword: e.target.value })}
                    className="w-full border rounded-md p-2 pr-9 text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                    placeholder="Repite la contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
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
            <div className="flex flex-col sm:flex-row gap-2 pt-3 mt-3 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddUser(false);
                  resetAddUserForm();
                }}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200 text-xs py-2"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={creatingUser}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-md transition-all duration-200 text-xs py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingUser ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
    </div>
  </div>
  , document.body
)}
      {/* Modal de Desactivar Usuario */}
      {showDeactivateModal && selectedUser && createPortal(
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-500" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: '1rem',
            boxSizing: 'border-box',
            overflow: 'auto',
            zIndex: 9999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeactivateModal(false);
              setDeactivateReason('');
            }
          }}
        >
          <div 
            className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-md w-full border border-gray-300 animate-fade-in-up max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ margin: 'auto' }}
          >
            <div className="p-0">
              <div className="rounded-t-lg sm:rounded-t-xl mb-0 shadow-lg overflow-hidden relative" style={{
                background: 'linear-gradient(180deg, #0a0e17 0%, #020408 50%, #000000 100%)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)'
              }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/50 via-transparent to-gray-900/30"></div>
                <div className="relative z-10 flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
                  <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-wide drop-shadow-lg">Desactivar Usuario</h2>
                  <button
                    onClick={() => {
                      setShowDeactivateModal(false);
                      setDeactivateReason('');
                    }}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="px-3 sm:px-4 py-3 sm:py-4">
                <div className="mb-3">
                  <p className="text-xs text-gray-700 mb-3">
                    ¿Estás seguro de que deseas desactivar al usuario <span className="font-semibold">{selectedUser.name}</span>?
                  </p>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Motivo de desactivación <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={deactivateReason}
                    onChange={(e) => setDeactivateReason(e.target.value)}
                    className="w-full border rounded-md p-2 text-xs focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-all resize-none"
                    rows={4}
                    placeholder="Ingresa el motivo de desactivación..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDeactivateModal(false);
                      setDeactivateReason('');
                    }}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200 text-xs py-2"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!deactivateReason.trim()) {
                        setError('El motivo de desactivación es obligatorio');
                        return;
                      }
                      try {
                        await deactivateUser(parseInt(selectedUser.id), deactivateReason);
                        setSuccess('Usuario desactivado exitosamente');
                        setShowDeactivateModal(false);
                        setDeactivateReason('');
                        await loadUsers();
                        setTimeout(() => setSuccess(null), 3000);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Error al desactivar el usuario');
                      }
                    }}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md transition-all duration-200 text-xs py-2"
                  >
                    Desactivar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        , document.body
      )}
      {/* Modal de Reactivar Usuario */}
      {showReactivateModal && selectedUser && createPortal(
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-500" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: '1rem',
            boxSizing: 'border-box',
            overflow: 'auto',
            zIndex: 9999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReactivateModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-md w-full border border-gray-300 animate-fade-in-up max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ margin: 'auto' }}
          >
            <div className="p-0">
              <div className="rounded-t-lg sm:rounded-t-xl mb-0 shadow-lg overflow-hidden relative" style={{
                background: 'linear-gradient(180deg, #0a0e17 0%, #020408 50%, #000000 100%)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)'
              }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/50 via-transparent to-gray-900/30"></div>
                <div className="relative z-10 flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
                  <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-wide drop-shadow-lg">Reactivar Usuario</h2>
                  <button
                    onClick={() => setShowReactivateModal(false)}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="px-3 sm:px-4 py-3 sm:py-4">
                <div className="mb-3">
                  <p className="text-xs text-gray-700">
                    ¿Estás seguro de que deseas reactivar al usuario <span className="font-semibold">{selectedUser.name}</span>?
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReactivateModal(false)}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200 text-xs py-2"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={async () => {
                      try {
                        await reactivateUser(parseInt(selectedUser.id));
                        setSuccess('Usuario reactivado exitosamente');
                        setShowReactivateModal(false);
                        await loadUsers();
                        setTimeout(() => setSuccess(null), 3000);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Error al reactivar el usuario');
                      }
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold shadow-md transition-all duration-200 text-xs py-2"
                  >
                    Reactivar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        , document.body
      )}
      {/* Modal de Eliminar Usuario */}
      {showDeleteModal && selectedUser && createPortal(
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-500" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: '1rem',
            boxSizing: 'border-box',
            overflow: 'auto',
            zIndex: 9999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-md w-full border border-gray-300 animate-fade-in-up max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ margin: 'auto' }}
          >
            <div className="p-0">
              <div className="rounded-t-lg sm:rounded-t-xl mb-0 shadow-lg overflow-hidden relative" style={{
                background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 50%, #dc2626 100%)',
                boxShadow: '0 4px 20px rgba(220, 38, 38, 0.6)'
              }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-red-900/50 via-transparent to-red-800/30"></div>
                <div className="relative z-10 flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
                  <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-wide drop-shadow-lg">Eliminar Usuario</h2>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="px-3 sm:px-4 py-3 sm:py-4">
                <div className="mb-3">
                  <p className="text-xs text-gray-700 mb-2">
                    ¿Estás seguro de que deseas eliminar permanentemente al usuario <span className="font-semibold">{selectedUser.name}</span>?
                  </p>
                  <p className="text-xs text-red-600 font-medium">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200 text-xs py-2"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={async () => {
                      try {
                        await deleteUser(parseInt(selectedUser.id));
                        setSuccess('Usuario eliminado exitosamente');
                        setShowDeleteModal(false);
                        await loadUsers();
                        setTimeout(() => setSuccess(null), 3000);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Error al eliminar el usuario');
                      }
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold shadow-md transition-all duration-200 text-xs py-2"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        , document.body
      )}
      {success && createPortal(
        <div className="fixed top-2 xs:top-4 right-2 xs:right-4 z-[10001] animate-fade-in w-[calc(100%-1rem)] xs:w-auto max-w-md" style={{ zIndex: 10001 }}>
          <div className={`px-3 xs:px-4 sm:px-5 py-3 xs:py-4 rounded-xl xs:rounded-2xl shadow-2xl flex items-center gap-2 xs:gap-3 min-w-0 xs:min-w-[280px] sm:min-w-[320px] backdrop-blur-sm ${
            success.includes('Error') || success.includes('error')
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-2 border-red-400'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-green-400'
          }`}>
            {success.includes('Error') || success.includes('error') ? (
              <AlertCircle className="w-5 h-5 xs:w-6 xs:h-6 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 xs:w-6 xs:h-6 flex-shrink-0" />
            )}
            <span className="flex-1 font-semibold text-xs xs:text-sm leading-relaxed break-words">{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="text-white/90 hover:text-white hover:bg-white/20 rounded-lg p-1 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 xs:w-5 xs:h-5" />
            </button>
          </div>
        </div>,
        document.body
      )}
      </div>
      </div>
    </div>
  );
}