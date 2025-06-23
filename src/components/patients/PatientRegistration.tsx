import React, { useState } from 'react';
import { UserPlus, Save, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { patientsService } from '../../services/patients';

export function PatientRegistration() {
  const [formData, setFormData] = useState({
    dni: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.dni || !formData.name || !formData.email || !formData.password) {
      setError('Todos los campos son obligatorios');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (!formData.email.endsWith('@instituto.edu.pe')) {
      setError('El correo debe ser institucional (@instituto.edu.pe)');
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
      const response = await patientsService.createPatient({
        dni: formData.dni,
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        setSuccess('Paciente registrado exitosamente');
        setFormData({
          dni: '',
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setError(response.message || 'Error al registrar paciente');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar paciente');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      dni: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2f3c6] via-[#d3b7a0] to-[#8e161a] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl rounded-3xl border-0 bg-white/95 backdrop-blur-md overflow-hidden" padding="lg">
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
              Registro de Paciente
            </h1>
            <p className="text-gray-700 font-semibold text-lg">
              Sistema de Gestión de Citas - Psicología
            </p>
            <p className="text-[#8e161a] font-bold text-sm mt-2">
              Instituto Túpac Amaru
            </p>
          </div>

          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  name="dni"
                  label="DNI"
                  placeholder="12345678"
                  value={formData.dni}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a] text-lg"
                />

                <Input
                  type="text"
                  name="name"
                  label="Nombre Completo"
                  placeholder="María García López"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a] text-lg"
                />
              </div>

              <Input
                type="email"
                name="email"
                label="Correo Institucional"
                placeholder="maria.garcia@instituto.edu.pe"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a] text-lg"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    label="Contraseña"
                    placeholder="Ingrese contraseña"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a] text-lg pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-10 text-[#d3b7a0] hover:text-[#8e161a] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    label="Confirmar Contraseña"
                    placeholder="Confirme contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a] text-lg pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-10 text-[#d3b7a0] hover:text-[#8e161a] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-600 font-semibold text-center">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <p className="text-green-600 font-semibold text-center">{success}</p>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] text-white font-bold py-4 rounded-xl shadow-lg hover:from-[#6d1115] hover:to-[#b89a8a] transition-all duration-300 text-lg transform hover:scale-105"
                  size="lg"
                  loading={loading}
                >
                  <Save className="w-6 h-6 mr-3" />
                  Registrar Paciente
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={clearForm}
                  className="border-2 border-[#d3b7a0] hover:border-[#8e161a] text-[#8e161a] font-semibold bg-white hover:bg-[#f2f3c6] transition-all duration-300 py-4 px-6"
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