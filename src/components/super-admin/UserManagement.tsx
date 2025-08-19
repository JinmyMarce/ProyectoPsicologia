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
  Search,
  Filter,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext'; // Not used currently

interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'psychologist' | 'admin' | 'super_admin' | 'tutor';
  verified: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  specialization?: string;
  career?: string;
  semester?: number | string; // Puede ser number para estudiantes o string para tutores
  dni?: string; // Added dni to User interface
  phone?: string; // Añadido para evitar error de linter
  birthdate?: string; // Añadido para evitar error de linter
  gender?: string; // Añadido para evitar error de linter
  avatar?: string; // <-- Soporte para avatar
  // Campos específicos para tutores
  classroom?: string;
  study_program?: string;
  course?: string;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dni: string;
  phone: string;
  role: 'psychologist' | 'admin' | 'tutor';
  specialization?: string;
  birthdate?: string; // Added birthdate
  gender?: string; // Added gender
  avatar?: string; // <-- Soporte para avatar
  // Campos específicos para tutores
  classroom?: string;
  study_program?: string;
  semester?: string;
  course?: string;
}

export function UserManagement() {
  // const { user: currentUser } = useAuth(); // Commented out as not used
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
    phone: '',
    role: 'psychologist'
  });

  // Estados para el modal de restablecimiento de contraseña
  const [resetEmail, setResetEmail] = useState('');
  
  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estado para errores de validación
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [dniError, setDniError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [specializationError, setSpecializationError] = useState<string | null>(null);
  const [birthdateError, setBirthdateError] = useState<string | null>(null); // Added birthdateError
  const [genderError, setGenderError] = useState<string | null>(null); // Added genderError

  // Modal de desactivación
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);

  // Estado para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserData, setEditUserData] = useState<CreateUserData | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  // Estado para el avatar mostrado en la tarjeta lateral (solo frontend)
  const [superAdminAvatar, setSuperAdminAvatar] = useState<string | undefined>(undefined);
  // Estado para mostrar el modal de advertencia por .ico
  const [showIcoWarning, setShowIcoWarning] = useState(false);
  const [avatarPreviewError, setAvatarPreviewError] = useState(false);

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
    let hasError = false;

    if (!createUserData.name.trim()) {
      setNameError('El nombre completo es obligatorio');
      hasError = true;
    } else {
      setNameError(null);
    }

    if (!/^\S+@\S+\.\S+$/.test(createUserData.email)) {
      setEmailError('El correo debe tener un formato válido');
      hasError = true;
    } else {
      const allowedDomains = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com'];
      if (!allowedDomains.some(domain => createUserData.email.endsWith(domain))) {
        setEmailError('El correo debe ser @gmail.com, @hotmail.com, @outlook.com o @yahoo.com');
        hasError = true;
      } else {
        setEmailError(null);
      }
    }

    if (!/^\d{8}$/.test(createUserData.dni)) {
      setDniError('El DNI debe ser numérico y tener 8 dígitos');
      hasError = true;
    } else {
      setDniError(null);
    }

    // LIMPIEZA EXTRA antes de validar y enviar
    const cleanPhone = createUserData.phone.replace(/[^0-9]/g, '').trim();
    if (!/^9\d{8}$/.test(cleanPhone)) {
      setPhoneError('El número debe empezar en 9 y tener 9 dígitos');
      hasError = true;
    } else {
      setPhoneError(null);
    }

    if (createUserData.role === 'psychologist' && createUserData.specialization && !createUserData.specialization.trim()) {
      setSpecializationError('Si se ingresa especialización, no puede estar vacía');
      hasError = true;
    } else {
      setSpecializationError(null);
    }

    if (createUserData.password !== createUserData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      hasError = true;
    } else if (createUserData.password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (!createUserData.birthdate) {
      setBirthdateError('La fecha de nacimiento es obligatoria');
      hasError = true;
    } else {
      const birthDate = new Date(createUserData.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      const day = today.getDate() - birthDate.getDate();
      const isBirthdayPassed = m > 0 || (m === 0 && day >= 0);
      const realAge = isBirthdayPassed ? age : age - 1;
      if (realAge < 21) {
        setBirthdateError('El usuario debe tener más de 20 años de edad');
        hasError = true;
      } else {
        setBirthdateError(null);
      }
    }

    if (!createUserData.gender) {
      setGenderError('El género es obligatorio');
      hasError = true;
    } else {
      setGenderError(null);
    }

    if (emailExists) {
      setEmailError('Este correo ya está registrado. Usa uno diferente.');
      hasError = true;
    }

    if (hasError) return;

    try {
      // Siempre enviar el número en formato +51 + 9 dígitos, limpio
      const phoneToSend = `+51${cleanPhone}`;
      const response = await fetch('http://localhost:8000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: createUserData.name.trim(),
          email: createUserData.email.trim(),
          password: createUserData.password,
          dni: createUserData.dni.trim(),
          phone: phoneToSend,
          role: createUserData.role,
          specialization: createUserData.specialization?.trim() || '',
          verified: true,
          birthdate: createUserData.birthdate, // Add birthdate
          gender: createUserData.gender, // Add gender
          // Campos específicos para tutores
          ...(createUserData.role === 'tutor' && {
            classroom: createUserData.classroom?.trim() || '',
            study_program: createUserData.study_program?.trim() || '',
            semester: createUserData.semester?.trim() || '',
            course: createUserData.course?.trim() || 'Tutoría'
          })
        })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Error al crear usuario';
        let errorData = null;
        if (contentType && contentType.includes('application/json')) {
          try {
            errorData = await response.json();
            errorMessage = errorData.message || errorData.error || 'Error al crear usuario';
          } catch (jsonError) {
            errorMessage = `Error del servidor (${response.status})`;
          }
        } else {
          errorMessage = `Error del servidor (${response.status}): Respuesta no válida`;
        }
        // Si hay errores de validación del backend, asignar a los campos
        if (response.status === 422 && errorData && errorData.errors) {
          // Limpiar errores anteriores
          setNameError(null);
          setEmailError(null);
          setPasswordError(null);
          setDniError(null);
          setPhoneError(null);
          setSpecializationError(null);
          setBirthdateError(null);
          setGenderError(null);
          // Asignar errores del backend
          if (errorData.errors.name) setNameError(errorData.errors.name[0]);
          if (errorData.errors.email) setEmailError(errorData.errors.email[0]);
          if (errorData.errors.password) setPasswordError(errorData.errors.password[0]);
          if (errorData.errors.dni) setDniError(errorData.errors.dni[0]);
          if (errorData.errors.phone) setPhoneError(errorData.errors.phone[0]); // Mostrar mensaje exacto del backend
          if (errorData.errors.specialization) setSpecializationError(errorData.errors.specialization[0]);
          if (errorData.errors.birthdate) setBirthdateError(errorData.errors.birthdate[0]);
          if (errorData.errors.gender) setGenderError(errorData.errors.gender[0]);
          return;
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
        phone: '',
        role: 'psychologist'
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
      setSuccessMessage('Usuario creado exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      // Limpiar errores de campos antes de mostrar error general
      setNameError(null);
      setEmailError(null);
      setPasswordError(null);
      setDniError(null);
      setPhoneError(null);
      setSpecializationError(null);
      setBirthdateError(null);
      setGenderError(null);
      // En el catch de handleCreateUser, si el error es de validación de specialization, mostrarlo igual que los otros campos obligatorios
      if (error.message && error.message.toLowerCase().includes('specialization')) {
        setSpecializationError(error.message);
      } else if (error.message && error.message.toLowerCase().includes('phone')) {
        setPhoneError(error.message);
      } else {
        setError(error.message);
      }
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

  // const handleVerifyUser = async (userId: number) => {
  //   try {
  //     const response = await fetch(`http://localhost:8000/api/users/${userId}/verify`, {
  //       method: 'PATCH',
  //       headers: {
  //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });
  //     if (!response.ok) {
  //       throw new Error('Error al verificar usuario');
  //     }
  //     setSuccessMessage('Usuario verificado exitosamente');
  //     fetchUsers();
  //   } catch (error: any) {
  //     setError(error.message);
  //   }
  // };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-granate-200 text-granate-900';
      case 'admin':
        return 'bg-granate-100 text-granate-800';
      case 'psychologist':
        return 'bg-azul-oscuro-100 text-azul-oscuro-800';
      case 'tutor':
        return 'bg-azul-marino-100 text-azul-marino-800';
      case 'student':
        return 'bg-verde-esmeralda/20 text-verde-oscuro';
      default:
        return 'bg-gris-claro text-gris-oscuro';
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
      case 'tutor':
        return 'Tutor';
      case 'student':
        return 'Estudiante';
      default:
        return role;
    }
  };

  const filteredUsers = users.filter(user => {
    const isAllowedRole = user.role === 'psychologist' || user.role === 'admin' || user.role === 'super_admin' || user.role === 'tutor';
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

  const handleEditUser = async () => {
    if (!editUserData || !userToEdit) return;

    // Si es super admin, solo validar y enviar nombre y celular en formato +519XXXXXXXX
    if (userToEdit.role === 'super_admin') {
      // El backend espera solo 9 dígitos para phone en el update
      const phoneToSend = editUserData.phone.replace(/^\+?51/, '');
      if (!/^9\d{8}$/.test(phoneToSend)) {
        setPhoneError('El número debe tener 9 dígitos y empezar en 9');
        return;
      }
      setPhoneError(null);
      try {
        const response = await fetch(`http://localhost:8000/api/users/${userToEdit.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: editUserData.name,
            phone: phoneToSend
          })
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar usuario');
        }
        setShowEditModal(false);
        setEditUserData(null);
        setUserToEdit(null);
        setEditAvatarFile(null);
        setEditAvatarPreview(null);
        setSuccessMessage('Usuario actualizado exitosamente');
        fetchUsers();
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error: any) {
        if (error.message && error.message.toLowerCase().includes('phone')) {
          setPhoneError(error.message);
        } else {
          setError(error.message);
        }
      }
      return;
    }

    // Validaciones locales (puedes agregar más si lo deseas)
    if (!/^9\d{8}$/.test(editUserData.phone)) {
      setPhoneError('El número debe empezar en 9 y tener 9 dígitos');
      return;
    }
    setPhoneError(null);

    if (editUserData.role === 'psychologist' && (!editUserData.specialization || editUserData.specialization.trim() === '')) {
      setSpecializationError('La especialización es obligatoria para psicólogos');
      return;
    }
    setSpecializationError(null);

    try {
      // Siempre enviar el número en formato +51 + 9 dígitos
      const phoneToSend = `+51${editUserData.phone}`;
      const response = await fetch(`http://localhost:8000/api/users/${userToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editUserData.name,
          email: editUserData.email,
          dni: editUserData.dni,
          phone: phoneToSend,
          role: editUserData.role,
          specialization: editUserData.specialization,
          birthdate: editUserData.birthdate, // Add birthdate
          gender: editUserData.gender // Add gender
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar usuario');
      }
      setShowEditModal(false);
      setEditUserData(null);
      setUserToEdit(null);
      setSuccessMessage('Usuario actualizado exitosamente');
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      if (error.message && error.message.toLowerCase().includes('phone')) {
        setPhoneError(error.message);
      } else if (error.message && error.message.toLowerCase().includes('specialization')) {
        setSpecializationError(error.message);
      } else {
        setError(error.message);
      }
    }
  };

  // Ordenar usuarios: solo admins y psicólogos, el super admin solo en la tarjeta lateral
  const orderedUsers = filteredUsers.filter(u => u.role !== 'super_admin');
  const superAdmin = filteredUsers.find(u => u.role === 'super_admin');

  // En la tarjeta lateral del super admin, usa la URL absoluta si es relativa
  const avatarUrl = superAdminAvatar
    ? (superAdminAvatar.startsWith('/') ? `http://localhost:8000${superAdminAvatar}` : superAdminAvatar)
    : (superAdmin?.avatar && superAdmin.avatar.startsWith('/') ? `http://localhost:8000${superAdmin.avatar}` : superAdmin?.avatar);

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
            setCreateUserData({
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
              dni: '',
              phone: '',
              role: 'psychologist',
              specialization: '',
              birthdate: '',
              gender: '',
              // Campos específicos para tutores
              classroom: '',
              study_program: '',
              semester: '',
              course: ''
            });
            setPasswordError(null);
            setShowPassword(false);
            setShowConfirmPassword(false);
            setDniError(null);
            setPhoneError(null);
            setSpecializationError(null);
            setBirthdateError(null); // Reset birthdate error
            setGenderError(null); // Reset gender error
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
            >
              <option value="all">Todos los roles</option>
              <option value="psychologist">Psicólogos</option>
              <option value="admin">Administradores</option>
              <option value="tutor">Tutores</option>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-4 flex flex-col gap-3">
          {orderedUsers.map((user) => (
            <Card
              key={user.id}
              className={`p-2 border rounded-xl flex items-center justify-between shadow-sm ${user.role === 'super_admin' ? 'border-purple-700 bg-purple-50' : 'border-[#8e161a]'}`}
            >
              <div className="flex items-center space-x-2 w-full">
                <div className={`w-10 h-10 bg-gradient-to-br from-[#8e161a] to-[#d3b7a0] rounded-full flex items-center justify-center text-base font-bold ${user.role === 'super_admin' ? 'bg-purple-700 text-white' : ''}`}>
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
                          phone: user.phone ? user.phone.replace(/^\+51/, '') : '',
                          role: user.role as 'psychologist' | 'admin',
                          specialization: user.specialization || '',
                          birthdate: user.birthdate || '', // Set birthdate
                          gender: user.gender || '' // Set gender
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
        {/* Columna lateral del Super Admin */}
        <div className="md:col-span-1">
          {superAdmin && (
            <Card className="p-4 border-2 border-purple-700 bg-purple-50 rounded-xl shadow-sm w-full mb-2 flex flex-col gap-2 items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-700 to-purple-300 rounded-full flex items-center justify-center text-2xl font-bold mb-4 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-white">{superAdmin.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h3 className="font-bold text-lg text-purple-900 mb-2">{superAdmin.name}</h3>
              <p className="text-xs text-gray-700 mb-2">{superAdmin.email}</p>
              <p className="text-xs text-gray-700 mb-2 flex items-center justify-center"><span className="font-semibold mr-1">Celular:</span> {superAdmin.phone}</p>
              <div className="flex flex-wrap items-center justify-center gap-2 my-2">
                <Badge className="bg-purple-200 text-purple-800 text-xs px-2 py-0.5">Super Admin</Badge>
                {superAdmin.verified && <Badge variant="success" className="text-xs px-2 py-0.5">Verificado</Badge>}
                <Badge variant={superAdmin.active ? "success" : "danger"} className="text-xs px-2 py-0.5">
                  {superAdmin.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-2">Registrado: {new Date(superAdmin.created_at).toLocaleDateString()}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-purple-700 text-purple-700 hover:bg-purple-100 font-semibold px-3 py-1 text-xs"
                onClick={() => {
                  setUserToEdit(superAdmin);
                  setEditUserData({
                    name: superAdmin.name,
                    email: superAdmin.email, // Solo para mantener la estructura, no editable
                    password: '',
                    confirmPassword: '',
                    dni: superAdmin.dni || '',
                    phone: superAdmin.phone ? superAdmin.phone.replace(/^\+51/, '') : '',
                    role: 'admin', // casteo correcto
                    specialization: '',
                    birthdate: '',
                    gender: '',
                    avatar: superAdmin.avatar || ''
                  });
                  setEditAvatarFile(null);
                  setEditAvatarPreview(superAdmin.avatar || null);
                  setSuperAdminAvatar(superAdmin.avatar || undefined);
                  setShowEditModal(true);
                }}
              >
                <Edit className="w-4 h-4 mr-1" /> Editar
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de creación de usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-all duration-500">
            <div className="bg-white rounded-2xl shadow-lg max-w-3xl w-full mx-4 border border-gray-200 animate-fade-in-up">
              <div className="p-0">
                <div className="rounded-t-2xl mb-0 shadow-md overflow-hidden border-b-4 border-[#8e161a]" style={{background: 'linear-gradient(90deg, #6b1115 0%, #8e161a 100%)'}}>
                 <h2 className="text-2xl font-extrabold text-white tracking-wide text-center py-6">Crear Nuevo Usuario</h2>
                </div>
                <div className="px-8 py-8 max-h-[80vh] overflow-y-auto">
                  <form onSubmit={handleCreateUser} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo <span className="text-red-600">*</span></label>
                        <input
                          type="text"
                          value={createUserData.name}
                          onChange={e => setCreateUserData(prev => ({ ...prev, name: e.target.value }))}
                          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all ${nameError ? 'border-red-500 bg-red-50' : ''}`}
                        />
                        {nameError && <div className="text-xs text-red-500 mt-1">{nameError}</div>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-600">*</span></label>
                        <input
                          type="text"
                          value={createUserData.email}
                          onChange={e => setCreateUserData(prev => ({ ...prev, email: e.target.value }))}
                          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all ${emailError ? 'border-red-500 bg-red-50' : ''}`}
                        />
                        {emailError && <div className="text-xs text-red-500 mt-1">{emailError}</div>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">DNI <span className="text-red-600">*</span></label>
                        <input
                          type="text"
                          value={createUserData.dni}
                          maxLength={8}
                          onChange={e => setCreateUserData(prev => ({ ...prev, dni: e.target.value.replace(/[^0-9]/g, '') }))}
                          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all ${dniError ? 'border-red-500 bg-red-50' : ''}`}
                        />
                        {dniError && <div className="text-xs text-red-500 mt-1">{dniError}</div>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento <span className="text-red-600">*</span></label>
                        <input
                          type="date"
                          value={createUserData.birthdate || ''}
                          onChange={e => setCreateUserData(prev => ({ ...prev, birthdate: e.target.value }))}
                          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all ${birthdateError ? 'border-red-500 bg-red-50' : ''}`}
                        />
                        {birthdateError && <div className="text-xs text-red-500 mt-1">{birthdateError}</div>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Género <span className="text-red-600">*</span></label>
                        <select
                          value={createUserData.gender || ''}
                          onChange={e => setCreateUserData(prev => ({ ...prev, gender: e.target.value }))}
                          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all ${genderError ? 'border-red-500 bg-red-50' : ''}`}
                        >
                          <option value="">Seleccionar género</option>
                          <option value="masculino">Masculino</option>
                          <option value="femenino">Femenino</option>
                          <option value="otro">Otro</option>
                        </select>
                        {genderError && <div className="text-xs text-red-500 mt-1">{genderError}</div>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Celular <span className="text-red-600">*</span></label>
                        <div className="flex items-center">
                          <span className="px-3 py-3 border border-gray-300 rounded-l-lg bg-gray-100 text-gray-700 select-none text-base h-[48px] flex items-center">+51</span>
                          <input
                            type="text"
                            value={createUserData.phone}
                            maxLength={9}
                            onChange={e => setCreateUserData(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '') }))}
                            className={`pl-3 w-full border-t border-b border-r border-gray-300 rounded-r-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all text-base h-[48px] ${phoneError ? 'border-red-500 bg-red-50' : ''}`}
                            placeholder="987654321"
                          />
                        </div>
                        {phoneError && <div className="text-xs text-red-500 mt-1">{phoneError}</div>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol <span className="text-red-600">*</span></label>
                        <select
                          value={createUserData.role}
                          onChange={e => setCreateUserData(prev => ({ 
                            ...prev, 
                            role: e.target.value as 'psychologist' | 'admin' | 'tutor',
                            course: e.target.value === 'tutor' ? 'Tutoría' : prev.course
                          }))}
                          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800 transition-all"
                        >
                          <option value="psychologist">Psicólogo</option>
                          <option value="admin">Administrador</option>
                          <option value="tutor">Tutor</option>
                        </select>
                      </div>
                      {createUserData.role === 'psychologist' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Especialización</label>
                          <input
                            type="text"
                            value={createUserData.specialization || ''}
                            onChange={e => setCreateUserData(prev => ({ ...prev, specialization: e.target.value }))}
                            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800 transition-all ${specializationError ? 'border-red-500 bg-red-50' : ''}`}
                            placeholder="Ej: Psicología Clínica"
                          />
                          {specializationError && <div className="text-xs text-red-500 mt-1">{specializationError}</div>}
                        </div>
                      )}
                      
                      {createUserData.role === 'tutor' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Aula/Salón <span className="text-red-600">*</span></label>
                            <input
                              type="text"
                              value={createUserData.classroom || ''}
                              onChange={e => setCreateUserData(prev => ({ ...prev, classroom: e.target.value }))}
                              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800 transition-all"
                              placeholder="Ej: A-101, B-205"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Programa de Estudios <span className="text-red-600">*</span></label>
                            <select
                              value={createUserData.study_program || ''}
                              onChange={e => setCreateUserData(prev => ({ ...prev, study_program: e.target.value }))}
                              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800 transition-all"
                            >
                              <option value="">Seleccionar programa</option>
                              <option value="Administración de Servicios de Hostelería y Restaurantes">Administración de Servicios de Hostelería y Restaurantes</option>
                              <option value="Contabilidad">Contabilidad</option>
                              <option value="Desarrollo de Sistemas de Información">Desarrollo de Sistemas de Información</option>
                              <option value="Electricidad Industrial">Electricidad Industrial</option>
                              <option value="Electrónica Industrial">Electrónica Industrial</option>
                              <option value="Enfermería Técnica">Enfermería Técnica</option>
                              <option value="Guía Oficial de Turismo">Guía Oficial de Turismo</option>
                              <option value="Laboratorio Clínico y Anatomía Patológica">Laboratorio Clínico y Anatomía Patológica</option>
                              <option value="Mecánica Automotriz">Mecánica Automotriz</option>
                              <option value="Mecánica de Producción Industrial">Mecánica de Producción Industrial</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
                            <select
                              value={createUserData.semester || ''}
                              onChange={e => setCreateUserData(prev => ({ ...prev, semester: e.target.value }))}
                              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800 transition-all"
                            >
                              <option value="">Seleccionar semestre</option>
                              {(() => {
                                const currentDate = new Date();
                                const currentMonth = currentDate.getMonth() + 1;
                                // Abril a Julio (meses 4-7): Semestres 1, 3, 5
                                // Agosto a Diciembre (meses 8-12): Semestres 2, 4, 6
                                if (currentMonth >= 4 && currentMonth <= 7) {
                                  return [
                                    <option key="1" value="1">1er Semestre</option>,
                                    <option key="3" value="3">3er Semestre</option>,
                                    <option key="5" value="5">5to Semestre</option>
                                  ];
                                } else {
                                  return [
                                    <option key="2" value="2">2do Semestre</option>,
                                    <option key="4" value="4">4to Semestre</option>,
                                    <option key="6" value="6">6to Semestre</option>
                                  ];
                                }
                              })()}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Curso/Materia</label>
                            <input
                              type="text"
                              value={createUserData.course || 'Tutoría'}
                              onChange={e => setCreateUserData(prev => ({ ...prev, course: e.target.value }))}
                              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800 transition-all bg-gray-100 text-gray-700"
                              placeholder="Tutoría"
                              readOnly
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña <span className="text-red-600">*</span></label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={createUserData.password}
                            onChange={e => setCreateUserData(prev => ({ ...prev, password: e.target.value }))}
                            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all pr-10 ${passwordError ? 'border-red-500 bg-red-50' : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {passwordError && <div className="text-xs text-red-500 mt-1">{passwordError}</div>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña <span className="text-red-600">*</span></label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={createUserData.confirmPassword}
                            onChange={e => setCreateUserData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all pr-10"
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
                    </div>
                      <div className="flex space-x-3 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowCreateModal(false);
                            setCreateUserData({
                              name: '',
                              email: '',
                              password: '',
                              confirmPassword: '',
                              dni: '',
                              phone: '',
                              role: 'psychologist',
                              specialization: '',
                              birthdate: '',
                              gender: ''
                            });
                            setPasswordError(null);
                            setShowPassword(false);
                            setShowConfirmPassword(false);
                            setDniError(null);
                            setPhoneError(null);
                            setSpecializationError(null);
                            setBirthdateError(null); // Reset birthdate error
                            setGenderError(null); // Reset gender error
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
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
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
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all min-h-[80px] resize-none"
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
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-2 border border-gray-200 animate-fade-in-up">
            <div className="p-0">
              <div className="rounded-t-2xl mb-0 shadow-md overflow-hidden border-b-4 border-[#8e161a]" style={{background: 'linear-gradient(90deg, #6b1115 0%, #8e161a 100%)'}}>
                <h2 className="text-xl font-extrabold text-white tracking-wide text-center py-4">Editar Usuario</h2>
              </div>
              <div className="px-4 py-4 max-h-[70vh] overflow-y-auto">
                <form className="flex flex-col gap-4 items-center w-full">
                  <div className="w-full max-w-xs space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nombre completo <span className="text-red-600">*</span></label>
                      <input
                        type="text"
                        value={editUserData.name}
                        onChange={e => setEditUserData(prev => prev ? {...prev, name: e.target.value} : null)}
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Correo electrónico</label>
                      <input
                        type="email"
                        value={editUserData.email}
                        readOnly
                        className="w-full border rounded-lg p-2 bg-gray-100 text-gray-700 text-sm cursor-not-allowed"
                      />
                    </div>
                    {/* En el modal, país y celular juntos en la misma fila */}
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
                            value={editUserData.phone}
                            maxLength={9}
                            onChange={e => setEditUserData(prev => prev ? { ...prev, phone: e.target.value.replace(/[^0-9]/g, '') } : null)}
                            className="pl-2 w-full border-t border-b border-r border-gray-300 rounded-r-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-sm h-[36px]"
                            placeholder="987654321"
                          />
                        </div>
                        {phoneError && <div className="text-xs text-red-500 mt-1">{phoneError}</div>}
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full pt-2">
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-2 border-2 border-purple-300 mx-auto">
                        {editAvatarPreview && !avatarPreviewError ? (
                          <img
                            src={editAvatarPreview}
                            alt="Avatar"
                            className="object-cover w-full h-full"
                            onError={() => setAvatarPreviewError(true)}
                          />
                        ) : (
                          <Edit className="w-10 h-10 text-purple-400" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*,.ico"
                        onChange={e => {
                          const file = e.target.files && e.target.files[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setEditAvatarFile(file);
                            setEditAvatarPreview(url);
                            setSuperAdminAvatar(url);
                            setAvatarPreviewError(false);
                            if (file.name.toLowerCase().endsWith('.ico')) {
                              setShowIcoWarning(true);
                            }
                          }
                        }}
                        className="block mt-1 text-xs text-gray-600 mx-auto"
                        style={{ maxWidth: '140px' }}
                      />
                      {avatarPreviewError && (
                        <div className="text-xs text-red-500 mt-2 text-center">No se puede previsualizar este archivo. Usa PNG para mejor compatibilidad visual.</div>
                      )}
                      {showIcoWarning && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                          <div className="bg-white rounded-xl shadow-lg p-6 max-w-xs w-full border-2 border-purple-400 text-center">
                            <h2 className="text-lg font-bold text-purple-700 mb-2">Compatibilidad de íconos</h2>
                            <p className="text-sm text-gray-700 mb-4">La previsualización de archivos <b>.ico</b> puede no funcionar en todos los navegadores.<br/>Te recomendamos usar imágenes <b>PNG</b> para mejor compatibilidad visual.</p>
                            <button
                              className="mt-2 px-6 py-2 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition"
                              onClick={() => setShowIcoWarning(false)}
                            >
                              Entendido
                            </button>
                          </div>
                        </div>
                      )}
                      <span className="text-xs text-gray-500 mt-1 text-center">Cambiar imagen</span>
                    </div>
                    <div className="flex justify-between w-full pt-3 gap-8">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowEditModal(false)}
                        className="border-[#8e161a] text-[#8e161a] hover:bg-[#f3e7e8] font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-sm py-2 px-6"
                        style={{ minWidth: '120px' }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        className="bg-[#8e161a] hover:bg-[#6b1115] text-white font-bold shadow-md transition-all duration-200 shadow-sm hover:shadow-lg text-sm py-2 px-6"
                        style={{ minWidth: '120px' }}
                        onClick={async () => {
                          if (editAvatarFile && userToEdit && userToEdit.role === 'super_admin') {
                            const formData = new FormData();
                            formData.append('name', editUserData.name);
                            formData.append('phone', editUserData.phone.replace(/^\+?51/, ''));
                            formData.append('avatar', editAvatarFile);
                            try {
                              const response = await fetch(`http://localhost:8000/api/users/${userToEdit.id}`, {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                                },
                                body: (() => { formData.append('_method', 'PUT'); return formData; })()
                              });
                              const data = await response.json();
                              if (!response.ok) throw new Error(data.message || 'Error al actualizar usuario');
                              if (data.data && data.data.avatar) {
                                setSuperAdminAvatar(
                                  data.data.avatar.startsWith('/')
                                    ? `http://localhost:8000${data.data.avatar}`
                                    : data.data.avatar
                                );
                                // Actualiza el campo avatar del objeto superAdmin si existe
                                if (superAdmin) {
                                  superAdmin.avatar = data.data.avatar;
                                }
                              }
                              setShowEditModal(false);
                              setEditUserData(null);
                              setUserToEdit(null);
                              setEditAvatarFile(null);
                              setEditAvatarPreview(null);
                              setSuccessMessage('Usuario actualizado exitosamente');
                              fetchUsers();
                              setTimeout(() => setSuccessMessage(null), 3000);
                            } catch (error: any) {
                              setError(error.message || 'Error desconocido');
                            }
                          } else {
                            await handleEditUser();
                          }
                        }}
                      >
                        Guardar Cambios
                      </Button>
                    </div>
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