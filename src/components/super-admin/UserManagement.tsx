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
  EyeOff,
  Sparkles,
  RefreshCw,
  X
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
  marital_status?: string; // Added marital_status
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
  // Estado para manejar errores de carga de imagen del avatar del super admin
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Calcular avatarUrl de manera segura (antes del return condicional)
  const avatarUrl = React.useMemo(() => {
    const superAdmin = users.find(u => u.role === 'super_admin');
    return superAdminAvatar
      ? (superAdminAvatar.startsWith('/') ? `http://localhost:8000${superAdminAvatar}` : superAdminAvatar)
      : (superAdmin?.avatar && superAdmin.avatar.startsWith('/') ? `http://localhost:8000${superAdmin.avatar}` : superAdmin?.avatar);
  }, [superAdminAvatar, users]);

  // Resetear estados de carga cuando cambie el avatarUrl (debe estar antes del return condicional)
  useEffect(() => {
    if (avatarUrl) {
      setAvatarLoadError(false);
      setAvatarLoading(true);
      
      // Pre-cargar la imagen para carga más rápida
      const img = new Image();
      img.src = avatarUrl;
      img.onload = () => {
        setAvatarLoading(false);
      };
      img.onerror = () => {
        setAvatarLoadError(true);
        setAvatarLoading(false);
      };
    } else {
      setAvatarLoadError(true);
      setAvatarLoading(false);
    }
  }, [avatarUrl]);

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
          marital_status: createUserData.marital_status || null, // Add marital_status (opcional)
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-3 mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Cargando usuarios...</p>
        </div>
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

  // Animation classes
  const fadeInUp = "animate-fade-in";
  const stagger1 = "delay-[100ms]";
  const stagger3 = "delay-[300ms]";

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900 w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Header Section - Compact & Professional */}
      <div className="rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl relative overflow-hidden mt-2 sm:mt-3 lg:mt-4 border border-white/10" style={{
        background: 'linear-gradient(180deg, #0a0e17 0%, #020408 50%, #000000 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#09090b]/50 via-transparent to-[#09090b]/30 animate-pulse"></div>

        {/* Minimal decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0a0e17]/10 via-[#020408]/5 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-[#020408]/8 to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

        {/* Subtle dots */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-12 left-16 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-32 w-1 h-1 bg-slate-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-5 lg:pt-6 pb-5 sm:pb-6 lg:pb-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
            <div className={`${fadeInUp}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-white/15 backdrop-blur-xl text-white text-[9px] sm:text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-white/20 hover:bg-white/25 transition-all duration-300">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1.5 animate-pulse" />
                  SUPER ADMIN
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white mb-1.5 leading-tight drop-shadow-lg">
                Gestión de Usuarios
              </h1>
              <p className="text-red-100 text-[11px] sm:text-xs md:text-sm max-w-2xl font-medium leading-relaxed drop-shadow-md">
                Administra y gestiona todos los usuarios del sistema.
                <span className="hidden md:inline text-red-200/80"> Control total de acceso y permisos.</span>
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="text-xs xs:text-sm font-bold rounded-lg px-3 xs:px-4 py-1.5 xs:py-2 transition-all hover:scale-105 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button
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
                  setBirthdateError(null);
                  setGenderError(null);
                }}
                className="flex items-center justify-center bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-xl px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg font-bold text-xs sm:text-sm w-full md:w-auto"
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Crear Usuario</span>
                <span className="sm:hidden">Crear</span>
              </button>
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

        {/* Filtros */}
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md border border-slate-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1.5 sm:mb-2 uppercase tracking-wider">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#3a0809] focus:border-[#3a0809] text-xs sm:text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1.5 sm:mb-2 uppercase tracking-wider">
                Rol
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#3a0809] focus:border-[#3a0809] text-xs sm:text-sm font-medium transition-all"
              >
                <option value="all">Todos los roles</option>
                <option value="psychologist">Psicólogos</option>
                <option value="admin">Administradores</option>
                <option value="tutor">Tutores</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1.5 sm:mb-2 uppercase tracking-wider">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#3a0809] focus:border-[#3a0809] text-xs sm:text-sm font-medium transition-all"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="text-xs xs:text-sm font-bold rounded-lg px-3 xs:px-4 py-1.5 xs:py-2 transition-all hover:scale-105 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-1.5 w-full bg-white/15 backdrop-blur-xl"
              >
                <RefreshCw className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 sm:gap-4">
          <div className="xl:col-span-4 flex flex-col gap-2 sm:gap-3">
            {orderedUsers.map((user) => (
              <div
                key={user.id}
                className={`group relative bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg p-3 sm:p-4 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${user.role === 'super_admin' ? 'border-purple-300 bg-purple-50/50' : ''}`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 w-full md:flex-1">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#5a0e11] to-[#8e161a] rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-base font-black text-white shadow-md group-hover:scale-110 transition-all duration-300 flex-shrink-0 ${user.role === 'super_admin' ? 'bg-gradient-to-br from-purple-600 to-purple-700' : ''}`}>
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 truncate text-xs sm:text-sm">{user.name}</h3>
                      <div className="flex items-center gap-1.5 md:hidden flex-shrink-0">
                        <Badge variant={user.role === 'psychologist' ? 'info' : user.role === 'admin' ? 'warning' : 'default'} className="text-[9px] px-2 py-0.5 uppercase tracking-wider font-bold shadow-sm rounded-md whitespace-nowrap">
                          {getRoleLabel(user.role)}
                        </Badge>
                        {user.active ? (
                          <Badge variant="success" className="text-[9px] px-2 py-0.5 uppercase tracking-wider font-bold shadow-sm rounded-md whitespace-nowrap">
                            {user.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-[9px] px-2 py-0.5 uppercase tracking-wider font-bold shadow-sm rounded-md whitespace-nowrap">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-600 truncate font-medium">{user.email}</p>
                    <div className="flex items-center space-x-1.5 sm:space-x-2 mt-1.5 sm:mt-2 hidden md:flex">
                      <Badge variant={user.role === 'psychologist' ? 'info' : user.role === 'admin' ? 'warning' : 'default'} className="text-[10px] px-2.5 py-1 uppercase tracking-wider font-bold shadow-sm rounded-lg">
                        {getRoleLabel(user.role)}
                      </Badge>
                      {user.verified && (
                        <Badge variant="success" className="text-[10px] px-2.5 py-1 uppercase tracking-wider font-bold shadow-sm rounded-lg">
                          Verificado
                        </Badge>
                      )}
                      <Badge variant={user.active ? "success" : "danger"} className="text-[10px] px-2.5 py-1 uppercase tracking-wider font-bold shadow-sm rounded-lg">
                        {user.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                </div>
                {/* Opciones solo para admin y psicólogo */}
                {user.role !== 'super_admin' && (
                  <div className="flex flex-row gap-1.5 sm:gap-2 w-full sm:w-auto sm:ml-2 flex-wrap sm:flex-nowrap justify-end sm:justify-start">
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
                      className="flex items-center justify-center border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold px-2 py-1.5 text-[9px] sm:text-[10px] md:text-xs rounded-md sm:rounded-lg transition-all"
                    >
                      <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-0.5 sm:mr-1" />
                      <span className="hidden md:inline">Editar</span>
                      <span className="md:hidden">Edit</span>
                    </Button>
                    {/* Botón Reactivar si está inactivo */}
                    {!user.active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUserStatus(user.id, user.active)}
                        className="flex items-center justify-center border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-bold px-2 py-1.5 text-[9px] sm:text-[10px] md:text-xs rounded-md sm:rounded-lg transition-all"
                      >
                        <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-0.5 sm:mr-1" />
                        <span className="hidden md:inline">Reactivar</span>
                        <span className="md:hidden">React</span>
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
                      className="flex items-center justify-center border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold px-2 py-1.5 text-[9px] sm:text-[10px] md:text-xs rounded-md sm:rounded-lg transition-all"
                    >
                      <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-0.5 sm:mr-1" />
                      <span className="hidden md:inline">Restablecer</span>
                      <span className="md:hidden">Reset</span>
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
                      className={`flex items-center justify-center border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold px-2 py-1.5 text-[9px] sm:text-[10px] md:text-xs rounded-md sm:rounded-lg transition-all ${user.active ? 'hover:text-red-700 hover:border-red-200' : 'hover:text-emerald-700 hover:border-emerald-200'}`}
                    >
                      {user.active ? (
                        <>
                          <UserX className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-0.5 sm:mr-1" />
                          <span className="hidden md:inline">Desactivar</span>
                          <span className="md:hidden">Desact</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-0.5 sm:mr-1" />
                          <span className="hidden md:inline">Activar</span>
                          <span className="md:hidden">Act</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Columna lateral del Super Admin */}
          <div className="xl:col-span-1 hidden xl:block">
            {superAdmin && (
              <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md border border-purple-200 p-4 sm:p-5 w-full flex flex-col gap-3 items-center sticky top-4 sm:top-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-lg mb-2 overflow-hidden relative">
                  {avatarUrl && !avatarLoadError ? (
                    <>
                      {avatarLoading && superAdmin?.name && (
                        <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-700">
                          {superAdmin.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        loading="eager"
                        fetchPriority="high"
                        className={`object-cover w-full h-full rounded-xl sm:rounded-2xl ${avatarLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                        onLoad={() => setAvatarLoading(false)}
                        onError={() => {
                          setAvatarLoadError(true);
                          setAvatarLoading(false);
                        }}
                      />
                    </>
                  ) : (
                    <span>{superAdmin?.name?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 mb-1 text-center">{superAdmin?.name || 'Super Admin'}</h3>
                <p className="text-[10px] sm:text-xs text-slate-600 mb-2 font-medium text-center">{superAdmin.email}</p>
                <p className="text-[10px] sm:text-xs text-slate-600 mb-3 flex items-center justify-center font-medium text-center"><span className="font-bold mr-1">Celular:</span> {superAdmin.phone}</p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 my-2">
                  <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 uppercase tracking-wider font-bold shadow-sm rounded-lg">Super Admin</Badge>
                  {superAdmin.verified && <Badge variant="success" className="text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 uppercase tracking-wider font-bold shadow-sm rounded-lg">Verificado</Badge>}
                  <Badge variant={superAdmin.active ? "success" : "danger"} className="text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 uppercase tracking-wider font-bold shadow-sm rounded-lg">
                    {superAdmin.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-[9px] sm:text-xs text-slate-500 mt-2 font-medium text-center">Registrado: {new Date(superAdmin.created_at).toLocaleDateString()}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 font-bold px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs rounded-lg sm:rounded-xl transition-all w-full sm:w-auto"
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
                  setAvatarLoadError(false);
                  setAvatarLoading(true);
                  setShowEditModal(true);
                }}
              >
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Editar
              </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      </div>

      {/* Modal de creación de usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-500">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 border border-slate-200 animate-fade-in-up">
              <div className="p-0">
                <div className="rounded-t-2xl mb-0 shadow-lg overflow-hidden relative" style={{
                  background: 'linear-gradient(180deg, #0a0e17 0%, #020408 50%, #000000 100%)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                }}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#09090b]/50 via-transparent to-[#09090b]/30"></div>
                  <div className="relative z-10 flex items-center justify-between px-6 py-6">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide drop-shadow-lg">Crear Nuevo Usuario</h2>
                    <button
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
                          gender: '',
                          marital_status: ''
                        });
                        setPasswordError(null);
                        setShowPassword(false);
                        setShowConfirmPassword(false);
                        setDniError(null);
                        setPhoneError(null);
                        setSpecializationError(null);
                        setBirthdateError(null);
                        setGenderError(null);
                      }}
                      className="text-white hover:text-red-200 transition-colors p-1 hover:bg-white/10 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="px-6 sm:px-8 py-6 sm:py-8 max-h-[80vh] overflow-y-auto">
                  <form onSubmit={handleCreateUser} className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nombre completo <span className="text-red-600">*</span></label>
                        <input
                          type="text"
                          value={createUserData.name}
                          onChange={e => setCreateUserData(prev => ({ ...prev, name: e.target.value }))}
                          className={`w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all ${nameError ? 'border-red-500 bg-red-50' : ''}`}
                        />
                        {nameError && <div className="text-xs text-red-500 mt-1">{nameError}</div>}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-600">*</span></label>
                        <input
                          type="text"
                          value={createUserData.email}
                          onChange={e => setCreateUserData(prev => ({ ...prev, email: e.target.value }))}
                          className={`w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all ${emailError ? 'border-red-500 bg-red-50' : ''}`}
                        />
                        {emailError && <div className="text-xs text-red-500 mt-1">{emailError}</div>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">DNI <span className="text-red-600">*</span></label>
                        <input
                          type="text"
                          value={createUserData.dni}
                          maxLength={8}
                          onChange={e => setCreateUserData(prev => ({ ...prev, dni: e.target.value.replace(/[^0-9]/g, '') }))}
                          className={`w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all ${dniError ? 'border-red-500 bg-red-50' : ''}`}
                        />
                        {dniError && <div className="text-xs text-red-500 mt-1">{dniError}</div>}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento <span className="text-red-600">*</span></label>
                        <input
                          type="date"
                          value={createUserData.birthdate || ''}
                          onChange={e => setCreateUserData(prev => ({ ...prev, birthdate: e.target.value }))}
                          className={`w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all ${birthdateError ? 'border-red-500 bg-red-50' : ''}`}
                        />
                        {birthdateError && <div className="text-xs text-red-500 mt-1">{birthdateError}</div>}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Género <span className="text-red-600">*</span></label>
                        <select
                          value={createUserData.gender || ''}
                          onChange={e => setCreateUserData(prev => ({ ...prev, gender: e.target.value }))}
                          className={`w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all ${genderError ? 'border-red-500 bg-red-50' : ''}`}
                        >
                          <option value="">Seleccionar género</option>
                          <option value="masculino">Masculino</option>
                          <option value="femenino">Femenino</option>
                          <option value="otro">Otro</option>
                        </select>
                        {genderError && <div className="text-xs text-red-500 mt-1">{genderError}</div>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Estado civil</label>
                        <select
                          value={createUserData.marital_status || ''}
                          onChange={e => setCreateUserData(prev => ({ ...prev, marital_status: e.target.value }))}
                          className="w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                        >
                          <option value="">Seleccionar estado civil</option>
                          <option value="soltero">Soltero/a</option>
                          <option value="casado">Casado/a</option>
                          <option value="divorciado">Divorciado/a</option>
                          <option value="viudo">Viudo/a</option>
                          <option value="conviviente">Conviviente</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Celular <span className="text-red-600">*</span></label>
                        <div className="flex items-center">
                          <span className="px-2.5 sm:px-3 py-2.5 sm:py-3 border border-gray-300 rounded-l-lg bg-gray-100 text-gray-700 select-none text-sm h-[42px] sm:h-[48px] flex items-center">+51</span>
                          <input
                            type="text"
                            value={createUserData.phone}
                            maxLength={9}
                            onChange={e => setCreateUserData(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '') }))}
                            className={`pl-2.5 sm:pl-3 w-full border-t border-b border-r border-gray-300 rounded-r-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all text-sm h-[42px] sm:h-[48px] ${phoneError ? 'border-red-500 bg-red-50' : ''}`}
                            placeholder="987654321"
                          />
                        </div>
                        {phoneError && <div className="text-xs text-red-500 mt-1">{phoneError}</div>}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Rol <span className="text-red-600">*</span></label>
                        <select
                          value={createUserData.role}
                          onChange={e => setCreateUserData(prev => ({ 
                            ...prev, 
                            role: e.target.value as 'psychologist' | 'admin' | 'tutor',
                            course: e.target.value === 'tutor' ? 'Tutoría' : prev.course
                          }))}
                          className="w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                        >
                          <option value="psychologist">Psicólogo</option>
                          <option value="admin">Administrador</option>
                          <option value="tutor">Tutor</option>
                        </select>
                      </div>
                      {createUserData.role === 'psychologist' && (
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Especialización</label>
                          <input
                            type="text"
                            value={createUserData.specialization || ''}
                            onChange={e => setCreateUserData(prev => ({ ...prev, specialization: e.target.value }))}
                            className={`w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all ${specializationError ? 'border-red-500 bg-red-50' : ''}`}
                            placeholder="Ej: Psicología Clínica"
                          />
                          {specializationError && <div className="text-xs text-red-500 mt-1">{specializationError}</div>}
                        </div>
                      )}
                      
                      {createUserData.role === 'tutor' && (
                        <>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Aula/Salón <span className="text-red-600">*</span></label>
                            <input
                              type="text"
                              value={createUserData.classroom || ''}
                              onChange={e => setCreateUserData(prev => ({ ...prev, classroom: e.target.value }))}
                              className="w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                              placeholder="Ej: A-101, B-205"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Programa de Estudios <span className="text-red-600">*</span></label>
                            <select
                              value={createUserData.study_program || ''}
                              onChange={e => setCreateUserData(prev => ({ ...prev, study_program: e.target.value }))}
                              className="w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
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
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Semestre</label>
                            <select
                              value={createUserData.semester || ''}
                              onChange={e => setCreateUserData(prev => ({ ...prev, semester: e.target.value }))}
                              className="w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
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
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Curso/Materia</label>
                            <input
                              type="text"
                              value={createUserData.course || 'Tutoría'}
                              onChange={e => setCreateUserData(prev => ({ ...prev, course: e.target.value }))}
                              className="w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all bg-gray-100 text-gray-700"
                              placeholder="Tutoría"
                              readOnly
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Contraseña <span className="text-red-600">*</span></label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={createUserData.password}
                            onChange={e => setCreateUserData(prev => ({ ...prev, password: e.target.value }))}
                            className={`w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all pr-10 ${passwordError ? 'border-red-500 bg-red-50' : ''}`}
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
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña <span className="text-red-600">*</span></label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={createUserData.confirmPassword}
                            onChange={e => setCreateUserData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all pr-10"
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
                              gender: '',
                              marital_status: ''
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
                          className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-[#8e161a] to-[#6b1115] hover:from-[#6b1115] hover:to-[#5a0e11] text-white font-bold shadow-lg transition-all duration-200 hover:shadow-xl"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-slate-200 animate-fade-in-up">
            <div className="rounded-t-2xl mb-0 shadow-lg overflow-hidden relative" style={{
              background: 'linear-gradient(180deg, #0a0e17 0%, #020408 50%, #000000 100%)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
            }}>
              <div className="absolute inset-0 bg-gradient-to-tr from-[#09090b]/50 via-transparent to-[#09090b]/30"></div>
              <div className="relative z-10 flex items-center justify-between px-6 py-5">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide drop-shadow-lg">Restablecer Contraseña</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-white hover:text-red-200 transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="px-6 sm:px-8 py-6 sm:py-8">
              <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 tracking-wide">Email del usuario</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                    required
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start space-x-2">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-blue-800">Envío de correo</p>
                      <p className="text-xs sm:text-sm text-blue-700 mt-1">Se enviará un correo al usuario con instrucciones para restablecer su contraseña.</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#8e161a] to-[#6b1115] hover:from-[#6b1115] hover:to-[#5a0e11] text-white font-bold shadow-lg transition-all duration-200 hover:shadow-xl"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 border border-slate-200 relative">
            <button
              onClick={() => setError(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <div className="bg-gradient-to-br from-red-100 to-red-200 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-md">
                  <UserX className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Error</h3>
                <p className="text-slate-600 mb-6">{error}</p>
                <Button
                  onClick={() => setError(null)}
                  className="bg-gradient-to-r from-[#8e161a] to-[#6b1115] hover:from-[#6b1115] hover:to-[#5a0e11] text-white font-bold shadow-lg transition-all duration-200 hover:shadow-xl"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-500">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-slate-200 animate-fade-in-up">
            <div className="rounded-t-2xl mb-0 shadow-lg overflow-hidden relative" style={{
              background: 'linear-gradient(180deg, #0a0e17 0%, #020408 50%, #000000 100%)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
            }}>
              <div className="absolute inset-0 bg-gradient-to-tr from-[#09090b]/50 via-transparent to-[#09090b]/30"></div>
              <div className="relative z-10 flex items-center justify-between px-6 py-5">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide drop-shadow-lg">Desactivar Usuario</h2>
                <button
                  onClick={() => {
                    setShowDeactivateModal(false);
                    setUserToDeactivate(null);
                    setDeactivateReason('');
                  }}
                  className="text-white hover:text-red-200 transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="px-6 sm:px-8 py-6 sm:py-8">
              <div className="mb-4">
                <p className="text-sm sm:text-base text-gray-800 font-semibold mb-1">{userToDeactivate.name}</p>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">{userToDeactivate.email}</p>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 tracking-wide">Motivo de desactivación <span className="text-red-600">*</span></label>
                <textarea
                  value={deactivateReason}
                  onChange={e => setDeactivateReason(e.target.value)}
                  className="w-full border rounded-lg p-2.5 sm:p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all min-h-[80px] resize-none"
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
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-gradient-to-r from-[#8e161a] to-[#6b1115] hover:from-[#6b1115] hover:to-[#5a0e11] text-white font-bold shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-500">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-2 border border-slate-200 animate-fade-in-up">
            <div className="p-0">
              <div className="rounded-t-2xl mb-0 shadow-lg overflow-hidden relative" style={{
                background: 'linear-gradient(180deg, #0a0e17 0%, #020408 50%, #000000 100%)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
              }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-[#09090b]/50 via-transparent to-[#09090b]/30"></div>
                <div className="relative z-10 flex items-center justify-between px-6 py-4">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-wide drop-shadow-lg">Editar Usuario</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-white hover:text-red-200 transition-colors p-1 hover:bg-white/10 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-4 sm:py-6 max-h-[70vh] overflow-y-auto">
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
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-2 border-2 border-purple-300 mx-auto relative">
                        {editAvatarPreview && !avatarPreviewError ? (
                          <>
                            {userToEdit && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                <span className="text-2xl font-bold text-purple-600">
                                  {userToEdit.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <img
                              src={editAvatarPreview}
                              alt="Avatar"
                              className="object-cover w-full h-full relative z-10"
                              onError={() => setAvatarPreviewError(true)}
                            />
                          </>
                        ) : (
                          userToEdit ? (
                            <span className="text-2xl font-bold text-purple-600">
                              {userToEdit.name.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <Edit className="w-10 h-10 text-purple-400" />
                          )
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
                            setAvatarLoadError(false);
                            setAvatarLoading(true);
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
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xs w-full border border-slate-200 text-center">
                            <h2 className="text-lg font-bold text-slate-800 mb-2">Compatibilidad de íconos</h2>
                            <p className="text-sm text-slate-600 mb-4">La previsualización de archivos <b>.ico</b> puede no funcionar en todos los navegadores.<br/>Te recomendamos usar imágenes <b>PNG</b> para mejor compatibilidad visual.</p>
                            <button
                              className="mt-2 px-6 py-2 bg-gradient-to-r from-[#8e161a] to-[#6b1115] hover:from-[#6b1115] hover:to-[#5a0e11] text-white rounded-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
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
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-sm py-2 px-6"
                        style={{ minWidth: '120px' }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-[#8e161a] to-[#6b1115] hover:from-[#6b1115] hover:to-[#5a0e11] text-white font-bold shadow-lg transition-all duration-200 hover:shadow-xl text-sm py-2 px-6"
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
                                setAvatarLoadError(false);
                                setAvatarLoading(true);
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