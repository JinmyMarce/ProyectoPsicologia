import React, { useState } from 'react';
import { TimeSelectionModal } from './TimeSelectionModal';
import { PersonalDataModal } from './PersonalDataModal';
import { EmergencyContactModal } from './EmergencyContactModal';
import { MedicalInfoModal } from './MedicalInfoModal';
import { createAppointment } from '../../services/appointments';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, Clock, User, Phone, FileText, Shield, CheckSquare } from 'lucide-react';

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

  const handleTimeSelected = (time: string) => {
    setAppointmentData(prev => ({ ...prev, time }));
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

    // Crear la cita
    setLoading(true);
    setError('');

    try {
      if (!user?.email) {
        throw new Error('Usuario no autenticado');
      }

      // Garantizar formato YYYY-MM-DD para patient_birthdate
      let birthDate = appointmentData.personalData!.birthDate;
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
        reason: medicalInfo.reason || '',
        duracion: 45,
        // Datos personales del paciente
        patient_dni: appointmentData.personalData?.dni || '',
        patient_name: appointmentData.personalData?.fullName || '',
        patient_birthdate: birthDate,
        patient_gender: appointmentData.personalData?.gender || '',
        patient_address: appointmentData.personalData?.address || '',
        patient_study_program: appointmentData.personalData?.studyProgram || '',
        patient_semester: appointmentData.personalData?.semester || '',
        patient_phone: appointmentData.personalData?.phone || '',
        patient_email: appointmentData.personalData?.email || '',
        // Contacto de emergencia
        emergency_contact_name: appointmentData.emergencyContact!.name,
        emergency_contact_relationship: appointmentData.emergencyContact!.relationship,
        emergency_contact_phone: appointmentData.emergencyContact!.phone,
        // Información médica (opcional)
        medical_history: medicalInfo.medicalHistory || '',
        current_medications: medicalInfo.currentMedications || '',
        allergies: medicalInfo.allergies || ''
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
    onClose();
  };

  const renderProgressBar = () => (
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

  const renderCurrentStep = () => {
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
            initialData={appointmentData.personalData ? {
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
            initialData={appointmentData.personalData ? {
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
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-sm sm:max-w-md lg:max-w-lg w-full border border-slate-200 sm:border-2" style={{
          boxShadow: `
            0 20px 40px rgba(0, 0, 0, 0.25), 
            0 10px 20px rgba(0, 0, 0, 0.15),
            0 5px 10px rgba(0, 0, 0, 0.1)
          `
        }}>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg border border-red-400 sm:border-2">
                <XCircle className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 mb-3 sm:mb-4 tracking-tight">
                Error al Agendar Cita
              </h3>
              <p className="text-slate-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base lg:text-lg font-medium px-2">{error}</p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 border border-slate-300 sm:border-2 rounded-lg sm:rounded-xl text-slate-700 hover:bg-slate-50 transition-all duration-300 font-semibold text-sm sm:text-base"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => setError('')}
                  className="flex-1 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg sm:rounded-xl hover:from-slate-800 hover:to-slate-900 transition-all duration-300 font-semibold text-sm sm:text-base shadow-md sm:shadow-lg"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar loading si está procesando - Responsivo
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-sm sm:max-w-md lg:max-w-lg w-full border border-slate-200 sm:border-2" style={{
          boxShadow: `
            0 20px 40px rgba(0, 0, 0, 0.25), 
            0 10px 20px rgba(0, 0, 0, 0.15),
            0 5px 10px rgba(0, 0, 0, 0.1)
          `
        }}>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className="animate-spin rounded-full h-14 w-14 sm:h-16 sm:w-16 border-3 sm:border-4 border-slate-200 border-t-slate-700 mx-auto" style={{
                  boxShadow: '0 6px 12px rgba(51, 65, 85, 0.2)'
                }}></div>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 mb-3 sm:mb-4 tracking-tight">
                Agendando Cita
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base lg:text-lg font-medium mb-6 sm:mb-8 px-2">
                Procesando tu solicitud de manera segura...
              </p>

              {/* Información adicional */}
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                <div className="flex items-center justify-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-200">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 flex-shrink-0" />
                  <span className="text-slate-700 font-semibold text-xs sm:text-sm">Datos protegidos y seguros</span>
                </div>
                <div className="flex items-center justify-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-200">
                  <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 flex-shrink-0" />
                  <span className="text-slate-700 font-semibold text-xs sm:text-sm">Proceso automatizado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return renderCurrentStep();
}; 