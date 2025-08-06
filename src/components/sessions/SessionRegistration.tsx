import React, { useState } from 'react';
import { MessageSquare, Save, X, Search, User, Calendar, FileText } from 'lucide-react';
import { patientsService, Patient } from '../../services/patients';
import { apiClient } from '../../services/apiClient';

interface SessionRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SessionRegistration({ isOpen, onClose, onSuccess }: SessionRegistrationProps) {
  const [formData, setFormData] = useState({
    patientDni: '',
    fecha_sesion: '',
    hora_sesion: '',
    temas_tratados: '',
    notas: '',
    estado: 'Programada' as 'Programada' | 'Realizada' | 'Cancelada',
    duracion_minutos: 60,
    tipo_sesion: 'Terapia individual',
    objetivos: '',
    conclusiones: ''
  });

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Validación especial para DNI - solo números
    if (name === 'patientDni') {
      const numericValue = value.replace(/\D/g, '').slice(0, 8);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const searchPatient = async () => {
    if (!formData.patientDni) {
      setError('Ingrese el DNI del paciente');
      return;
    }

    if (formData.patientDni.length !== 8) {
      setError('El DNI debe tener exactamente 8 dígitos');
      return;
    }

    setSearching(true);
    setError('');
    setWarning('');

    try {
      const response = await patientsService.searchByDni(formData.patientDni);
      if (response.success) {
        setPatient(response.data);
        setError('');
        setWarning(''); // Las sesiones son independientes de las citas
      } else {
        setError('Paciente no encontrado');
        setPatient(null);
        setWarning('');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      if (errorMessage && errorMessage.includes('no encontrado')) {
        setError(`No se encontró ningún estudiante con el DNI ${formData.patientDni}. Verifique que el DNI sea correcto y que el usuario esté registrado como estudiante.`);
      } else {
        setError(errorMessage || 'Error al buscar paciente. Verifique la conexión e intente nuevamente.');
      }
      setPatient(null);
      setWarning('');
    } finally {
      setSearching(false);
    }
  };

  const validateForm = () => {
    if (!patient) {
      setError('Debe buscar y seleccionar un paciente');
      return false;
    }

    if (!formData.fecha_sesion || !formData.hora_sesion) {
      setError('Fecha y hora son obligatorias');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const sessionData = {
        patient_dni: formData.patientDni,
        fecha_sesion: formData.fecha_sesion,
        hora_sesion: formData.hora_sesion,
        temas_tratados: formData.temas_tratados,
        notas: formData.notas,
        estado: formData.estado,
        duracion_minutos: formData.duracion_minutos,
        tipo_sesion: formData.tipo_sesion,
        objetivos: formData.objetivos,
        conclusiones: formData.conclusiones
      };

      const response = await apiClient.post('/psychologist-dashboard/sessions/register', sessionData);

      if (response.data.success) {
        setSuccess('Sesión registrada exitosamente');
        clearForm();
        if (onSuccess) onSuccess();
        setTimeout(() => onClose(), 1500); // Cerrar modal después de mostrar mensaje de éxito
      } else {
        setError(response.data.message || 'Error al registrar sesión');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar sesión');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      patientDni: '',
      fecha_sesion: '',
      hora_sesion: '',
      temas_tratados: '',
      notas: '',
      estado: 'Programada',
      duracion_minutos: 60,
      tipo_sesion: 'Terapia individual',
      objetivos: '',
      conclusiones: ''
    });
    setPatient(null);
    setError('');
    setWarning('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Registro de Sesión</h1>
              <p className="text-sm text-gray-600">Registrar nueva sesión psicológica</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

          <div className="p-6">
            {/* Mensaje de alerta en la parte superior */}
            {warning && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800">Atención</h3>
                    <p className="mt-1 text-sm text-orange-700">{warning}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Búsqueda de paciente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Buscar Paciente
                </h3>
                <div className="space-y-4">
                  {/* Fila única: DNI, Botón de búsqueda y Campo de autocompletar */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                    <div className="lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        DNI del Paciente <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="patientDni"
                        placeholder="12345678"
                        value={formData.patientDni}
                        onChange={handleInputChange}
                        maxLength={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <button
                        type="button"
                        onClick={searchPatient}
                        disabled={searching || !formData.patientDni}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center disabled:opacity-50 text-sm whitespace-nowrap"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        {searching ? 'Buscando...' : 'Buscar'}
                      </button>
                    </div>
                    <div className="lg:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Paciente Encontrado
                      </label>
                      <input
                        type="text"
                        value={patient ? `${patient.name} (${patient.email})` : ''}
                        readOnly
                        placeholder="Se completará automáticamente al buscar"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {patient && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800 text-sm">{patient.name}</p>
                        <p className="text-green-600 text-xs">{patient.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Información de la sesión */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Información de la Sesión Psicológica
                </h3>
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  📝 Las sesiones psicológicas son independientes del sistema de citas. Puede registrar una sesión con cualquier estudiante.
                </p>
                
                {/* Fila 1: Fecha, Hora, Duración */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Sesión <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="fecha_sesion"
                      value={formData.fecha_sesion}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de Sesión <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="hora_sesion"
                      value={formData.hora_sesion}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duración (minutos)
                    </label>
                    <input
                      type="number"
                      name="duracion_minutos"
                      value={formData.duracion_minutos}
                      onChange={handleInputChange}
                      min="15"
                      max="180"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Fila 2: Estado, Tipo de Sesión */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Programada">Programada</option>
                      <option value="Realizada">Realizada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Sesión
                    </label>
                    <input
                      type="text"
                      value="Terapia individual"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Detalles de la sesión */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Detalles de la Sesión
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temas Tratados
                    </label>
                    <textarea
                      name="temas_tratados"
                      value={formData.temas_tratados}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Describa los temas tratados en la sesión..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Objetivos
                    </label>
                    <textarea
                      name="objetivos"
                      value={formData.objetivos}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Objetivos de la sesión..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas
                    </label>
                    <textarea
                      name="notas"
                      value={formData.notas}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Notas adicionales de la sesión..."
                    />
                  </div>

                  {formData.estado === 'Realizada' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conclusiones
                      </label>
                      <textarea
                        name="conclusiones"
                        value={formData.conclusiones}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Conclusiones de la sesión..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Mensajes de error y éxito */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-semibold text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 font-semibold text-sm">{success}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#8e161a] text-white rounded-lg hover:bg-[#6d1115] transition-colors duration-200 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Registrando...' : 'Registrar Sesión'}
                </button>
              </div>
            </form>
          </div>
        </div>
    </div>
  );
} 