import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PsychologistDashboard } from './components/psychologist/PsychologistDashboard';
import { SuperAdminDashboard } from './components/super-admin/SuperAdminDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { TutorDashboard } from './components/tutor/TutorDashboard';
import { StudentManagement } from './components/tutor/StudentManagement';
import { DerivationManagement } from './components/tutor/DerivationManagement';
import { GroupSessionManagement } from './components/tutor/GroupSessionManagement';
import { UserProfile } from './components/profile/UserProfile';
import { StudentProfile } from './components/students/StudentProfile';
import AppointmentsPage from './components/appointments';
import { AppointmentBooking } from './components/appointments/AppointmentBooking';
import { UnifiedCalendar } from './components/ui/UnifiedCalendar';
import { AppointmentHistory } from './components/appointments/AppointmentHistory';
import { UserManagement } from './components/admin/UserManagement';
import { UserManagement as SuperAdminUserManagement } from './components/super-admin/UserManagement';
import { SystemMonitoring } from './components/super-admin/SystemMonitoring';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { ReportsAnalytics } from './components/reports/ReportsAnalytics';
import { ScheduleManager } from './components/psychologist/ScheduleManager';
import { PatientRegistration } from './components/patients/PatientRegistration';
import PatientList from './components/patients/PatientList';
import { SessionList } from './components/sessions/SessionList';
import { StudentAppointmentHistory } from './components/students/StudentAppointmentHistory';
import { UnifiedCalendar as PsychologistCalendar } from './components/ui/UnifiedCalendar';
import { SessionHistory } from './components/psychologist/SessionHistory';
import { RescheduleAppointment } from './components/students/RescheduleAppointment';
import MessagePanel from './components/messages/MessagePanel';
import { SyncNotification } from './components/ui/SyncNotification';
import { WelcomeMessage } from './components/auth/WelcomeMessage';
import { AdminStats } from './components/dashboard/AdminStats';
import { LoadingScreen } from './components/ui/LoadingScreen';

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
  const { user, loading, syncMessage, setSyncMessage, welcomeMessage, setWelcomeMessage } = useAuth();
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

    // Manejar casos especiales de navegación
    switch (page) {
      case 'reschedule':
        navigate('/appointments/reschedule');
        break;
      default:
        navigate(`/${page}`);
    }

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Instituto Túpac Amaru"
        subtitle="Sistema de Gestión Psicológica"
        size="lg"
        showParticles={true}
        showWaves={true}
      />
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: undefined }}>
      <NavigationHandler onPageChange={setCurrentPage} />

      {/* Contenedor unificado con sidebar y contenido */}
      <div className="flex w-full h-screen bg-gray-50">
        {/* Sidebar - deshabilitada cuando hay mensaje de bienvenida */}
        {!welcomeMessage && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onPageChange={handlePageChange}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        {/* Área de contenido principal */}
        <div className="flex-1 flex flex-col relative bg-white">
          {/* Header - deshabilitado cuando hay mensaje de bienvenida */}
          <Header
            onMenuClick={welcomeMessage ? undefined : () => setSidebarOpen(prev => !prev)}
          />

          {/* Notificación de sincronización */}
          {syncMessage && (
            <SyncNotification
              isVisible={syncMessage.visible}
              message={syncMessage.message}
              type={syncMessage.type}
              onClose={() => setSyncMessage(null)}
            />
          )}

          {/* Mensaje de bienvenida */}
          {welcomeMessage && (
            <WelcomeMessage
              type={welcomeMessage.type}
              userName={welcomeMessage.userName}
              isVisible={welcomeMessage.visible}
              onClose={() => setWelcomeMessage(null)}
            />
          )}

          {/* Contenido principal - deshabilitado cuando hay mensaje de bienvenida */}
          <main className={`flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto bg-gray-50 ${welcomeMessage ? 'pointer-events-none opacity-50' : ''}`}>
            <div className="w-full h-full">
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
                    <Route path="/admin-stats" element={<AdminStats />} />
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
                    <Route path="/patients" element={<PatientList onRegisterClick={() => navigate('/patients/register')} />} />
                    <Route path="/patients/register" element={<PatientRegistration />} />
                    <Route path="/patients/registry" element={<PatientRegistration />} />
                    <Route path="/sessions" element={<SessionList />} />
                    <Route path="/sessions/history" element={<SessionHistory />} />
                    <Route path="/appointments/direct" element={<PsychologistCalendar />} />
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
                    <Route path="/appointments/calendar" element={<UnifiedCalendar />} />
                    <Route path="/appointments/history" element={<StudentAppointmentHistory />} />
                    <Route path="/appointments/reschedule" element={<RescheduleAppointment />} />
                    <Route path="/notifications" element={<NotificationCenter />} />
                    <Route path="/profile" element={<StudentProfile />} />
                  </>
                )}

                {/* Rutas para Tutor */}
                {user.role === 'tutor' && (
                  <>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<TutorDashboard />} />
                    <Route path="/students" element={<StudentManagement />} />
                    <Route path="/derivations" element={<DerivationManagement />} />
                    <Route path="/sessions" element={<GroupSessionManagement />} />
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
        <ScheduleProvider>
          <AppContent />
        </ScheduleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;