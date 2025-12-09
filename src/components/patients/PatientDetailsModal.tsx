import { patientsService } from '../../services/patients';
import { useState, useEffect, useRef } from 'react';
import { MedicalInfoModal } from './MedicalInfoModal';
import { User, AlertTriangle, BookOpen, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
}

export function PatientDetailsModal({ isOpen, onClose, patientId }: PatientDetailsModalProps) {
  const [patient, setPatient] = useState<any>(null);
  const [showMedicalInfo, setShowMedicalInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      loadingRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Solo cargar si el modal está abierto y hay un patientId válido
    if (!isOpen || !patientId || loadingRef.current) {
      if (!isOpen) {
        // Limpiar datos cuando se cierra el modal
        setPatient(null);
      }
      return;
    }

    // Prevenir llamadas duplicadas
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    patientsService.getPatient(patientId)
      .then((res) => {
        if (!isMountedRef.current) {
          return;
        }
        if (res && res.success && res.data) {
          setPatient(res.data);
        } else {
          setPatient(null);
        }
      })
      .catch((err) => {
        if (!isMountedRef.current) {
          return;
        }
        console.error('Error loading patient details:', err);
        setPatient(null);
      })
      .finally(() => {
        if (isMountedRef.current) {
          setLoading(false);
        }
        loadingRef.current = false;
      });
  }, [isOpen, patientId]);

  if (!isOpen) return null;
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-[#7a0c0c] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700 font-medium">Cargando información del paciente...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male':
      case 'masculino': return 'Masculino';
      case 'female':
      case 'femenino': return 'Femenino';
      case 'other':
      case 'otro': return 'Otro';
      default: return 'No especificado';
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return 'No especificado';
    if (phone.startsWith('+51')) return phone.replace('+51', '+51 ');
    if (phone.startsWith('51')) return `+51 ${phone.slice(2)}`;
    return `+51 ${phone}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
        {/* Header compacto */}
        <div className="relative bg-[#7a0c0c] p-0">
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-10 pt-4 sm:pt-6 pb-2">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/90 rounded-full flex items-center justify-center border-2 border-white/30">
                <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#7a0c0c]" />
              </div>
              <div className="text-sm sm:text-base md:text-xl font-semibold text-white/80 leading-tight ml-1 sm:ml-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span>Información del Paciente:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-normal text-xs sm:text-sm md:text-base text-white/70">{patient.name}</span>
                    <span className={`text-xs font-semibold rounded flex items-center gap-1 ${patient.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} px-2 py-0.5`} style={{ width: 'auto', display: 'inline-flex' }}> 
                      {patient.active ? <span className="text-xs font-bold">✔</span> : <span className="text-xs font-bold">✖</span>} 
                      {patient.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 transition-all duration-300 rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0"
            >
              <X className="w-4 h-4 sm:w-6 sm:h-6" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 md:gap-x-8 gap-y-1 sm:gap-y-2 px-4 sm:px-6 md:px-12 pb-3 sm:pb-4 justify-start">
            <span className="text-[#f5d7d7] text-xs sm:text-sm font-semibold">DNI: <span className="font-bold text-white">{patient.dni || 'No especificado'}</span></span>
            <span className="text-[#f5d7d7] text-xs sm:text-sm font-semibold">EMAIL: <span className="font-bold text-white">{patient.email || 'No especificado'}</span></span>
            <span className="text-[#f5d7d7] text-xs sm:text-sm font-semibold">TEL: <span className="font-bold text-white">{formatPhoneNumber(patient.phone)}</span></span>
            <span className="text-[#f5d7d7] text-xs sm:text-sm font-semibold flex items-center">UBICACIÓN: <span className="font-bold text-white ml-1">{patient.address || 'No especificada'}</span></span>
          </div>
        </div>

        {/* Body compacto */}
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* Información General */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-center gap-2 bg-[#7a0c0c] rounded-t-xl px-3 sm:px-4 py-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white font-bold uppercase text-xs sm:text-sm">Información General</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="bg-white border rounded-lg p-2 sm:p-3 text-center">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Género</div>
                  <div className="font-medium text-gray-800 mt-1 text-sm sm:text-base">{getGenderLabel(patient.gender)}</div>
                </div>
                <div className="bg-white border rounded-lg p-2 sm:p-3 text-center">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Fecha de Nacimiento</div>
                  <div className="font-medium text-gray-800 mt-1 text-sm sm:text-base">{formatDate(patient.birthdate)}</div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mt-2">Edad</div>
                  <div className="font-medium text-gray-800 mt-1 text-sm sm:text-base">{calculateAge(patient.birthdate)}</div>
                </div>
              </div>
            </div>
            {/* Información Académica */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-center gap-2 bg-[#7a0c0c] rounded-t-xl px-3 sm:px-4 py-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white font-bold uppercase text-xs sm:text-sm">Información Académica</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="bg-white border rounded-lg p-2 sm:p-3 text-center">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Programa de Estudios</div>
                  <div className="font-medium text-gray-800 mt-1 text-sm sm:text-base">{patient.career || 'No especificado'}</div>
                  <div className="font-medium text-gray-800 mt-1 text-sm sm:text-base">{patient.semester ? `${patient.semester}º semestre` : 'No especificado'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-center gap-2 bg-[#7a0c0c] rounded-t-xl px-3 sm:px-4 py-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span className="text-white font-bold uppercase text-xs sm:text-sm">Contacto de Emergencia</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4">
              <div className="bg-white border rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs font-semibold text-gray-500 uppercase">Nombre del Contacto</div>
                <div className="font-medium text-gray-800 mt-1 text-sm sm:text-base">{patient.emergency_contact?.name || 'No especificado'}</div>
              </div>
              <div className="bg-white border rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs font-semibold text-gray-500 uppercase">Relación</div>
                <div className="font-medium text-gray-800 mt-1 text-sm sm:text-base">{patient.emergency_contact?.relationship || 'No especificado'}</div>
              </div>
              <div className="bg-white border rounded-lg p-2 sm:p-3 text-center sm:col-span-2 lg:col-span-1">
                <div className="text-xs font-semibold text-gray-500 uppercase">Teléfono de Emergencia</div>
                <div className="font-medium text-gray-800 mt-1 text-sm sm:text-base">{formatPhoneNumber(patient.emergency_contact?.phone)}</div>
              </div>
            </div>
          </div>

          {/* Footer compacto */}
          <div className="flex justify-end gap-2 pt-2 sm:pt-3 md:pt-4">
            <Button
              onClick={onClose}
              className="bg-white border border-[#7a0c0c] text-[#7a0c0c] px-4 sm:px-6 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-100"
            >
              Cerrar
            </Button>
            <Button
              className="bg-[#1d2977] hover:bg-[#2336a3] text-white px-4 sm:px-6 py-2 rounded-lg font-semibold text-xs sm:text-sm"
              onClick={() => setShowMedicalInfo(true)}
            >
              Ver Información Médica
            </Button>
          </div>
        </div>
        {/* Modal de Información Médica */}
        {showMedicalInfo && (
          <MedicalInfoModal
            isOpen={showMedicalInfo}
            onClose={() => setShowMedicalInfo(false)}
            medicalInfo={patient.medical_info}
            patientName={patient.name}
          />
        )}
      </div>
    </div>
  );
}
