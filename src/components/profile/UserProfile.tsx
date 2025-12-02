import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, changePassword, createUser, deactivateUser, getProfile } from '@/services/users';
import { User } from '@/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  User as UserIcon,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Lock,
  Shield,
  Settings
} from 'lucide-react';
import { CustomSelect } from '../ui/CustomSelect';

export const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dni: user?.dni || '',
    birthdate: user?.birthdate || '',
    gender: user?.gender || '',
    address: user?.address || '',
    marital_status: user?.marital_status || ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Referencia para el mensaje de éxito
  const successMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  // Hacer scroll al mensaje de éxito cuando aparezca
  useEffect(() => {
    if (success && successMessageRef.current) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (successMessageRef.current) {
          successMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [success]);

  const formatPhoneWithPrefix = (phone: string): string => {
    if (!phone) return '';
    let cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (cleaned.startsWith('+51')) return cleaned;
    if (cleaned.startsWith('51')) return `+${cleaned}`;
    return `+51${cleaned}`;
  };

  const handlePhoneChange = (value: string) => {
    let cleaned = value.replace(/^\+51\s*/, '').replace(/\s+/g, '');
    cleaned = cleaned.replace(/\D/g, '');
    if (cleaned.length > 9) cleaned = cleaned.substring(0, 9);
    const formatted = cleaned ? `+51 ${cleaned}` : '';
    setProfileData({ ...profileData, phone: formatted });
  };

  const formatGenderDisplay = (gender: string) => {
    if (!gender) return 'No especificado';
    const genderLower = gender.toLowerCase();
    switch (genderLower) {
      case 'masculino':
        return 'Masculino';
      case 'femenino':
        return 'Femenino';
      case 'otro':
        return 'Otro';
      default:
        return gender;
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      student: 'Estudiante',
      psychologist: 'Psicólogo',
      admin: 'Administrador',
      super_admin: 'Super Administrador',
      tutor: 'Tutor'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      setError(null);
      const profile = await getProfile();
      
      let formattedBirthdate = '';
      if (profile.birthdate) {
        try {
          if (typeof profile.birthdate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(profile.birthdate)) {
            formattedBirthdate = profile.birthdate;
          } else {
            const dateStr = profile.birthdate.split('T')[0];
            if (dateStr) {
              formattedBirthdate = dateStr;
            }
          }
        } catch (e) {
          console.error('Error formatting birthdate:', e);
        }
      }

      setProfileData({
        name: profile.name || '',
        email: profile.email || '',
        phone: formatPhoneWithPrefix(profile.phone || ''),
        dni: profile.dni || '',
        birthdate: formattedBirthdate,
        gender: profile.gender || '',
        address: profile.address || '',
        marital_status: profile.marital_status || ''
      });
    } catch (error: unknown) {
      console.error('Error loading profile:', error);
      setError('Error al cargar el perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedProfile = await updateProfile({
        name: profileData.name,
        phone: formatPhoneWithPrefix(profileData.phone),
        address: profileData.address,
        birthdate: profileData.birthdate,
        gender: profileData.gender,
        dni: profileData.dni,
        marital_status: profileData.marital_status
      });

      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);

      if (updateUser) {
        updateUser(updatedProfile);
      }

      await loadProfile();

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (successMessageRef.current) {
          successMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        setError((error as Error).message || 'Error al actualizar el perfil');
      } else {
        setError('Error al actualizar el perfil. Por favor, verifica los datos e intenta nuevamente.');
      }
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

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Determinar si es admin para aplicar el color correspondiente
  const isAdmin = user?.role === 'admin';

  return (
    <div className={`min-h-screen font-sans selection:bg-slate-100 selection:text-slate-900 w-full overflow-x-hidden ${isAdmin ? 'bg-gray-50' : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'}`}>
      {isAdmin ? (
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          {/* Header Section - Compact & Professional */}
      <div className={`${isAdmin ? 'rounded-lg sm:rounded-xl lg:rounded-2xl' : 'rounded-2xl'} shadow-2xl relative overflow-hidden ${isAdmin ? 'mt-2 sm:mt-3 lg:mt-4' : 'mx-2 sm:mx-3 mt-3'} border border-white/10`} style={isAdmin ? {
        background: 'linear-gradient(180deg, #1e3a5f 0%, #1a2f4f 50%, #0f1b2e 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      } : {}}>
        {/* Subtle gradient overlay */}
        <div className={`absolute inset-0 ${isAdmin ? 'bg-gradient-to-tr from-blue-900/50 via-transparent to-indigo-900/30' : 'bg-gradient-to-tr from-slate-800/50 via-transparent to-slate-800/30'} animate-pulse`}></div>

        {/* Minimal decorative elements */}
        <div className={`absolute top-0 right-0 w-64 h-64 ${isAdmin ? 'bg-gradient-to-br from-blue-600/10 via-indigo-500/5' : 'bg-gradient-to-br from-slate-600/10 via-slate-500/5'} to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`}></div>
        <div className={`absolute bottom-0 left-0 w-56 h-56 ${isAdmin ? 'bg-gradient-to-tr from-cyan-600/8' : 'bg-gradient-to-tr from-slate-700/8'} to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none`}></div>

        {/* Subtle dots */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-12 left-16 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-32 w-1 h-1 bg-slate-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className={`w-full ${isAdmin ? 'px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-5 lg:pt-6 pb-5 sm:pb-6 lg:pb-8' : 'px-4 sm:px-6 lg:px-8 pt-6 pb-8'} relative z-10`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/15 backdrop-blur-xl text-white text-[9px] sm:text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-white/20 hover:bg-white/25 transition-all duration-300">
                  <UserIcon className={`w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5 flex-shrink-0`} />
                  <span className="hidden xs:inline">{isAdmin ? 'ADMINISTRADOR' : 'PERFIL'}</span>
                  <span className="xs:hidden">{isAdmin ? 'ADMIN' : 'PERFIL'}</span>
                </span>
              </div>
              <h1 className={`${isAdmin ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl' : 'text-3xl md:text-4xl'} font-black tracking-tight text-white mb-1 sm:mb-1.5 leading-tight drop-shadow-lg`}>
                Mi Perfil
              </h1>
              <p className={`${isAdmin ? 'text-blue-100 text-[10px] sm:text-[11px] md:text-xs lg:text-sm' : 'text-slate-300 text-sm'} max-w-2xl font-medium leading-relaxed drop-shadow-md`}>
                Gestiona tu información personal y configuración de cuenta
                <span className={`hidden sm:inline ${isAdmin ? 'text-blue-200/80' : 'text-slate-400'}`}> Todo en un solo lugar.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced wave pattern */}
        <div className={`absolute bottom-0 left-0 right-0 ${isAdmin ? 'h-12' : 'h-16'} overflow-hidden pointer-events-none`}>
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="white" fillOpacity={isAdmin ? "0.08" : "0.1"} />
            <path d="M0,20 C200,100 400,100 600,60 C800,20 1000,20 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity={isAdmin ? "0.04" : "0.05"} />
          </svg>
        </div>
      </div>
      
      <div className={`w-full -mt-4 relative z-20 ${isAdmin ? '' : 'pb-4 px-3 sm:px-4 lg:px-6'}`}>
        {/* Botones de Navegación */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-3 flex flex-col sm:flex-row gap-1.5 border border-slate-200">
          <button
            className={`flex-1 justify-center py-2 px-3 rounded-md transition-all duration-200 flex items-center gap-1.5 font-medium text-sm ${
              activeTab === 'profile'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <UserIcon className={`w-3.5 h-3.5 ${activeTab === 'profile' ? 'text-white' : 'text-slate-400'}`} />
            Mi Información
          </button>
          {(user?.role === 'admin' || user?.role === 'psychologist' || user?.role === 'super_admin') && (
            <button
              className={`flex-1 justify-center py-2 px-3 rounded-md transition-all duration-200 flex items-center gap-1.5 font-medium text-sm ${
                activeTab === 'password'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200'
              }`}
              onClick={() => setActiveTab('password')}
            >
              <Lock className={`w-3.5 h-3.5 ${activeTab === 'password' ? 'text-white' : 'text-slate-400'}`} />
              Cambiar Contraseña
            </button>
          )}
        </div>

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

        {success && (
          <div 
            ref={successMessageRef}
            className="mb-3 bg-emerald-50 border border-emerald-200 rounded-md p-2.5 shadow-lg flex items-center space-x-2.5 animate-fade-in relative z-50"
          >
            <div className="bg-emerald-500 p-1.5 rounded-md flex-shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-emerald-900 font-medium text-xs mb-0.5">Éxito</h4>
              <p className="text-emerald-800 text-xs break-words">{success}</p>
            </div>
          </div>
        )}

        <div className="space-y-2.5 pb-4" style={{ overflow: 'visible' }}>
          {/* Información Personal */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-visible hover:shadow-md transition-all duration-200 relative">
              <div className="p-3 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white relative">
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-10 h-10 bg-slate-800 rounded-md flex items-center justify-center text-white relative overflow-hidden flex-shrink-0">
                    <UserIcon className="w-5 h-5 relative z-10" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-slate-900 tracking-tight">Información Personal</h2>
                    <p className="text-xs text-slate-500">Datos personales y de contacto</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={loading}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-800 hover:text-slate-900 px-3 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {isEditing ? <X className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              <div className="p-3 sm:p-4 relative overflow-visible">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  <div className="group sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Nombre Completo
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all bg-white text-sm outline-none"
                      />
                    ) : (
                      <div className="bg-slate-50 px-2.5 py-2 rounded-md border border-slate-200 text-slate-900 font-normal text-sm group-hover:border-slate-300 transition-all">
                        {profileData.name || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div className="group sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Correo Electrónico
                    </label>
                    <div className="bg-slate-50 px-2.5 py-2 rounded-md border border-slate-200 text-slate-900 font-normal text-sm group-hover:border-slate-300 transition-all break-all">
                      {profileData.email || 'No especificado'}
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      DNI
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.dni}
                        onChange={(e) => setProfileData({ ...profileData, dni: e.target.value.replace(/[^0-9]/g, '') })}
                        maxLength={8}
                        className="w-full px-2.5 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all bg-white text-sm outline-none"
                        placeholder="12345678"
                      />
                    ) : (
                      <div className="px-2.5 py-2 text-slate-900 font-normal text-sm border border-slate-200 bg-slate-50 rounded-md group-hover:border-slate-300 transition-all">
                        {profileData.dni || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Teléfono
                    </label>
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <span className="px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-md text-white font-medium text-sm whitespace-nowrap">+51</span>
                        <input
                          type="tel"
                          value={profileData.phone.replace(/^\+51\s*/, '')}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          className="flex-1 min-w-[120px] px-2.5 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all bg-white text-sm outline-none"
                          placeholder="9732554"
                          maxLength={9}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-md text-white font-medium text-sm whitespace-nowrap">+51</span>
                        <div className="flex-1 px-2.5 py-2 text-slate-900 font-normal text-sm border border-slate-200 bg-slate-50 rounded-md group-hover:border-slate-300 transition-all">
                          {profileData.phone.replace(/^\+51\s*/, '') || 'No especificado'}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Fecha de Nacimiento
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profileData.birthdate}
                        onChange={(e) => setProfileData({ ...profileData, birthdate: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all bg-white text-sm outline-none"
                      />
                    ) : (
                      <div className="px-2.5 py-2 text-slate-900 font-normal text-sm border border-slate-200 bg-slate-50 rounded-md group-hover:border-slate-300 transition-all">
                        {profileData.birthdate ? (() => {
                          try {
                            const dateParts = profileData.birthdate.split('-');
                            if (dateParts.length === 3) {
                              const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
                              if (!isNaN(date.getTime())) {
                                return date.toLocaleDateString('es-ES', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                });
                              }
                            }
                          } catch (e) {
                            console.error('Error formatting date:', e);
                          }
                          return profileData.birthdate;
                        })() : 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div className="group relative" style={{ overflow: 'visible' }}>
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Género
                    </label>
                    {isEditing ? (
                      <CustomSelect
                        value={profileData.gender}
                        onChange={(value) => setProfileData({ ...profileData, gender: value })}
                        options={[
                          { value: 'masculino', label: 'Masculino' },
                          { value: 'femenino', label: 'Femenino' },
                          { value: 'otro', label: 'Otro' }
                        ]}
                        placeholder="Seleccionar"
                        focusColor="blue-dark"
                      />
                    ) : (
                      <div className="px-2.5 py-2 text-slate-900 font-normal text-sm border border-slate-200 bg-slate-50 rounded-md group-hover:border-slate-300 transition-all">
                        {formatGenderDisplay(profileData.gender)}
                      </div>
                    )}
                  </div>

                  <div className="group relative" style={{ overflow: 'visible' }}>
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Estado Civil
                    </label>
                    {isEditing ? (
                      <CustomSelect
                        value={profileData.marital_status}
                        onChange={(value) => setProfileData({ ...profileData, marital_status: value })}
                        options={[
                          { value: 'soltero', label: 'Soltero/a' },
                          { value: 'casado', label: 'Casado/a' },
                          { value: 'divorciado', label: 'Divorciado/a' },
                          { value: 'viudo', label: 'Viudo/a' },
                          { value: 'conviviente', label: 'Conviviente' }
                        ]}
                        placeholder="Seleccionar"
                        focusColor="blue-dark"
                      />
                    ) : (
                      <div className="px-2.5 py-2 text-slate-900 font-normal text-sm border border-slate-200 bg-slate-50 rounded-md group-hover:border-slate-300 transition-all">
                        {profileData.marital_status || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 group">
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Dirección
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all bg-white text-sm outline-none"
                      />
                    ) : (
                      <div className="px-2.5 py-2 text-slate-900 font-normal text-sm border border-slate-200 bg-slate-50 rounded-md group-hover:border-slate-300 transition-all">
                        {profileData.address || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Rol
                    </label>
                    <Badge className="bg-slate-800 text-white border border-slate-700 text-sm">
                      {getRoleLabel(user?.role || '')}
                    </Badge>
                  </div>
                </div>

                {/* Estado del usuario */}
                <div className="mt-4 p-2.5 bg-green-50 rounded-md border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-1.5 rounded-md">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-green-900">Estado de la Cuenta</h3>
                        <p className="text-xs text-green-700">Sistema de Gestión de Psicología</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border border-green-300 font-medium text-sm">
                      {user?.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>

                {/* Botones de acción */}
                {isEditing && (
                  <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-800 rounded-md font-medium transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="bg-slate-800 text-white px-4 py-1.5 rounded-md font-medium transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {loading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}
                      Guardar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cambiar Contraseña */}
          {activeTab === 'password' && (user?.role === 'admin' || user?.role === 'psychologist' || user?.role === 'super_admin') && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-visible hover:shadow-md transition-all duration-200 relative">
              <div className="p-3 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white relative">
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-10 h-10 bg-slate-800 rounded-md flex items-center justify-center text-white relative overflow-hidden flex-shrink-0">
                    <Lock className="w-5 h-5 relative z-10" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-slate-900 tracking-tight">Cambiar Contraseña</h2>
                    <p className="text-xs text-slate-500">Actualiza tu contraseña de acceso</p>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 overflow-visible">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="group">
                      <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                        Contraseña Actual
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all bg-white text-sm outline-none"
                        required
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all bg-white text-sm outline-none"
                        required
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                        Confirmar Contraseña
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all bg-white text-sm outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-800 rounded-md font-medium transition-all duration-200 text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-slate-800 text-white px-4 py-1.5 rounded-md font-medium transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {loading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}
                      Cambiar Contraseña
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
        </div>
      ) : null}
    </div>
  );
};
