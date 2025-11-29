import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Phone, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { CustomSelect } from '../ui/CustomSelect';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface EmergencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onContinue: (data: EmergencyContact) => void;
  selectedDate: string;
  selectedTime: string;
  personalData: any;
  initialData?: EmergencyContact;
}

export const EmergencyContactModal: React.FC<EmergencyContactModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onContinue,
  selectedDate,
  selectedTime,
  personalData,
  initialData
}) => {
  const [formData, setFormData] = useState<EmergencyContact>({
    name: '',
    relationship: '',
    phone: ''
  });

  const [errors, setErrors] = useState<Partial<EmergencyContact>>({});

  // Actualizar formData cuando cambie initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        relationship: initialData.relationship || '',
        phone: (initialData.phone || '').replace('+51', '').replace(/\D/g, '') // Limpiar +51 y caracteres no numéricos
      });
    }
  }, [initialData]);

  const handleInputChange = (field: keyof EmergencyContact, value: string) => {
    // Validación especial para teléfono - solo números
    if (field === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EmergencyContact> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.relationship.trim()) newErrors.relationship = 'La relación es obligatoria';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';

    // Validaciones específicas
    if (formData.phone && !formData.phone.match(/^\d{9}$/)) {
      newErrors.phone = 'El teléfono debe tener exactamente 9 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Agregar el prefijo +51 al teléfono antes de enviar
      const dataToSend = {
        ...formData,
        phone: `+51${formData.phone}`
      };
      onContinue(dataToSend);
    }
  };

  // Si isOpen es false, renderizar solo el contenido (para uso en MultiStepPatientRegistrationModal)
  const content = (
    <div className="space-y-4">
      {/* Fila 1: Nombre completo del contacto */}
      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">
          Nombre completo del contacto <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nombre completo del contacto de emergencia"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Fila 2: Relación y Teléfono */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
        <div className="relative" style={{ overflow: 'visible' }}>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Relación con el paciente <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={formData.relationship}
            onChange={(value) => handleInputChange('relationship', value)}
            options={[
              { value: 'Padre', label: 'Padre' },
              { value: 'Madre', label: 'Madre' },
              { value: 'Hermano/a', label: 'Hermano/a' },
              { value: 'Hijo/a', label: 'Hijo/a' },
              { value: 'Cónyuge', label: 'Cónyuge' },
              { value: 'Pareja', label: 'Pareja' },
              { value: 'Tío/a', label: 'Tío/a' },
              { value: 'Primo/a', label: 'Primo/a' },
              { value: 'Amigo/a', label: 'Amigo/a' },
              { value: 'Compañero/a de trabajo', label: 'Compañero/a de trabajo' },
              { value: 'Otro', label: 'Otro' }
            ]}
            placeholder="Seleccionar relación"
            error={!!errors.relationship}
            openDirection="top"
          />
          {errors.relationship && <p className="text-red-500 text-sm mt-1">{errors.relationship}</p>}
        </div>
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Teléfono del contacto <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500 text-base">+51</span>
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full pl-12 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="987654321"
              maxLength={9}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center space-x-2 shadow-sm hover:shadow-md text-base"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Atrás</span>
        </button>
        <button
          onClick={handleContinue}
          className="px-4 py-2 bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white rounded-lg hover:from-black hover:to-gray-800 transition-all duration-200 font-semibold flex items-center space-x-2 shadow-lg transform hover:scale-105 hover:shadow-xl text-base"
        >
          <span>Continuar</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  // Si isOpen es true, renderizar el modal completo
  if (isOpen) {
    return createPortal(
      <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-3 max-h-[85vh] border border-gray-100 relative" style={{
          boxShadow: `
            0 32px 64px rgba(0, 0, 0, 0.12), 
            0 16px 32px rgba(0, 0, 0, 0.08),
            0 8px 16px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.8)
          `,
          background: 'linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)',
          zIndex: 10000,
          overflow: 'visible'
        }}>
          <div className="p-4 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center shadow-lg border border-gray-700">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-gray-900 to-black rounded-xl blur opacity-20 -z-10"></div>
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">
                    Contacto de Emergencia
                  </h2>
                  <p className="text-base text-gray-600 font-medium">
                    Paso 3 de 4 - Información de contacto
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-300 shadow-md border border-gray-200 hover:border-gray-300 hover:shadow-lg"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Información del Paciente - Compacto */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 mb-4 border border-gray-200 shadow-sm">
              <div className="space-y-0.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-semibold">Paciente:</span>
                  <span className="font-bold text-gray-800">{personalData?.fullName || 'N/A'}</span>
                </div>
              </div>
            </div>

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