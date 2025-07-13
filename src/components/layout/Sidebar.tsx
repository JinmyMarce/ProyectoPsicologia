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
  ChevronRight,
  Edit
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
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Mi Inicio',
    icon: Home,
    page: 'dashboard',
    roles: ['student', 'super_admin', 'admin', 'psychologist']
  },
  {
    label: 'Agendar Cita',
    icon: Calendar,
    page: 'appointments',
    roles: ['student'],
    subItems: [
      {
        label: 'Agendar Cita',
        icon: Calendar,
        page: 'appointments',
        roles: ['student']
      },
      {
        label: 'Reprogramar Citas',
        icon: Edit,
        page: 'appointments/reschedule',
        roles: ['student']
      }
    ]
  },
  {
    label: 'Historial de Citas',
    icon: Clock,
    page: 'appointments/history',
    roles: ['student']
  },
  {
    label: 'Notificaciones',
    icon: Bell,
    page: 'notifications',
    roles: ['student', 'psychologist', 'admin', 'super_admin']
  },
  {
    label: 'Mensajes',
    icon: MessageSquare,
    page: 'messages',
    roles: ['student']
  },
  {
    label: 'Mi cuenta',
    icon: UserCheck,
    page: 'profile',
    roles: ['student']
  },
  {
    label: 'Calendario de Citas',
    icon: Calendar,
    page: 'appointments/calendar',
    roles: ['super_admin', 'admin', 'psychologist']
  },
  {
    label: 'Historial de Citas',
    icon: Clock,
    page: 'appointments/history',
    roles: ['super_admin', 'admin', 'psychologist']
  },
  {
    label: 'Agendar Cita Directamente',
    icon: Calendar,
    page: 'appointments/direct',
    roles: ['psychologist']
  },
  {
    label: 'Registro de Pacientes',
    icon: Users,
    page: 'patients/registry',
    roles: ['psychologist']
  },
  {
    label: 'Registrar Sesión',
    icon: MessageSquare,
    page: 'sessions/register',
    roles: ['psychologist']
  },
  {
    label: 'Historial de Sesiones',
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
    label: 'Monitoreo del Sistema',
    icon: Activity,
    page: 'monitoring',
    roles: ['super_admin']
  },
  {
    label: 'Horarios',
    icon: Clock,
    page: 'schedule',
    roles: ['super_admin', 'admin', 'psychologist']
  },
  {
    label: 'Reportes',
    icon: BarChart3,
    page: 'reports',
    roles: ['super_admin', 'admin', 'psychologist']
  },
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
      <aside className={`bg-granate text-blanco w-64 h-full fixed z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className={`p-4 text-center border-b border-white/10 bg-black/20 transition-all duration-300`}>
            <img 
              src="/images/icons/psicologia.png"
              alt="Logo Institucional"
              className={`object-contain mx-auto transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-56 h-56'}`}
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
            {filteredMenuItems.map((item) => (
              <Button
                key={item.page}
                variant="ghost"
                className="w-full justify-start text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200 group rounded-lg py-3 px-4"
                onClick={() => handleItemClick(item.page)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-blanco font-semibold ml-2">{item.label}</span>
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