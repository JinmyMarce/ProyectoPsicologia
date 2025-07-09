import React, { useState, useEffect } from 'react';
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
            return <SuperAdminDashboard />;
          case 'admin':
            return <AdminDashboard />;
          case 'psychologist':
            return <PsychologistDashboard />;
          case 'student':
            return <StudentDashboard onPageChange={handlePageChange} />;
          default:
            return <div>Rol no reconocido</div>;
        }
      case 'appointments':
        return <AppointmentBooking />;
      case 'appointments/calendar':
        return <AppointmentCalendar />;
      case 'appointments/history':
        return <AppointmentHistory />;
      case 'profile':
        return <UserProfile onPageChange={handlePageChange} />;
      case 'users':
        return <UserManagement />;
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
      default:
        return <StudentDashboard onPageChange={handlePageChange} />;
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

import { BrowserRouter } from 'react-router-dom';

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