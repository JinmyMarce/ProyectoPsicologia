import React, { useState } from 'react';
import { MessageSquare, Save, X, Search, User, Calendar, FileText, RefreshCw } from 'lucide-react';
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
      setError('Ingrese el DNI');
      setPatient(null);
      return;
    }

    if (formData.patientDni.length !== 8) {
      setError('Debe tener 8 dígitos');
      setPatient(null);
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
        setWarning('');
      } else {
        setError('Paciente no encontrado');
        setPatient(null);
        setWarning('');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      if (errorMessage && errorMessage.includes('no encontrado')) {
        setError('Paciente no encontrado');
      } else {
        setError('Error al buscar');
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
      duracion_minutos: 45,
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-3" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="bg-white rounded-xl shadow-2xl max-w-full sm:max-w-lg lg:max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-300 mx-2">
        {/* Header compacto - Azul marino oscuro */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-0">
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 pb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
              </div>
              <div className="text-xs sm:text-sm md:text-base font-semibold text-white/80 leading-tight">
                <span>Registro de Sesión</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 transition-all duration-300 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

            {/* Body compacto - Responsivo */}
        <div className="p-2 sm:p-3 md:p-4 bg-white overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          {/* Mensaje de alerta en la parte superior */}
          {warning && (
            <div className="mb-3 p-2 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-orange-800">Atención</h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-orange-700">{warning}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Búsqueda de paciente */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg px-2 sm:px-3 py-1.5">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <h3 className="text-[10px] sm:text-xs font-bold text-white uppercase">Buscar Paciente</h3>
              </div>
              <div className="space-y-2">
                {/* Campo DNI, Botón de búsqueda e Información del paciente - Todo en la misma fila */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    DNI del Paciente <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <div className="flex gap-2 items-center flex-wrap">
                      <div className="flex-shrink-0">
                        <input
                          type="text"
                          name="patientDni"
                          placeholder="12345678"
                          value={formData.patientDni}
                          onChange={(e) => {
                            handleInputChange(e);
                            // Limpiar errores y paciente cuando se cambia el DNI
                            if (error) setError('');
                            if (patient) setPatient(null);
                          }}
                          maxLength={8}
                          className={`w-20 sm:w-24 px-2 sm:px-3 py-1.5 sm:py-2 border-2 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none ${
                            error && !patient ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : 'border-slate-200'
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={searchPatient}
                        disabled={searching || !formData.patientDni || !!patient}
                        className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-950 transition-all duration-200 font-semibold items-center justify-center gap-1.5 disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap ml-2 ${patient ? 'hidden sm:flex' : 'flex'}`}
                      >
                        <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">{searching ? 'Buscando...' : 'Buscar'}</span>
                        <span className="xs:hidden">{searching ? '...' : 'Buscar'}</span>
                      </button>
                      {patient && (
                        <div className="flex-shrink-0 p-1.5 sm:p-2 bg-green-50 border border-green-200 rounded-lg ml-auto">
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-semibold text-green-800 text-xs sm:text-sm leading-tight">{patient.name}</p>
                              <p className="text-green-600 text-xs leading-tight">{patient.email}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Mensajes de error/alertas debajo del campo - Cortos y claros */}
                    <div className="mt-1">
                      {error && !patient && (
                        <p className="text-[10px] sm:text-xs text-red-600 font-semibold">{error}</p>
                      )}
                      {formData.patientDni.length > 0 && formData.patientDni.length < 8 && !error && (
                        <p className="text-[10px] sm:text-xs text-amber-600 font-semibold">8 dígitos requeridos</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de la sesión */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg px-2 sm:px-3 py-1.5">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <h3 className="text-[10px] sm:text-xs font-bold text-white uppercase">Información de la Sesión</h3>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                📝 Las sesiones psicológicas son independientes del sistema de citas. Puede registrar una sesión con cualquier estudiante.
              </p>
              
              {/* Fila 1: Fecha, Hora, Duración */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Fecha de Sesión <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_sesion"
                    value={formData.fecha_sesion}
                    onChange={handleInputChange}
                    required
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Hora de Sesión <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="hora_sesion"
                    value={formData.hora_sesion}
                    onChange={handleInputChange}
                    required
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    name="duracion_minutos"
                    value={formData.duracion_minutos}
                    onChange={handleInputChange}
                    min="15"
                    max="180"
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Fila 2: Estado, Tipo de Sesión */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300"
                  >
                    <option value="Programada">Programada</option>
                    <option value="Realizada">Realizada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Tipo de Sesión
                  </label>
                  <input
                    type="text"
                    name="tipo_sesion"
                    value={formData.tipo_sesion}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Detalles de la sesión */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg px-2 sm:px-3 py-1.5">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <h3 className="text-[10px] sm:text-xs font-bold text-white uppercase">Detalles de la Sesión</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Temas Tratados
                  </label>
                  <textarea
                    name="temas_tratados"
                    value={formData.temas_tratados}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none resize-none"
                    placeholder="Describa los temas tratados en la sesión..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Objetivos
                  </label>
                  <textarea
                    name="objetivos"
                    value={formData.objetivos}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none resize-none"
                    placeholder="Objetivos de la sesión..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none resize-none"
                    placeholder="Notas adicionales de la sesión..."
                  />
                </div>

                {formData.estado === 'Realizada' && (
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                      Conclusiones
                    </label>
                    <textarea
                      name="conclusiones"
                      value={formData.conclusiones}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all text-xs sm:text-sm font-semibold bg-white hover:border-slate-300 focus:outline-none resize-none"
                      placeholder="Conclusiones de la sesión..."
                    />
                  </div>
                )}
              </div>
            </div>


            {success && (
              <div className="p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 font-semibold text-xs sm:text-sm">{success}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 sm:pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={clearForm}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 font-semibold flex items-center justify-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                Limpiar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-lg transition-all duration-300 font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Registrar Sesión</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 