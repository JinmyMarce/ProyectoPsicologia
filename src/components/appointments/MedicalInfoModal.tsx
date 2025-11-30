import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Heart, X, ArrowLeft, CheckCircle, CalendarCheck, Clock3, User } from 'lucide-react';

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
            className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-300 ${errors.reason ? 'border-red-500' : 'border-gray-300'}`}
            rows={3}
            placeholder="Describe brevemente el motivo de tu consulta psicológica"
          />
          {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
        </div>
      )}

      {/* Fila 1: Antecedentes médicos y Medicamentos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Antecedentes médicos relevantes
          </label>
          <textarea
            value={formData.medicalHistory}
            onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-300"
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
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-300"
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
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-300"
          rows={3}
          placeholder="Alergias a medicamentos, alimentos, etc. (opcional)"
        />
      </div>

      {/* Información adicional */}
              {isEditingMode ? (
          <div className="rounded-xl p-4" style={{
            background: `
              linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%),
              radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)
            `,
            border: '2px solid rgba(59, 130, 246, 0.2)',
            boxShadow: `
              inset 0 2px 4px rgba(255, 255, 255, 0.3),
              inset 0 -2px 4px rgba(0, 0, 0, 0.05),
              0 4px 12px rgba(59, 130, 246, 0.1)
            `,
            backdropFilter: 'blur(10px)'
          }}>
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 p-2 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.8) 100%)',
                boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)'
              }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium text-base" style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  letterSpacing: '0.2px'
                }}>Modificar datos del paciente</p>
                <p className="mt-1 font-medium" style={{
                  letterSpacing: '0.1px'
                }}>Revisa y actualiza la información médica del paciente.</p>
              </div>
            </div>
          </div>
        ) : selectedDate && selectedTime ? (
          <div className="rounded-xl p-4" style={{
            background: `
              linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%),
              radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)
            `,
            border: '2px solid rgba(16, 185, 129, 0.2)',
            boxShadow: `
              inset 0 2px 4px rgba(255, 255, 255, 0.3),
              inset 0 -2px 4px rgba(0, 0, 0, 0.05),
              0 4px 12px rgba(16, 185, 129, 0.1)
            `,
            backdropFilter: 'blur(10px)'
          }}>
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 p-2 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.8) 100%)',
                boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)'
              }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-green-800">
                <p className="font-medium text-base" style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  letterSpacing: '0.2px'
                }}>¡Casi listo!</p>
                <p className="mt-1 font-medium" style={{
                  letterSpacing: '0.1px'
                }}>Revisa toda la información antes de confirmar tu cita psicológica.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-4" style={{
            background: `
              linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%),
              radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)
            `,
            border: '2px solid rgba(59, 130, 246, 0.2)',
            boxShadow: `
              inset 0 2px 4px rgba(255, 255, 255, 0.3),
              inset 0 -2px 4px rgba(0, 0, 0, 0.05),
              0 4px 12px rgba(59, 130, 246, 0.1)
            `,
            backdropFilter: 'blur(10px)'
          }}>
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 p-2 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.8) 100%)',
                boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)'
              }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium text-base" style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  letterSpacing: '0.2px'
                }}>¡Último paso!</p>
                <p className="mt-1 font-medium" style={{
                  letterSpacing: '0.1px'
                }}>Revisa toda la información antes de crear el nuevo paciente.</p>
              </div>
            </div>
          </div>
        )}

      {/* Botones de navegación - Responsivos */}
      <div className="flex justify-between pt-4 xs:pt-5 sm:pt-6 gap-2 xs:gap-3">
        <button
          onClick={onBack}
          className="px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center space-x-2 shadow-sm hover:shadow-md text-xs xs:text-sm flex-1 xs:flex-initial justify-center"
        >
          <ArrowLeft className="w-3 h-3 xs:w-4 xs:h-4" />
          <span className="hidden xs:inline">Atrás</span>
          <span className="xs:hidden">←</span>
        </button>
        <button
          onClick={handleContinue}
          className="px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3 bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white rounded-lg sm:rounded-xl hover:from-black hover:to-gray-800 transition-all duration-200 font-semibold flex items-center space-x-2 shadow-lg transform hover:scale-105 hover:shadow-xl text-xs xs:text-sm flex-1 xs:flex-initial justify-center"
        >
          {isEditingMode ? (
            <>
              <span className="hidden sm:inline">Modificar Datos</span>
              <span className="sm:hidden">Modificar</span>
              <CheckCircle className="w-3 h-3 xs:w-4 xs:h-4" />
            </>
          ) : selectedDate && selectedTime ? (
            <>
              <span className="hidden sm:inline">Confirmar Cita</span>
              <span className="sm:hidden">Confirmar</span>
              <CheckCircle className="w-3 h-3 xs:w-4 xs:h-4" />
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Crear Paciente</span>
              <span className="sm:hidden">Crear</span>
              <CheckCircle className="w-3 h-3 xs:w-4 xs:h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Si isOpen es true, renderizar el modal completo
  if (isOpen) {
    return createPortal(
      <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto border border-gray-100 relative" style={{
          boxShadow: `
            0 32px 64px rgba(0, 0, 0, 0.12), 
            0 16px 32px rgba(0, 0, 0, 0.08),
            0 8px 16px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.8)
          `,
          background: 'linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)',
          zIndex: 10000
        }}>
          <div className="p-5">
            {/* Header Responsivo */}
            <div className="flex items-center justify-between mb-4 xs:mb-5 sm:mb-6">
              <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center shadow-xl border border-gray-700">
                    <Heart className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-gray-900 to-black rounded-xl sm:rounded-2xl blur opacity-20 -z-10"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg xs:text-xl font-bold text-gray-900 tracking-tight truncate">
                    Información Médica
                  </h2>
                  <p className="text-sm xs:text-base text-gray-600 font-medium truncate">
                    Paso 4 de 4 - Datos clínicos
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 flex-shrink-0 rounded-lg sm:rounded-xl bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-300 shadow-lg border border-gray-200 hover:border-gray-300 hover:shadow-xl ml-2"
              >
                <X className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>

            {/* Resumen de selección solo para estudiantes (cuando hay fecha y hora) - Elegante */}
            {(selectedDate && selectedTime) && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2.5 xs:p-3 mb-4 border border-gray-200 shadow-sm">
                <div className="space-y-2">
                  {/* Primera fila: Fecha y Horario */}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="bg-white rounded-lg p-2 border border-gray-200 col-span-8 xs:col-span-9">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <div className="w-4 h-4 rounded-md bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center shadow-sm border border-slate-500 flex-shrink-0">
                          <CalendarCheck className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-[10px] xs:text-xs font-semibold text-gray-600 uppercase tracking-wide">Fecha</span>
                      </div>
                      <p className="text-xs font-bold text-gray-800 capitalize text-center">{formatDate(selectedDate)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200 col-span-4 xs:col-span-3">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <div className="w-4 h-4 rounded-md bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 flex items-center justify-center shadow-sm border border-gray-500 flex-shrink-0">
                          <Clock3 className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-[10px] xs:text-xs font-semibold text-gray-600 uppercase tracking-wide">Horario</span>
                      </div>
                      <p className="text-xs font-bold text-gray-800 text-center">{selectedTime}</p>
                    </div>
                  </div>
                  {/* Segunda fila: Paciente */}
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <div className="w-4 h-4 rounded-md bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center shadow-sm border border-blue-500 flex-shrink-0">
                        <User className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-[10px] xs:text-xs font-semibold text-gray-600 uppercase tracking-wide">Paciente</span>
                    </div>
                    <p className="text-xs font-bold text-gray-800 text-center truncate">{personalData?.fullName || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contenido del formulario */}
            {content}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Si isOpen es false, retornar solo el contenido
  return content;
}; 