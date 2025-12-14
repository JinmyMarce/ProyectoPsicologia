import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PersonalDataModal } from '../appointments/PersonalDataModal';
import { EmergencyContactModal } from '../appointments/EmergencyContactModal';
import { MedicalInfoModal } from '../appointments/MedicalInfoModal';
import { patientsService } from '../../services/patients';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

interface MultiStepPatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  patientId?: number;
  patientData?: any; // datos completos si se edita
}

export const MultiStepPatientRegistrationModal: React.FC<MultiStepPatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patientId,
  patientData
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [personalData, setPersonalData] = useState<any>(null);
  const [emergencyContact, setEmergencyContact] = useState<any>(null);
  const [medicalInfo, setMedicalInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);
  const patientDataRef = useRef<any>(null);

  // Memoizar patientData usando una clave estable para evitar cambios innecesarios
  const memoizedPatientData = useMemo(() => {
    if (!patientData) return null;
    // Crear una copia estable del objeto para evitar referencias cambiantes
    return {
      personalData: patientData.personalData || null,
      emergencyContact: patientData.emergencyContact || null,
      medicalInfo: patientData.medicalInfo || null
    };
  }, [
    patientData?.personalData?.dni,
    patientData?.personalData?.fullName,
    patientData?.personalData?.email,
    patientData?.emergencyContact?.name,
    patientData?.emergencyContact?.phone,
    patientData?.medicalInfo?.medicalHistory,
    patientId
  ]);

  // Precargar datos si es edición - solo cuando cambia patientData o se abre el modal
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      loadingRef.current = false;
    };
  }, []);

  // Ref para rastrear si ya se cargaron los datos iniciales
  const dataLoadedRef = useRef(false);
  
  useEffect(() => {
    // Solo actualizar si el modal está abierto y no se han cargado los datos aún
    if (!isOpen) {
      dataLoadedRef.current = false;
      return;
    }

    // Solo cargar datos una vez cuando se abre el modal
    if (isOpen && !dataLoadedRef.current && memoizedPatientData) {
      dataLoadedRef.current = true;
      patientDataRef.current = memoizedPatientData;
      if (isMountedRef.current) {
        setPersonalData(memoizedPatientData.personalData || null);
        setEmergencyContact(memoizedPatientData.emergencyContact || null);
        setMedicalInfo(memoizedPatientData.medicalInfo || null);
      }
    } else if (isOpen && !memoizedPatientData && !dataLoadedRef.current) {
      // Si no hay datos y el modal se abre, limpiar
      dataLoadedRef.current = true;
      patientDataRef.current = null;
      if (isMountedRef.current) {
        setPersonalData(null);
        setEmergencyContact(null);
        setMedicalInfo(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Solo depender de isOpen para evitar bucles infinitos

  // Resetear cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      // Resetear solo cuando se cierra
      setCurrentStep(1);
      setError('');
      setSuccess('');
      loadingRef.current = false;
      dataLoadedRef.current = false;
      patientDataRef.current = null;
    }
  }, [isOpen]);

  const handlePersonalDataContinue = (data: any) => {
    setPersonalData(data);
    setCurrentStep(2);
  };

  const handleEmergencyContactContinue = (data: any) => {
    setEmergencyContact(data);
    setCurrentStep(3);
  };

  const handleMedicalInfoContinue = async (data: any) => {
    if (loadingRef.current || !isMountedRef.current) {
      return;
    }

    setMedicalInfo(data);
    loadingRef.current = true;
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Unificar datos para registro/edición
      const payload = {
        ...personalData,
        ...emergencyContact,
        ...data,
      };
      
      let response;
      if (patientId) {
        response = await patientsService.updatePatient(patientId, payload);
      } else {
        response = await patientsService.createPatient(payload);
      }
      
      if (!isMountedRef.current) {
        return;
      }

      if (response && response.success) {
        setSuccess(patientId ? 'Paciente modificado exitosamente' : 'Paciente registrado exitosamente');
        if (onSuccess) {
          // Usar setTimeout para evitar conflictos con el cierre del modal
          setTimeout(() => {
            onSuccess();
          }, 100);
        }
        onClose();
        // Navegar solo si no hay onSuccess callback
        if (!onSuccess) {
          setTimeout(() => {
            navigate('/patients');
          }, 200);
        }
      } else {
        setError(response?.message || (patientId ? 'Error al modificar paciente' : 'Error al registrar paciente'));
      }
    } catch (err: any) {
      if (!isMountedRef.current) {
        return;
      }
      const errorMessage = err?.response?.data?.message || err?.message || (patientId ? 'Error al modificar paciente' : 'Error al registrar paciente');
      setError(errorMessage);
      console.error('Error saving patient:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setPersonalData(null);
    setEmergencyContact(null);
    setMedicalInfo(null);
    setError('');
    setSuccess('');
    onClose();
  };

  const getStepTitle = () => {
    if (patientId) {
      // Modo modificar
      switch (currentStep) {
        case 1:
          return "Información General";
        case 2:
          return "Contacto de Emergencia";
        case 3:
          return "Información Médica";
        default:
          return "Modificar Datos del Paciente";
      }
    } else {
      // Modo crear
      switch (currentStep) {
        case 1:
          return "Información General";
        case 2:
          return "Contacto de Emergencia";
        case 3:
          return "Información Médica";
        default:
          return "Registrar Nuevo Paciente";
      }
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 1:
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 2:
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 3:
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
    }
  };

  const getModalWidth = () => {
    switch (currentStep) {
      case 1:
        return "max-w-2xl"; // Información General - más ancho
      case 2:
        return "max-w-md"; // Contacto de Emergencia - menos ancho
      case 3:
        return "max-w-lg"; // Información Médica - menos ancho
      default:
        return "max-w-2xl";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 xs:p-3 sm:p-4">
      <div className={`bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-300 ${getModalWidth()} w-full max-w-full sm:max-w-lg lg:max-w-2xl mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          {/* Header común - Azul marino oscuro */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-3 rounded-xl shadow-md">
                {getStepIcon()}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {getStepTitle()}
                </h2>
                <p className="text-sm text-slate-700 font-semibold">Paso {currentStep} de 3</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg p-2 transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Nota informativa para registro de pacientes */}
          {!patientId && (
            <div className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="text-slate-700 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-slate-900">
                  <p className="font-bold">Registro por Psicólogo</p>
                  <p className="mt-1 font-medium">Este formulario es para registrar pacientes que no pueden acceder al sistema por sí mismos (sin internet, celular, etc.). Los estudiantes con email institucional pueden auto-registrarse usando Google OAuth.</p>
                </div>
              </div>
            </div>
          )}

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-700 font-bold">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <p className="text-green-700 font-bold">{success}</p>
            </div>
          )}

          {/* Contenido del paso actual */}
          {currentStep === 1 && (
            <div className="w-full">
              <PersonalDataModal
                isOpen={false} // No renderizar como modal independiente
                onClose={onClose}
                onBack={onClose}
                onContinue={handlePersonalDataContinue}
                selectedDate=""
                selectedTime=""
                userData={undefined}
                disableNameAndEmail={!!patientId}
                initialData={personalData}
              />
            </div>
          )}
          {currentStep === 2 && (
            <div className="w-full">
              <EmergencyContactModal
                isOpen={false} // No renderizar como modal independiente
                onClose={onClose}
                onBack={handleBack}
                onContinue={handleEmergencyContactContinue}
                selectedDate=""
                selectedTime=""
                personalData={personalData}
                initialData={emergencyContact}
              />
            </div>
          )}
          {currentStep === 3 && (
            <div className="w-full">
              <MedicalInfoModal
                isOpen={false} // No renderizar como modal independiente
                onClose={onClose}
                onBack={handleBack}
                onContinue={handleMedicalInfoContinue}
                selectedDate=""
                selectedTime=""
                personalData={personalData}
                emergencyContact={emergencyContact}
                isFirstAppointment={!patientId}
                initialData={medicalInfo}
                isEditingMode={!!patientId} // Solo verdadero cuando se está modificando un paciente existente
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
