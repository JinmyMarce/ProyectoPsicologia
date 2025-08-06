import React, { useState, useEffect } from 'react';
import { Heart, X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface MedicalInfo {
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  reason: string;
}

interface MedicalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onContinue: (data: MedicalInfo) => void;
  selectedDate: string;
  selectedTime: string;
  personalData: any;
  emergencyContact: any;
  isFirstAppointment: boolean;
  initialData?: MedicalInfo;
  isEditingMode?: boolean; // Nueva prop para distinguir el contexto del psicólogo
}

export const MedicalInfoModal: React.FC<MedicalInfoModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onContinue,
  selectedDate,
  selectedTime,
  personalData,
  emergencyContact,
  isFirstAppointment,
  initialData,
  isEditingMode = false // Por defecto false para no afectar estudiantes
}) => {
  const [formData, setFormData] = useState<MedicalInfo>({
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    reason: ''
  });

  const [errors, setErrors] = useState<Partial<MedicalInfo>>({});

  // Actualizar formData cuando cambie initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        medicalHistory: initialData.medicalHistory || '',
        currentMedications: initialData.currentMedications || '',
        allergies: initialData.allergies || '',
        reason: initialData.reason || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (field: keyof MedicalInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<MedicalInfo> = {};

    // Solo validar motivo de consulta si es primera cita
    if (isFirstAppointment && !formData.reason.trim()) {
      newErrors.reason = 'El motivo de la consulta es obligatorio para primera vez';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onContinue(formData);
    }
  };

  function parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Si isOpen es false, renderizar solo el contenido (para uso en MultiStepPatientRegistrationModal)
  const content = (
    <div className="space-y-4">
      {/* Información del paciente (solo cuando no hay fecha/hora seleccionada) */}
      {!selectedDate && !selectedTime && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Paciente:</span>
              <span className="font-semibold">{personalData?.fullName || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Motivo de la consulta (solo para primera cita y cuando hay fecha/hora) */}
      {isFirstAppointment && selectedDate && selectedTime && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motivo de la consulta <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.reason ? 'border-red-500' : 'border-gray-300'}`}
            rows={3}
            placeholder="Describe brevemente el motivo de tu consulta psicológica"
          />
          {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
        </div>
      )}

      {/* Fila 1: Antecedentes médicos y Medicamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Antecedentes médicos relevantes
          </label>
          <textarea
            value={formData.medicalHistory}
            onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Condiciones médicas, cirugías previas, etc. (opcional)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medicamentos que toma actualmente
          </label>
          <textarea
            value={formData.currentMedications}
            onChange={(e) => handleInputChange('currentMedications', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Lista de medicamentos, dosis, etc. (opcional)"
          />
        </div>
      </div>

      {/* Fila 2: Alergias */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alergias conocidas
        </label>
        <textarea
          value={formData.allergies}
          onChange={(e) => handleInputChange('allergies', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Alergias a medicamentos, alimentos, etc. (opcional)"
        />
      </div>

      {/* Información adicional */}
              {isEditingMode ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Modificar datos del paciente</p>
                <p className="mt-1">Revisa y actualiza la información médica del paciente.</p>
              </div>
            </div>
          </div>
        ) : selectedDate && selectedTime ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium">¡Casi listo!</p>
                <p className="mt-1">Revisa toda la información antes de confirmar tu cita.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium">¡Último paso!</p>
                <p className="mt-1">Revisa toda la información antes de crear el nuevo paciente.</p>
              </div>
            </div>
          </div>
        )}

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
        >
          ← Atrás
        </button>
        <button
          onClick={handleContinue}
          className="px-6 py-2 bg-[#8e161a] text-white rounded-lg hover:bg-[#6d1115] transition-colors duration-200 font-medium flex items-center"
        >
          {isEditingMode ? (
            <>
              Modificar Datos
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          ) : selectedDate && selectedTime ? (
            <>
              Confirmar Cita
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Crear Paciente
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Si isOpen es true, renderizar el modal completo
  if (isOpen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Información Médica</h2>
                  <p className="text-sm text-gray-600">Paso 4 de 4</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Resumen de selección solo para estudiantes (cuando hay fecha y hora) */}
            {(selectedDate && selectedTime) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-semibold">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Horario:</span>
                    <span className="font-semibold">{selectedTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Paciente:</span>
                    <span className="font-semibold">{personalData?.fullName || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Contenido del formulario */}
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Si isOpen es false, retornar solo el contenido
  return content;
}; 