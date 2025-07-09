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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8e161a]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Citas Pendientes</h2>
        <Badge variant="warning" className="text-sm">
          {appointments.length} pendientes
        </Badge>
      </div>

      {appointments.length === 0 ? (
        <Card className="p-8 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay citas pendientes</h3>
          <p className="text-gray-600">Todas las citas han sido procesadas</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {appointment.patient_full_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {appointment.patient_study_program} - {appointment.patient_semester}° Semestre
                  </p>
                </div>
                <Badge variant="warning">Pendiente</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {new Date(appointment.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {appointment.time} - 45 minutos
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <User className="w-4 h-4 inline mr-1" />
                    DNI: {appointment.patient_dni}
                  </p>
                  <p className="text-sm text-gray-600">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {appointment.patient_phone}
                  </p>
                </div>
              </div>

              {appointment.reason && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Motivo de Consulta
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {appointment.reason}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(appointment.id)}
                  className="flex items-center bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprobar
                </Button>
                <Button
                  onClick={() => openRejectModal(appointment.id)}
                  variant="outline"
                  className="flex items-center text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para rechazar cita */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Rechazar Cita</h3>
            <p className="text-sm text-gray-600 mb-4">
              Proporciona una razón para rechazar esta cita. El estudiante será notificado.
            </p>
            <textarea
              className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a]"
              placeholder="Razón del rechazo..."
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setRejectModal({ open: false, appointmentId: null, reason: '' })}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700"
              >
                Rechazar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 