import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TimeSelectionModal } from './TimeSelectionModal';
import { PersonalDataModal } from './PersonalDataModal';
import { EmergencyContactModal } from './EmergencyContactModal';
import { MedicalInfoModal } from './MedicalInfoModal';
import { createAppointment } from '../../services/appointments';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile } from '../../services/users';
import { CheckCircle, XCircle, Clock, User, Phone, FileText, Shield, CheckSquare, Edit } from 'lucide-react';

interface AppointmentData {
  psychologistId: number;
  date: string;
  time: string;
  personalData: any;
  emergencyContact: any;
  medicalInfo: any;
}

interface MultiStepAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  psychologistId: number;
  selectedDate: string;
  isFirstAppointment: boolean;
  onSuccess: () => void;
}

export const MultiStepAppointmentModal: React.FC<MultiStepAppointmentModalProps> = ({
  isOpen,
  onClose,
  psychologistId,
  selectedDate,
  isFirstAppointment,
  onSuccess
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentData, setAppointmentData] = useState<Partial<AppointmentData>>({
    psychologistId,
    date: selectedDate
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showDataOptions, setShowDataOptions] = useState(false);
  const [userDataComplete, setUserDataComplete] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Selección de Horario',
      subtitle: 'Elige el horario ideal',
      icon: Clock,
      description: 'Selecciona el horario que mejor se adapte a tu disponibilidad',
      color: 'from-gray-700 to-gray-800',
      bgColor: 'from-gray-50 to-gray-100',
      gradient: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
      accentColor: '#374151',
      features: ['Horarios flexibles', 'Confirmación inmediata', 'Recordatorios automáticos']
    },
    {
      id: 2,
      title: 'Datos Personales',
      subtitle: 'Información básica',
      icon: User,
      description: 'Completa tu información personal para el registro',
      color: 'from-gray-600 to-gray-700',
      bgColor: 'from-gray-50 to-gray-100',
      gradient: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)',
      accentColor: '#4b5563',
      features: ['Datos seguros', 'Proceso rápido', 'Validación automática']
    },
    {
      id: 3,
      title: 'Contacto de Emergencia',
      subtitle: 'Seguridad y respaldo',
      icon: Phone,
      description: 'Proporciona un contacto de emergencia para tu seguridad',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'from-gray-50 to-gray-100',
      gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      accentColor: '#6b7280',
      features: ['Contacto confiable', 'Información privada', 'Acceso rápido']
    },
    {
      id: 4,
      title: 'Información Médica',
      subtitle: 'Historial y motivo',
      icon: FileText,
      description: 'Comparte información médica relevante para tu consulta',
      color: 'from-gray-400 to-gray-500',
      bgColor: 'from-gray-50 to-gray-100',
      gradient: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
      accentColor: '#9ca3af',
      features: ['Historial completo', 'Motivo de consulta', 'Medicamentos actuales']
    }
  ];

  // Función para verificar si los datos están completos
  const checkUserDataComplete = (profile: any): boolean => {
    const hasEssentialData = !!(
      profile.dni &&
      profile.dni.trim() !== '' &&
      profile.phone &&
      profile.phone.trim() !== '' &&
      profile.address &&
      profile.address.trim() !== '' &&
      profile.gender &&
      profile.gender.trim() !== '' &&
      profile.birthdate &&
      profile.career &&
      profile.career.trim() !== '' &&
      profile.semester &&
      profile.semester.trim() !== ''
    );

    const emergencyContact = profile.emergency_contact || {
      name: profile.emergency_name,
      phone: profile.emergency_phone,
      relationship: profile.emergency_relationship
    };

    const hasEmergencyContact = !!(
      emergencyContact?.name &&
      emergencyContact.name.trim() !== '' &&
      emergencyContact?.phone &&
      emergencyContact.phone.trim() !== '' &&
      emergencyContact?.relationship &&
      emergencyContact.relationship.trim() !== ''
    );

    return hasEssentialData && hasEmergencyContact;
  };

  // Cargar perfil del usuario cuando se selecciona un horario
  const loadUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const profile = await getProfile();
      console.log('Perfil cargado:', profile);
      console.log('Estado civil:', profile.marital_status);
      setUserProfile(profile);
      const isComplete = checkUserDataComplete(profile);
      setUserDataComplete(isComplete);
      
      if (isComplete) {
        // Si los datos están completos, mostrar opciones
        setShowDataOptions(true);
      } else {
        // Si no están completos, continuar con el flujo normal
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      // En caso de error, continuar con el flujo normal
      setCurrentStep(2);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleTimeSelected = async (time: string) => {
    setAppointmentData(prev => ({ ...prev, time }));
    // Cargar datos del usuario antes de continuar
    await loadUserProfile();
  };

  // Función para limpiar teléfono (remover +51 y espacios)
  const cleanPhone = (phone: string | undefined): string => {
    if (!phone) return '';
    return phone.replace('+51', '').replace(/\D/g, '');
  };

  // Función para formatear fecha de nacimiento (asegurar formato YYYY-MM-DD)
  const formatBirthDate = (birthdate: string | undefined): string => {
    if (!birthdate) return '';
    // Si ya está en formato YYYY-MM-DD, retornarlo
    if (/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
      return birthdate;
    }
    // Intentar parsear y convertir
    const date = new Date(birthdate);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return birthdate;
  };

  // Función para prellenar datos del usuario
  const prefillUserData = () => {
    if (!userProfile) return null;

    const emergencyContact = userProfile.emergency_contact || {
      name: userProfile.emergency_name,
      phone: userProfile.emergency_phone,
      relationship: userProfile.emergency_relationship
    };

    const medicalInfo = userProfile.medical_info || {
      medical_history: userProfile.medical_conditions || '',
      current_medications: userProfile.current_medications || '',
      allergies: userProfile.allergies || ''
    };

    // Obtener estado civil - verificar múltiples posibles nombres del campo y normalizar
    const maritalStatusRaw = userProfile.marital_status || 
                             (userProfile as any).maritalStatus || 
                             (userProfile as any).marital_status || 
                             '';
    
    // Normalizar el valor a minúsculas para que coincida con las opciones del select
    const maritalStatus = maritalStatusRaw ? maritalStatusRaw.toLowerCase() : '';

    console.log('Prellenando datos - Estado civil (raw):', maritalStatusRaw);
    console.log('Prellenando datos - Estado civil (normalizado):', maritalStatus);

    return {
      personalData: {
        dni: userProfile.dni || '',
        fullName: userProfile.name || '',
        birthDate: formatBirthDate(userProfile.birthdate),
        gender: userProfile.gender || '',
        maritalStatus: maritalStatus,
        address: userProfile.address || '',
        studyProgram: userProfile.career || userProfile.study_program || '',
        semester: userProfile.semester || '',
        phone: cleanPhone(userProfile.phone),
        email: userProfile.email || '',
        emergencyContactName: emergencyContact?.name || '',
        emergencyContactRelationship: emergencyContact?.relationship || '',
        emergencyContactPhone: cleanPhone(emergencyContact?.phone),
        medicalHistory: medicalInfo.medical_history || '',
        currentMedications: medicalInfo.current_medications || '',
        allergies: medicalInfo.allergies || ''
      },
      emergencyContact: {
        name: emergencyContact?.name || '',
        relationship: emergencyContact?.relationship || '',
        phone: cleanPhone(emergencyContact?.phone)
      },
      medicalInfo: {
        medicalHistory: medicalInfo.medical_history || '',
        currentMedications: medicalInfo.current_medications || '',
        allergies: medicalInfo.allergies || '',
        reason: ''
      }
    };
  };

  const handleAgendarDirecto = async () => {
    // Agendar directamente con los datos existentes
    const prefillData = prefillUserData();
    if (!prefillData) {
      setError('Error al cargar los datos del usuario');
      return;
    }

    // Actualizar el estado primero
    setAppointmentData(prev => ({
      ...prev,
      personalData: prefillData.personalData,
      emergencyContact: prefillData.emergencyContact,
      medicalInfo: prefillData.medicalInfo
    }));

    // Proceder directamente a crear la cita con los datos prellenados
    await createAppointmentWithData(
      prefillData.personalData,
      prefillData.emergencyContact,
      prefillData.medicalInfo
    );
  };

  const handleEditarDatos = () => {
    // Prellenar datos y continuar con el flujo de edición
    const prefillData = prefillUserData();
    if (prefillData) {
      setAppointmentData(prev => ({
        ...prev,
        personalData: prefillData.personalData
      }));
    }
    setShowDataOptions(false);
    setCurrentStep(2);
  };

  const handlePersonalDataComplete = (personalData: any) => {
    setAppointmentData(prev => ({ ...prev, personalData }));
    setCurrentStep(3);
  };

  const handleEmergencyContactComplete = (emergencyContact: any) => {
    setAppointmentData(prev => ({ ...prev, emergencyContact }));
    setCurrentStep(4);
  };

  const handleMedicalInfoComplete = async (medicalInfo: any) => {
    setAppointmentData(prev => ({ ...prev, medicalInfo }));
    // Usar los datos del estado actualizado
    await createAppointmentWithData(
      appointmentData.personalData,
      appointmentData.emergencyContact,
      medicalInfo
    );
  };

  const createAppointmentWithData = async (
    personalData?: any,
    emergencyContact?: any,
    medicalInfo?: any
  ) => {
    // Crear la cita
    setLoading(true);
    setError('');

    try {
      if (!user?.email) {
        throw new Error('Usuario no autenticado');
      }

      // Usar los datos pasados como parámetros o los del estado
      const finalPersonalData = personalData || appointmentData.personalData;
      const finalEmergencyContact = emergencyContact || appointmentData.emergencyContact;
      const finalMedicalInfo = medicalInfo || appointmentData.medicalInfo;

      // Validar que los datos personales y contacto de emergencia estén presentes
      if (!finalPersonalData) {
        throw new Error('Los datos personales son requeridos');
      }
      if (!finalEmergencyContact) {
        throw new Error('El contacto de emergencia es requerido');
      }

      // Garantizar formato YYYY-MM-DD para patient_birthdate
      let birthDate = finalPersonalData?.birthDate || '';
      if (birthDate) {
        // Si viene en otro formato, intentar convertir
        const dateObj = new Date(birthDate);
        if (!isNaN(dateObj.getTime())) {
          birthDate = dateObj.toISOString().split('T')[0];
        }
      } else {
        birthDate = '';
      }
      const calculateAge = (birthDateString: string): number => {
        if (!birthDateString) return 0;
        const today = new Date();
        const birthDateObj = new Date(birthDateString);
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
          age--;
        }
        return age;
      };

      const appointmentDataToSend = {
        // Campos requeridos por backend
        user_email: user.email,
        date: selectedDate,
        time: appointmentData.time!,
        status: 'pending',
        psychologist_id: psychologistId,
        reason: finalMedicalInfo?.reason || '',
        duracion: 45,
        // Datos personales del paciente
        patient_dni: finalPersonalData?.dni || '',
        patient_name: finalPersonalData?.fullName || '',
        patient_birthdate: birthDate,
        patient_gender: finalPersonalData?.gender || '',
        patient_marital_status: finalPersonalData?.maritalStatus || '',
        patient_address: finalPersonalData?.address || '',
        patient_study_program: finalPersonalData?.studyProgram || '',
        patient_semester: finalPersonalData?.semester || '',
        patient_phone: finalPersonalData?.phone || '',
        patient_email: finalPersonalData?.email || '',
        // Contacto de emergencia
        emergency_contact_name: finalEmergencyContact?.name || '',
        emergency_contact_relationship: finalEmergencyContact?.relationship || '',
        emergency_contact_phone: finalEmergencyContact?.phone || '',
        // Información médica (opcional)
        medical_history: finalMedicalInfo?.medicalHistory || '',
        current_medications: finalMedicalInfo?.currentMedications || '',
        allergies: finalMedicalInfo?.allergies || ''
      };
      console.log('Payload enviado:', appointmentDataToSend);
      await createAppointment(appointmentDataToSend);
      onSuccess();
      handleClose();
    } catch (error: any) {
      setError(error.message || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setAppointmentData({ psychologistId, date: selectedDate });
    setError('');
    setShowDataOptions(false);
    setUserProfile(null);
    setUserDataComplete(false);
    onClose();
  };

  // Reset cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setShowDataOptions(false);
      setUserProfile(null);
      setUserDataComplete(false);
    }
  }, [isOpen]);

  const renderProgressBar = () => {
    // No mostrar barra de progreso si estamos en el modal de opciones
    if (showDataOptions) return null;
    
    return (
    <div className="mb-4 sm:mb-6 lg:mb-8">
      {/* Header del progreso - Responsivo */}
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl sm:rounded-2xl border border-slate-200 sm:border-2 mb-4 sm:mb-6 shadow-md sm:shadow-lg">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
            <span className="text-white text-xs sm:text-sm font-bold">{currentStep}</span>
          </div>
          <span className="text-slate-700 font-bold text-xs sm:text-sm lg:text-base tracking-wide">
            <span className="hidden sm:inline">Paso {currentStep} de {steps.length} - </span>
            <span className="sm:hidden">{currentStep}/{steps.length} - </span>
            {steps[currentStep - 1].title}
          </span>
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
            <span className="text-white text-xs sm:text-sm font-bold">{steps.length}</span>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tight px-4" style={{
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          letterSpacing: '-0.5px'
        }}>
          {steps[currentStep - 1].subtitle}
        </h2>
        <p className="text-slate-600 text-sm sm:text-base lg:text-lg xl:text-xl max-w-3xl mx-auto font-medium leading-relaxed px-4">
          {steps[currentStep - 1].description}
        </p>
      </div>

      {/* Barra de progreso - Responsivo */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8 px-2 sm:px-0">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center relative">
                {/* Círculo del paso - Responsivo */}
                <div className={`
                  w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full flex items-center justify-center transition-all duration-500 transform relative border border-2
                  ${isCompleted
                    ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg sm:shadow-xl border-emerald-500'
                    : isCurrent
                      ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg sm:shadow-xl border-slate-600 scale-105'
                      : 'bg-white text-slate-400 shadow-sm sm:shadow-md border-slate-300'
                  }
                `} style={{
                    boxShadow: isCurrent || isCompleted
                      ? `0 8px 16px ${isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(51, 65, 85, 0.3)'}, 0 4px 8px rgba(0, 0, 0, 0.15)`
                      : '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" />
                  ) : (
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" />
                  )}
                </div>

                {/* Información del paso - Oculto en móvil */}
                <div className="mt-2 sm:mt-3 text-center max-w-20 sm:max-w-28 lg:max-w-32 hidden sm:block">
                  <p className={`text-xs sm:text-sm font-bold ${isCurrent ? 'text-slate-800' : isCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 hidden lg:block leading-tight">
                    {step.description}
                  </p>
                </div>

                {/* Indicador de paso actual */}
                {isCurrent && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center border border-white sm:border-2 shadow-md sm:shadow-lg">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                  </div>
                )}

                {/* Badge de completado */}
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center border border-white sm:border-2 shadow-md sm:shadow-lg">
                    <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Línea conectora - Responsivo */}
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 lg:mx-4 rounded-full transition-all duration-500 relative overflow-hidden
                  ${isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    : 'bg-slate-200'
                  }
                `} style={{
                    boxShadow: isCompleted
                      ? '0 1px 2px rgba(16, 185, 129, 0.2)'
                      : '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Características del paso actual - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8 px-2 sm:px-0">
        {steps[currentStep - 1].features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 bg-white rounded-lg sm:rounded-xl border border-slate-200 sm:border-2 transition-all duration-300 hover:border-slate-300 hover:shadow-sm sm:hover:shadow-md">
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-sm sm:shadow-md flex-shrink-0">
              <CheckSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" />
            </div>
            <span className="text-slate-700 font-semibold text-xs sm:text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
    );
  };

  const renderDataOptionsModal = () => {
    if (!showDataOptions) return null;

    return createPortal(
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000]" 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          zIndex: 10000
        }}
      >
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-sm xs:max-w-md w-full border border-slate-200 m-2 xs:m-3 sm:m-4">
          <div className="p-4 xs:p-5 sm:p-6">
            <div className="text-center mb-4 xs:mb-5 sm:mb-6">
              <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4 shadow-lg">
                <CheckCircle className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-emerald-600" />
              </div>
              <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-1.5 xs:mb-2">
                Tus datos están completos
              </h3>
              <p className="text-xs xs:text-sm text-gray-600 px-2">
                Puedes agendar la cita directamente o editar tus datos si lo necesitas.
              </p>
            </div>

            {loadingProfile ? (
              <div className="text-center py-3 xs:py-4">
                <div className="animate-spin rounded-full h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 border-2 xs:border-3 border-slate-200 border-t-slate-700 mx-auto"></div>
                <p className="text-xs xs:text-sm text-gray-600 mt-2">Cargando datos...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 xs:gap-2.5 sm:gap-3">
                <button
                  onClick={handleAgendarDirecto}
                  disabled={loading}
                  className="w-full px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-semibold text-xs xs:text-sm hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-1.5 xs:gap-2 disabled:opacity-50"
                >
                  <Clock className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5" />
                  <span>Agendar cita</span>
                </button>
                <button
                  onClick={handleEditarDatos}
                  className="w-full px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold text-xs xs:text-sm hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 xs:gap-2"
                >
                  <Edit className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5" />
                  <span>Editar datos</span>
                </button>
                <button
                  onClick={() => {
                    setShowDataOptions(false);
                    handleClose();
                  }}
                  className="w-full px-3 xs:px-4 py-1.5 xs:py-2 text-slate-600 rounded-xl font-medium text-xs xs:text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const renderCurrentStep = () => {
    // Mostrar modal de opciones si los datos están completos
    if (showDataOptions) {
      return renderDataOptionsModal();
    }

    switch (currentStep) {
      case 1:
        return (
          <TimeSelectionModal
            isOpen={isOpen}
            onClose={handleClose}
            psychologistId={psychologistId}
            selectedDate={selectedDate}
            onTimeSelected={handleTimeSelected}
          />
        );
      case 2:
        return (
          <PersonalDataModal
            isOpen={isOpen}
            onClose={handleClose}
            onBack={handleBack}
            onContinue={handlePersonalDataComplete}
            selectedDate={selectedDate}
            selectedTime={appointmentData.time!}
            userData={{
              fullName: user?.name || '',
              email: user?.email || ''
            }}
            disableNameAndEmail={true}
            initialData={appointmentData.personalData ? {
              dni: appointmentData.personalData.dni || '',
              fullName: appointmentData.personalData.fullName || '',
              birthDate: appointmentData.personalData?.birthDate || '',
              gender: appointmentData.personalData.gender || '',
              maritalStatus: appointmentData.personalData.maritalStatus || '',
              address: appointmentData.personalData.address || '',
              studyProgram: appointmentData.personalData.studyProgram || '',
              semester: appointmentData.personalData.semester || '',
              phone: appointmentData.personalData.phone || '',
              email: appointmentData.personalData.email || '',
              emergencyContactName: appointmentData.personalData.emergencyContactName || '',
              emergencyContactRelationship: appointmentData.personalData.emergencyContactRelationship || '',
              emergencyContactPhone: appointmentData.personalData.emergencyContactPhone || '',
              medicalHistory: appointmentData.personalData.medicalHistory || '',
              currentMedications: appointmentData.personalData.currentMedications || '',
              allergies: appointmentData.personalData.allergies || ''
            } : undefined}
          />
        );
      case 3:
        return (
          <EmergencyContactModal
            isOpen={isOpen}
            onClose={handleClose}
            onBack={handleBack}
            onContinue={handleEmergencyContactComplete}
            selectedDate={selectedDate}
            selectedTime={appointmentData.time!}
            personalData={appointmentData.personalData!}
            initialData={appointmentData.emergencyContact ? {
              name: appointmentData.emergencyContact.name || '',
              relationship: appointmentData.emergencyContact.relationship || '',
              phone: appointmentData.emergencyContact.phone || ''
            } : appointmentData.personalData ? {
              name: appointmentData.personalData.emergencyContactName || '',
              relationship: appointmentData.personalData.emergencyContactRelationship || '',
              phone: appointmentData.personalData.emergencyContactPhone || ''
            } : undefined}
          />
        );
      case 4:
        return (
          <MedicalInfoModal
            isOpen={isOpen}
            onClose={handleClose}
            onBack={handleBack}
            onContinue={handleMedicalInfoComplete}
            selectedDate={selectedDate}
            selectedTime={appointmentData.time!}
            personalData={appointmentData.personalData!}
            emergencyContact={appointmentData.emergencyContact!}
            isFirstAppointment={isFirstAppointment}
            initialData={appointmentData.medicalInfo ? {
              medicalHistory: appointmentData.medicalInfo.medicalHistory || '',
              currentMedications: appointmentData.medicalInfo.currentMedications || '',
              allergies: appointmentData.medicalInfo.allergies || '',
              reason: appointmentData.medicalInfo.reason || ''
            } : appointmentData.personalData ? {
              medicalHistory: appointmentData.personalData.medicalHistory || '',
              currentMedications: appointmentData.personalData.currentMedications || '',
              allergies: appointmentData.personalData.allergies || '',
              reason: ''
            } : undefined}
          />
        );
      default:
        return null;
    }
  };

  // Mostrar error si existe - Responsivo
  if (error) {
    return createPortal(
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000]" 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          zIndex: 10000
        }}
      >
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-[280px] xs:max-w-[320px] w-full border border-slate-200 m-2 xs:m-3 sm:m-4" style={{
          boxShadow: `
            0 20px 40px rgba(0, 0, 0, 0.25), 
            0 10px 20px rgba(0, 0, 0, 0.15),
            0 5px 10px rgba(0, 0, 0, 0.1)
          `
        }}>
          <div className="p-4 xs:p-5">
            <div className="text-center">
              <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-3 xs:mb-4 shadow-lg border border-red-400">
                <XCircle className="w-6 h-6 xs:w-7 xs:h-7 text-white" />
              </div>
              <h3 className="text-base xs:text-lg font-bold text-slate-900 mb-2 xs:mb-3 tracking-tight">
                Error al Agendar Cita
              </h3>
              <p className="text-slate-600 mb-4 xs:mb-5 leading-relaxed text-xs xs:text-sm font-medium px-2">{error}</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-2 xs:py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-300 font-semibold text-xs xs:text-sm"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => setError('')}
                  className="w-full px-4 py-2 xs:py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-300 font-semibold text-xs xs:text-sm shadow-md"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Mostrar loading si está procesando - Responsivo
  if (loading) {
    return createPortal(
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000]" 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          zIndex: 10000
        }}
      >
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-[280px] xs:max-w-[320px] w-full border border-slate-200 m-2 xs:m-3 sm:m-4" style={{
          boxShadow: `
            0 20px 40px rgba(0, 0, 0, 0.25), 
            0 10px 20px rgba(0, 0, 0, 0.15),
            0 5px 10px rgba(0, 0, 0, 0.1)
          `
        }}>
          <div className="p-4 xs:p-5">
            <div className="text-center">
              <div className="relative mb-3 xs:mb-4">
                <div className="animate-spin rounded-full h-10 w-10 xs:h-12 xs:w-12 border-3 border-slate-200 border-t-slate-700 mx-auto" style={{
                  boxShadow: '0 6px 12px rgba(51, 65, 85, 0.2)'
                }}></div>
              </div>
              <h3 className="text-base xs:text-lg font-bold text-slate-900 mb-2 xs:mb-3 tracking-tight">
                Agendando Cita
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs xs:text-sm font-medium mb-4 xs:mb-5 px-2">
                Procesando tu solicitud de manera segura...
              </p>

              {/* Información adicional */}
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-center space-x-2 p-2 xs:p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <Shield className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-slate-600 flex-shrink-0" />
                  <span className="text-slate-700 font-semibold text-[10px] xs:text-xs">Datos protegidos y seguros</span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-2 xs:p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <CheckSquare className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-slate-600 flex-shrink-0" />
                  <span className="text-slate-700 font-semibold text-[10px] xs:text-xs">Proceso automatizado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return renderCurrentStep();
}; 