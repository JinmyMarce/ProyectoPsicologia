import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { User, X, ArrowRight, ArrowLeft, AlertCircle, GraduationCap, PhoneCall, UserCheck, CalendarCheck, Clock3, Shield, Star, CheckSquare } from 'lucide-react';
import { CustomSelect } from '../ui/CustomSelect';

interface PersonalData {
  dni: string;
  fullName: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
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
    maritalStatus: '',
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
        phone: initialData.phone ? (initialData.phone.replace('+51', '').replace(/\D/g, '')) : prev.phone,
        // Normalizar estado civil a minúsculas para que coincida con las opciones del select
        maritalStatus: initialData.maritalStatus ? initialData.maritalStatus.toLowerCase() : prev.maritalStatus
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

  const validateForm = () => {
    const newErrors: Partial<PersonalData> = {};

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es requerido';
    } else if (formData.dni.length !== 8) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe contener solo números';
    } else if (formData.dni.length !== 8) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es requerida';
    }

    if (!formData.gender) {
      newErrors.gender = 'El género es requerido';
    }

    if (!formData.maritalStatus) {
      newErrors.maritalStatus = 'El estado civil es requerido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.studyProgram) {
      newErrors.studyProgram = 'El programa de estudios es requerido';
    }

    if (!formData.semester) {
      newErrors.semester = 'El semestre es requerido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (formData.phone.length !== 9) {
      newErrors.phone = 'El teléfono debe tener 9 dígitos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simular validación con el backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onContinue(formData);
    } catch (error) {
      console.error('Error al procesar datos personales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PersonalData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[9999]">
      <div className="bg-gradient-to-br from-white via-gray-50 to-slate-50 rounded-lg shadow-2xl max-w-xl w-full mx-3 max-h-[85vh] border border-gray-200 relative" style={{
        boxShadow: `
          0 32px 64px rgba(0, 0, 0, 0.12), 
          0 16px 32px rgba(0, 0, 0, 0.08),
          0 8px 16px rgba(0, 0, 0, 0.04),
          inset 0 1px 0 rgba(255, 255, 255, 0.9)
        `,
        zIndex: 10000,
        overflow: 'visible'
      }}>
        <div className="p-3 xs:p-4 sm:p-5 max-h-[85vh] overflow-y-auto">
          {/* Header Responsivo */}
          <div className="flex items-center justify-between mb-3 xs:mb-4">
            <div className="flex items-center gap-2 xs:gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-lg bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center shadow-md border border-slate-600">
                  <User className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                </div>
                <div className="absolute -inset-0.5 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg blur opacity-20 -z-10"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg xs:text-xl font-bold text-gray-900 tracking-tight truncate">
                  Datos Personales
                </h2>
                <p className="text-slate-600 text-sm xs:text-base font-medium truncate">
                  Completa tu información
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 xs:w-8 xs:h-8 flex-shrink-0 rounded-lg bg-white hover:bg-red-50 flex items-center justify-center transition-all duration-300 shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-md ml-2"
            >
              <X className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-600 hover:text-red-600" />
            </button>
          </div>

          {/* Información de la cita - Responsivo con hora separada */}
          <div className="mb-3 xs:mb-4">
            <div className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-100 rounded-lg p-2.5 xs:p-3 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between gap-3 xs:gap-4">
                {/* Fecha */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center shadow-sm border border-slate-500 flex-shrink-0">
                    <CalendarCheck className="w-3 h-3 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs xs:text-sm font-bold text-gray-900">
                      Fecha de Cita
                    </h3>
                    <p className="text-gray-700 capitalize font-semibold text-xs xs:text-sm truncate">
                      {formatDate(selectedDate)}
                    </p>
                  </div>
                </div>
                {/* Hora con icono */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 flex items-center justify-center shadow-sm border border-gray-500">
                    <Clock3 className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs xs:text-sm font-bold text-gray-900">
                      Horario
                    </h3>
                    <p className="text-gray-700 font-semibold text-xs xs:text-sm">
                      {selectedTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
            {/* Información Personal - Compacto */}
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg p-2.5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center shadow-sm border border-slate-500">
                  <UserCheck className="w-2.5 h-2.5 text-white" />
                </div>
                <h3 className="text-sm xs:text-base font-bold text-gray-900 tracking-tight">
                  Información Personal
                </h3>
              </div>
              
              <div className="space-y-2">
                {/* Fila 1: Nombre Completo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    disabled={disableNameAndEmail}
                    className={`w-full px-3 py-2 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 text-base ${
                      errors.fullName 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                        : 'border-slate-200 focus:border-slate-500 focus:ring-slate-100'
                    } ${disableNameAndEmail ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Juan Pérez García"
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Fila 2: DNI y Fecha de Nacimiento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-3">
                  {/* DNI */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      DNI *
                    </label>
                    <input
                      type="text"
                      value={formData.dni}
                      onChange={(e) => handleInputChange('dni', e.target.value.replace(/\D/g, ''))}
                      className={`w-full px-3 py-2 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 text-base ${
                        errors.dni 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-gray-500 focus:ring-gray-100'
                      }`}
                      placeholder="12345678"
                      maxLength={8}
                    />
                    {errors.dni && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.dni}
                    </p>
                  )}
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 text-base ${
                      errors.birthDate 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : 'border-slate-200 focus:border-slate-500 focus:ring-slate-100'
                    }`}
                  />
                  {errors.birthDate && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                      {errors.birthDate}
                    </p>
                  )}
                </div>
                </div>

                {/* Fila 3: Género y Estado Civil - Referencia ocupando poco espacio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-3">
                {/* Género */}
                <div className="relative" style={{ overflow: 'visible' }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Género *
                  </label>
                  <CustomSelect
                    value={formData.gender}
                    onChange={(value) => handleInputChange('gender', value)}
                    options={[
                      { value: 'masculino', label: 'Masculino' },
                      { value: 'femenino', label: 'Femenino' },
                      { value: 'otro', label: 'Otro' }
                    ]}
                    placeholder="Selecciona"
                    error={!!errors.gender}
                    className={errors.gender ? 'border-red-300' : 'border-gray-200'}
                  />
                  {errors.gender && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                      {errors.gender}
                    </p>
                  )}
                  </div>

                {/* Estado Civil */}
                <div className="relative" style={{ overflow: 'visible' }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Estado Civil *
                  </label>
                  <CustomSelect
                    value={formData.maritalStatus}
                    onChange={(value) => handleInputChange('maritalStatus', value)}
                    options={[
                      { value: 'soltero', label: 'Soltero' },
                      { value: 'casado', label: 'Casado' },
                      { value: 'divorciado', label: 'Divorciado' },
                      { value: 'viudo', label: 'Viudo' },
                      { value: 'conviviente', label: 'Conviviente' }
                    ]}
                    placeholder="Selecciona"
                    error={!!errors.maritalStatus}
                    className={errors.maritalStatus ? 'border-red-300' : 'border-gray-200'}
                  />
                  {errors.maritalStatus && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                      {errors.maritalStatus}
                    </p>
                  )}
                  </div>
                </div>

                {/* Fila 3: Dirección */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 text-base ${
                      errors.address 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                        : 'border-slate-200 focus:border-slate-500 focus:ring-slate-100'
                    }`}
                    placeholder="Av. Principal 123, Distrito, Ciudad"
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información Académica - Compacto */}
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg p-2.5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center shadow-sm border border-slate-500">
                  <GraduationCap className="w-2.5 h-2.5 text-white" />
                </div>
                <h3 className="text-sm xs:text-base font-bold text-gray-900 tracking-tight">
                  Información Académica
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 xs:gap-3">
                {/* Programa de Estudios - Más ancho */}
                <div className="sm:col-span-2 relative" style={{ overflow: 'visible' }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Programa de Estudios *
                  </label>
                  <CustomSelect
                    value={formData.studyProgram}
                    onChange={(value) => handleInputChange('studyProgram', value)}
                    options={[
                      { value: 'Administración de Servicios de Hostelería y Restaurantes', label: 'Administración de Servicios de Hostelería y Restaurantes' },
                      { value: 'Contabilidad', label: 'Contabilidad' },
                      { value: 'Desarrollo de Sistemas de Información', label: 'Desarrollo de Sistemas de Información' },
                      { value: 'Electricidad Industrial', label: 'Electricidad Industrial' },
                      { value: 'Electrónica Industrial', label: 'Electrónica Industrial' },
                      { value: 'Enfermería Técnica', label: 'Enfermería Técnica' },
                      { value: 'Guía Oficial de Turismo', label: 'Guía Oficial de Turismo' },
                      { value: 'Laboratorio Clínico y Anatomía Patológica', label: 'Laboratorio Clínico y Anatomía Patológica' },
                      { value: 'Mecánica Automotriz', label: 'Mecánica Automotriz' },
                      { value: 'Mecánica de Producción Industrial', label: 'Mecánica de Producción Industrial' }
                    ]}
                    placeholder="Selecciona"
                    error={!!errors.studyProgram}
                    className={errors.studyProgram ? 'border-red-300' : 'border-slate-200'}
                  />
                  {errors.studyProgram && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.studyProgram}
                    </p>
                  )}
                </div>

                {/* Semestre - Más pequeño */}
                <div className="relative" style={{ overflow: 'visible' }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Semestre Actual *
                  </label>
                  <CustomSelect
                    value={formData.semester}
                    onChange={(value) => handleInputChange('semester', value)}
                    options={getAvailableSemesters()}
                    placeholder="Selecciona"
                    error={!!errors.semester}
                    className={errors.semester ? 'border-red-300' : 'border-gray-200'}
                  />
                  {errors.semester && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.semester}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Contacto - Compacto */}
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg p-2.5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center shadow-sm border border-slate-500">
                  <PhoneCall className="w-2.5 h-2.5 text-white" />
                </div>
                <h3 className="text-sm xs:text-base font-bold text-gray-900 tracking-tight">
                  Información de Contacto
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-3">
                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                      +51
                    </span>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                      className={`w-full pl-12 pr-3 py-2 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 text-base ${
                        errors.phone 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : 'border-slate-200 focus:border-slate-500 focus:ring-slate-100'
                      }`}
                      placeholder="912345678"
                      maxLength={9}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={disableNameAndEmail}
                    className={`w-full px-3 py-2 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 text-base ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                        : 'border-gray-200 focus:border-gray-500 focus:ring-gray-100'
                    } ${disableNameAndEmail ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="juan.perez@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>


            {/* Botones de acción - Responsivos */}
            <div className="flex justify-between items-center pt-3 xs:pt-4 border-t border-slate-200 gap-2 xs:gap-3">
              <button
                type="button"
                onClick={onBack}
                className="px-3 xs:px-4 sm:px-5 py-1.5 xs:py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold text-xs xs:text-sm flex items-center gap-1.5 shadow-sm hover:shadow-md flex-1 xs:flex-initial"
              >
                <ArrowLeft className="w-3 h-3 xs:w-4 xs:h-4" />
                <span className="hidden xs:inline">Atrás</span>
                <span className="xs:hidden">←</span>
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-3 xs:px-4 sm:px-5 py-1.5 xs:py-2 sm:py-2.5 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-300 font-semibold text-xs xs:text-sm flex items-center gap-1.5 shadow-lg transform hover:scale-105 hover:shadow-xl flex-1 xs:flex-initial justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 xs:h-4 xs:w-4 border-2 border-white border-t-transparent"></div>
                    <span className="hidden sm:inline">Procesando...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="w-3 h-3 xs:w-4 xs:h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}; 