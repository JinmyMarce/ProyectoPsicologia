import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Users, 
  Calendar, 
  Send, 
  Clock, 
  Plus,
  User,
  BookOpen,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  School
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { Tutor, Derivation, GroupSession, Student } from '../../types';

export function TutorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [derivations, setDerivations] = useState<Derivation[]>([]);
  const [groupSessions, setGroupSessions] = useState<GroupSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showDerivationModal, setShowDerivationModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Datos del formulario de derivación
  const [derivationForm, setDerivationForm] = useState({
    student_id: '',
    reason: '',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    notes: ''
  });

  // Datos del formulario de sesión grupal
  const [sessionForm, setSessionForm] = useState({
    classroom: '',
    date: '',
    day_of_week: 'monday' as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
    topic: '',
    max_students: 30,
    notes: ''
  });

  useEffect(() => {
    if (user?.role === 'tutor') {
      loadTutorData();
    }
  }, [user]);

  const loadTutorData = async () => {
    try {
      setLoading(true);
      // Aquí irían las llamadas a la API
      // const derivationsData = await getMyDerivations();
      // const sessionsData = await getMyGroupSessions();
      // const studentsData = await getMyStudents();
      
      // Por ahora datos de ejemplo
      setDerivations([]);
      setGroupSessions([]);
      setStudents([]);
    } catch (error) {
      console.error('Error loading tutor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDerivation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Aquí iría la llamada a la API para crear derivación
      console.log('Creating derivation:', derivationForm);
      setShowDerivationModal(false);
      loadTutorData();
    } catch (error) {
      console.error('Error creating derivation:', error);
    }
  };

  const handleCreateGroupSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Aquí iría la llamada a la API para crear sesión grupal
      console.log('Creating group session:', sessionForm);
      setShowSessionModal(false);
      loadTutorData();
    } catch (error) {
      console.error('Error creating group session:', error);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <Badge variant="danger">Crítica</Badge>;
      case 'high':
        return <Badge variant="warning">Alta</Badge>;
      case 'medium':
        return <Badge variant="info">Media</Badge>;
      case 'low':
        return <Badge variant="success">Baja</Badge>;
      default:
        return <Badge variant="default">{urgency}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'assigned':
        return <Badge variant="info">Asignada</Badge>;
      case 'in_progress':
        return <Badge variant="primary">En Progreso</Badge>;
      case 'completed':
        return <Badge variant="success">Completada</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelada</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Título Principal */}
      <div className="text-center mb-6">
        <div className="inline-block px-20 py-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
            Panel del Tutor - Gestión Estudiantil
          </h1>
          <div className="w-28 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto rounded-full"></div>
        </div>
      </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowDerivationModal(true)}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white"
            variant="primary"
          >
            <Send className="w-4 h-4" />
            Nueva Derivación
          </Button>
          <Button 
            onClick={() => setShowSessionModal(true)}
            className="flex items-center gap-2 border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white"
            variant="secondary"
          >
            <Calendar className="w-4 h-4" />
            Sesión Grupal
          </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Users className="w-6 h-6 text-gray-800" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{students.length}</h3>
              <p className="text-sm text-gray-600">Estudiantes a Cargo</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Send className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-700">{derivations.length}</h3>
              <p className="text-sm text-gray-600">Derivaciones Activas</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Calendar className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-600">{groupSessions.length}</h3>
              <p className="text-sm text-gray-600">Sesiones Programadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Clock className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-500">1-2 AM</h3>
              <p className="text-sm text-gray-600">Horario de Sesiones</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Derivations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Derivaciones Recientes
          </CardTitle>
          <CardDescription>
            Estudiantes derivados al área de psicología
          </CardDescription>
        </CardHeader>
        <div className="p-6">
          {derivations.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Sin derivaciones</h3>
              <p className="text-gray-500 mb-4">No has realizado ninguna derivación aún</p>
              <Button onClick={() => setShowDerivationModal(true)}>
                Crear primera derivación
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {derivations.map((derivation) => (
                <div key={derivation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-azul-marino-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-azul-marino-800" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{derivation.student?.name}</h4>
                      <p className="text-sm text-gray-600">{derivation.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getUrgencyBadge(derivation.urgency)}
                    {getStatusBadge(derivation.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Scheduled Group Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Sesiones Grupales Programadas
          </CardTitle>
          <CardDescription>
            Sesiones de 1:00 AM - 2:00 AM, Lunes a Viernes
          </CardDescription>
        </CardHeader>
        <div className="p-6">
          {groupSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Sin sesiones programadas</h3>
              <p className="text-gray-500 mb-4">No hay sesiones grupales programadas</p>
              <Button onClick={() => setShowSessionModal(true)}>
                Programar sesión
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupSessions.map((session) => (
                <div key={session.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{session.topic}</h4>
                    {getStatusBadge(session.status)}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{session.start_time} - {session.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4" />
                      <span>{session.classroom}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{session.registered_students.length} estudiantes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal para Nueva Derivación */}
      {showDerivationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-granate-800">Nueva Derivación a Psicología</h2>
              <p className="text-gray-600 mt-1">Deriva un estudiante al área de psicología</p>
            </div>
            
            <form onSubmit={handleCreateDerivation} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estudiante <span className="text-red-500">*</span>
                </label>
                <select
                  value={derivationForm.student_id}
                  onChange={e => setDerivationForm(prev => ({ ...prev, student_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                  required
                >
                  <option value="">Seleccionar estudiante</option>
                  {/* Aquí irían los estudiantes del tutor */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la derivación <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={derivationForm.reason}
                  onChange={e => setDerivationForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                  rows={4}
                  placeholder="Describe el motivo de la derivación..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de urgencia
                </label>
                <select
                  value={derivationForm.urgency}
                  onChange={e => setDerivationForm(prev => ({ ...prev, urgency: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales
                </label>
                <textarea
                  value={derivationForm.notes}
                  onChange={e => setDerivationForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                  rows={3}
                  placeholder="Información adicional relevante..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowDerivationModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Crear Derivación
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Nueva Sesión Grupal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-granate-800">Nueva Sesión Grupal</h2>
              <p className="text-gray-600 mt-1">Programa una sesión grupal de 1:00 AM - 2:00 AM</p>
            </div>
            
            <form onSubmit={handleCreateGroupSession} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aula/Salón <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={sessionForm.classroom}
                    onChange={e => setSessionForm(prev => ({ ...prev, classroom: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                    placeholder="Ej: A-101"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={sessionForm.date}
                    onChange={e => setSessionForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Día de la semana
                </label>
                <select
                  value={sessionForm.day_of_week}
                  onChange={e => setSessionForm(prev => ({ ...prev, day_of_week: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                >
                  <option value="monday">Lunes</option>
                  <option value="tuesday">Martes</option>
                  <option value="wednesday">Miércoles</option>
                  <option value="thursday">Jueves</option>
                  <option value="friday">Viernes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema de la sesión <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sessionForm.topic}
                  onChange={e => setSessionForm(prev => ({ ...prev, topic: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                  placeholder="Ej: Técnicas de estudio, Manejo del estrés"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de estudiantes
                </label>
                <input
                  type="number"
                  value={sessionForm.max_students}
                  onChange={e => setSessionForm(prev => ({ ...prev, max_students: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales
                </label>
                <textarea
                  value={sessionForm.notes}
                  onChange={e => setSessionForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
                  rows={3}
                  placeholder="Información adicional sobre la sesión..."
                />
              </div>

              <div className="bg-azul-marino-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-azul-marino-800 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-azul-marino-900">Horario de sesiones grupales</h4>
                    <p className="text-sm text-azul-marino-700 mt-1">
                      Las sesiones grupales se realizan de <strong>1:00 AM a 2:00 AM</strong>, 
                      únicamente de <strong>lunes a viernes</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowSessionModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Programar Sesión
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
