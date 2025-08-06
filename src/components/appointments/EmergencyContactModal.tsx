import React, { useState, useEffect } from 'react';
import { Phone, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo del contacto <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nombre completo del contacto de emergencia"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Fila 2: Relación y Teléfono */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relación con el paciente <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.relationship}
            onChange={(e) => handleInputChange('relationship', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.relationship ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar relación</option>
            <option value="Padre">Padre</option>
            <option value="Madre">Madre</option>
            <option value="Hermano/a">Hermano/a</option>
            <option value="Hijo/a">Hijo/a</option>
            <option value="Cónyuge">Cónyuge</option>
            <option value="Pareja">Pareja</option>
            <option value="Tío/a">Tío/a</option>
            <option value="Primo/a">Primo/a</option>
            <option value="Amigo/a">Amigo/a</option>
            <option value="Compañero/a de trabajo">Compañero/a de trabajo</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.relationship && <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono del contacto <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500 text-sm">+51</span>
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full pl-12 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="987654321"
              maxLength={9}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

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
          className="px-6 py-2 bg-[#8e161a] text-white rounded-lg hover:bg-[#6d1115] transition-colors duration-200 font-medium"
        >
          Continuar →
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
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Contacto de Emergencia</h2>
                  <p className="text-sm text-gray-600">Paso 3 de 4</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Información del Paciente */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Paciente:</span>
                  <span className="font-semibold">{personalData?.fullName || 'N/A'}</span>
                </div>
              </div>
            </div>

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