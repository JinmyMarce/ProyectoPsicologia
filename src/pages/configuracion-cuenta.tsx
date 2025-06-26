import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/users';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function ConfiguracionCuenta() {
  const { user, setUser, token } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    specialization: user?.specialization || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await userService.updateUser(user!.id, form);
      setUser(res.data);
      setSuccess('Perfil actualizado correctamente');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Configuración de Cuenta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <Input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
          <Input name="email" value={form.email} onChange={handleChange} required type="email" />
        </div>
        {user?.role === 'psychologist' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Especialidad</label>
            <Input name="specialization" value={form.specialization} onChange={handleChange} />
          </div>
        )}
        <Button type="submit" loading={loading} className="w-full">Guardar cambios</Button>
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
} 