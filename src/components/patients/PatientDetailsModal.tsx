import { patientsService } from '../../services/patients';
import { useState, useEffect } from 'react';
import { MedicalInfoModal } from './MedicalInfoModal';
import { X, User, Phone, Mail, MapPin, Calendar, Heart, AlertTriangle, FileText, Clock, CheckCircle, XCircle, GraduationCap, Check, Minus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
}

export function PatientDetailsModal({ isOpen, onClose, patientId }: PatientDetailsModalProps) {
  const [patient, setPatient] = useState<any>(null);
  const [showMedicalInfo, setShowMedicalInfo] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && patientId) {
      setLoading(true);
      patientsService.getPatient(patientId)
        .then((response) => {
          if (response.success && response.data) {
            setPatient(response.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching patient data:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  const getGenderLabel = (gender: string) => {
    if (!gender) return 'No especificado';
    
    const genderLower = gender.toLowerCase().trim();
    
    switch (genderLower) {
      case 'male':
      case 'm':
      case 'masculino':
      case 'masculine':
        return 'Masculino';
      case 'female':
      case 'f':
      case 'femenino':
      case 'feminine':
        return 'Femenino';
      case 'other':
      case 'otro':
      case 'o':
        return 'Otro';
      default:
        return 'No especificado';
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return 'No especificado';
    if (phone.startsWith('+51')) return phone;
    if (phone.startsWith('51')) return `+${phone}`;
    return `+51 ${phone}`;
  };

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return 'No especificado';
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  const formatDate = (date: string) => {
    if (!date) return 'No especificado';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge variant="default" className="bg-green-100 text-green-800 font-semibold flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Activo
      </Badge>
    ) : (
      <Badge variant="danger" className="font-semibold flex items-center gap-1">
        <XCircle className="w-3 h-3" />
        Inactivo
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
            <span className="text-sm font-medium text-gray-700">Cargando información...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4">
          <div className="text-center">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error</h3>
            <p className="text-gray-600 mb-4 text-sm">No se pudo cargar la información del paciente</p>
            <Button onClick={onClose} className="bg-gray-600 text-white hover:bg-gray-700">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-[#660000] to-[#4A0000] text-white px-8 py-6">
          {/* Primera fila - Nombre completo */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3 border border-white/30">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Información del Paciente</h2>
              </div>
              <div className="px-4 py-2">
                <h3 className="text-sm font-semibold">{patient.name}</h3>
              </div>
            </div>
            <div className="flex items-center space-x-36">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                {patient.active ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                <span>{patient.active ? 'Activo' : 'Inactivo'}</span>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Segunda fila - Datos de contacto */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white/70">DNI:</span>
                <span className="text-sm font-semibold text-white">{patient.dni}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white/70">EMAIL:</span>
                <span className="text-sm font-semibold text-white">{patient.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white/70">TEL:</span>
                <span className="text-sm font-semibold text-white">+51 {patient.phone?.replace('+51', '').trim()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAddress(!showAddress)}
                  className="text-blue-600 hover:text-blue-400 transition-colors p-1 rounded-full hover:bg-blue-600/10"
                  title="Ver dirección"
                >
                  <MapPin className="w-4 h-4" />
                </button>
                {showAddress && (
                  <span className="text-sm font-semibold text-white">{patient.address || 'No especificada'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Compacto */}
        <div className="p-6 space-y-4 max-h-[calc(80vh-140px)] overflow-y-auto">
          {/* Información General y Académica en 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Información General */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#8B0000] to-[#660000] text-white px-4 py-3 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <User className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">Información General</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Género</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {getGenderLabel(patient.gender)}
                      {/* Debug: {JSON.stringify(patient.gender)} */}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de Nacimiento</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{patient.birthdate ? formatDate(patient.birthdate) : 'No especificado'}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Edad</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{calculateAge(patient.birthdate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Académica */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#8B0000] to-[#660000] text-white px-4 py-3 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">Información Académica</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Programa de Estudios</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{patient.career || 'No especificado'}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Semestre</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{patient.semester ? `${patient.semester}° Semestre` : 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contacto de Emergencia en una fila */}
          {patient.emergency_contact && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#8B0000] to-[#660000] text-white px-4 py-3 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">Contacto de Emergencia</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre del Contacto</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{patient.emergency_contact.name || 'No especificado'}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Relación</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{patient.emergency_contact.relationship || 'No especificado'}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono de Emergencia</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{formatPhoneNumber(patient.emergency_contact.phone)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cerrar
            </Button>
            {patient.medical_info && (
              <Button
                onClick={() => setShowMedicalInfo(true)}
                className="bg-[#1e3a8a] text-white hover:bg-[#1e40af]"
              >
                Ver Información Médica
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Información Médica */}
      {showMedicalInfo && patient.medical_info && (
        <MedicalInfoModal
          isOpen={showMedicalInfo}
          onClose={() => setShowMedicalInfo(false)}
          medicalInfo={patient.medical_info}
        />
      )}
    </div>
  );
}

