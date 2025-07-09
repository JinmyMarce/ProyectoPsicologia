import React, { useState } from 'react';
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
}

export const EmergencyContactModal: React.FC<EmergencyContactModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onContinue,
  selectedDate,
  selectedTime,
  personalData
}) => {
  const [formData, setFormData] = useState<EmergencyContact>({
    name: '',
    relationship: '',
    phone: ''
  });

  const [errors, setErrors] = useState<Partial<EmergencyContact>>({});

  const handleInputChange = (field: keyof EmergencyContact, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    if (formData.phone && !formData.phone.match(/^\+51\d{9}$/)) {
      newErrors.phone = 'El teléfono debe tener formato +51 seguido de 9 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onContinue(formData);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Phone className="w-6 h-6 text-orange-600" />
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

          {/* Resumen de selección */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
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
                <span className="font-semibold">{personalData.fullName}</span>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            {/* Nombre del contacto */}
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
                placeholder="María García López"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Relación */}
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
                <option value="padre">Padre</option>
                <option value="madre">Madre</option>
                <option value="hermano/a">Hermano/a</option>
                <option value="esposo/a">Esposo/a</option>
                <option value="hijo/a">Hijo/a</option>
                <option value="tío/a">Tío/a</option>
                <option value="abuelo/a">Abuelo/a</option>
                <option value="amigo/a">Amigo/a</option>
                <option value="otro">Otro</option>
              </select>
              {errors.relationship && <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono de contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+51987654321"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="text-blue-600 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Información importante:</p>
                  <p className="mt-1">Este contacto será utilizado únicamente en caso de emergencia durante la sesión psicológica.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atrás
            </Button>
            <Button
              onClick={handleContinue}
              className="flex items-center"
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 