import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { PsychologistDashboard } from './components/dashboard/PsychologistDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { AppointmentBooking } from './components/appointments/AppointmentBooking';
import { AppointmentCalendar } from './components/appointments/AppointmentCalendar';
import { AppointmentHistory } from './components/appointments/AppointmentHistory';
import { UserManagement } from './components/admin/UserManagement';
import { PsychologistManagement } from './components/admin/PsychologistManagement';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { ReportsAnalytics } from './components/reports/ReportsAnalytics';
import { ScheduleManager } from './components/psychologist/ScheduleManager';
import { PatientRegistration } from './components/patients/PatientRegistration';
import { PatientList } from './components/patients/PatientList';
import { SessionRegistration } from './components/sessions/SessionRegistration';
import { SessionList } from './components/sessions/SessionList';
import ConfiguracionCuenta from './pages/configuracion-cuenta';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function AppContent() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        switch (user.role) {
          case 'super_admin':
          case 'admin':
            return <AdminDashboard />;
          case 'psychologist':
            return <PsychologistDashboard />;
          case 'student':
            return <StudentDashboard />;
          default:
            return <StudentDashboard />;
        }
      case 'appointments':
        return <AppointmentBooking />;
      case 'appointments/calendar':
        return <AppointmentCalendar />;
      case 'appointments/history':
        return <AppointmentHistory />;
      case 'users':
        return <UserManagement />;
      case 'psychologists':
        return <PsychologistManagement />;
      case 'notifications':
        return <NotificationCenter />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'schedule':
        return <ScheduleManager />;
      case 'patients/register':
        return <PatientRegistration />;
      case 'patients':
        return <PatientList />;
      case 'sessions/register':
        return <SessionRegistration />;
      case 'sessions':
        return <SessionList />;
      case 'configuracion-cuenta':
        return <ConfiguracionCuenta />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
            {renderCurrentPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/configuracion-cuenta" element={<ConfiguracionCuenta />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;