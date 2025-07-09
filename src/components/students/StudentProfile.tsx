import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Lock, 
  Eye, 
  EyeOff,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, updateProfile, changePassword } from '../../services/users';
import { PageHeader } from '../ui/PageHeader';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string;
  student_id: string;
  career: string;
  semester: string;
}

interface Document {
  id: number;
  name: string;
  type: string;
  upload_date: string;
  status: 'pending' | 'approved' | 'rejected';
  url?: string;
}

export function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    birth_date: '',
    student_id: '',
    career: 'Psicología',
    semester: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para cambio de contraseña
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Estados para documentos (simulado por ahora)
  const [documents] = useState<Document[]>([
    {
      id: 1,
      name: 'Carné Universitario',
      type: 'Identificación',
      upload_date: '2024-01-15',
      status: 'approved',
      url: '#'
    },
    {
      id: 2,
      name: 'Historial Académico',
      type: 'Académico',
      upload_date: '2024-01-10',
      status: 'pending'
    },
    {
      id: 3,
      name: 'Certificado de Salud',
      type: 'Médico',
      upload_date: '2024-01-05',
      status: 'approved',
      url: '#'
    }
  ]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      setError('');
      const profile = await getProfile();
      
      setProfileData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        birth_date: profile.birth_date || '',
        student_id: profile.student_id || '',
        career: profile.career || 'Psicología',
        semester: profile.semester || ''
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
    setError('');
    setSuccess('');
    
    try {
      const updatedProfile = await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        birth_date: profileData.birth_date,
        student_id: profileData.student_id,
        career: profileData.career,
        semester: profileData.semester
      });
      
      // Actualizar el contexto de autenticación
      if (updateUser && user) {
        updateUser({
          ...user,
          name: updatedProfile.name
        });
      }
      
      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await changePassword(passwordData);
      setSuccess('Contraseña cambiada correctamente');
      setShowPasswordChange(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error: unknown) {
      console.error('Error changing password:', error);
      setError(error instanceof Error ? error.message : 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getDocumentStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#8e161a]" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Mi Perfil"
        subtitle="Información Personal y Académica"
      >
        <p className="text-base text-gray-500 font-medium text-center">
          Instituto Túpac Amaru - Psicología Clínica
        </p>
      </PageHeader>

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-center space-x-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <p className="text-red-800 font-bold text-lg">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 flex items-center space-x-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <p className="text-green-800 font-bold text-lg">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <User className="w-6 h-6 mr-3 text-[#8e161a]" />
                Información Personal
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={loading}
              >
                {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8e161a]"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{profileData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-gray-900 font-semibold">{profileData.email}</p>
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8e161a]"
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
                    value={profileData.birth_date}
                    onChange={(e) => setProfileData({...profileData, birth_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8e161a]"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">
                    {profileData.birth_date ? new Date(profileData.birth_date).toLocaleDateString('es-ES') : 'No especificado'}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8e161a]"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{profileData.address || 'No especificado'}</p>
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

          {/* Información Académica */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-[#8e161a]" />
              Información Académica
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Estudiante
                </label>
                <p className="text-gray-900 font-semibold">{profileData.student_id || 'No especificado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carrera
                </label>
                <p className="text-gray-900 font-semibold">{profileData.career}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semestre
                </label>
                <p className="text-gray-900 font-semibold">{profileData.semester || 'No especificado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <Badge variant="success" className="text-sm">
                  Activo
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Cambiar contraseña */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-[#8e161a]" />
              Seguridad
            </h3>
            
            {!showPasswordChange ? (
              <Button
                variant="outline"
                onClick={() => setShowPasswordChange(true)}
                className="w-full"
              >
                Cambiar Contraseña
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#8e161a]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute right-2 top-2"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#8e161a]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-2 top-2"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#8e161a]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-2 top-2"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({
                        current_password: '',
                        new_password: '',
                        confirm_password: ''
                      });
                    }}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      'Cambiar'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Documentos */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#8e161a]" />
              Mis Documentos
            </h3>
            
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">{doc.name}</h4>
                    <Badge variant={getDocumentStatusColor(doc.status)} className="text-xs">
                      {getDocumentStatusText(doc.status)}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Tipo: {doc.type}</p>
                    <p>Subido: {new Date(doc.upload_date).toLocaleDateString('es-ES')}</p>
                  </div>
                  {doc.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Descargar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 