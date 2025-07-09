import React, { useState } from 'react';
import { TimeSelectionModal } from './TimeSelectionModal';
import { PersonalDataModal } from './PersonalDataModal';
import { EmergencyContactModal } from './EmergencyContactModal';
import { MedicalInfoModal } from './MedicalInfoModal';
import { createAppointment } from '../../services/appointments';
import { useAuth } from '../../contexts/AuthContext';

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

      const appointmentDataToSend = {
        psychologist_id: psychologistId,
        date: selectedDate,
        time: appointmentData.time!,
        reason: medicalInfo.reason || '',
        notes: '',
        user_email: user.email,
        status: 'pending',
        // Datos personales del paciente
        patient_dni: appointmentData.personalData!.dni,
        patient_full_name: appointmentData.personalData!.fullName,
        patient_age: parseInt(appointmentData.personalData!.age),
        patient_gender: appointmentData.personalData!.gender,
        patient_address: appointmentData.personalData!.address,
        patient_study_program: appointmentData.personalData!.studyProgram,
        patient_semester: appointmentData.personalData!.semester,
        // Datos de contacto del paciente
        patient_phone: appointmentData.personalData!.phone,
        patient_email: appointmentData.personalData!.email,
        // Contacto de emergencia
        emergency_contact_name: appointmentData.emergencyContact!.name,
        emergency_contact_relationship: appointmentData.emergencyContact!.relationship,
        emergency_contact_phone: appointmentData.emergencyContact!.phone,
        // Información médica (opcional)
        medical_history: medicalInfo.medicalHistory || '',
        current_medications: medicalInfo.currentMedications || '',
        allergies: medicalInfo.allergies || ''
      };

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
          />
        );
      default:
        return null;
    }
  };

  // Mostrar error si existe
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="text-center">
              <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al agendar cita</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => setError('')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

  // Mostrar loading si está procesando
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Agendando cita...</h3>
              <p className="text-gray-600">Por favor espera mientras procesamos tu solicitud.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return renderCurrentStep();
}; 