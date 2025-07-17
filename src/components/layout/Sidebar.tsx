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
      <aside className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 bg-[#8e161a] text-white shadow-xl ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className={`flex flex-col items-center justify-center relative ${isCollapsed ? 'py-4' : 'py-8'} border-b border-[#6e1014] bg-[#7a1417] transition-all duration-300`}>
            <img 
              src="/images/icons/psicologia.png"
              alt="Logo Institucional"
              className={`object-contain mx-auto mb-4 rounded-full shadow-lg ${isCollapsed ? 'w-24 h-24' : 'w-56 h-56 md:w-64 md:h-64'}`}
            />
            {!isCollapsed && (
              <>
                <h2 className="font-extrabold text-2xl tracking-wide text-white text-center">Psicología ISTTA</h2>
              </>
            )}
          </div>
          {/* Botón de colapsar/expandir fuera de la barra lateral, mitad dentro y mitad fuera, alineado abajo, diseño elegante */}
          <div
            style={{
              position: 'fixed',
              bottom: 32,
              right: isCollapsed ? '-10px' : '-19px', // La mitad del ancho del botón
              zIndex: 60,
            }}
            className="hidden lg:block"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="text-white rounded-full p-0 shadow-md border border-[#a32c34] hover:shadow-lg hover:scale-105 focus:scale-105 transition-all duration-200"
              aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
              style={{
                width: 48,
                height: 32,
                borderRadius: 9999,
                background: 'linear-gradient(90deg, #8e161a 60%, #a32c34 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#a32c34',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                margin: 0,
              }}
            >
              {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
            </Button>
          </div>
          {/* Menú de opciones */}
          <nav className={`flex-1 ${isCollapsed ? 'py-4 px-1 space-y-1' : 'py-8 px-4 space-y-2'} overflow-y-auto`}>
            {filteredMenuItems.map((item, idx) => (
              <button
                key={item.label + idx}
                onClick={() => handleItemClick(item.page)}
                className={`flex items-center w-full ${isCollapsed ? 'justify-center px-0 py-3' : 'px-5 py-4'} rounded-xl transition-all duration-200 group hover:bg-[#a32c34] focus:bg-[#a32c34] focus:outline-none`}
                tabIndex={0}
                aria-label={item.label}
              >
                <item.icon className={`w-7 h-7 ${isCollapsed ? '' : 'mr-4'} group-hover:scale-110 group-hover:text-yellow-300 transition-all duration-200`} />
                {!isCollapsed && <span className="font-medium text-sm truncate">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}