import { useState, useEffect } from 'react';
import {
  User,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Phone,
  Heart
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, updateProfile } from '../../services/users';

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
  const { updateUser } = useAuth();
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
  const [success, setSuccess] = useState('');

  // Estado para controlar qué sección está activa
  const [activeSection, setActiveSection] = useState<'student' | 'emergency' | 'medical'>('student');

  useEffect(() => {
    loadProfile();
  }, []);

  // Función para obtener nacionalidad por defecto según el género
  const getDefaultNationality = (gender: string) => {
    switch (gender) {
      case 'Femenino':
        return 'Peruana';
      case 'Masculino':
        return 'Peruano';
      case 'Otro':
        return 'Peru';
      default:
        return 'Peruano';
    }
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

      setProfileData({
        // Información del Estudiante (tabla users)
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        birthdate: profile.birthdate || '',
        gender: profile.gender || '',
        dni: profile.dni || '',
        role: profile.role || '',
        student_id: profile.student_id || '',
        career: profile.career || 'Psicología',
        semester: profile.semester || '',

        // Contacto de Emergencia - Priorizar datos de tabla emergency_contacts
        emergency_name: emergencyData?.name || profile.emergency_name || '',
        emergency_phone: emergencyData?.phone || profile.emergency_phone || '',
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

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedProfile = await updateProfile({
        // Información del Estudiante (tabla users)
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        birthdate: profileData.birthdate,
        gender: profileData.gender,
        dni: profileData.dni,
        career: profileData.career,
        semester: profileData.semester,

        // Campos directos de emergencia y médicos (tabla users)
        emergency_name: profileData.emergency_name,
        emergency_phone: profileData.emergency_phone,
        emergency_relationship: profileData.emergency_relationship,
        allergies: profileData.allergies,
        current_medications: profileData.current_medications,
        medical_conditions: profileData.medical_conditions,

        // Contacto de Emergencia (tabla emergency_contacts)
        emergency_contact: {
          name: profileData.emergency_name,
          relationship: profileData.emergency_relationship,
          phone: profileData.emergency_phone
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

      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);

      // Actualizar el contexto del usuario
      if (updateUser) {
        updateUser(updatedProfile);
      }
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      setError('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 font-medium">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header - Dashboard Style */}
      <div className="bg-gradient-to-br from-slate-200 via-gray-100 to-blue-200 rounded-2xl shadow-xl relative overflow-hidden mx-4 mt-4 border border-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Mi Perfil</h1>
            <div className="w-28 h-1 bg-gradient-to-r from-slate-600 to-blue-600 mx-auto rounded-full mb-4"></div>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">
              Gestiona tu información personal, de contacto y médica
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 via-violet-400/20 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-400/10 to-transparent rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Botones de Navegación */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 flex flex-col sm:flex-row gap-2 border border-gray-200">
          <Button
            variant="ghost"
            className={`flex-1 justify-center py-3 rounded-xl transition-all duration-300 ${activeSection === 'student'
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100 font-bold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            onClick={() => setActiveSection('student')}
          >
            <User className={`w-5 h-5 mr-2 ${activeSection === 'student' ? 'text-blue-600' : 'text-gray-400'}`} />
            Mi Información
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 justify-center py-3 rounded-xl transition-all duration-300 ${activeSection === 'emergency'
                ? 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 shadow-sm border border-orange-100 font-bold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            onClick={() => setActiveSection('emergency')}
          >
            <Phone className={`w-5 h-5 mr-2 ${activeSection === 'emergency' ? 'text-orange-600' : 'text-gray-400'}`} />
            Emergencia
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 justify-center py-3 rounded-xl transition-all duration-300 ${activeSection === 'medical'
                ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 shadow-sm border border-red-100 font-bold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            onClick={() => setActiveSection('medical')}
          >
            <Heart className={`w-5 h-5 mr-2 ${activeSection === 'medical' ? 'text-red-600' : 'text-gray-400'}`} />
            Médica
          </Button>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm flex items-center space-x-3 animate-fade-in">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="text-red-800 font-bold text-sm">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm flex items-center space-x-3 animate-fade-in">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-green-800 font-bold text-sm">Éxito</h4>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Información del Estudiante */}
          {activeSection === 'student' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Información del Estudiante</h2>
                    <p className="text-sm text-gray-500">Datos personales y académicos</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={loading}
                  className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                  {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Nombre Completo
                    </label>
                    <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium">
                      {profileData.name || 'No especificado'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Correo Institucional
                    </label>
                    <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium">
                      {profileData.email || 'No especificado'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Programa de Estudios
                    </label>
                    <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium">
                      {profileData.career || 'No especificado'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      DNI
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.dni}
                        onChange={(e) => setProfileData({ ...profileData, dni: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="12345678"
                      />
                    ) : (
                      <div className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100">
                        {profileData.dni || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Teléfono
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    ) : (
                      <div className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100">
                        {profileData.phone || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Fecha de Nacimiento
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profileData.birthdate}
                        onChange={(e) => setProfileData({ ...profileData, birthdate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    ) : (
                      <div className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100">
                        {profileData.birthdate ? new Date(profileData.birthdate).toLocaleDateString('es-ES') : 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Género
                    </label>
                    {isEditing ? (
                      <select
                        value={profileData.gender}
                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Seleccionar</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    ) : (
                      <div className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100">
                        {profileData.gender || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Estado Civil
                    </label>
                    {isEditing ? (
                      <select
                        value={profileData.marital_status}
                        onChange={(e) => setProfileData({ ...profileData, marital_status: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Seleccionar</option>
                        <option value="Soltero">Soltero</option>
                        <option value="Casado">Casado</option>
                        <option value="Divorciado">Divorciado</option>
                        <option value="Viudo">Viudo</option>
                        <option value="Conviviente">Conviviente</option>
                      </select>
                    ) : (
                      <div className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100">
                        {profileData.marital_status || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Dirección
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    ) : (
                      <div className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100">
                        {profileData.address || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Rol
                    </label>
                    <div className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100 flex items-center">
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        {profileData.role || 'Estudiante'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Estado del estudiante */}
                <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-green-900">Estado del Estudiante</h3>
                      <p className="text-xs text-green-700">Instituto Túpac Amaru - Psicología Clínica</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200 font-bold">
                    Activo
                  </Badge>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                      className="px-6"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl px-6"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contacto de Emergencia */}
          {activeSection === 'emergency' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shadow-sm">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Contacto de Emergencia</h2>
                    <p className="text-sm text-gray-500">En caso de necesidad</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={loading}
                  className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                  {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Nombre del Contacto
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.emergency_name}
                        onChange={(e) => setProfileData({ ...profileData, emergency_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    ) : (
                      <div className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100 text-lg">
                        {profileData.emergency_name || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Teléfono
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.emergency_phone}
                        onChange={(e) => setProfileData({ ...profileData, emergency_phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    ) : (
                      <div className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100 text-lg">
                        {profileData.emergency_phone || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Relación
                    </label>
                    {isEditing ? (
                      <select
                        value={profileData.emergency_relationship}
                        onChange={(e) => setProfileData({ ...profileData, emergency_relationship: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      >
                        <option value="">Seleccionar relación</option>
                        <option value="Padre">Padre</option>
                        <option value="Madre">Madre</option>
                        <option value="Hermano/Hermana">Hermano/Hermana</option>
                        <option value="Cónyuge">Cónyuge</option>
                        <option value="Hijo/Hija">Hijo/Hija</option>
                        <option value="Otro familiar">Otro familiar</option>
                        <option value="Amigo/Amiga">Amigo/Amiga</option>
                        <option value="Otro">Otro</option>
                      </select>
                    ) : (
                      <div className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100 text-lg">
                        {profileData.emergency_relationship || 'No especificado'}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                      className="px-6"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg hover:shadow-xl px-6"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información Médica */}
          {activeSection === 'medical' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shadow-sm">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Información Médica</h2>
                    <p className="text-sm text-gray-500">Datos de salud importantes</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={loading}
                  className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                  {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Alergias
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.allergies}
                        onChange={(e) => setProfileData({ ...profileData, allergies: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="Ej: Ninguna, Penicilina, etc."
                      />
                    ) : (
                      <div className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100">
                        {profileData.allergies || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Condiciones Médicas
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.medical_conditions}
                        onChange={(e) => setProfileData({ ...profileData, medical_conditions: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="Ej: Diabetes, Hipertensión, etc."
                      />
                    ) : (
                      <div className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100">
                        {profileData.medical_conditions || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Medicamentos Actuales
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.current_medications}
                        onChange={(e) => setProfileData({ ...profileData, current_medications: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="Ej: Metformina, Losartán, etc."
                      />
                    ) : (
                      <div className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100">
                        {profileData.current_medications || 'No especificado'}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                      className="px-6"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl px-6"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
