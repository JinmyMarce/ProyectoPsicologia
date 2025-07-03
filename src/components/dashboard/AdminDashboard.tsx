import React, { useState, useEffect } from 'react';
import { getAppointments, getPsychologists } from '../../services/appointments';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Star, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  TrendingUp,
  Users,
  FileText,
  Settings,
  BarChart3,
  UserCheck
} from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { reportService } from '../../services/reports';
import { userService } from '../../services/users';
import { psychologistService } from '../../services/psychologist';

interface Appointment {
  id: number;
  student_id: number;
  psychologist_id: number;
  psychologist_name: string;
  fecha: string;
  hora: string;
  motivo_consulta: string;
  notas?: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  created_at: string;
  updated_at: string;
}

interface Psychologist {
  id: number;
  name: string;
  email: string;
  specialization: string;
  rating: number;
  total_appointments: number;
  verified: boolean;
  active: boolean;
}

interface AppointmentWithDetails extends Appointment {
  psychologist: Psychologist;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [psychologists, setPsychologists] = useState<any[]>([]);
  const [deactivated, setDeactivated] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    password: '',
    specialization: '',
    celular: '',
    fecha_nacimiento: '',
    verified: false
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [analytics, activePsychs, deactPsychs, appts] = await Promise.all([
        reportService.getAnalytics(),
        psychologistService.getPsychologists(),
        psychologistService.getPsychologistHistory(),
        reportService.getAppointmentsReport({})
      ]);
      setSummary(analytics);
      setPsychologists(activePsychs.data || []);
      setDeactivated(deactPsychs.data || []);
      setAppointments(appts.data || []);
    } catch (e) {
      setError('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setActionLoading('deactivate-' + id);
    setMessage(null);
    setError(null);
    try {
      await psychologistService.deactivatePsychologist(id, {});
      setMessage('Psicólogo desactivado exitosamente.');
      await loadDashboard();
    } catch (e) {
      setError('Error al desactivar psicólogo.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (historyId: string) => {
    setActionLoading('reactivate-' + historyId);
    setMessage(null);
    setError(null);
    try {
      await psychologistService.reactivatePsychologist(historyId);
      setMessage('Psicólogo reactivado exitosamente.');
      await loadDashboard();
    } catch (e) {
      setError('Error al reactivar psicólogo.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreatePsychologist = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setMessage(null);
    setError(null);
    try {
      await psychologistService.createPsychologist(createForm);
      setMessage('Psicólogo creado exitosamente.');
      setShowCreateModal(false);
      setCreateForm({ name: '', apellido_paterno: '', apellido_materno: '', email: '', password: '', specialization: '', celular: '', fecha_nacimiento: '', verified: false });
      await loadDashboard();
    } catch (e) {
      setError('Error al crear psicólogo.');
    } finally {
      setCreateLoading(false);
    }
  };

  if (user?.role !== 'super_admin') {
    return <div className="text-center py-12 text-sm">Acceso solo para superadministrador.</div>;
  }

  if (loading) {
    return <div className="text-center py-12 text-sm">Cargando dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8e161a] via-cyan-400/30 to-violet-700/40 animate-gradient-shift p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        {/* Modal Crear Psicólogo */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm border-2 border-[#8e161a]/20">
              <h2 className="text-base font-bold mb-4 text-[#8e161a]">Crear Psicólogo</h2>
              <form onSubmit={handleCreatePsychologist} className="space-y-3">
                <input type="text" className="w-full border rounded px-3 py-2 text-xs" placeholder="Nombre" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} required />
                <input type="text" className="w-full border rounded px-3 py-2 text-xs" placeholder="Apellido Paterno" value={createForm.apellido_paterno} onChange={e => setCreateForm(f => ({ ...f, apellido_paterno: e.target.value }))} required />
                <input type="text" className="w-full border rounded px-3 py-2 text-xs" placeholder="Apellido Materno" value={createForm.apellido_materno} onChange={e => setCreateForm(f => ({ ...f, apellido_materno: e.target.value }))} required />
                <input type="email" className="w-full border rounded px-3 py-2 text-xs" placeholder="Email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} required />
                <input type="password" className="w-full border rounded px-3 py-2 text-xs" placeholder="Contraseña" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} required />
                <input type="text" className="w-full border rounded px-3 py-2 text-xs" placeholder="Especialidad" value={createForm.specialization} onChange={e => setCreateForm(f => ({ ...f, specialization: e.target.value }))} required />
                <input type="text" className="w-full border rounded px-3 py-2 text-xs" placeholder="Celular" value={createForm.celular} onChange={e => setCreateForm(f => ({ ...f, celular: e.target.value }))} required />
                <input type="date" className="w-full border rounded px-3 py-2 text-xs" placeholder="Fecha de Nacimiento" value={createForm.fecha_nacimiento} onChange={e => setCreateForm(f => ({ ...f, fecha_nacimiento: e.target.value }))} required />
                <label className="flex items-center text-xs">
                  <input type="checkbox" className="mr-2" checked={createForm.verified} onChange={e => setCreateForm(f => ({ ...f, verified: e.target.checked }))} />
                  Verificado
                </label>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs text-center">
                    {error}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setShowCreateModal(false)} disabled={createLoading}>Cancelar</Button>
                  <Button type="submit" size="sm" variant="primary" loading={createLoading}>Crear</Button>
                </div>
              </form>
            </div>
          </div>
        )}
        {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mb-2 text-xs">{message}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-2 text-xs">{error}</div>}
        {/* Resumen rápido */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><div className="text-center"><p className="text-lg font-bold">{summary?.data?.totalPsychologists || 0}</p><p className="text-xs text-gray-600">Psicólogos Activos</p></div></Card>
          <Card><div className="text-center"><p className="text-lg font-bold">{deactivated.length}</p><p className="text-xs text-gray-600">Psicólogos Desactivados</p></div></Card>
          <Card><div className="text-center"><p className="text-lg font-bold">{summary?.data?.totalAppointments || 0}</p><p className="text-xs text-gray-600">Citas Totales</p></div></Card>
          <Card><div className="text-center"><p className="text-lg font-bold">{summary?.data?.pendingAppointments || 0}</p><p className="text-xs text-gray-600">Citas Pendientes</p></div></Card>
        </div>

        {/* Gestión de psicólogos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold">Psicólogos Activos</h2>
              <Button size="sm" variant="primary" onClick={() => setShowCreateModal(true)}>Crear Psicólogo</Button>
            </div>
            <ul className="divide-y divide-gray-100 text-xs">
              {psychologists.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span>{p.name} ({p.email})</span>
                  <Button size="sm" variant="danger" disabled={actionLoading === 'deactivate-' + p.id} onClick={() => handleDeactivate(p.id)}>
                    {actionLoading === 'deactivate-' + p.id ? 'Desactivando...' : 'Desactivar'}
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="text-base font-bold mb-2">Psicólogos Desactivados</h2>
            <ul className="divide-y divide-gray-100 text-xs">
              {deactivated.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span>{p.name} ({p.email})</span>
                  <Button size="sm" variant="outline" disabled={actionLoading === 'reactivate-' + p.id} onClick={() => handleReactivate(p.id)}>
                    {actionLoading === 'reactivate-' + p.id ? 'Reactivando...' : 'Reactivar'}
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Historial de actividades: citas */}
        <Card>
          <h2 className="text-base font-bold mb-2">Historial de Citas Recientes</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-600">
                <th>Fecha</th>
                <th>Psicólogo</th>
                <th>Estudiante</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-t">
                  <td>{a.fecha}</td>
                  <td>{a.psychologist_name || a.psychologist?.name}</td>
                  <td>{a.student_name || a.student?.name}</td>
                  <td><Badge variant={a.estado === 'completada' ? 'success' : a.estado === 'cancelada' ? 'danger' : 'warning'}>{a.estado}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Reportes y métricas */}
        <Card>
          <h2 className="text-base font-bold mb-2">Reportes y Métricas</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm" variant="outline"><BarChart3 className="w-4 h-4 mr-1" /> Ver Analítica</Button>
            <Button size="sm" variant="outline"><FileText className="w-4 h-4 mr-1" /> Exportar PDF</Button>
            <Button size="sm" variant="outline"><FileText className="w-4 h-4 mr-1" /> Exportar Excel</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}