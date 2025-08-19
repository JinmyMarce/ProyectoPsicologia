import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Send,
  Eye,
  Edit,
  AlertCircle,
  GraduationCap,
  School
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { Student, Tutor } from '../../types';

interface StudentWithDetails extends Student {
  study_program?: string;
  semester?: string;
  phone?: string;
  dni?: string;
  birthdate?: string;
  last_attendance?: string;
  attendance_rate?: number;
}

export function StudentManagement() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [showDerivationModal, setShowDerivationModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDetails | null>(null);

  // Datos del formulario de derivación
  const [derivationForm, setDerivationForm] = useState({
    student_id: '',
    reason: '',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    notes: ''
  });

  useEffect(() => {
    if (user?.role === 'tutor') {
      loadStudents();
    }
  }, [user]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada a la API
      // const response = await fetch(`/api/tutors/${user?.id}/students`);
      // const data = await response.json();
      
      // Por ahora datos de ejemplo
      const mockStudents: StudentWithDetails[] = [
        {
          id: 1,
          name: 'María González López',
          email: 'maria.gonzalez@istta.edu.pe',
          role: 'student',
          study_program: 'Desarrollo de Sistemas de Información',
          semester: '4',
          phone: '+51987654321',
          dni: '12345678',
          birthdate: '2002-05-15',
          last_attendance: '2025-08-15',
          attendance_rate: 95,
          verified: true,
          active: true,
          created_at: '2025-01-15',
          updated_at: '2025-08-15'
        },
        {
          id: 2,
          name: 'Carlos Mendoza Ruiz',
          email: 'carlos.mendoza@istta.edu.pe',
          role: 'student',
          study_program: 'Desarrollo de Sistemas de Información',
          semester: '4',
          phone: '+51987654322',
          dni: '23456789',
          birthdate: '2001-11-20',
          last_attendance: '2025-08-14',
          attendance_rate: 87,
          verified: true,
          active: true,
          created_at: '2025-01-15',
          updated_at: '2025-08-14'
        },
        {
          id: 3,
          name: 'Ana Flores Sánchez',
          email: 'ana.flores@istta.edu.pe',
          role: 'student',
          study_program: 'Desarrollo de Sistemas de Información',
          semester: '4',
          phone: '+51987654323',
          dni: '34567890',
          birthdate: '2002-03-08',
          last_attendance: '2025-08-13',
          attendance_rate: 78,
          verified: true,
          active: true,
          created_at: '2025-01-15',
          updated_at: '2025-08-13'
        }
      ];
      
      setStudents(mockStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDerivation = async (studentId: number) => {
    setDerivationForm(prev => ({ ...prev, student_id: studentId.toString() }));
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student || null);
    setShowDerivationModal(true);
  };

  const handleSubmitDerivation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar llamada a la API
      console.log('Creating derivation:', derivationForm);
      setShowDerivationModal(false);
      setDerivationForm({ student_id: '', reason: '', urgency: 'medium', notes: '' });
      setSelectedStudent(null);
      
      // Mostrar mensaje de éxito
      alert('Derivación creada exitosamente');
    } catch (error) {
      console.error('Error creating derivation:', error);
      alert('Error al crear la derivación');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.dni?.includes(searchTerm);
    
    const matchesSemester = filterSemester === 'all' || student.semester === filterSemester;
    
    return matchesSearch && matchesSemester;
  });

  const getAttendanceBadge = (rate: number) => {
    if (rate >= 90) return <Badge variant="success">Excelente ({rate}%)</Badge>;
    if (rate >= 80) return <Badge variant="info">Buena ({rate}%)</Badge>;
    if (rate >= 70) return <Badge variant="warning">Regular ({rate}%)</Badge>;
    return <Badge variant="danger">Baja ({rate}%)</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-granate-800"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-granate-800">Gestión de Estudiantes</h1>
          <p className="text-azul-marino-700 mt-1">
            Gestiona los estudiantes a tu cargo
          </p>
          {user && (
            <div className="flex items-center gap-2 mt-2">
              <School className="w-4 h-4 text-granate-800" />
              <span className="text-sm text-gray-600">
                {(user as any).study_program} - {(user as any).semester} Semestre - {(user as any).classroom}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {students.length} estudiantes
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-granate-800 focus:border-granate-800"
            >
              <option value="all">Todos los semestres</option>
              <option value="1">1er Semestre</option>
              <option value="2">2do Semestre</option>
              <option value="3">3er Semestre</option>
              <option value="4">4to Semestre</option>
              <option value="5">5to Semestre</option>
              <option value="6">6to Semestre</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de estudiantes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-azul-marino-200 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-azul-marino-800" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.semester}º Semestre</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCreateDerivation(student.id)}
                className="flex items-center gap-1"
              >
                <Send className="w-4 h-4" />
                Derivar
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{student.email}</span>
              </div>
              
              {student.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{student.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{student.study_program}</span>
              </div>

              {student.attendance_rate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Asistencia:</span>
                  {getAttendanceBadge(student.attendance_rate)}
                </div>
              )}

              {student.last_attendance && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Última asistencia: {new Date(student.last_attendance).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 flex items-center justify-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Ver Perfil
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 flex items-center justify-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Contactar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No se encontraron estudiantes</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No tienes estudiantes asignados aún'}
          </p>
        </Card>
      )}

      {/* Modal para Nueva Derivación */}
      {showDerivationModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-granate-800">Crear Derivación</h2>
              <p className="text-gray-600 mt-1">
                Derivar a <strong>{selectedStudent.name}</strong> al área de psicología
              </p>
            </div>
            
            <form onSubmit={handleSubmitDerivation} className="p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Información del Estudiante</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Nombre:</span>
                    <p className="font-medium">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Programa:</span>
                    <p className="font-medium">{selectedStudent.study_program}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Semestre:</span>
                    <p className="font-medium">{selectedStudent.semester}º Semestre</p>
                  </div>
                </div>
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
                  placeholder="Describe detalladamente el motivo de la derivación..."
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
                  <option value="low">Baja - Seguimiento preventivo</option>
                  <option value="medium">Media - Atención en días</option>
                  <option value="high">Alta - Atención prioritaria</option>
                  <option value="critical">Crítica - Atención inmediata</option>
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
                  placeholder="Información adicional que pueda ser útil para el psicólogo..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowDerivationModal(false);
                    setSelectedStudent(null);
                    setDerivationForm({ student_id: '', reason: '', urgency: 'medium', notes: '' });
                  }}
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
    </div>
  );
}
