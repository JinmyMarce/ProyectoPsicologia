import React, { useState, useEffect } from 'react';
import { MessageSquare, Save, X, Search, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { psychologicalSessionsService } from '../../services/psychologicalSessions';
import { patientsService, Patient } from '../../services/patients';

export function SessionRegistration() {
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
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const searchPatient = async () => {
    if (!formData.patientDni) {
      setError('Ingrese el DNI del paciente');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const response = await patientsService.searchByDni(formData.patientDni);
      if (response.success) {
        setPatient(response.data);
        setError('');
      } else {
        setError('Paciente no encontrado');
        setPatient(null);
      }
    } catch (err: any) {
      setError('Paciente no encontrado');
      setPatient(null);
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
        patient_id: patient.id,
        psychologist_id: 1, // TODO: Obtener del contexto de autenticación
        fecha_sesion: `${formData.fecha_sesion} ${formData.hora_sesion}:00`,
        temas_tratados: formData.temas_tratados,
        notas: formData.notas,
        estado: formData.estado,
        duracion_minutos: formData.duracion_minutos,
        tipo_sesion: formData.tipo_sesion,
        objetivos: formData.objetivos,
        conclusiones: formData.conclusiones
      };

      const response = await psychologicalSessionsService.createSession(sessionData);

      if (response.success) {
        setSuccess('Sesión registrada exitosamente');
        clearForm();
      } else {
        setError(response.message || 'Error al registrar sesión');
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
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8e161a] via-cyan-400/30 to-violet-700/40 animate-gradient-shift p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        <Card className="shadow-2xl rounded-3xl border-0 bg-white/95 backdrop-blur-md overflow-hidden" padding="lg">
          {/* Header con icono grande */}
          <div className="text-center mb-8 bg-gradient-to-r from-[#8e161a]/10 to-[#d3b7a0]/10 p-8 rounded-t-3xl">
            <div className="flex items-center justify-center mx-auto mb-6">
              <div className="relative">
                <img 
                  src="/images/icons/psicologia.png"
                  alt="Logo Institucional"
                  className="w-24 h-24 object-contain drop-shadow-2xl filter brightness-110"
                />
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-[#8e161a] mb-3 tracking-tight drop-shadow-sm">
              Registro de Sesión
            </h1>
            <p className="text-gray-700 font-semibold text-lg">
              Sistema de Gestión de Citas - Psicología
            </p>
            <p className="text-[#8e161a] font-bold text-sm mt-2">
              Instituto Túpac Amaru
            </p>
          </div>

          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Búsqueda de paciente */}
              <div className="bg-gradient-to-r from-gray-50 to-[#f2f3c6] p-6 rounded-2xl border-2 border-[#d3b7a0]/30">
                <h3 className="text-xl font-bold text-[#8e161a] mb-4 flex items-center">
                  <User className="w-6 h-6 mr-3" />
                  Paciente
                </h3>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      name="patientDni"
                      label="DNI del Paciente"
                      placeholder="12345678"
                      value={formData.patientDni}
                      onChange={handleInputChange}
                      className="focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a] text-lg"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={searchPatient}
                    loading={searching}
                    className="bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] text-white font-bold shadow-lg hover:from-[#6d1115] hover:to-[#b89a8a] transition-all duration-300 px-8 py-3"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Buscar
                  </Button>
                </div>

                {patient && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <User className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-bold text-green-800 text-lg">{patient.name}</p>
                        <p className="text-green-600 text-sm">{patient.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Información de la sesión */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="date"
                  name="fecha_sesion"
                  label="Fecha de Sesión"
                  value={formData.fecha_sesion}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a] text-lg"
                />

                <Input
                  type="time"
                  name="hora_sesion"
                  label="Hora de Sesión"
                  value={formData.hora_sesion}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a] text-lg"
                />

                <Input
                  type="number"
                  name="duracion_minutos"
                  label="Duración (minutos)"
                  value={formData.duracion_minutos}
                  onChange={handleInputChange}
                  className="focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a] text-lg"
                />

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#d3b7a0] rounded-xl focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-lg"
                  >
                    <option value="Programada">Programada</option>
                    <option value="Realizada">Realizada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tipo de Sesión
                  </label>
                  <select
                    name="tipo_sesion"
                    value={formData.tipo_sesion}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#d3b7a0] rounded-xl focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-lg"
                  >
                    <option value="Terapia individual">Terapia individual</option>
                    <option value="Terapia familiar">Terapia familiar</option>
                    <option value="Evaluación inicial">Evaluación inicial</option>
                    <option value="Evaluación psicológica">Evaluación psicológica</option>
                  </select>
                </div>
              </div>

              {/* Campos de texto */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Temas Tratados
                  </label>
                  <textarea
                    name="temas_tratados"
                    value={formData.temas_tratados}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-[#d3b7a0] rounded-xl focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-lg resize-none"
                    placeholder="Describa los temas tratados en la sesión..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Notas
                  </label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-[#d3b7a0] rounded-xl focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-lg resize-none"
                    placeholder="Notas adicionales de la sesión..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Objetivos
                  </label>
                  <textarea
                    name="objetivos"
                    value={formData.objetivos}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-[#d3b7a0] rounded-xl focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-lg resize-none"
                    placeholder="Objetivos de la sesión..."
                  />
                </div>

                {formData.estado === 'Realizada' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Conclusiones
                    </label>
                    <textarea
                      name="conclusiones"
                      value={formData.conclusiones}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-[#d3b7a0] rounded-xl focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] text-lg resize-none"
                      placeholder="Conclusiones de la sesión..."
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-600 font-semibold text-center text-lg">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <p className="text-green-600 font-semibold text-center text-lg">{success}</p>
                </div>
              )}

              <div className="flex space-x-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] text-white font-bold py-4 rounded-xl shadow-lg hover:from-[#6d1115] hover:to-[#b89a8a] transition-all duration-300 text-lg transform hover:scale-105"
                  size="lg"
                  loading={loading}
                >
                  <Save className="w-6 h-6 mr-3" />
                  Registrar Sesión
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={clearForm}
                  className="border-2 border-[#d3b7a0] hover:border-[#8e161a] text-[#8e161a] font-semibold bg-white hover:bg-[#f2f3c6] transition-all duration-300 py-4 px-8"
                  size="lg"
                >
                  <X className="w-6 h-6 mr-3" />
                  Limpiar
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
} 