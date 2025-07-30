import React, { useState } from 'react';
import { PersonalDataModal } from '../appointments/PersonalDataModal';
import { EmergencyContactModal } from '../appointments/EmergencyContactModal';
import { MedicalInfoModal } from '../appointments/MedicalInfoModal';
import { patientsService } from '../../services/patients';
import { useNavigate } from 'react-router-dom';

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
  const [personalData, setPersonalData] = useState<any>(patientData?.personalData || null);
  const [emergencyContact, setEmergencyContact] = useState<any>(patientData?.emergencyContact || null);
  const [medicalInfo, setMedicalInfo] = useState<any>(patientData?.medicalInfo || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Precargar datos si es edición
  React.useEffect(() => {
    if (patientData) {
      setPersonalData(patientData.personalData || null);
      setEmergencyContact(patientData.emergencyContact || null);
      setMedicalInfo(patientData.medicalInfo || null);
    }
  }, [patientData]);

  const handlePersonalDataContinue = (data: any) => {
    setPersonalData(data);
    setCurrentStep(2);
  };

  const handleEmergencyContactContinue = (data: any) => {
    setEmergencyContact(data);
    setCurrentStep(3);
  };

  const handleMedicalInfoContinue = async (data: any) => {
    setMedicalInfo(data);
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
      if (response.success) {
        setSuccess(patientId ? 'Paciente modificado exitosamente' : 'Paciente registrado exitosamente');
        if (onSuccess) onSuccess();
        onClose();
        navigate('/patients');
      } else {
        setError(response.message || (patientId ? 'Error al modificar paciente' : 'Error al registrar paciente'));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || (patientId ? 'Error al modificar paciente' : 'Error al registrar paciente'));
    } finally {
      setLoading(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl p-6 relative">
        {currentStep === 1 && (
          <PersonalDataModal
            isOpen={isOpen}
            onClose={handleClose}
            onBack={handleClose}
            onContinue={handlePersonalDataContinue}
            selectedDate={''}
            selectedTime={''}
            userData={undefined}
            disableNameAndEmail={false} // Permitir editar nombre y correo
            initialData={personalData}
          />
        )}
        {currentStep === 2 && (
  <EmergencyContactModal
    isOpen={isOpen}
    onClose={handleClose}
    onBack={handleBack}
    onContinue={handleEmergencyContactContinue}
    selectedDate={''}
    selectedTime={''}
    personalData={personalData}
    initialData={emergencyContact}
  />
)}
        {currentStep === 3 && (
  <MedicalInfoModal
    isOpen={isOpen}
    onClose={handleClose}
    onBack={handleBack}
    onContinue={handleMedicalInfoContinue}
    selectedDate={''}
    selectedTime={''}
    personalData={personalData}
    emergencyContact={emergencyContact}
    isFirstAppointment={true}
    initialData={medicalInfo}
  />
)}
        {loading && <div className="mt-4 text-center text-[#8e161a]">Registrando paciente...</div>}
        {error && <div className="mt-4 text-center text-red-600">{error}</div>}
        {success && <div className="mt-4 text-center text-green-600">{success}</div>}
      </div>
    </div>
  );
};
