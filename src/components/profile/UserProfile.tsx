import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, changePassword } from '@/services/users';
import { User } from '@/types';

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
      student: 'bg-blue-100 text-blue-800',
      psychologist: 'bg-purple-100 text-purple-800',
      admin: 'bg-orange-100 text-orange-800',
      super_admin: 'bg-red-100 text-red-800'
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">Gestiona tu información personal y configuración</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Rol:</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.role || '')}`}>
            {getRoleLabel(user?.role || '')}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex space-x-2 border-b border-gray-200">
          {[
            { key: 'profile', label: 'Información Personal' },
            { key: 'password', label: 'Cambiar Contraseña' },
            { key: 'system', label: 'Información del Sistema' }
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key 
                  ? 'border-[#8e161a] text-[#8e161a]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Información Personal</h2>
              <p className="text-gray-600 mt-1">Actualiza tu información personal</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
                      required
                      readOnly={user?.role === 'student'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
                      required
                      readOnly={user?.role === 'student'}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#8e161a] text-white px-6 py-2 rounded-lg hover:bg-[#7a1418] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Cambiar Contraseña</h2>
              <p className="text-gray-600 mt-1">Actualiza tu contraseña de acceso</p>
            </div>
            <div className="p-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
                      required
                    />
                  </div>
                  <div></div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e161a] focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#8e161a] text-white px-6 py-2 rounded-lg hover:bg-[#7a1418] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
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
      </div>

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
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-800 font-semibold">{success}</span>
        </div>
      )}
    </div>
  );
}; 