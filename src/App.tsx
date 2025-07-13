import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PsychologistDashboard } from './components/psychologist/PsychologistDashboard';
import { SuperAdminDashboard } from './components/super-admin/SuperAdminDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { UserProfile } from './components/profile/UserProfile';
import AppointmentsPage from './components/appointments';
import { AppointmentBooking } from './components/appointments/AppointmentBooking';
import { AppointmentCalendar } from './components/appointments/AppointmentCalendar';
import { AppointmentHistory } from './components/appointments/AppointmentHistory';
import { UserManagement } from './components/admin/UserManagement';
import { UserManagement as SuperAdminUserManagement } from './components/super-admin/UserManagement';
import { SystemMonitoring } from './components/super-admin/SystemMonitoring';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { ReportsAnalytics } from './components/reports/ReportsAnalytics';
import { ScheduleManager } from './components/psychologist/ScheduleManager';
import { PatientRegistration } from './components/patients/PatientRegistration';
import { PatientList } from './components/patients/PatientList';
import { SessionRegistration } from './components/sessions/SessionRegistration';
import { SessionList } from './components/sessions/SessionList';
import { StudentAppointmentHistory } from './components/students/StudentAppointmentHistory';
import { DirectAppointmentScheduler } from './components/psychologist/DirectAppointmentScheduler';
import { SessionHistory } from './components/psychologist/SessionHistory';
import { RescheduleAppointment } from './components/students/RescheduleAppointment';
import MessagePanel from './components/messages/MessagePanel';

// Componente para manejar la navegación
function NavigationHandler({ onPageChange }: { onPageChange: (page: string) => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Extraer la página actual de la URL
    const path = location.pathname;
    const page = path.substring(1) || 'dashboard';
    onPageChange(page);
  }, [location, onPageChange]);

  return null;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Para cerrar el menú lateral al cambiar de página en desktop
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePageChange = (page: string) => {
    if (page === 'messages') {
      setShowMessagesPanel(true);
      return;
    }
    setCurrentPage(page);
    navigate(`/${page}`);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/images/icons/psicologia.png"
            alt="Logo Institucional"
            className="w-24 h-24 object-contain mx-auto mb-4"
          />
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-700 animate-bounce"></div>
            <div className="w-4 h-4 rounded-full bg-red-700 animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-4 h-4 rounded-full bg-red-700 animate-bounce [animation-delay:-.5s]"></div>
          </div>
          <p className="text-gray-600 font-semibold mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <NavigationHandler onPageChange={setCurrentPage} />
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onPageChange={handlePageChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          notifications={3}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Routes>
              {/* Rutas para Super Admin */}
              {user.role === 'super_admin' && user.email === 'marcelojinmy2024@gmail.com' && (
                <>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<SuperAdminDashboard />} />
                  <Route path="/users" element={<SuperAdminUserManagement />} />
                  <Route path="/monitoring" element={<SystemMonitoring />} />
                  <Route path="/reports" element={<ReportsAnalytics />} />
                  <Route path="/notifications" element={<NotificationCenter />} />
                  <Route path="/profile" element={<UserProfile />} />
                </>
              )}
              {/* Si es super_admin pero no tiene el email correcto, mostrar acceso denegado */}
              {user.role === 'super_admin' && user.email !== 'marcelojinmy2024@gmail.com' && (
                <Route path="*" element={<div className="flex items-center justify-center min-h-screen"><h2 className="text-2xl text-red-600 font-bold">Acceso denegado. Solo el superadministrador autorizado puede acceder.</h2></div>} />
              )}

              {/* Rutas para Admin */}
              {user.role === 'admin' && (
                <>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/reports" element={<ReportsAnalytics />} />
                  <Route path="/notifications" element={<NotificationCenter />} />
                  <Route path="/profile" element={<UserProfile />} />
                </>
              )}

              {/* Rutas para Psicólogo */}
              {user.role === 'psychologist' && user.email !== 'marcelojinmy2024@gmail.com' && (
                <>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<PsychologistDashboard />} />
                  <Route path="/schedule" element={<ScheduleManager />} />
                  <Route path="/patients" element={<PatientList />} />
                  <Route path="/patients/register" element={<PatientRegistration />} />
                  <Route path="/sessions" element={<SessionHistory />} />
                  <Route path="/sessions/register" element={<SessionRegistration />} />
                  <Route path="/appointments/direct" element={<DirectAppointmentScheduler />} />
                  <Route path="/notifications" element={<NotificationCenter />} />
                  <Route path="/profile" element={<UserProfile />} />
                </>
              )}
              {/* Si es super_admin, nunca mostrar la interfaz de psicólogo */}
              {user.role === 'psychologist' && user.email === 'marcelojinmy2024@gmail.com' && (
                <Route path="*" element={<div className="flex items-center justify-center min-h-screen"><h2 className="text-2xl text-red-600 font-bold">Acceso denegado. Solo el superadministrador autorizado puede acceder a su propia interfaz.</h2></div>} />
              )}

              {/* Rutas para Estudiante */}
              {user.role === 'student' && (
                <>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<StudentDashboard onPageChange={handlePageChange} />} />
                  <Route path="/appointments" element={<AppointmentBooking />} />
                  <Route path="/appointments/calendar" element={<AppointmentCalendar />} />
                  <Route path="/appointments/history" element={<StudentAppointmentHistory />} />
                  <Route path="/appointments/reschedule" element={<RescheduleAppointment />} />
                  <Route path="/notifications" element={<NotificationCenter />} />
                  <Route path="/profile" element={<UserProfile />} />
                </>
              )}

              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
      {/* Panel de mensajes global */}
      <MessagePanel isOpen={showMessagesPanel} onClose={() => setShowMessagesPanel(false)} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;