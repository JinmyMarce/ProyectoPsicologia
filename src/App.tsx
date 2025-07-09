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
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { ReportsAnalytics } from './components/reports/ReportsAnalytics';
import { ScheduleManager } from './components/psychologist/ScheduleManager';
import { PatientRegistration } from './components/patients/PatientRegistration';
import { PatientList } from './components/patients/PatientList';
import { SessionRegistration } from './components/sessions/SessionRegistration';
import { SessionList } from './components/sessions/SessionList';

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
              {user.role === 'super_admin' && (
                <>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<SuperAdminDashboard />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/reports" element={<ReportsAnalytics />} />
                  <Route path="/notifications" element={<NotificationCenter />} />
                  <Route path="/profile" element={<UserProfile />} />
                </>
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
              {user.role === 'psychologist' && (
                <>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<PsychologistDashboard />} />
                  <Route path="/schedule" element={<ScheduleManager />} />
                  <Route path="/patients" element={<PatientList />} />
                  <Route path="/patients/register" element={<PatientRegistration />} />
                  <Route path="/sessions" element={<SessionList />} />
                  <Route path="/sessions/register" element={<SessionRegistration />} />
                  <Route path="/notifications" element={<NotificationCenter />} />
                  <Route path="/profile" element={<UserProfile />} />
                </>
              )}

              {/* Rutas para Estudiante */}
              {user.role === 'student' && (
                <>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<StudentDashboard onPageChange={handlePageChange} />} />
                  <Route path="/appointments" element={<AppointmentBooking />} />
                  <Route path="/appointments/calendar" element={<AppointmentCalendar />} />
                  <Route path="/appointments/history" element={<AppointmentHistory />} />
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