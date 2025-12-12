import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle, XCircle, Clock, User, Phone, Mail, FileText, Calendar } from 'lucide-react';
import { getPendingAppointments, approveAppointment, rejectAppointment } from '../../services/appointments';
import { useAuth } from '../../contexts/AuthContext';

interface PendingAppointment {
  id: number;
  student_name: string;
  student_email: string;
  psychologist_name: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  created_at: string;
  patient_dni: string;
  patient_full_name: string;
  patient_age: number;
  patient_gender: string;
  patient_address: string;
  patient_study_program: string;
  patient_semester: string;
  patient_phone: string;
  patient_email: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  medical_history: string;
  current_medications: string;
  allergies: string;
}

export const PendingAppointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<PendingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectModal, setRejectModal] = useState<{ open: boolean; appointmentId: number | null; reason: string }>({
    open: false,
    appointmentId: null,
    reason: ''
  });

  useEffect(() => {
    loadPendingAppointments();
  }, []);

  const loadPendingAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPendingAppointments();
      setAppointments(data);
    } catch (error: any) {
      setError(error.message || 'Error al cargar las citas pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveAppointment(id);
      setAppointments(prev => prev.filter(app => app.id !== id));
      // Aquí se podría mostrar una notificación de éxito
    } catch (error: any) {
      setError(error.message || 'Error al aprobar la cita');
    }
  };

  const handleReject = async () => {
    if (!rejectModal.appointmentId || !rejectModal.reason.trim()) {
      setError('Debes proporcionar una razón para rechazar la cita');
      return;
    }

    try {
      await rejectAppointment(rejectModal.appointmentId, rejectModal.reason);
      setAppointments(prev => prev.filter(app => app.id !== rejectModal.appointmentId));
      setRejectModal({ open: false, appointmentId: null, reason: '' });
      // Aquí se podría mostrar una notificación de éxito
    } catch (error: any) {
      setError(error.message || 'Error al rechazar la cita');
    }
  };

  const openRejectModal = (id: number) => {
    setRejectModal({ open: true, appointmentId: id, reason: '' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-md border border-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Cargando citas pendientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
            <XCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-red-900 font-bold text-lg">Error</p>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-white to-amber-50 p-6 rounded-2xl shadow-md border border-amber-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Citas Pendientes</h2>
        </div>
        <Badge variant="warning" className="text-sm font-bold px-4 py-2">
          {appointments.length} pendientes
        </Badge>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-slate-200">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No hay citas pendientes</h3>
          <p className="text-gray-600 font-medium">Todas las citas han sido procesadas</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl p-6 border border-slate-200 hover:border-slate-300 transition-all duration-300">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all duration-300">
                    <User className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                      {appointment.patient_full_name}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {appointment.patient_study_program} - {appointment.patient_semester}° Semestre
                    </p>
                  </div>
                </div>
                <Badge variant="warning" className="font-bold px-3 py-1">Pendiente</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 font-medium flex items-center">
                    <Calendar className="w-4 h-4 inline mr-2 text-cyan-600" />
                    {new Date(appointment.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-700 font-medium flex items-center">
                    <Clock className="w-4 h-4 inline mr-2 text-blue-600" />
                    {appointment.time} - 45 minutos
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 font-medium flex items-center">
                    <User className="w-4 h-4 inline mr-2 text-violet-600" />
                    DNI: {appointment.patient_dni}
                  </p>
                  <p className="text-sm text-gray-700 font-medium flex items-center">
                    <Phone className="w-4 h-4 inline mr-2 text-emerald-600" />
                    {appointment.patient_phone}
                  </p>
                </div>
              </div>

              {appointment.reason && (
                <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    Motivo de Consulta
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {appointment.reason}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <Button
                  onClick={() => handleApprove(appointment.id)}
                  className="flex items-center bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-semibold px-6"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Aprobar
                </Button>
                <Button
                  onClick={() => openRejectModal(appointment.id)}
                  variant="outline"
                  className="flex items-center text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 rounded-xl transition-all duration-300 font-semibold px-6"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para rechazar cita */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Rechazar Cita</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed font-medium bg-red-50 p-3 rounded-xl border border-red-100">
              Proporciona una razón para rechazar esta cita. El estudiante será notificado automáticamente.
            </p>
            <textarea
              className="w-full border-2 border-slate-300 rounded-xl p-4 mb-5 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 font-medium"
              placeholder="Describe el motivo del rechazo..."
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setRejectModal({ open: false, appointmentId: null, reason: '' })}
                className="rounded-xl border-slate-300 hover:bg-slate-50 font-semibold px-6"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReject}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-semibold px-6"
              >
                Rechazar Cita
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 