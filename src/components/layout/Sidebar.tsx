import React from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Bell, 
  BarChart3, 
  UserPlus,
  ClipboardList,
  MessageSquare,
  Clock,
  BookOpen,
  UserCheck,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onPageChange?: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  page: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: Home,
    page: 'dashboard',
    roles: ['super_admin', 'admin', 'psychologist', 'student']
  },
  {
    label: 'Agendar Cita',
    icon: Calendar,
    page: 'appointments',
    roles: ['student']
  },
  {
    label: 'Historial de Citas',
    icon: Clock,
    page: 'appointments/history',
    roles: ['student', 'admin', 'psychologist']
  },
  {
    label: 'Calendario de Citas',
    icon: Calendar,
    page: 'appointments/calendar',
    roles: ['admin', 'psychologist']
  },
  {
    label: 'Historial de Citas',
    icon: Clock,
    page: 'appointments/history',
    roles: ['admin', 'psychologist']
  },
  {
    label: 'Registro de Pacientes',
    icon: UserPlus,
    page: 'patients/register',
    roles: ['psychologist']
  },
  {
    label: 'Visualizar Pacientes',
    icon: Users,
    page: 'patients',
    roles: ['psychologist']
  },
  {
    label: 'Registrar Sesión',
    icon: MessageSquare,
    page: 'sessions/register',
    roles: ['psychologist']
  },
  {
    label: 'Visualizar Sesiones',
    icon: ClipboardList,
    page: 'sessions',
    roles: ['psychologist']
  },
  {
    label: 'Gestión de Psicólogos',
    icon: UserCheck,
    page: 'psychologists',
    roles: ['super_admin']
  },
  {
    label: 'Gestión de Usuarios',
    icon: Users,
    page: 'users',
    roles: ['super_admin', 'admin']
  },
  {
    label: 'Horarios',
    icon: Clock,
    page: 'schedule',
    roles: ['admin', 'psychologist']
  },
  {
    label: 'Notificaciones',
    icon: Bell,
    page: 'notifications',
    roles: ['admin', 'psychologist', 'student']
  },
  {
    label: 'Reportes',
    icon: BarChart3,
    page: 'reports',
    roles: ['super_admin', 'admin', 'psychologist']
  },
  {
    label: 'Configuración',
    icon: Settings,
    page: 'settings',
    roles: ['super_admin', 'admin', 'psychologist', 'student']
  }
];

export function Sidebar({ 
  isOpen, 
  onClose, 
  onPageChange, 
  isCollapsed, 
  onToggleCollapse 
}: SidebarProps) {
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const handleItemClick = (page: string) => {
    if (onPageChange) {
      onPageChange(page);
    }
    // No cerramos en desktop si está colapsado
    if (isOpen) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-gradient-to-b from-[#8e161a]/80 via-cyan-400/40 to-violet-700/60 backdrop-blur-2xl shadow-2xl border-r-4 border-cyan-400/30 animate-gradient-shift animate-fade-in-up z-50
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className={`p-4 text-center border-b border-white/10 bg-white/10 rounded-b-2xl shadow-lg animate-fade-in-up transition-all duration-300`}>
            <img 
              src="/images/icons/psicologia.png"
              alt="Logo Institucional"
              className={`object-contain mx-auto transition-all duration-300 drop-shadow-[0_0_24px_cyan] ${isCollapsed ? 'w-12 h-12' : 'w-32 h-32'}`}
            />
            {!isCollapsed && (
              <div className="mt-2">
                <h2 className="text-white font-bold text-base leading-tight">
                  Psicología ISTTA
                </h2>
                <p className="text-white/70 text-xs font-medium">
                  Sistema de Gestión
                </p>
              </div>
            )}
          </div>

          {/* Menú */}
          <nav className="flex-1 flex flex-col justify-center p-4 space-y-3">
            {filteredMenuItems.map((item, idx) => (
              <Button
                key={item.page}
                variant="ghost"
                className="w-full justify-start text-white/90 hover:bg-cyan-400/20 hover:text-cyan-200 transition-all duration-300 group rounded-xl py-3 px-4 animate-fade-in-up hover:scale-105 hover:shadow-[0_0_16px_2px_rgba(56,189,248,0.3)]"
                style={{ animationDelay: `${idx * 80}ms` }}
                onClick={() => handleItemClick(item.page)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-semibold text-sm ml-3">{item.label}</span>
                )}
              </Button>
            ))}
          </nav>

          {/* Footer del sidebar con el botón para colapsar */}
          <div className="p-2 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-center text-white/90 hover:bg-white/10 hover:text-white p-3 rounded-lg hidden lg:flex"
              onClick={onToggleCollapse}
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}