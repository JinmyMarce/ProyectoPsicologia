import { useState, useEffect, useRef } from 'react';
import {
  User,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Phone,
  Heart,
  Trash2,
  ShieldAlert,
  Lock
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CustomSelect } from '../ui/CustomSelect';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, updateProfile, deleteUser } from '../../services/users';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthdate: string;
  gender: string;
  dni: string;
  role: string;
  student_id: string;
  career: string;
  semester: string;
  // Datos de contacto de emergencia (según migración 2025_08_01_144900)
  emergency_name: string;
  emergency_phone: string;
  emergency_relationship: string;
  // Información médica (según migración 2025_08_01_144900)
  allergies: string;
  current_medications: string;
  medical_conditions: string;
  // Información adicional
  nationality: string;
  marital_status: string;
  // Campos adicionales de migraciones
  avatar: string;
  verified: boolean;
  active: boolean;
  specialization: string;
  rating: number;
  total_appointments: number;
  // Campos de tutor (si aplica)
  classroom: string;
  study_program: string;
  course: string;
  total_students: number;
  active_derivations: number;
}

export function StudentProfile() {
  const { updateUser, logout } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthdate: '',
    gender: '',
    dni: '',
    role: '',
    student_id: '',
    career: 'Psicología',
    semester: '',
    // Datos de contacto de emergencia (según migración 2025_08_01_144900)
    emergency_name: '',
    emergency_phone: '',
    emergency_relationship: '',
    // Información médica (según migración 2025_08_01_144900)
    allergies: '',
    current_medications: '',
    medical_conditions: '',
    // Información adicional
    nationality: '',
    marital_status: '',
    // Campos adicionales de migraciones
    avatar: '',
    verified: false,
    active: true,
    specialization: '',
    rating: 0,
    total_appointments: 0,
    // Campos de tutor (si aplica)
    classroom: '',
    study_program: '',
    course: '',
    total_students: 0,
    active_derivations: 0
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState('');

  // Funciones para manejar el prefijo +51 en teléfonos
  const formatPhoneWithPrefix = (phone: string): string => {
    if (!phone) return '';
    // Remover espacios y guiones
    let cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
    // Si ya tiene el prefijo +51, devolverlo sin espacios
    if (cleaned.startsWith('+51')) return cleaned;
    // Si empieza con 51, agregar el +
    if (cleaned.startsWith('51')) return `+${cleaned}`;
    // Si no tiene prefijo, agregarlo sin espacio
    return `+51${cleaned}`;
  };

  const handlePhoneChange = (value: string, field: 'phone' | 'emergency_phone') => {
    // Remover el prefijo +51 si está presente para procesar
    let cleaned = value.replace(/^\+51\s*/, '').replace(/\s+/g, '');
    // Solo permitir números
    cleaned = cleaned.replace(/\D/g, '');
    // Limitar a 9 dígitos (número peruano)
    if (cleaned.length > 9) cleaned = cleaned.substring(0, 9);
    // Formatear con el prefijo
    const formatted = cleaned ? `+51 ${cleaned}` : '';
    setProfileData({ ...profileData, [field]: formatted });
  };

  const displayPhone = (phone: string): string => {
    if (!phone) return 'No especificado';
    // Si ya tiene el formato +51, mostrarlo tal cual
    if (phone.startsWith('+51')) return phone;
    // Si no, agregar el prefijo
    return formatPhoneWithPrefix(phone);
  };
  const [success, setSuccess] = useState('');

  // Estado para controlar qué sección está activa
  const [activeSection, setActiveSection] = useState<'student' | 'emergency' | 'medical'>('student');

  // Estado para modal de eliminar cuenta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Referencia para el mensaje de éxito
  const successMessageRef = useRef<HTMLDivElement>(null);

  // Limpiar mensajes al cambiar de sección
  useEffect(() => {
    setSuccess('');
    setError('');
  }, [activeSection]);
  
  // Hacer scroll al mensaje de éxito cuando aparezca
  useEffect(() => {
    if (success && successMessageRef.current) {
      // Pequeño delay para asegurar que el DOM se haya actualizado
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (successMessageRef.current) {
          successMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [success]);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  // Función para obtener nacionalidad por defecto según el género
  const getDefaultNationality = (gender: string) => {
    const genderLower = gender?.toLowerCase() || '';
    switch (genderLower) {
      case 'femenino':
        return 'Peruana';
      case 'masculino':
        return 'Peruano';
      case 'otro':
        return 'Peru';
      default:
        return 'Peruano';
    }
  };

  // Función para formatear el género para mostrar (con mayúscula inicial)
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

  // Función para convertir rol a español
  const getRoleLabel = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'student': 'Estudiante',
      'psychologist': 'Psicólogo',
      'admin': 'Administrador',
      'super_admin': 'Super Administrador',
      'tutor': 'Tutor'
    };
    return roleMap[role] || role || 'Estudiante';
  };

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      setError('');

      // Cargar datos reales de la base de datos
      const profile = await getProfile();

      // Obtener datos de emergencia de las tablas relacionadas
      const emergencyData = profile.emergency_contact || null;
      const medicalData = profile.medical_info || null;

      // Formatear fecha de nacimiento para el input date (YYYY-MM-DD)
      // Usar solo la fecha local para evitar problemas de zona horaria
      let formattedBirthdate = '';
      if (profile.birthdate) {
        try {
          // Si viene como string YYYY-MM-DD, usarlo directamente
          if (typeof profile.birthdate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(profile.birthdate)) {
            formattedBirthdate = profile.birthdate;
          } else {
            // Si viene como fecha ISO, extraer solo la fecha sin conversión de zona horaria
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
        // Información del Estudiante (tabla users)
        name: profile.name || '',
        email: profile.email || '',
        phone: formatPhoneWithPrefix(profile.phone || ''),
        address: profile.address || '',
        birthdate: formattedBirthdate,
        gender: profile.gender || '',
        dni: profile.dni || '',
        role: profile.role || '',
        student_id: profile.student_id || '',
        career: profile.career || 'Psicología',
        semester: profile.semester || '',

        // Contacto de Emergencia - Priorizar datos de tabla emergency_contacts
        emergency_name: emergencyData?.name || profile.emergency_name || '',
        emergency_phone: formatPhoneWithPrefix(emergencyData?.phone || profile.emergency_phone || ''),
        emergency_relationship: emergencyData?.relationship || profile.emergency_relationship || '',

        // Información Médica - Priorizar datos de tabla medical_infos
        allergies: medicalData?.allergies || profile.allergies || '',
        current_medications: medicalData?.current_medications || profile.current_medications || '',
        medical_conditions: medicalData?.medical_history || profile.medical_conditions || '',

        // Información adicional
        nationality: profile.nationality || getDefaultNationality(profile.gender || ''),
        marital_status: profile.marital_status || '',

        // Campos adicionales de migraciones
        avatar: profile.avatar || '',
        verified: profile.verified || false,
        active: profile.active !== undefined ? profile.active : true,
        specialization: profile.specialization || '',
        rating: profile.rating || 0,
        total_appointments: profile.total_appointments || 0,

        // Campos de tutor (si aplica)
        classroom: profile.classroom || '',
        study_program: profile.study_program || '',
        course: profile.course || '',
        total_students: profile.total_students || 0,
        active_derivations: profile.active_derivations || 0
      });
    } catch (error: unknown) {
      console.error('Error loading profile:', error);
      setError('Error al cargar el perfil desde la base de datos');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteReason.trim()) {
      setError('Por favor, proporciona un motivo para eliminar tu cuenta');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const response = await getProfile();
      const userId = parseInt(response.id.toString());
      await deleteUser(userId);
      setSuccess('Tu cuenta ha sido eliminada exitosamente');
      setShowDeleteModal(false);
      setDeleteReason('');
      
      // Cerrar sesión después de 1 segundo
      setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, 1000);
    } catch (error: unknown) {
      console.error('Error deleting account:', error);
      setError('Error al eliminar la cuenta. Por favor, intenta nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedProfile = await updateProfile({
        // Información del Estudiante (tabla users)
        name: profileData.name,
        phone: formatPhoneWithPrefix(profileData.phone),
        address: profileData.address,
        birthdate: profileData.birthdate,
        gender: profileData.gender,
        dni: profileData.dni,
        career: profileData.career,
        semester: profileData.semester ? parseInt(profileData.semester, 10) : undefined,

        // Campos directos de emergencia y médicos (tabla users)
        emergency_name: profileData.emergency_name,
        emergency_phone: formatPhoneWithPrefix(profileData.emergency_phone),
        emergency_relationship: profileData.emergency_relationship,
        allergies: profileData.allergies,
        current_medications: profileData.current_medications,
        medical_conditions: profileData.medical_conditions,

        // Contacto de Emergencia (tabla emergency_contacts)
        emergency_contact: {
          name: profileData.emergency_name,
          relationship: profileData.emergency_relationship,
          phone: formatPhoneWithPrefix(profileData.emergency_phone)
        },

        // Información Médica (tabla medical_infos)
        medical_info: {
          medical_history: profileData.medical_conditions,
          current_medications: profileData.current_medications,
          allergies: profileData.allergies
        },

        // Información adicional
        nationality: profileData.nationality,
        marital_status: profileData.marital_status,

        // Campos adicionales de migraciones
        avatar: profileData.avatar,
        specialization: profileData.specialization,

        // Campos de tutor (si aplica)
        classroom: profileData.classroom,
        study_program: profileData.study_program,
        course: profileData.course
      });

      // Mensaje específico según la sección activa
      const successMessage = activeSection === 'emergency' 
        ? 'Datos de emergencia actualizados correctamente'
        : 'Datos del estudiante actualizados correctamente';
      
      setSuccess(successMessage);
      setIsEditing(false);

      // Actualizar el contexto del usuario
      if (updateUser) {
        updateUser(updatedProfile);
      }
      
      // Recargar el perfil para mostrar los datos actualizados
      await loadProfile();
      
      // Hacer scroll hacia arriba para mostrar el mensaje de éxito
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // También intentar hacer scroll al mensaje si existe
        if (successMessageRef.current) {
          successMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setSuccess('');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans selection:bg-slate-100 selection:text-slate-900">
      {/* Header Section - Compact & Professional */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl relative overflow-hidden mx-2 sm:mx-3 mt-3 border border-white/10">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/50 via-transparent to-slate-800/30 animate-pulse"></div>

        {/* Minimal decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-slate-600/10 via-slate-500/5 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-slate-700/8 to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

        {/* Subtle dots */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-12 left-16 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-32 w-1 h-1 bg-slate-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xl text-white text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg border border-white/20 hover:bg-white/25 transition-all duration-300">
                  <User className="w-3 h-3 mr-1.5" />
                  PERFIL
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-1.5 leading-tight drop-shadow-lg">
                Mi Perfil
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl font-medium leading-relaxed drop-shadow-md">
                Gestiona tu información personal, de contacto y médica
                <span className="hidden sm:inline text-slate-400"> Todo en un solo lugar.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced wave pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C200,80 400,80 600,40 C800,0 1000,0 1200,40 L1200,120 L0,120 Z" fill="white" fillOpacity="0.1" />
            <path d="M0,20 C250,100 450,100 600,60 C750,20 950,20 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity="0.05" />
          </svg>
        </div>
      </div>

      <div className="w-full px-3 sm:px-4 lg:px-6 -mt-4 relative z-20 pb-4">
        {/* Botones de Navegación */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-3 flex flex-col sm:flex-row gap-1.5 border border-slate-200">
          <button
            className={`flex-1 justify-center py-2 px-3 rounded-md transition-all duration-200 flex items-center gap-1.5 font-medium text-sm ${
              activeSection === 'student'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200'
            }`}
            onClick={() => setActiveSection('student')}
          >
            <User className={`w-3.5 h-3.5 ${activeSection === 'student' ? 'text-white' : 'text-slate-400'}`} />
            Mi Información
          </button>
          <button
            className={`flex-1 justify-center py-2 px-3 rounded-md transition-all duration-200 flex items-center gap-1.5 font-medium text-sm ${
              activeSection === 'emergency'
                ? 'bg-rose-950 text-white shadow-sm border border-rose-900'
                : 'text-slate-600 hover:bg-rose-50 hover:text-rose-900 border border-transparent hover:border-rose-200'
            }`}
            onClick={() => setActiveSection('emergency')}
          >
            <Phone className={`w-3.5 h-3.5 ${activeSection === 'emergency' ? 'text-white' : 'text-slate-400'}`} />
            Emergencia
          </button>
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
          {/* Información del Estudiante */}
          {activeSection === 'student' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-visible hover:shadow-md transition-all duration-200 relative">
              <div className="p-3 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white relative">
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-10 h-10 bg-slate-800 rounded-md flex items-center justify-center text-white relative overflow-hidden flex-shrink-0">
                    <User className="w-5 h-5 relative z-10" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-slate-900 tracking-tight">Información del Estudiante</h2>
                    <p className="text-xs text-slate-500">Datos personales y académicos</p>
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
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Nombre Completo
                    </label>
                    <div className="bg-slate-50 px-2.5 py-2 rounded-md border border-slate-200 text-slate-900 font-normal text-sm group-hover:border-slate-300 transition-all">
                      {profileData.name || 'No especificado'}
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Programa de Estudios
                    </label>
                    <div className="bg-slate-50 px-2.5 py-2 rounded-md border border-slate-200 text-slate-900 font-normal text-sm group-hover:border-slate-300 transition-all">
                      {profileData.career || 'No especificado'}
                    </div>
                  </div>

                  <div className="group relative" style={{ overflow: 'visible' }}>
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Semestre
                    </label>
                    {isEditing ? (
                      <CustomSelect
                        value={profileData.semester || ''}
                        onChange={(value) => setProfileData({ ...profileData, semester: value })}
                        options={(() => {
                          // Usar zona horaria de Perú
                          const now = new Date();
                          const peruTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Lima"}));
                          const month = peruTime.getMonth() + 1; // getMonth() devuelve 0-11
                          
                          // Abril a Julio (meses 4-7): Semestres 1, 3, 5
                          // Agosto a Diciembre (meses 8-12): Semestres 2, 4, 6
                          if (month >= 4 && month <= 7) {
                            return [
                              { value: '1', label: '1er Semestre' },
                              { value: '3', label: '3er Semestre' },
                              { value: '5', label: '5to Semestre' }
                            ];
                          } else {
                            return [
                              { value: '2', label: '2do Semestre' },
                              { value: '4', label: '4to Semestre' },
                              { value: '6', label: '6to Semestre' }
                            ];
                          }
                        })()}
                        placeholder="Seleccionar"
                        focusColor="blue-dark"
                      />
                    ) : (
                      <div className="px-2.5 py-2 text-slate-900 font-normal text-sm border border-slate-200 bg-slate-50 rounded-md group-hover:border-slate-300 transition-all">
                        {profileData.semester ? `${profileData.semester}${profileData.semester === '1' ? 'er' : profileData.semester === '2' ? 'do' : profileData.semester === '3' ? 'er' : profileData.semester === '4' ? 'to' : profileData.semester === '5' ? 'to' : 'to'} Semestre` : 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div className="group sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Correo Institucional
                    </label>
                    <div className="bg-slate-50 px-2.5 py-2 rounded-md border border-slate-200 text-slate-900 font-normal text-sm group-hover:border-slate-300 transition-all break-all">
                      {profileData.email || 'No especificado'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      DNI
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.dni}
                        onChange={(e) => setProfileData({ ...profileData, dni: e.target.value })}
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
                          onChange={(e) => handlePhoneChange(e.target.value, 'phone')}
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
                            // Usar solo la fecha sin conversión de zona horaria
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
                          { value: 'Soltero', label: 'Soltero' },
                          { value: 'Casado', label: 'Casado' },
                          { value: 'Divorciado', label: 'Divorciado' },
                          { value: 'Viudo', label: 'Viudo' },
                          { value: 'Conviviente', label: 'Conviviente' }
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
                      {getRoleLabel(profileData.role)}
                    </Badge>
                  </div>
                </div>

                {/* Estado del estudiante */}
                <div className="mt-4 p-2.5 bg-green-50 rounded-md border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-1.5 rounded-md">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-green-900">Estado del Estudiante</h3>
                        <p className="text-xs text-green-700">Instituto Túpac Amaru - Área de Psicología</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border border-green-300 font-medium text-sm">
                      Activo
                    </Badge>
                  </div>
                </div>

                {/* Botones de acción */}
                {isEditing ? (
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
                ) : (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full px-3 py-2 bg-white border border-red-400 text-red-700 hover:bg-red-50 hover:border-red-500 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-1.5 text-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                      Eliminar Mi Cuenta
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contacto de Emergencia */}
          {activeSection === 'emergency' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-visible hover:shadow-md transition-all duration-200 relative">
              <div className="p-3 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white relative">
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-10 h-10 bg-rose-950 rounded-md flex items-center justify-center text-white relative overflow-hidden flex-shrink-0">
                    <Phone className="w-5 h-5 relative z-10" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-slate-900 tracking-tight">Contacto de Emergencia</h2>
                    <p className="text-xs text-slate-500">En caso de necesidad</p>
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

              <div className="p-3 sm:p-4 overflow-visible">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Nombre del Contacto
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.emergency_name}
                        onChange={(e) => setProfileData({ ...profileData, emergency_name: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-rose-950 focus:border-rose-950 transition-all bg-white text-sm outline-none"
                      />
                    ) : (
                      <div className="px-2.5 py-2 text-slate-900 font-normal text-sm border border-slate-200 bg-slate-50 rounded-md group-hover:border-slate-300 transition-all">
                        {profileData.emergency_name || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Teléfono
                    </label>
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <span className="px-2.5 py-2 bg-rose-950 border border-rose-900 rounded-md text-white font-medium text-sm whitespace-nowrap">+51</span>
                        <input
                          type="tel"
                          value={profileData.emergency_phone.replace(/^\+51\s*/, '')}
                          onChange={(e) => handlePhoneChange(e.target.value, 'emergency_phone')}
                          className="flex-1 min-w-[120px] px-2.5 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-rose-950 focus:border-rose-950 transition-all bg-white text-sm outline-none"
                          placeholder="9732554"
                          maxLength={9}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-2 bg-rose-950 border border-rose-900 rounded-md text-white font-medium text-sm whitespace-nowrap">+51</span>
                        <div className="flex-1 px-2.5 py-2 text-slate-900 font-normal text-sm border border-slate-200 bg-slate-50 rounded-md group-hover:border-slate-300 transition-all">
                          {profileData.emergency_phone.replace(/^\+51\s*/, '') || 'No especificado'}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="group sm:col-span-2 lg:col-span-1 relative" style={{ overflow: 'visible' }}>
                    <label className="block text-sm font-medium text-slate-600 uppercase tracking-wide mb-1.5">
                      Relación
                    </label>
                    {isEditing ? (
                      <CustomSelect
                        value={profileData.emergency_relationship}
                        onChange={(value) => setProfileData({ ...profileData, emergency_relationship: value })}
                        options={[
                          { value: 'Padre', label: 'Padre' },
                          { value: 'Madre', label: 'Madre' },
                          { value: 'Hermano/Hermana', label: 'Hermano/Hermana' },
                          { value: 'Cónyuge', label: 'Cónyuge' },
                          { value: 'Hijo/Hija', label: 'Hijo/Hija' },
                          { value: 'Otro familiar', label: 'Otro familiar' },
                          { value: 'Amigo/Amiga', label: 'Amigo/Amiga' },
                          { value: 'Otro', label: 'Otro' }
                        ]}
                        placeholder="Seleccionar relación"
                        focusColor="rose-dark"
                      />
                    ) : (
                      <div className="px-2.5 py-2 text-slate-900 font-normal text-sm border border-slate-200 bg-slate-50 rounded-md group-hover:border-slate-300 transition-all">
                        {profileData.emergency_relationship || 'No especificado'}
                      </div>
                    )}
                  </div>
                </div>

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
                      className="bg-rose-950 text-white px-4 py-1.5 rounded-md font-medium transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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

          {/* Información Médica - Oculto completamente */}
          {false && activeSection === 'medical' && (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-red-50/20 pointer-events-none"></div>
              <div className="p-6 border-b border-slate-200/50 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm relative">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-400/50 to-red-400/50"></div>
                    <Heart className="w-7 h-7 relative z-10" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Información Médica</h2>
                    <p className="text-sm text-slate-600 font-semibold">Datos de salud importantes</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={loading}
                  className="bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-red-400 shadow-md hover:shadow-lg px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 font-bold text-sm hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              <div className="p-6 md:p-8">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="group">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                        Alergias
                      </label>
                      <input
                        type="text"
                        value={profileData.allergies}
                        onChange={(e) => setProfileData({ ...profileData, allergies: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white shadow-sm hover:shadow-md hover:border-slate-400"
                        placeholder="Ej: Ninguna, Penicilina"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                        Condiciones Médicas
                      </label>
                      <input
                        type="text"
                        value={profileData.medical_conditions}
                        onChange={(e) => setProfileData({ ...profileData, medical_conditions: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white shadow-sm hover:shadow-md hover:border-slate-400"
                        placeholder="Ej: Diabetes, Hipertensión"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                        Medicamentos Actuales
                      </label>
                      <input
                        type="text"
                        value={profileData.current_medications}
                        onChange={(e) => setProfileData({ ...profileData, current_medications: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white shadow-sm hover:shadow-md hover:border-slate-400"
                        placeholder="Ej: Metformina, Losartán"
                      />
                    </div>
                  </div>
                ) : null}

                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-100">
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                      className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-amber-600 text-white shadow-md hover:shadow-lg px-6 py-2.5 rounded-lg font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Guardar Cambios
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Eliminar Cuenta */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            {/* Header con gradiente moderno */}
            <div className="relative p-6 bg-gradient-to-br from-red-600 via-red-600 to-red-700 text-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-red-700/50 via-transparent to-red-700/30"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                  <Trash2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Eliminar Cuenta</h3>
                  <p className="text-sm text-red-100 font-medium mt-0.5">Esta acción es permanente e irreversible</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Advertencia destacada */}
              <div className="bg-gradient-to-br from-red-50 to-red-50 border-2 border-red-200 rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-100/50 rounded-full blur-xl -mr-10 -mt-10"></div>
                <div className="relative flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-900 mb-1">Advertencia Importante</p>
                    <p className="text-xs text-red-800 leading-relaxed">
                      Al eliminar tu cuenta, se perderán permanentemente todos tus datos, citas y historial. 
                      Esta acción <strong>no se puede deshacer</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Campo de motivo */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">
                  Motivo de eliminación <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Por favor, explica el motivo por el cual deseas eliminar tu cuenta..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white resize-none text-sm placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-500 mt-1.5">Tu información nos ayuda a mejorar el servicio</p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteReason('');
                    setError('');
                  }}
                  disabled={deleting}
                  className="flex-1 px-5 py-3 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-xl font-bold transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || !deleteReason.trim()}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 border border-red-700/30"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Eliminar Cuenta
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
