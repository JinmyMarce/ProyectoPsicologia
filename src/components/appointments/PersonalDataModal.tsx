import React, { useState, useEffect } from 'react';
import { User, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import axios from 'axios';

interface PersonalData {
  dni: string;
  fullName: string;
  age: string;
  gender: string;
  address: string;
  studyProgram: string;
  semester: string;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
}

interface PersonalDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onContinue: (data: PersonalData) => void;
  selectedDate: string;
  selectedTime: string;
  userData?: {
    fullName: string;
    email: string;
    career?: string;
    semester?: number;
  };
  disableNameAndEmail?: boolean;
}

export const PersonalDataModal: React.FC<PersonalDataModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onContinue,
  selectedDate,
  selectedTime,
  userData,
  disableNameAndEmail
}) => {
  const [formData, setFormData] = useState<PersonalData>({
    dni: '',
    fullName: userData?.fullName || '',
    age: '',
    gender: '',
    address: '',
    studyProgram: userData?.career || '',
    semester: userData?.semester?.toString() || '',
    phone: '',
    email: userData?.email || '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: ''
  });

  const [errors, setErrors] = useState<Partial<PersonalData>>({});

  // Función para obtener los semestres disponibles basados en la fecha actual de Perú
  const getAvailableSemesters = () => {
    // Usar zona horaria de Perú
    const now = new Date();
    const peruTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Lima"}));
    const month = peruTime.getMonth() + 1; // getMonth() devuelve 0-11
    
    // Abril a Julio (meses 4-7): Semestres 1, 3, 5
    // Agosto a Diciembre (meses 8-12): Semestres 2, 4, 6
    if (month >= 4 && month <= 7) {
      return [
        { value: '1', label: '1er Semestre' },
        { value: '3', label: '3er Semestre' },
        { value: '5', label: '5to Semestre' }
      ];
    } else {
      return [
        { value: '2', label: '2do Semestre' },
        { value: '4', label: '4to Semestre' },
        { value: '6', label: '6to Semestre' }
      ];
    }
  };

  const handleInputChange = (field: keyof PersonalData, value: string) => {
    // Validación especial para DNI y teléfono - solo números
    if (field === 'dni' || field === 'phone') {
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
    const newErrors: Partial<PersonalData> = {};

    if (!formData.dni.trim()) newErrors.dni = 'El DNI es obligatorio';
    if (!formData.fullName.trim()) newErrors.fullName = 'El nombre completo es obligatorio';
    if (!formData.age.trim()) newErrors.age = 'La edad es obligatoria';
    if (!formData.gender.trim()) newErrors.gender = 'El género es obligatorio';
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria';
    if (!formData.studyProgram.trim()) newErrors.studyProgram = 'El programa de estudios es obligatorio';
    if (!formData.semester.trim()) newErrors.semester = 'El semestre es obligatorio';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (!formData.email.trim()) newErrors.email = 'El email es obligatorio';

    // Validaciones específicas
    if (formData.dni && formData.dni.length !== 8) {
      newErrors.dni = 'El DNI debe tener exactamente 8 dígitos';
    }

    if (formData.dni && !/^\d+$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe contener solo números';
    }

    if (formData.age && (parseInt(formData.age) < 15 || parseInt(formData.age) > 80)) {
      newErrors.age = 'La edad debe estar entre 15 y 80 años';
    }

    if (formData.phone && !formData.phone.match(/^\d{9}$/)) {
      newErrors.phone = 'El teléfono debe tener exactamente 9 dígitos';
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'El email no tiene un formato válido';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    // Si el DNI tiene 8 dígitos, buscar datos previos del estudiante
    if (formData.dni.length === 8) {
      axios.get(`/api/patients/search/dni/${formData.dni}`)
        .then(res => {
          if (res.data && res.data.success && res.data.data) {
            const data = res.data.data;
            setFormData(prev => ({
              ...prev,
              fullName: prev.fullName || userData?.fullName || data.name || '',
              age: data.age ? String(data.age) : prev.age,
              gender: data.gender || prev.gender,
              address: data.address || prev.address,
              studyProgram: data.career || prev.studyProgram,
              semester: data.semester ? String(data.semester) : prev.semester,
              phone: data.phone || prev.phone,
              email: prev.email || userData?.email || data.email || '',
              // Si hay datos de contacto de emergencia y clínicos, autocompletar
              emergencyContactName: data.emergency_contact_name || '',
              emergencyContactRelationship: data.emergency_contact_relationship || '',
              emergencyContactPhone: data.emergency_contact_phone || '',
              medicalHistory: data.medical_history || '',
              currentMedications: data.current_medications || '',
              allergies: data.allergies || ''
            }));
          }
        })
        .catch(() => {/* No autocompletar si no hay datos */});
    }
  }, [formData.dni, userData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Datos Personales</h2>
                <p className="text-sm text-gray-600">Paso 2 de 4</p>
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Fecha seleccionada:</span>
              <span className="font-semibold">{formatDate(selectedDate)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Horario seleccionado:</span>
              <span className="font-semibold">{selectedTime}</span>
            </div>
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DNI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.dni}
                  onChange={(e) => handleInputChange('dni', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.dni ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="12345678"
                  maxLength={8}
                />
                {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
              </div>

              {/* Nombre completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nombre completo"
                  disabled={disableNameAndEmail}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              {/* Edad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edad <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.age ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="20"
                  min="15"
                  max="80"
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>

              {/* Género */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar género</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Av. Principal 123, Lima"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              {/* Programa de estudios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Programa de estudios <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.studyProgram}
                  onChange={(e) => handleInputChange('studyProgram', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.studyProgram ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!!userData?.career}
                >
                  <option value="">Seleccionar programa</option>
                  <option value="Administración de Servicios de Hostelería y Restaurantes">Administración de Servicios de Hostelería y Restaurantes</option>
                  <option value="Contabilidad">Contabilidad</option>
                  <option value="Desarrollo de Sistemas de Información">Desarrollo de Sistemas de Información</option>
                  <option value="Electricidad Industrial">Electricidad Industrial</option>
                  <option value="Electrónica Industrial">Electrónica Industrial</option>
                  <option value="Enfermería Técnica">Enfermería Técnica</option>
                  <option value="Guía Oficial de Turismo">Guía Oficial de Turismo</option>
                  <option value="Laboratorio Clínico y Anatomía Patológica">Laboratorio Clínico y Anatomía Patológica</option>
                  <option value="Mecánica Automotriz">Mecánica Automotriz</option>
                  <option value="Mecánica de Producción Industrial">Mecánica de Producción Industrial</option>
                </select>
                {errors.studyProgram && <p className="text-red-500 text-xs mt-1">{errors.studyProgram}</p>}
              </div>

              {/* Semestre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semestre <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => handleInputChange('semester', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.semester ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!!userData?.semester}
                >
                  <option value="">Seleccionar semestre</option>
                  {getAvailableSemesters().map(semester => (
                    <option key={semester.value} value={semester.value}>
                      {semester.label}
                    </option>
                  ))}
                </select>
                {errors.semester && <p className="text-red-500 text-xs mt-1">{errors.semester}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono <span className="text-red-500">*</span>
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

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Correo institucional"
                  disabled={disableNameAndEmail}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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