import { useState, useEffect } from 'react';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Shield,
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
  
  // Estados para eliminar cuenta
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  
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

  const handleDeleteAccount = async () => {
    setDeleteAccountLoading(true);
    
    try {
      // Simular eliminación de cuenta (desactivación)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('Cuenta desactivada correctamente. Serás redirigido al login...');
      
      // Simular logout después de 3 segundos
      setTimeout(() => {
        // Aquí iría la lógica de logout
        window.location.href = '/login';
      }, 3000);
    } catch (error: unknown) {
      console.error('Error deleting account:', error);
      setError('Error al eliminar la cuenta');
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título Principal */}
      <div className="text-center mb-6">
        <div className="inline-block px-20 py-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
            Mi Perfil - Información Personal
          </h1>
          <div className="w-28 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-center space-x-4 mb-6">
        <Button
          variant="outline"
          className={`border-gray-300 hover:bg-gray-50 ${activeSection === 'student' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
          onClick={() => setActiveSection('student')}
        >
          <User className="w-4 h-4 mr-2" />
          Información del Estudiante
        </Button>
        <Button
          variant="outline"
          className={`border-gray-300 hover:bg-gray-50 ${activeSection === 'emergency' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
          onClick={() => setActiveSection('emergency')}
        >
          <Phone className="w-4 h-4 mr-2" />
          Contacto de Emergencia
        </Button>
        <Button
          variant="outline"
          className={`border-gray-300 hover:bg-gray-50 ${activeSection === 'medical' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
          onClick={() => setActiveSection('medical')}
        >
          <Heart className="w-4 h-4 mr-2" />
          Información Médica
        </Button>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-700 font-medium">{success}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Contenido Principal */}
        <div className="space-y-6">
          {/* Información del Estudiante */}
          {activeSection === 'student' && (
            <Card className="p-6 border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{
                    backgroundColor: '#1a2332'
                  }}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                  Información del Estudiante
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={loading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>

              <div className="space-y-4">
                {/* Fila 1: 3 campos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                  <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {profileData.name || 'No especificado'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo
                  </label>
                  <p className="text-gray-900 font-semibold bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {profileData.email || 'No especificado'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Programa de Estudios
                  </label>
                  <p className="text-gray-900 font-semibold bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {profileData.career || 'No especificado'}
                  </p>
                </div>
                </div>

                {/* Fila 2: 4 campos */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DNI
                  </label>
                {isEditing ? (
                  <input
                    type="text"
                      value={profileData.dni}
                      onChange={(e) => setProfileData({...profileData, dni: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a0e0f]"
                      placeholder="12345678"
                  />
                ) : (
                    <p className="text-gray-900 font-semibold">{profileData.dni || 'No especificado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a0e0f]"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{profileData.phone || 'No especificado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Nacimiento
                </label>
                {isEditing ? (
                  <input
                    type="date"
                      value={profileData.birthdate}
                      onChange={(e) => setProfileData({...profileData, birthdate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a0e0f]"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">
                      {profileData.birthdate ? new Date(profileData.birthdate).toLocaleDateString('es-ES') : 'No especificado'}
                  </p>
                )}
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a0e0f]"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-semibold">{profileData.gender || 'No especificado'}</p>
                  )}
                </div>
                </div>

                {/* Fila 3: 4 campos */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado Civil
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.marital_status}
                      onChange={(e) => setProfileData({...profileData, marital_status: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a0e0f]"
                    >
                      <option value="">Seleccionar estado civil</option>
                      <option value="Soltero">Soltero</option>
                      <option value="Casado">Casado</option>
                      <option value="Divorciado">Divorciado</option>
                      <option value="Viudo">Viudo</option>
                      <option value="Conviviente">Conviviente</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-semibold">{profileData.marital_status || 'No especificado'}</p>
                  )}
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a0e0f]"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{profileData.address || 'No especificado'}</p>
                )}
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carrera
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.career}
                      onChange={(e) => setProfileData({...profileData, career: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a0e0f]"
                    >
                      <option value="Psicología">Psicología</option>
                      <option value="Psicología Clínica">Psicología Clínica</option>
                      <option value="Psicología Educativa">Psicología Educativa</option>
                      <option value="Psicología Organizacional">Psicología Organizacional</option>
                      <option value="Psicología Social">Psicología Social</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-semibold">{profileData.career || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <p className="text-gray-900 font-semibold bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {profileData.role || 'Estudiante'}
                  </p>
                </div>
                </div>
              </div>

              {/* Estado del estudiante */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">Estado del Estudiante</h3>
                    <p className="text-sm text-gray-600">Instituto Túpac Amaru - Psicología Clínica</p>
                  </div>
                  <Badge variant="success" className="text-sm bg-green-100 text-green-800 border-green-200">
                    Activo
                  </Badge>
                </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
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
          </Card>
          )}

          {/* Contacto de Emergencia */}
          {activeSection === 'emergency' && (
            <Card className="p-6 border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{
                    backgroundColor: '#1a2332'
                  }}>
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  Contacto de Emergencia
            </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={loading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Contacto
                </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.emergency_name}
                      onChange={(e) => setProfileData({...profileData, emergency_name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a0e0f]"
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold">{profileData.emergency_name || 'No especificado'}</p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.emergency_phone}
                      onChange={(e) => setProfileData({...profileData, emergency_phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a0e0f]"
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold">{profileData.emergency_phone || 'No especificado'}</p>
                  )}
              </div>

                <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relación
                </label>
                  {isEditing ? (
                    <select
                      value={profileData.emergency_relationship}
                      onChange={(e) => setProfileData({...profileData, emergency_relationship: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a0e0f]"
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
                    <p className="text-gray-900 font-semibold">{profileData.emergency_relationship || 'No especificado'}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
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
          </Card>
          )}

          {/* Información Médica */}
          {activeSection === 'medical' && (
            <Card className="p-6 border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{
                    backgroundColor: '#1a2332'
                  }}>
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  Información Médica
                </h2>
              <Button
                variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={loading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alergias
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.allergies}
                      onChange={(e) => setProfileData({...profileData, allergies: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a0e0f]"
                      placeholder="Ej: Ninguna, Penicilina, etc."
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold">{profileData.allergies || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condiciones Médicas
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.medical_conditions}
                      onChange={(e) => setProfileData({...profileData, medical_conditions: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a0e0f]"
                      placeholder="Ej: Diabetes, Hipertensión, etc."
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold">{profileData.medical_conditions || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicamentos
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.current_medications}
                      onChange={(e) => setProfileData({...profileData, current_medications: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a0e0f]"
                      placeholder="Ej: Metformina, Losartán, etc."
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold">{profileData.current_medications || 'No especificado'}</p>
                  )}
                </div>
                </div>

              {isEditing && (
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
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
          </Card>
          )}
        </div>

        {/* Zona de Peligro - Solo visible en sección estudiante, al final */}
        {activeSection === 'student' && (
          <Card className="p-6 border border-red-200 bg-red-50 shadow-sm">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <div className="w-6 h-6 rounded flex items-center justify-center mr-2 bg-red-600">
                <Shield className="w-3 h-3 text-white" />
              </div>
              Zona de Peligro
            </h3>
            
            {!showDeleteAccount ? (
            <div className="space-y-3">
                <p className="text-sm text-red-700">
                  Si elimina su cuenta, ya no podrá hacer uso de este sistema.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteAccount(true)}
                  className="w-full border-red-300 text-red-700 hover:bg-red-100"
                  disabled={deleteAccountLoading}
                  style={{
                    borderColor: '#4a0e0f',
                    color: '#4a0e0f'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4a0e0f';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#4a0e0f';
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Cuenta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-red-800 mb-2">
                        ⚠️ Advertencia Importante
                      </h4>
                      <p className="text-sm text-red-700 mb-2">
                        Al eliminar esta cuenta usted ya no podrá hacer el uso de este sistema.
                      </p>
                      <p className="text-sm text-red-700 font-semibold">
                        Para activarlo tiene que hablar con el administrador del sistema que es el psicólogo o el jefe de área.
                      </p>
                    </div>
                  </div>
                  </div>
                
                <div className="flex space-x-2">
                    <Button
                      variant="outline"
                    onClick={() => setShowDeleteAccount(false)}
                    disabled={deleteAccountLoading}
                    className="flex-1 border-gray-300"
                  >
                    Cancelar
                    </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={deleteAccountLoading}
                    className="flex-1 text-white"
                    style={{
                      backgroundColor: '#4a0e0f'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#6b1013';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#4a0e0f';
                    }}
                  >
                    {deleteAccountLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Confirmar Eliminación
                  </Button>
                </div>
            </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
} 
