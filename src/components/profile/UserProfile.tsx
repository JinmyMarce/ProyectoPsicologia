import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, changePassword, createUser, deactivateUser } from '@/services/users';
import { User } from '@/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Definir tipo para el historial de superadmins
  type SuperAdminHistoryItem = {
    name: string;
    email: string;
    activated: string;
    deactivated: string | null;
  };
  // Simulación de obtención de historial real de superadmins
  async function getSuperAdminHistory(): Promise<SuperAdminHistoryItem[]> {
    // Aquí deberías llamar a tu API real
    return [
      { name: 'Marcelo Q', email: 'marcelojinmy2024@gmail.com', activated: '01/01/2023', deactivated: '01/06/2024' },
      { name: user?.name || '', email: user?.email || '', activated: user?.created_at ? new Date(user.created_at).toLocaleDateString('es-PE') : '', deactivated: null }
    ];
  }
  const [superAdminHistory, setSuperAdminHistory] = useState<SuperAdminHistoryItem[]>([]);
  useEffect(() => {
    if (user?.role === 'super_admin') {
      getSuperAdminHistory().then(setSuperAdminHistory);
    }
  }, [user]);

  const getRoleLabel = (role: string) => {
    const labels = {
      student: 'Estudiante',
      psychologist: 'Psicólogo',
      admin: 'Administrador',
      super_admin: 'Super Administrador'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      student: 'bg-gray-100 text-gray-800',
      psychologist: 'bg-gray-100 text-gray-700',
      admin: 'bg-gray-100 text-gray-600',
      super_admin: 'bg-gray-100 text-gray-500'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await updateProfile(profileForm);
      updateUser(updatedUser);
      setSuccess('Perfil actualizado correctamente');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword
      });
      setSuccess('Contraseña cambiada correctamente');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Simulación de agregar nuevo superadmin
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    dni: '',
    birthdate: '',
    gender: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [adminFormError, setAdminFormError] = useState<string | null>(null);
  const [adminFormLoading, setAdminFormLoading] = useState(false);

  // 1. Eliminar 'required' de los inputs del formulario de admin
  // 2. Agregar estados para errores por campo
  const [adminFieldErrors, setAdminFieldErrors] = useState({
    name: '',
    email: '',
    dni: '',
    birthdate: '',
    gender: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // 3. Validación manual en el submit
  const validateAdminForm = () => {
    const errors: any = {};
    if (!adminForm.name.trim()) errors.name = 'El nombre completo es obligatorio.';
    if (!adminForm.email.trim()) errors.email = 'El email es obligatorio.';
    if (!adminForm.dni.trim()) errors.dni = 'El DNI es obligatorio.';
    if (adminForm.dni && adminForm.dni.length !== 8) errors.dni = 'El DNI debe tener 8 dígitos.';
    if (!adminForm.birthdate.trim()) errors.birthdate = 'La fecha de nacimiento es obligatoria.';
    if (!adminForm.gender.trim()) errors.gender = 'El género es obligatorio.';
    if (!adminForm.phone.trim()) errors.phone = 'El celular es obligatorio.';
    if (adminForm.phone && adminForm.phone.length !== 9) errors.phone = 'El celular debe tener 9 dígitos.';
    if (!adminForm.password.trim()) errors.password = 'La contraseña es obligatoria.';
    if (!adminForm.confirmPassword.trim()) errors.confirmPassword = 'Confirma la contraseña.';
    if (adminForm.password !== adminForm.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden.';
    setAdminFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSuperAdmin = () => {
    setShowSuperAdminModal(true);
  };
  const handleCloseModal = () => {
    setShowSuperAdminModal(false);
  };
  const handleContinueGoogle = () => {
    setShowSuperAdminModal(false);
    alert('Aquí se iniciaría el proceso de login con Google y desactivación del superadmin actual.');
  };

  // Función para crear nuevo admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormError(null);
    setAdminFormLoading(true);
    if (!validateAdminForm()) {
      setAdminFormLoading(false);
      return;
    }
    try {
      // Crear el nuevo admin
      await createUser({
        ...adminForm,
        role: 'admin',
        phone: adminForm.phone ? '+51' + adminForm.phone.replace(/^\+?51/, '') : '',
      });
      // Desactivar el usuario actual
      await deactivateUser(Number(user?.id) || 0);
      setShowAddAdmin(false);
      alert('¡Nuevo administrador registrado exitosamente! Tu cuenta ha sido desactivada. Por favor, inicia sesión con el nuevo usuario.');
      // Cerrar sesión
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    } catch (err) {
      setAdminFormError('Error al crear el nuevo administrador');
    } finally {
      setAdminFormLoading(false);
    }
  };

return (
  <div className="container mx-auto p-6 space-y-6 bg-slate-50">
    {/* Título Principal */}
    <div className="text-center mb-6">
      <div className="inline-block px-20 py-4 bg-white border border-gray-200 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
          Mi Perfil de Usuario
        </h1>
        <div className="w-28 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto rounded-full"></div>
      </div>
    </div>

      {/* Información del rol */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <span className="text-base text-gray-700 font-semibold">Rol:</span>
        <span className={`px-3 py-1 text-sm font-bold rounded-full border border-gray-600 bg-gray-100 text-gray-800`}>{getRoleLabel(user?.role || '')}</span>
      </div>
      {/* Botón para registrar nuevo admin */}
      {user?.role === 'admin' && (
        <div className="flex justify-end mb-4">
          <Button className="bg-[#8e161a] text-white font-bold hover:bg-[#6b1115]" onClick={() => setShowAddAdmin(true)}>
            Registrar nuevo administrador
          </Button>
        </div>
      )}
      {/* Modal para crear nuevo admin */}
      {showAddAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-all duration-500">
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full mx-4 border border-gray-200 animate-fade-in-up">
            <div className="rounded-t-2xl mb-0 shadow-md overflow-hidden border-b-4 border-[#8e161a]" style={{background: 'linear-gradient(90deg, #6b1115 0%, #8e161a 100%)'}}>
              <h2 className="text-2xl font-extrabold text-white tracking-wide text-center py-6">Registrar Nuevo Administrador</h2>
            </div>
            <div className="px-8 py-8">
              <form className="space-y-5" onSubmit={handleCreateAdmin}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo <span className="text-red-600">*</span></label>
                    <input type="text" value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all" />
                    {adminFieldErrors.name && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-red-800 text-xs font-semibold">{adminFieldErrors.name}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-600">*</span></label>
                    <input type="email" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all" />
                    {adminFieldErrors.email && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-red-800 text-xs font-semibold">{adminFieldErrors.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI <span className="text-red-600">*</span></label>
                    <input type="text" value={adminForm.dni} onChange={e => setAdminForm({...adminForm, dni: e.target.value.replace(/[^0-9]/g, '')})} maxLength={8} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all" />
                    {adminFieldErrors.dni && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-red-800 text-xs font-semibold">{adminFieldErrors.dni}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento <span className="text-red-600">*</span></label>
                    <input type="date" value={adminForm.birthdate} onChange={e => setAdminForm({...adminForm, birthdate: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all" />
                    {adminFieldErrors.birthdate && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-red-800 text-xs font-semibold">{adminFieldErrors.birthdate}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Género <span className="text-red-600">*</span></label>
                    <select value={adminForm.gender} onChange={e => setAdminForm({...adminForm, gender: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all" >
                      <option value="">Seleccionar género</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                    </select>
                    {adminFieldErrors.gender && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-red-800 text-xs font-semibold">{adminFieldErrors.gender}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Celular <span className="text-red-600">*</span></label>
                    <div className="flex items-center">
                      <span className="px-3 py-3 border border-gray-300 rounded-l-lg bg-gray-100 text-gray-700 select-none text-base h-[48px] flex items-center">+51</span>
                      <input type="text" value={adminForm.phone} onChange={e => setAdminForm({...adminForm, phone: e.target.value.replace(/[^0-9]/g, '')})} maxLength={9} className="pl-3 w-full border-t border-b border-r border-gray-300 rounded-r-lg bg-white focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all text-base h-[48px]" placeholder="987654321" />
                    </div>
                    {adminFieldErrors.phone && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-red-800 text-xs font-semibold">{adminFieldErrors.phone}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <input type="text" value="Administrador" readOnly className="w-full border rounded-lg p-3 bg-gray-100 text-gray-700 cursor-not-allowed" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña <span className="text-red-600">*</span></label>
                    <input type="password" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all pr-10" />
                    {adminFieldErrors.password && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-red-800 text-xs font-semibold">{adminFieldErrors.password}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña <span className="text-red-600">*</span></label>
                    <input type="password" value={adminForm.confirmPassword} onChange={e => setAdminForm({...adminForm, confirmPassword: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all pr-10" />
                    {adminFieldErrors.confirmPassword && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2 flex items-center space-x-2 mt-1">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-red-800 text-xs font-semibold">{adminFieldErrors.confirmPassword}</span>
                      </div>
                    )}
                  </div>
                </div>
                {adminFormError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-2 mt-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-800 font-semibold">{adminFormError}</span>
                  </div>
                )}
                <div className="flex space-x-3 pt-6">
                  <Button type="button" variant="outline" onClick={() => setShowAddAdmin(false)} className="flex-1 border-[#8e161a] text-[#8e161a] hover:bg-[#f3e7e8] font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-[#8e161a] hover:bg-[#6b1115] text-white font-bold shadow-md transition-all duration-200 shadow-sm hover:shadow-lg" disabled={adminFormLoading}>
                    {adminFormLoading ? 'Creando...' : 'Registrar Administrador'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-6 py-2 rounded-lg font-semibold border transition-colors ${activeTab === 'profile' ? 'bg-[#8e161a] text-white border-[#8e161a]' : 'bg-white text-[#8e161a] border-[#8e161a] hover:bg-gray-100'}`}
          onClick={() => setActiveTab('profile')}
        >
          Información Personal
        </button>
        {(user?.role === 'admin' || user?.role === 'psychologist') && (
          <button
            className={`px-6 py-2 rounded-lg font-semibold border transition-colors ${activeTab === 'password' ? 'bg-[#8e161a] text-white border-[#8e161a]' : 'bg-white text-[#8e161a] border-[#8e161a] hover:bg-gray-100'}`}
            onClick={() => setActiveTab('password')}
          >
            Cambiar Contraseña
          </button>
        )}
      </div>

      {/* Información Personal */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-8 max-w-4xl w-full mx-auto">
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-[#8e161a]">Información Personal</h2>
          </div>
          <form className="w-full">
            {/* Fila 1: Nombre Completo y Correo Electrónico */}
            <div className="flex flex-row gap-6 mb-6 w-full">
              <div className="flex-1 min-w-[220px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={profileForm.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium"
                  required
                  readOnly
                />
              </div>
              <div className="flex-1 min-w-[220px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={profileForm.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium"
                  required
                  readOnly
                />
              </div>
            </div>
            {/* Fila 2: Otros datos personales */}
            <div className="flex flex-row flex-wrap gap-6 w-full">
              {user?.dni && (
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">DNI</label>
                  <input type="text" value={user.dni} readOnly className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-medium" />
                </div>
              )}
              <div className="flex-1 min-w-[160px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Celular</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-100 text-gray-700 select-none">+51</span>
                  <input type="text" value={user?.phone ? user.phone.replace(/^\+?51/, '') : ''} readOnly className="w-full border-t border-b border-r border-gray-300 rounded-r-lg bg-gray-100 text-gray-700 font-medium px-3 py-2" />
                </div>
              </div>
              {user?.specialization && (
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Especialización</label>
                  <input type="text" value={user.specialization} readOnly className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-medium" />
                </div>
              )}
              {user?.birthdate && (
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Nacimiento</label>
                  <input type="text" value={user.birthdate} readOnly className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-medium" />
                </div>
              )}
              {user?.gender && (
                <div className="flex-1 min-w-[100px]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Género</label>
                  <input type="text" value={user.gender} readOnly className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-medium" />
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Cambiar Contraseña */}
      {activeTab === 'password' && (user?.role === 'admin' || user?.role === 'psychologist') && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-8 max-w-4xl w-full mx-auto flex flex-col items-center">
          <div className="mb-6 border-b border-gray-200 pb-4 w-full">
            <h2 className="text-xl font-bold text-[#8e161a]">Cambiar Contraseña</h2>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-6 w-full max-w-lg">
            <div className="flex flex-row flex-wrap gap-6 w-full">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña Actual</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium"
                  required
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium"
                  required
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                type="button"
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                onClick={() => setActiveTab('profile')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#8e161a] text-white px-6 py-2 rounded-lg hover:bg-[#7a1418] transition-colors disabled:opacity-50 font-bold"
              >
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      )}

        {activeTab === 'system' && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Información del Sistema</h2>
              <p className="text-gray-600 mt-1">Detalles de tu cuenta y configuración del sistema</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Información de la Cuenta</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ID de Usuario:</span>
                        <span className="text-sm font-medium">{user?.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Rol:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.role || '')}`}>
                          {getRoleLabel(user?.role || '')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Estado:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${user?.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user?.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fecha de Registro:</span>
                        <span className="text-sm font-medium">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Configuración del Sistema</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Versión del Sistema:</span>
                        <span className="text-sm font-medium">1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Última Actualización:</span>
                        <span className="text-sm font-medium">
                          {user?.updated_at ? new Date(user.updated_at).toLocaleDateString('es-ES') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Zona Horaria:</span>
                        <span className="text-sm font-medium">America/Mexico_City</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Idioma:</span>
                        <span className="text-sm font-medium">Español</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Elimino la sección de información profesional para psicólogos y académica para estudiantes que usaba specialty, license, career y semester */}
              </div>
            </div>
          </div>
        )}

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-red-800 font-semibold">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center space-x-2 mt-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-800 font-semibold">{success}</span>
        </div>
      )}
    </div>
  );
}; 