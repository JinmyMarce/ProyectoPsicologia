import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SyncNotification } from './components/ui/SyncNotification';
import { WelcomeMessage } from './components/auth/WelcomeMessage';
import { LoadingScreen } from './components/ui/LoadingScreen';

// Code-splitting: cargar pantallas bajo demanda para reducir el bundle inicial.
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const PsychologistDashboard = lazy(() => import('./components/psychologist/PsychologistDashboard').then(m => ({ default: m.PsychologistDashboard })));
const SuperAdminDashboard = lazy(() => import('./components/super-admin/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const StudentDashboard = lazy(() => import('./components/dashboard/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const TutorDashboard = lazy(() => import('./components/tutor/TutorDashboard').then(m => ({ default: m.TutorDashboard })));
const StudentManagement = lazy(() => import('./components/tutor/StudentManagement').then(m => ({ default: m.StudentManagement })));
const DerivationManagement = lazy(() => import('./components/tutor/DerivationManagement').then(m => ({ default: m.DerivationManagement })));
const GroupSessionManagement = lazy(() => import('./components/tutor/GroupSessionManagement').then(m => ({ default: m.GroupSessionManagement })));
const UserProfile = lazy(() => import('./components/profile/UserProfile').then(m => ({ default: m.UserProfile })));
const PsychologistProfile = lazy(() => import('./components/psychologist/PsychologistProfile').then(m => ({ default: m.PsychologistProfile })));
const StudentProfile = lazy(() => import('./components/students/StudentProfile').then(m => ({ default: m.StudentProfile })));
const AppointmentsPage = lazy(() => import('./components/appointments'));
const AppointmentBooking = lazy(() => import('./components/appointments/AppointmentBooking').then(m => ({ default: m.AppointmentBooking })));
const UnifiedCalendar = lazy(() => import('./components/ui/UnifiedCalendar').then(m => ({ default: m.UnifiedCalendar })));
const AppointmentHistory = lazy(() => import('./components/appointments/AppointmentHistory').then(m => ({ default: m.AppointmentHistory })));
const UserManagement = lazy(() => import('./components/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const SuperAdminUserManagement = lazy(() => import('./components/super-admin/UserManagement').then(m => ({ default: m.UserManagement })));
const SystemMonitoring = lazy(() => import('./components/super-admin/SystemMonitoring').then(m => ({ default: m.SystemMonitoring })));
const SystemSettings = lazy(() => import('./components/super-admin/SystemSettings').then(m => ({ default: m.SystemSettings })));
const AuditLog = lazy(() => import('./components/super-admin/AuditLog').then(m => ({ default: m.AuditLog })));
const BackupManager = lazy(() => import('./components/super-admin/BackupManager').then(m => ({ default: m.BackupManager })));
const NotificationCenter = lazy(() => import('./components/notifications/NotificationCenter').then(m => ({ default: m.NotificationCenter })));
const ReportsAnalytics = lazy(() => import('./components/reports/ReportsAnalytics').then(m => ({ default: m.ReportsAnalytics })));
const AdminReports = lazy(() => import('./components/admin/AdminReports').then(m => ({ default: m.AdminReports })));
const ScheduleManager = lazy(() => import('./components/psychologist/ScheduleManager').then(m => ({ default: m.ScheduleManager })));
const PatientRegistration = lazy(() => import('./components/patients/PatientRegistration').then(m => ({ default: m.PatientRegistration })));
const PatientList = lazy(() => import('./components/patients/PatientList'));
const SessionList = lazy(() => import('./components/sessions/SessionList').then(m => ({ default: m.SessionList })));
const StudentAppointmentHistory = lazy(() => import('./components/students/StudentAppointmentHistory').then(m => ({ default: m.StudentAppointmentHistory })));
const DirectAppointmentScheduler = lazy(() => import('./components/psychologist/DirectAppointmentScheduler').then(m => ({ default: m.DirectAppointmentScheduler })));
const SessionHistory = lazy(() => import('./components/psychologist/SessionHistory').then(m => ({ default: m.SessionHistory })));
const RescheduleAppointment = lazy(() => import('./components/students/RescheduleAppointment').then(m => ({ default: m.RescheduleAppointment })));
const MessagePanel = lazy(() => import('./components/messages/MessagePanel'));
const AdminStats = lazy(() => import('./components/dashboard/AdminStats').then(m => ({ default: m.AdminStats })));

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
  const location = useLocation();

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

  // Redirigir al dashboard según el rol cuando el usuario inicia sesión
  useEffect(() => {
    if (!loading && user) {
      // Si estamos en la ruta de login o en la raíz, redirigir al dashboard
      if (location.pathname === '/login' || location.pathname === '/') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate, location.pathname]);

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
        title="SAPTA"
        subtitle="Sistema de Atención Psicológica Túpac Amaru"
        size="lg"
        showParticles={true}
        showWaves={true}
      />
    );
  }

  if (!user) {
    // Mantener la URL consistente cuando no hay sesión (sin alterar el UI actual):
    // si el usuario no está autenticado, siempre mostrar /login en la barra.
    if (location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: undefined }}>
      <NavigationHandler onPageChange={setCurrentPage} />

      {/* Contenedor unificado con sidebar y contenido */}
      <div className="flex w-full min-h-screen bg-gray-50">
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
        <div className={`flex-1 flex flex-col relative bg-white min-h-screen transition-all duration-300 ease-out ${!welcomeMessage && !isSidebarCollapsed ? 'lg:ml-72' : !welcomeMessage && isSidebarCollapsed ? 'lg:ml-20' : ''}`}>
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
          <main className={`flex-1 bg-gray-50 ${welcomeMessage ? 'pointer-events-none opacity-50' : ''} p-3 sm:p-4 lg:p-6`}>
            <div className="w-full h-full">
              <Suspense fallback={null}>
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
                    <Route path="/settings" element={<SystemSettings />} />
                    <Route path="/audit" element={<AuditLog />} />
                    <Route path="/backups" element={<BackupManager />} />
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
                    <Route path="/reports" element={<AdminReports />} />
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
                    <Route path="/appointments/direct" element={<DirectAppointmentScheduler />} />
                    <Route path="/notifications" element={<NotificationCenter />} />
                    <Route path="/profile" element={<PsychologistProfile />} />
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
              </Suspense>
            </div>
          </main>
        </div>
      </div>
      {/* Panel de mensajes global */}
      <Suspense fallback={null}>
        <MessagePanel isOpen={showMessagesPanel} onClose={() => setShowMessagesPanel(false)} />
      </Suspense>
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