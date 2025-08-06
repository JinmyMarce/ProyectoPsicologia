import React, { useState, useEffect } from 'react';
import { User, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import axios from 'axios';

interface PersonalData {
  dni: string;
  fullName: string;
  birthDate: string;
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
  initialData?: Partial<PersonalData>;
}

export const PersonalDataModal: React.FC<PersonalDataModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onContinue,
  selectedDate,
  selectedTime,
  userData,
  disableNameAndEmail,
  initialData
}) => {
  const [formData, setFormData] = useState<PersonalData>({
    dni: '',
    fullName: userData?.fullName || '',
    birthDate: '',
    gender: '',
    address: '',
    studyProgram: userData?.career || '',
    semester: userData?.semester ? String(userData.semester) : '',
    phone: '',
    email: userData?.email || '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: ''
  });

  const [loading, setLoading] = useState(false);

  // Actualizar si cambia initialData
  React.useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Limpiar específicamente el teléfono si viene con +51
        phone: initialData.phone ? (initialData.phone.replace('+51', '').replace(/\D/g, '')) : prev.phone
      }));
    }
  }, [initialData]);

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

  // Función para obtener semestres incluyendo el actual del paciente (para modificación)
  const getSemestersForEdit = () => {
    const currentSemesters = getAvailableSemesters();
    const currentSemesterValue = formData.semester;
    
    // Si el semestre actual del paciente no está en las opciones, agregarlo
    if (currentSemesterValue && !currentSemesters.find(s => s.value === currentSemesterValue)) {
      const semesterLabels = {
        '1': '1er Semestre',
        '2': '2do Semestre', 
        '3': '3er Semestre',
        '4': '4to Semestre',
        '5': '5to Semestre',
        '6': '6to Semestre'
      };
      
      const newOption = { 
        value: currentSemesterValue, 
        label: semesterLabels[currentSemesterValue as keyof typeof semesterLabels] || `${currentSemesterValue}° Semestre` 
      };
      
      // Agregar la nueva opción y ordenar por valor numérico
      const allOptions = [...currentSemesters, newOption];
      return allOptions.sort((a, b) => parseInt(a.value) - parseInt(b.value));
    }
    
    return currentSemesters;
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
    if (!formData.birthDate.trim()) newErrors.birthDate = 'La fecha de nacimiento es obligatoria';
    else {
      const birth = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear() - (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate()) ? 1 : 0);
      if (age < 15) newErrors.birthDate = 'Debes tener al menos 15 años';
    }
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

    if (formData.phone && !formData.phone.match(/^\d{9}$/)) {
      newErrors.phone = 'El teléfono debe tener exactamente 9 dígitos';
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'El email no tiene un formato válido';
    } else if (formData.email && !formData.email.endsWith('@istta.edu.pe')) {
      newErrors.email = 'El email debe ser institucional (@istta.edu.pe)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
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
              birthDate: data.birthDate || prev.birthDate,
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

  // Si isOpen es false, renderizar solo el contenido (para uso en MultiStepPatientRegistrationModal)
  const content = (
    <div className="space-y-4">
      {/* Fila 1: Nombre completo y Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo <span className="text-red-500">*</span>
            {disableNameAndEmail && <span className="text-xs text-gray-500 ml-2">(No editable)</span>}
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'} ${disableNameAndEmail ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="Nombre completo"
            disabled={disableNameAndEmail}
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
            {disableNameAndEmail && <span className="text-xs text-gray-500 ml-2">(No editable)</span>}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'} ${disableNameAndEmail ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="estudiante@istta.edu.pe"
            disabled={disableNameAndEmail}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Fila 2: DNI, Género y Teléfono */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DNI <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.dni}
            onChange={(e) => handleInputChange('dni', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.dni ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="12345678"
            maxLength={8}
          />
          {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Género <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Seleccionar género</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono del paciente <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500 text-sm">+51</span>
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full pl-12 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="987654321"
              maxLength={9}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* Fila 3: Fecha de nacimiento y Dirección */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de nacimiento <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Ciudad, Distrito, Dirección específica"
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>
      </div>

      {/* Fila 4: Programa de estudios y Semestre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Programa de estudios <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.studyProgram}
            onChange={(e) => handleInputChange('studyProgram', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.studyProgram ? 'border-red-500' : 'border-gray-300'}`}
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semestre <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.semester}
            onChange={(e) => handleInputChange('semester', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.semester ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Seleccionar semestre</option>
            {getSemestersForEdit().map((semester) => (
              <option key={semester.value} value={semester.value}>
                {semester.label}
              </option>
            ))}
          </select>
          {errors.semester && <p className="text-red-500 text-xs mt-1">{errors.semester}</p>}
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
          disabled={loading}
          className="px-6 py-2 bg-[#8e161a] text-white rounded-lg hover:bg-[#6d1115] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : 'Continuar →'}
        </button>
      </div>
    </div>
  );

  // Si isOpen es true, renderizar el modal completo
  if (isOpen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Información General</h2>
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

            {/* Resumen de selección solo para estudiantes (cuando hay fecha y hora) */}
            {(selectedDate && selectedTime) && (
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