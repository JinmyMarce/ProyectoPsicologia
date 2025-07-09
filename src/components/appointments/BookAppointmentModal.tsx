import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertCircle, CheckCircle, User, Phone, Mail, FileText, ExternalLink, CreditCard, MapPin, Calendar, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AppointmentSummary } from './AppointmentSummary';

interface TimeSlot {
  id: number;
  time: string;
  available: boolean;
}

interface BookAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onBook: (time: string, reason: string, contactData: ContactData) => void;
  date: string;
  availableSlots: TimeSlot[];
  isFirstAppointment: boolean;
  loading: boolean;
  error: string;
  psychologist?: {
    name: string;
    specialization: string;
    email: string;
  } | null;
}

interface ContactData {
  // Datos personales
  dni: string;
  fullName: string;
  age: string;
  gender: string;
  address: string;
  studyProgram: string;
  semester: string;
  
  // Datos de contacto
  phone: string;
  email: string;
  
  // Contacto de emergencia
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  
  // Información médica
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  
  // Políticas
  acceptPolicies: boolean;
  acceptCancellationPolicy: boolean;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  open,
  onClose,
  onBook,
  date,
  availableSlots,
  isFirstAppointment,
  loading,
  error,
  psychologist,
}) => {
  const { user } = useAuth();
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [contactData, setContactData] = useState<ContactData>({
    dni: '',
    fullName: user?.name || '',
    age: '',
    gender: '',
    address: '',
    phone: '',
    email: user?.email || '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    acceptPolicies: false,
    acceptCancellationPolicy: false,
    studyProgram: '',
    semester: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    setSelectedTime('');
    setReason('');
    setContactData({
      dni: '',
      fullName: user?.name || '',
      age: '',
      gender: '',
      address: '',
      phone: '',
      email: user?.email || '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      medicalHistory: '',
      currentMedications: '',
      allergies: '',
      acceptPolicies: false,
      acceptCancellationPolicy: false,
      studyProgram: '',
      semester: '',
    });
    setSubmitted(false);
    setCurrentStep(1);
  }, [open, date, user]);

  const handleBook = () => {
    setSubmitted(true);
    
    // Validaciones
    if (!selectedTime) return;
    if (isFirstAppointment && !reason.trim()) return;
    if (!contactData.dni.trim()) return;
    if (!contactData.fullName.trim()) return;
    if (!contactData.age.trim()) return;
    if (!contactData.gender.trim()) return;
    if (!contactData.address.trim()) return;
    if (!contactData.studyProgram.trim()) return;
    if (!contactData.semester.trim()) return;
    if (!contactData.phone.trim()) return;
    if (!contactData.email.trim()) return;
    if (!contactData.emergencyContact.name.trim()) return;
    if (!contactData.emergencyContact.relationship.trim()) return;
    if (!contactData.emergencyContact.phone.trim()) return;
    if (!contactData.acceptPolicies) return;
    if (!contactData.acceptCancellationPolicy) return;
    
    // Mostrar resumen antes de confirmar
    setShowSummary(true);
  };

  const handleConfirmBooking = () => {
    onBook(selectedTime, reason, contactData);
    setShowSummary(false);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Validar formato +51 + 9 dígitos
    const phoneRegex = /^\+51[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const formatPhone = (phone: string) => {
    // Remover todo excepto números
    const numbers = phone.replace(/\D/g, '');
    
    // Si empieza con 51, agregar +
    if (numbers.startsWith('51') && numbers.length === 11) {
      return `+${numbers}`;
    }
    
    // Si empieza con 9 y tiene 9 dígitos, agregar +51
    if (numbers.startsWith('9') && numbers.length === 9) {
      return `+51${numbers}`;
    }
    
    // Si tiene 9 dígitos y no empieza con 9, agregar +519
    if (numbers.length === 9) {
      return `+519${numbers}`;
    }
    
    return phone;
  };

  const validateDNI = (dni: string) => {
    const dniRegex = /^[0-9]{8}$/;
    return dniRegex.test(dni);
  };

  const validateAge = (age: string) => {
    const ageNum = parseInt(age);
    return ageNum >= 1 && ageNum <= 120;
  };

  // Función para determinar las opciones de semestre según la fecha actual
  const getSemesterOptions = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11
    
    // Marzo (3) hasta Agosto (8): 1, 3, 5 semestre
    if (currentMonth >= 3 && currentMonth <= 8) {
      return [
        { value: '1', label: '1er Semestre' },
        { value: '3', label: '3er Semestre' },
        { value: '5', label: '5to Semestre' }
      ];
    } else {
      // Septiembre (9) hasta Febrero (2): 2, 4, 6 semestre
      return [
        { value: '2', label: '2do Semestre' },
        { value: '4', label: '4to Semestre' },
        { value: '6', label: '6to Semestre' }
      ];
    }
  };

  const isFormValid = () => {
    return selectedTime && 
           (!isFirstAppointment || reason.trim()) &&
           contactData.dni.trim() &&
           validateDNI(contactData.dni) &&
           contactData.fullName.trim() &&
           contactData.age.trim() &&
           validateAge(contactData.age) &&
           contactData.gender.trim() &&
           contactData.address.trim() &&
           contactData.studyProgram.trim() &&
           contactData.semester.trim() &&
           contactData.phone.trim() &&
           validatePhone(contactData.phone) &&
           contactData.email.trim() &&
           validateEmail(contactData.email) &&
           contactData.emergencyContact.name.trim() &&
           contactData.emergencyContact.relationship.trim() &&
           contactData.emergencyContact.phone.trim() &&
           validatePhone(contactData.emergencyContact.phone) &&
           contactData.acceptPolicies &&
           contactData.acceptCancellationPolicy;
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Selección de hora */}
      <div>
        <div className="font-bold mb-3 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-[#8e161a]" />
          Selecciona una hora disponible:
        </div>
        <div className="grid grid-cols-3 gap-2">
          {availableSlots.length === 0 && (
            <div className="col-span-3 text-gray-500 text-center py-4">
              No hay horarios disponibles para este día.
            </div>
          )}
          {availableSlots.map(slot => (
            <button
              key={slot.id}
              type="button"
              className={`p-3 rounded-lg border text-sm font-semibold transition-all
                ${selectedTime === slot.time ? 'bg-[#8e161a] text-white border-[#8e161a] shadow-lg' : ''}
                ${slot.available ? 'bg-green-50 border-green-400 hover:bg-green-100 hover:shadow-md' : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'}
              `}
              disabled={!slot.available}
              onClick={() => slot.available && setSelectedTime(slot.time)}
            >
              {slot.time}
            </button>
          ))}
        </div>
        {submitted && !selectedTime && (
          <div className="text-xs text-red-500 mt-2">Debes seleccionar una hora disponible.</div>
        )}
      </div>

      {/* Motivo de la cita (solo para primera cita) */}
      {isFirstAppointment && (
        <div>
          <div className="font-bold mb-2 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-[#8e161a]" />
            Motivo de la consulta <span className="text-red-600">*</span>
          </div>
          <textarea
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Describe brevemente el motivo de tu consulta. Esto ayudará al psicólogo a prepararse mejor para tu sesión..."
            rows={4}
            required
          />
          {submitted && !reason.trim() && (
            <div className="text-xs text-red-500 mt-2">El motivo de la cita es obligatorio para tu primera consulta.</div>
          )}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      {/* Datos personales */}
      <div>
        <div className="font-bold mb-2 flex items-center">
          <User className="w-5 h-5 mr-2 text-[#8e161a]" />
          Datos Personales
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CreditCard className="w-4 h-4 inline mr-1" />
              DNI <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
              value={contactData.dni}
              onChange={e => setContactData(prev => ({ ...prev, dni: e.target.value }))}
              placeholder="12345678"
              maxLength={8}
              required
            />
            {submitted && (!contactData.dni.trim() || !validateDNI(contactData.dni)) && (
              <div className="text-xs text-red-500 mt-1">Ingresa un DNI válido de 8 dígitos.</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Nombre Completo <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
              value={contactData.fullName}
              onChange={e => setContactData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Apellidos y Nombres"
              required
            />
            {submitted && !contactData.fullName.trim() && (
              <div className="text-xs text-red-500 mt-1">Ingresa tu nombre completo.</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Edad <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
              value={contactData.age}
              onChange={e => setContactData(prev => ({ ...prev, age: e.target.value }))}
              placeholder="25"
              min="1"
              max="120"
              required
            />
            {submitted && (!contactData.age.trim() || !validateAge(contactData.age)) && (
              <div className="text-xs text-red-500 mt-1">Ingresa una edad válida.</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Género <span className="text-red-600">*</span>
            </label>
            <select
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
              value={contactData.gender}
              onChange={e => setContactData(prev => ({ ...prev, gender: e.target.value }))}
              required
            >
              <option value="">Selecciona...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
            {submitted && !contactData.gender.trim() && (
              <div className="text-xs text-red-500 mt-1">Selecciona tu género.</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              Programa de Estudios <span className="text-red-600">*</span>
            </label>
            <select
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
              value={contactData.studyProgram}
              onChange={e => setContactData(prev => ({ ...prev, studyProgram: e.target.value }))}
              required
            >
              <option value="">Selecciona tu programa...</option>
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
            {submitted && !contactData.studyProgram.trim() && (
              <div className="text-xs text-red-500 mt-1">Selecciona tu programa de estudios.</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Semestre <span className="text-red-600">*</span>
            </label>
            <select
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
              value={contactData.semester}
              onChange={e => setContactData(prev => ({ ...prev, semester: e.target.value }))}
              required
            >
              <option value="">Selecciona tu semestre...</option>
              {getSemesterOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {submitted && !contactData.semester.trim() && (
              <div className="text-xs text-red-500 mt-1">Selecciona tu semestre.</div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="w-4 h-4 inline mr-1" />
            Dirección <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
            value={contactData.address}
            onChange={e => setContactData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Dirección completa"
            required
          />
          {submitted && !contactData.address.trim() && (
            <div className="text-xs text-red-500 mt-1">Ingresa tu dirección.</div>
          )}
        </div>
      </div>

      {/* Datos de contacto */}
      <div>
        <div className="font-bold mb-3 flex items-center">
          <Phone className="w-5 h-5 mr-2 text-[#8e161a]" />
          Datos de Contacto
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Teléfono <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
              value={contactData.phone}
              onChange={e => setContactData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
              placeholder="Ej: +51 999 123 456"
              required
            />
            {submitted && (!contactData.phone.trim() || !validatePhone(contactData.phone)) && (
              <div className="text-xs text-red-500 mt-1">Ingresa un número de teléfono válido.</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Correo electrónico <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
              value={contactData.email}
              onChange={e => setContactData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="tu@email.com"
              required
            />
            {submitted && (!contactData.email.trim() || !validateEmail(contactData.email)) && (
              <div className="text-xs text-red-500 mt-1">Ingresa un correo electrónico válido.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Contacto de emergencia */}
      <div>
        <div className="font-bold mb-3 flex items-center">
          <Users className="w-5 h-5 mr-2 text-[#8e161a]" />
          Contacto de Emergencia
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Nombre del contacto <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
              value={contactData.emergencyContact.name}
              onChange={e => setContactData(prev => ({ 
                ...prev, 
                emergencyContact: { ...prev.emergencyContact, name: e.target.value }
              }))}
              placeholder="Nombre completo"
              required
            />
            {submitted && !contactData.emergencyContact.name.trim() && (
              <div className="text-xs text-red-500 mt-1">Ingresa el nombre del contacto de emergencia.</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Relación <span className="text-red-600">*</span>
            </label>
            <select
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
              value={contactData.emergencyContact.relationship}
              onChange={e => setContactData(prev => ({ 
                ...prev, 
                emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
              }))}
              required
            >
              <option value="">Selecciona...</option>
              <option value="padre">Padre</option>
              <option value="madre">Madre</option>
              <option value="hermano">Hermano/a</option>
              <option value="esposo">Esposo/a</option>
              <option value="hijo">Hijo/a</option>
              <option value="amigo">Amigo/a</option>
              <option value="otro">Otro</option>
            </select>
            {submitted && !contactData.emergencyContact.relationship.trim() && (
              <div className="text-xs text-red-500 mt-1">Selecciona la relación.</div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Teléfono de emergencia <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
              value={contactData.emergencyContact.phone}
              onChange={e => setContactData(prev => ({ 
                ...prev, 
                emergencyContact: { ...prev.emergencyContact, phone: formatPhone(e.target.value) }
              }))}
              placeholder="Ej: +51 999 123 456"
              required
            />
            {submitted && (!contactData.emergencyContact.phone.trim() || !validatePhone(contactData.emergencyContact.phone)) && (
              <div className="text-xs text-red-500 mt-1">Ingresa un número de teléfono válido.</div>
            )}
          </div>
        </div>
      </div>

      {/* Información médica */}
      <div>
        <div className="font-bold mb-3 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-[#8e161a]" />
          Información Médica (Opcional)
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Antecedentes médicos
            </label>
            <textarea
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
              value={contactData.medicalHistory}
              onChange={e => setContactData(prev => ({ ...prev, medicalHistory: e.target.value }))}
              placeholder="Describe brevemente cualquier condición médica relevante..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicamentos actuales
            </label>
            <textarea
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
              value={contactData.currentMedications}
              onChange={e => setContactData(prev => ({ ...prev, currentMedications: e.target.value }))}
              placeholder="Lista de medicamentos que tomas actualmente..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alergias
            </label>
            <textarea
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
              value={contactData.allergies}
              onChange={e => setContactData(prev => ({ ...prev, allergies: e.target.value }))}
              placeholder="Alergias conocidas (medicamentos, alimentos, etc.)..."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Políticas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="font-bold mb-3 text-blue-900">
          Políticas y Términos
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="policies"
              checked={contactData.acceptPolicies}
              onChange={e => setContactData(prev => ({ ...prev, acceptPolicies: e.target.checked }))}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="policies" className="text-sm text-blue-900 cursor-pointer">
                He leído y acepto la{' '}
                <button
                  type="button"
                  onClick={() => setShowPolicies(true)}
                  className="text-[#8e161a] underline hover:no-underline font-semibold"
                >
                  Política de Privacidad
                </button>
                <span className="text-red-600">*</span>
              </label>
              {submitted && !contactData.acceptPolicies && (
                <div className="text-xs text-red-500 mt-1">Debes aceptar la política de privacidad.</div>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="cancellation"
              checked={contactData.acceptCancellationPolicy}
              onChange={e => setContactData(prev => ({ ...prev, acceptCancellationPolicy: e.target.checked }))}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="cancellation" className="text-sm text-blue-900 cursor-pointer">
                He leído y acepto la{' '}
                <button
                  type="button"
                  onClick={() => setShowCancellationPolicy(true)}
                  className="text-[#8e161a] underline hover:no-underline font-semibold"
                >
                  Política de Cancelación y Reprogramación
                </button>
                <span className="text-red-600">*</span>
              </label>
              {submitted && !contactData.acceptCancellationPolicy && (
                <div className="text-xs text-red-500 mt-1">Debes aceptar la política de cancelación.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información importante */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="font-bold mb-2 text-yellow-900">
          ⚠️ Información Importante
        </div>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Las citas se confirman automáticamente</li>
          <li>• Puedes cancelar hasta 24 horas antes de tu cita</li>
          <li>• Llega 10 minutos antes de tu hora programada</li>
          <li>• Trae tu documento de identidad</li>
          <li>• Las notificaciones se enviarán a tu correo y teléfono</li>
          <li>• La información médica es confidencial y opcional</li>
        </ul>
      </div>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={`Agendar cita para ${new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`}>
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-semibold">{error}</span>
        </div>
      )}

      {/* Indicador de pasos */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 1 ? 'bg-[#8e161a] text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <span className={`text-sm ${currentStep >= 1 ? 'text-[#8e161a] font-semibold' : 'text-gray-500'}`}>
              Selección
            </span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div className={`h-full bg-[#8e161a] transition-all duration-300 ${
              currentStep >= 2 ? 'w-full' : currentStep >= 1 ? 'w-1/2' : 'w-0'
            }`}></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 2 ? 'bg-[#8e161a] text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className={`text-sm ${currentStep >= 2 ? 'text-[#8e161a] font-semibold' : 'text-gray-500'}`}>
              Datos
            </span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div className={`h-full bg-[#8e161a] transition-all duration-300 ${
              currentStep >= 3 ? 'w-full' : currentStep >= 2 ? 'w-1/2' : 'w-0'
            }`}></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 3 ? 'bg-[#8e161a] text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
            <span className={`text-sm ${currentStep >= 3 ? 'text-[#8e161a] font-semibold' : 'text-gray-500'}`}>
              Contacto
            </span>
          </div>
        </div>
      </div>

      {/* Contenido del paso actual */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Botones de navegación */}
      <div className="flex justify-between gap-3 mt-6">
        <Button 
          variant="outline" 
          type="button" 
          onClick={currentStep === 1 ? onClose : prevStep} 
          disabled={loading}
        >
          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
        </Button>
        
        <div className="flex gap-3">
          {currentStep < 3 ? (
            <Button 
              type="button" 
              onClick={nextStep}
              disabled={loading}
            >
              Siguiente
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={handleBook} 
              loading={loading}
              disabled={!isFormValid()}
            >
              Revisar y Confirmar
            </Button>
          )}
        </div>
      </div>

      {/* Modal de Política de Privacidad */}
      {showPolicies && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Política de Privacidad</h3>
              <button
                onClick={() => setShowPolicies(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-700 space-y-3">
              <p><strong>1. Recopilación de Información:</strong> Recopilamos información personal como nombre, correo electrónico, teléfono y motivo de consulta para brindar servicios psicológicos.</p>
              <p><strong>2. Uso de la Información:</strong> Tu información se utiliza exclusivamente para agendar citas, enviar notificaciones y brindar atención psicológica.</p>
              <p><strong>3. Protección de Datos:</strong> Implementamos medidas de seguridad para proteger tu información personal.</p>
              <p><strong>4. Confidencialidad:</strong> Toda la información compartida durante las sesiones es estrictamente confidencial.</p>
              <p><strong>5. Derechos del Usuario:</strong> Tienes derecho a acceder, rectificar y cancelar tu información personal.</p>
            </div>
            <div className="mt-4 text-right">
              <Button onClick={() => setShowPolicies(false)}>
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Política de Cancelación */}
      {showCancellationPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Política de Cancelación y Reprogramación</h3>
              <button
                onClick={() => setShowCancellationPolicy(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-700 space-y-3">
              <p><strong>1. Cancelación:</strong> Puedes cancelar tu cita hasta 24 horas antes de la hora programada sin penalización.</p>
              <p><strong>2. Cancelación Tardía:</strong> Las cancelaciones con menos de 24 horas de anticipación pueden incurrir en restricciones para futuras citas.</p>
              <p><strong>3. Reprogramación:</strong> Puedes reprogramar tu cita hasta 24 horas antes, sujeto a disponibilidad.</p>
              <p><strong>4. No Show:</strong> No presentarse a la cita sin previo aviso puede resultar en la suspensión temporal del servicio.</p>
              <p><strong>5. Emergencias:</strong> En caso de emergencia, contacta inmediatamente al consultorio para reprogramar.</p>
            </div>
            <div className="mt-4 text-right">
              <Button onClick={() => setShowCancellationPolicy(false)}>
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resumen de Cita */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Confirmar Cita</h3>
              <button
                onClick={() => setShowSummary(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
              <AppointmentSummary
                psychologist={psychologist}
                date={date}
                time={selectedTime}
                reason={reason}
                contactData={contactData}
                isFirstAppointment={isFirstAppointment}
              />
            </div>

            <div className="flex justify-between gap-4 pt-6 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => setShowSummary(false)}
                className="px-6 py-3"
              >
                Volver a Editar
              </Button>
              <Button 
                onClick={handleConfirmBooking} 
                loading={loading}
                className="px-8 py-3 bg-[#8e161a] hover:bg-[#7a1417] text-white font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Cita
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
