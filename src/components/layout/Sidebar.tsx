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
    label: 'Agendar Cita Directamente',
    icon: Calendar,
    page: 'appointments/direct',
    roles: ['psychologist']
  },
  {
    label: 'Gestión de Pacientes',
    icon: Users,
    page: 'patients/registry',
    roles: ['psychologist']
  },
  {
    label: 'Sesión Psicológica',
    icon: MessageSquare,
    page: 'sessions',
    roles: ['psychologist']
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
    label: 'Reportes',
    icon: BarChart3,
    page: 'reports',
    roles: ['super_admin', 'admin', 'psychologist']
  },
  {
    label: 'Estadísticas',
    icon: BarChart3,
    page: 'admin-stats',
    roles: ['admin']
  },
  // 'Mi Perfil' al final
  {
    label: 'Mi Perfil',
    icon: UserCheck,
    page: 'profile',
    roles: ['super_admin']
  },
  {
    label: 'Mi Perfil',
    icon: UserCheck,
    page: 'profile',
    roles: ['admin']
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
      <aside className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 bg-[#8e161a] text-white shadow-xl ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar con diseño profesional */}
          <div className={`flex flex-col items-center justify-center relative ${isCollapsed ? 'py-4' : 'py-8'} border-b border-[#6e1014] transition-all duration-300`} 
               style={{
                 background: 'linear-gradient(135deg, #8e161a 0%, #a32c34 25%, #7a1417 50%, #6e1014 75%, #8e161a 100%)',
                 backgroundSize: '400% 400%',
                 animation: 'professionalGradient 15s ease-in-out infinite'
               }}>
            
            {/* Efectos de fondo similares al login */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `
                  radial-gradient(1px 1px at 20px 30px, rgba(211, 183, 160, 0.3), transparent),
                  radial-gradient(1px 1px at 40px 70px, rgba(255, 255, 255, 0.2), transparent),
                  radial-gradient(1px 1px at 60px 20px, rgba(211, 183, 160, 0.2), transparent)
                `,
                backgroundRepeat: 'repeat',
                backgroundSize: '80px 60px',
                animation: 'sparkle 12s linear infinite'
              }}></div>
            </div>

            {/* Contenedor del logo con efecto de luna */}
            <div className={`relative flex items-center justify-center ${isCollapsed ? 'w-16 h-16' : 'w-32 h-32'} transition-all duration-300`}>
              {/* Fondo del logo estilo luna */}
              <div className={`absolute inset-0 rounded-full shadow-2xl ${isCollapsed ? 'w-14 h-14' : 'w-28 h-28'} transition-all duration-300`} style={{
                animation: 'moonGlow 12s ease-in-out infinite, moonFloat 8s ease-in-out infinite',
                boxShadow: '0 0 30px rgba(255, 255, 255, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1), 0 0 40px rgba(255, 255, 255, 0.2)',
                background: `
                  radial-gradient(circle at 25% 25%, #ffffff 0%, #f8fafc 30%, #e2e8f0 60%, #cbd5e1 80%, #94a3b8 90%, #64748b 95%, #475569 100%),
                  radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 20% 80%, rgba(100, 116, 139, 0.4) 0%, transparent 50%)
                `
              }}>
                {/* Efectos de cráteres lunares */}
                <div className="absolute top-1 left-1 w-1 h-1 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full opacity-40"></div>
                <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-50"></div>
                <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full opacity-30"></div>
                
                {/* Brillo lunar natural */}
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-gradient-to-br from-white to-transparent rounded-full opacity-80"></div>
                <div className="absolute top-0 left-0 w-0.5 h-0.5 bg-white rounded-full opacity-90"></div>
              </div>
              
              {/* Logo principal */}
              <img 
                src="/images/icons/psicologia.png"
                alt="Logo Institucional"
                className={`relative z-10 object-contain drop-shadow-lg transition-all duration-300 ${isCollapsed ? 'w-12 h-12' : 'w-24 h-24'}`}
                style={{ 
                  animation: 'logoFloat 6s ease-in-out infinite',
                  imageRendering: 'crisp-edges',
                  filter: 'none'
                }}
              />
            </div>

            {/* Título institucional */}
            {!isCollapsed && (
              <div className="mt-4 text-center">
                <h1 className="text-lg font-black text-white mb-1 tracking-tight drop-shadow-lg" style={{animation: 'logoGlow 8s ease-in-out infinite'}}>
                  Instituto Túpac Amaru
                </h1>
                <p className="text-sm font-bold text-[#d3b7a0] tracking-wide opacity-90">
                  Sistema de Psicología
                </p>
              </div>
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