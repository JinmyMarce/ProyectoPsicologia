import React from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, CreditCard, MapPin, Phone, Mail, Users, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';

interface AppointmentSummaryProps {
  psychologist: {
    name: string;
    specialization: string;
    email: string;
  } | null | undefined;
  date: string;
  time: string;
  reason: string;
  contactData: {
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
  };
  isFirstAppointment: boolean;
}

export const AppointmentSummary: React.FC<AppointmentSummaryProps> = ({
  psychologist,
  date,
  time,
  reason,
  contactData,
  isFirstAppointment
}) => {
  return (
    <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
        Resumen de tu Cita
      </h3>

      <div className="space-y-4">
        {/* Información del psicólogo */}
        {psychologist && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2 text-[#8e161a]" />
              Psicólogo Asignado
            </h4>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">Dr. {psychologist.name}</p>
              <p className="text-xs text-gray-600">{psychologist.specialization}</p>
              <p className="text-xs text-gray-500">{psychologist.email}</p>
            </div>
          </div>
        )}

        {/* Fecha y hora */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-[#8e161a]" />
            Fecha y Hora
          </h4>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {new Date(date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-sm text-gray-600 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {time} - Duración: 45 minutos
            </p>
          </div>
        </div>

        {/* Datos personales del paciente */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <User className="w-4 h-4 mr-2 text-[#8e161a]" />
            Datos Personales
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">DNI:</span> {contactData.dni}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Nombre:</span> {contactData.fullName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Edad:</span> {contactData.age} años
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Género:</span> {contactData.gender}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Dirección:</span> {contactData.address}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Programa de Estudios:</span> {contactData.studyProgram}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Semestre:</span> {contactData.semester}° Semestre
            </p>
          </div>
        </div>

        {/* Datos de contacto */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Phone className="w-4 h-4 mr-2 text-[#8e161a]" />
            Datos de Contacto
          </h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Teléfono:</span> {contactData.phone}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Email:</span> {contactData.email}
            </p>
          </div>
        </div>

        {/* Contacto de emergencia */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Users className="w-4 h-4 mr-2 text-[#8e161a]" />
            Contacto de Emergencia
          </h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Nombre:</span> {contactData.emergencyContact.name}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Relación:</span> {contactData.emergencyContact.relationship}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Teléfono:</span> {contactData.emergencyContact.phone}
            </p>
          </div>
        </div>

        {/* Información médica (solo si hay datos) */}
        {(contactData.medicalHistory || contactData.currentMedications || contactData.allergies) && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-[#8e161a]" />
              Información Médica
            </h4>
            <div className="space-y-2">
              {contactData.medicalHistory && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Antecedentes médicos:</p>
                  <p className="text-sm text-gray-600">{contactData.medicalHistory}</p>
                </div>
              )}
              {contactData.currentMedications && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Medicamentos actuales:</p>
                  <p className="text-sm text-gray-600">{contactData.currentMedications}</p>
                </div>
              )}
              {contactData.allergies && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Alergias:</p>
                  <p className="text-sm text-gray-600">{contactData.allergies}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Motivo de consulta (solo para primera cita) */}
        {isFirstAppointment && reason && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-[#8e161a]" />
              Motivo de Consulta
            </h4>
            <p className="text-sm text-gray-700">{reason}</p>
          </div>
        )}

        {/* Información importante */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">
            ⚠️ Información Importante
          </h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Llega 10 minutos antes de tu cita</li>
            <li>• Trae tu documento de identidad (DNI)</li>
            <li>• Las notificaciones se enviarán a tu correo y teléfono</li>
            <li>• Puedes cancelar hasta 24 horas antes</li>
            <li>• En caso de emergencia, contacta al consultorio</li>
            <li>• La información médica es confidencial y opcional</li>
          </ul>
        </div>

        {/* Confirmación de políticas */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Políticas Aceptadas
          </h4>
          <ul className="text-xs text-green-700 space-y-1">
            <li>✓ Política de Privacidad</li>
            <li>✓ Política de Cancelación y Reprogramación</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}; 