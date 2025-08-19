import React from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  Bell, 
  BarChart3, 
  MessageSquare,
  Clock,
  UserCheck,
  Activity,
  ChevronLeft,
  ChevronRight,
  Edit,
  Send,
  School,
  GraduationCap
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
    roles: ['student', 'super_admin', 'admin', 'psychologist', 'tutor']
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
    roles: ['student', 'psychologist', 'admin', 'super_admin', 'tutor']
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
  // Elementos específicos para tutores
  {
    label: 'Mis Estudiantes',
    icon: GraduationCap,
    page: 'students',
    roles: ['tutor']
  },
  {
    label: 'Derivaciones',
    icon: Send,
    page: 'derivations',
    roles: ['tutor']
  },
  {
    label: 'Sesiones Grupales',
    icon: School,
    page: 'sessions',
    roles: ['tutor']
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
  },
  {
    label: 'Mi Perfil',
    icon: UserCheck,
    page: 'profile',
    roles: ['tutor']
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
      <aside 
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 text-white shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isCollapsed ? 'w-20' : 'w-72'}`}
        style={{
          background: `
            linear-gradient(180deg, 
              #0f1419 0%, 
              #1a1f29 8%, 
              #2c1d1d 16%, 
              #1e2a37 24%, 
              #142025 32%, 
              #1a1f29 40%, 
              #0f1419 48%, 
              #1a1f29 56%, 
              #2c1d1d 64%, 
              #1e2a37 72%, 
              #142025 80%, 
              #1a1f29 88%, 
              #0f1419 100%
            ),
            radial-gradient(ellipse at 8% 25%, rgba(142, 22, 26, 0.1) 0%, transparent 65%),
            radial-gradient(ellipse at 92% 75%, rgba(211, 183, 160, 0.08) 0%, transparent 65%),
            linear-gradient(0deg, transparent 0%, rgba(211, 183, 160, 0.03) 50%, transparent 100%)
          `,
          boxShadow: `
            6px 0 30px rgba(0, 0, 0, 0.4), 
            inset -2px 0 0 rgba(211, 183, 160, 0.2),
            0 0 60px rgba(0, 0, 0, 0.25),
            inset 0 0 40px rgba(0, 0, 0, 0.2)
          `,
          borderRight: '2px solid rgba(211, 183, 160, 0.15)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header del sidebar con diseño profesional */}
          <div className={`flex flex-col items-center justify-center relative ${isCollapsed ? 'py-4' : 'py-8'} transition-all duration-300`} 
               style={{
                 background: `
                   linear-gradient(135deg, 
                     rgba(15, 20, 25, 0.95) 0%, 
                     rgba(26, 31, 41, 0.9) 20%, 
                     rgba(44, 29, 29, 0.85) 40%, 
                     rgba(30, 42, 55, 0.8) 60%, 
                     rgba(142, 22, 26, 0.2) 80%, 
                     rgba(211, 183, 160, 0.1) 100%
                   )
                 `,
                 borderBottom: '1px solid rgba(211, 183, 160, 0.25)',
                 boxShadow: 'inset 0 -1px 0 rgba(255, 255, 255, 0.05)'
               }}>
            
            {/* Efectos de fondo similares al login */}
            <div className="absolute inset-0 overflow-hidden opacity-15">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `
                  radial-gradient(1px 1px at 20px 30px, rgba(211, 183, 160, 0.4), transparent),
                  radial-gradient(1px 1px at 40px 70px, rgba(142, 22, 26, 0.3), transparent),
                  radial-gradient(1px 1px at 60px 20px, rgba(211, 183, 160, 0.2), transparent),
                  radial-gradient(2px 2px at 10px 50px, rgba(142, 22, 26, 0.2), transparent)
                `,
                backgroundRepeat: 'repeat',
                backgroundSize: '80px 60px',
                animation: 'sparkle 15s linear infinite'
              }}></div>
            </div>

            {/* Logo con luna más pequeña pero logo más grande */}
            <div className={`relative flex items-center justify-center ${isCollapsed ? 'w-24 h-24' : 'w-44 h-44'} transition-all duration-500`}>
              {/* Fondo del logo - Luna más pequeña pero limpia */}
              <div className={`absolute inset-0 ${isCollapsed ? 'w-20 h-20' : 'w-36 h-36'} rounded-full shadow-2xl transition-all duration-500`} style={{
                animation: 'moonGlow 12s ease-in-out infinite, moonFloat 8s ease-in-out infinite',
                boxShadow: '0 0 40px rgba(255, 255, 255, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.15), 0 0 60px rgba(255, 255, 255, 0.25)',
                background: `
                  radial-gradient(circle at 30% 30%, #ffffff 0%, #f8fafc 25%, #e2e8f0 50%, #cbd5e1 70%, #94a3b8 85%, #64748b 95%, #475569 100%),
                  radial-gradient(circle at 70% 70%, rgba(148, 163, 184, 0.1) 0%, transparent 60%)
                `
              }}>
                {/* Textura lunar suave y limpia */}
                <div className="absolute inset-0 rounded-full" style={{
                  backgroundImage: `
                    radial-gradient(circle at 25% 25%, rgba(148, 163, 184, 0.15) 0.5px, transparent 0.5px),
                    radial-gradient(circle at 75% 75%, rgba(100, 116, 139, 0.1) 0.5px, transparent 0.5px)
                  `,
                  backgroundSize: `${isCollapsed ? '12px 12px' : '20px 20px'}, ${isCollapsed ? '18px 18px' : '30px 30px'}`
                }}></div>
                
                {/* Solo brillo lunar principal (sin cráteres) */}
                <div className={`absolute ${isCollapsed ? 'top-1 left-1 w-1.5 h-1.5' : 'top-2 left-2 w-3 h-3'} bg-gradient-to-br from-white to-transparent rounded-full opacity-70 transition-all duration-500`}></div>
                <div className={`absolute ${isCollapsed ? 'top-0.5 left-0.5 w-1 h-1' : 'top-1 left-1 w-2 h-2'} bg-white rounded-full opacity-80 transition-all duration-500`}></div>
              </div>
              
              {/* Contenedor del logo mucho más grande dentro de la luna */}
              <div className={`absolute inset-0 ${isCollapsed ? 'w-20 h-20' : 'w-36 h-36'} flex items-center justify-center transition-all duration-500`}>
                <img 
                  src={window.location.origin + "/images/icons/psicologia.png"}
                  alt="Logo Institucional"
                  className={`${isCollapsed ? 'w-20 h-20' : 'w-40 h-40'} object-contain drop-shadow-lg transition-all duration-500`}
                  style={{ 
                    maxWidth: '115%', 
                    maxHeight: '115%',
                    animation: 'logoFloat 6s ease-in-out infinite',
                    imageRendering: 'crisp-edges',
                    filter: 'drop-shadow(0 3px 10px rgba(0, 0, 0, 0.3))',
                    transform: 'scale(1.1)'
                  }}
                  onError={(e) => {
                    console.log('Error cargando imagen:', e);
                    const target = e.currentTarget;
                    const nextSibling = target.nextElementSibling as HTMLElement;
                    if (target && nextSibling) {
                      target.style.display = 'none';
                      nextSibling.style.display = 'flex';
                    }
                  }}
                  onLoad={() => {
                    console.log('Logo de sidebar cargado exitosamente');
                  }}
                />
                {/* Fallback mejorado más grande */}
                <div className={`${isCollapsed ? 'w-20 h-20' : 'w-40 h-40'} bg-gradient-to-tr from-[#8e161a] via-[#a52a2a] to-[#d3b7a0] rounded-full flex items-center justify-center hidden shadow-2xl transition-all duration-500`} style={{
                  transform: 'scale(1.1)'
                }}>
                  <span 
                    className={`font-bold text-white ${isCollapsed ? 'text-3xl' : 'text-8xl'} transition-all duration-500`}
                    style={{fontFamily: 'Georgia, serif'}}
                  >
                    Ψ
                  </span>
                </div>
              </div>
            </div>

            {/* Título institucional mejorado */}
            {!isCollapsed && (
              <div className="mt-6 text-center px-2">
                <h1 className="text-xl font-black text-white mb-2 tracking-tight leading-tight" style={{
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 40px rgba(211, 183, 160, 0.4)',
                  animation: 'titleGlow 10s ease-in-out infinite',
                  fontFamily: 'Georgia, serif'
                }}>
                  Instituto Túpac Amaru
                </h1>
                <div className="relative">
                  <p className="text-base font-bold text-[#d3b7a0] tracking-wider leading-relaxed" style={{
                    textShadow: '0 0 15px rgba(211, 183, 160, 0.8), 0 1px 3px rgba(0, 0, 0, 0.7)',
                    animation: 'subtitleGlow 8s ease-in-out infinite 1s'
                  }}>
                    Sistema de Psicología
                  </p>
                  {/* Línea decorativa */}
                  <div className="mt-2 mx-auto w-24 h-0.5" style={{
                    background: 'linear-gradient(90deg, transparent 0%, #d3b7a0 50%, transparent 100%)',
                    animation: 'lineGlow 6s ease-in-out infinite'
                  }}></div>
                  {/* Puntos decorativos */}
                  <div className="flex justify-center items-center mt-2 space-x-2">
                    <div className="w-1 h-1 bg-[#d3b7a0] rounded-full opacity-80" style={{animation: 'dotPulse 3s ease-in-out infinite'}}></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full opacity-90" style={{animation: 'dotPulse 3s ease-in-out infinite 1s'}}></div>
                    <div className="w-1 h-1 bg-[#d3b7a0] rounded-full opacity-80" style={{animation: 'dotPulse 3s ease-in-out infinite 2s'}}></div>
                  </div>
                </div>
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
              className="text-white rounded-full p-0 shadow-md border border-[#d3b7a0]/30 hover:shadow-lg hover:scale-105 focus:scale-105 transition-all duration-200"
              aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
              style={{
                width: 48,
                height: 32,
                borderRadius: 9999,
                background: 'linear-gradient(90deg, #8e161a 20%, #2c1d1d 60%, #1e2a37 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(211, 183, 160, 0.3)',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                margin: 0,
              }}
            >
              {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
            </Button>
          </div>
          {/* Menú de opciones mejorado */}
          <nav className={`flex-1 ${isCollapsed ? 'py-6 px-2 space-y-2' : 'py-8 px-4 space-y-3'} overflow-y-auto`}>
            {filteredMenuItems.map((item, idx) => {
              const isActive = location.pathname === item.page;
              
              return (
                <button
                  key={item.label + idx}
                  onClick={() => handleItemClick(item.page)}
                  className={`flex items-center w-full ${isCollapsed ? 'justify-center px-0 py-3' : 'px-5 py-4'} rounded-xl transition-all duration-300 group focus:outline-none relative overflow-hidden ${
                    isActive 
                      ? 'text-white shadow-xl' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10 focus:bg-white/10'
                  }`}
                  style={isActive ? {
                    background: `
                      linear-gradient(135deg, 
                        rgba(211, 183, 160, 0.2) 0%, 
                        rgba(142, 22, 26, 0.3) 50%, 
                        rgba(211, 183, 160, 0.1) 100%
                      )
                    `,
                    border: '1px solid rgba(211, 183, 160, 0.3)',
                    boxShadow: `
                      0 4px 15px rgba(142, 22, 26, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1)
                    `
                  } : {}}
                  tabIndex={0}
                  aria-label={item.label}
                >
                  {/* Indicador lateral para elemento activo */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#d3b7a0] to-[#8e161a] rounded-r-full" style={{
                      animation: 'activeIndicator 2s ease-in-out infinite'
                    }}></div>
                  )}
                  
                  {/* Efectos de fondo al hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(211, 183, 160, 0.1) 0%, transparent 70%)'
                  }}></div>
                  
                  {/* Icono mejorado */}
                  <div className={`relative z-10 ${isCollapsed ? 'w-7 h-7' : 'w-6 h-6 mr-4'} flex items-center justify-center transition-all duration-300`}>
                    <div className={`w-full h-full flex items-center justify-center ${
                      isActive ? 'animate-pulse' : ''
                    }`} style={isActive ? {
                      filter: 'drop-shadow(0 0 8px rgba(211, 183, 160, 0.5))',
                      animation: 'iconGlow 3s ease-in-out infinite'
                    } : {}}>
                      <item.icon className={`w-full h-full transition-all duration-300 ${
                        isActive 
                          ? 'text-[#d3b7a0] drop-shadow-lg' 
                          : 'group-hover:text-[#d3b7a0] group-hover:scale-110'
                      }`} />
                    </div>
                  </div>
                  
                  {/* Texto del menú */}
                  {!isCollapsed && (
                    <span className={`transition-all duration-300 relative z-10 font-medium text-sm truncate ${
                      isActive ? 'font-semibold' : 'group-hover:font-medium'
                    }`} style={isActive ? {
                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                    } : {}}>
                      {item.label}
                    </span>
                  )}
                  
                  {/* Efecto de brillo en hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-xl pointer-events-none" style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                    animation: 'menuShine 2s ease-in-out infinite'
                  }}></div>
                </button>
              );
            })}
            
            {/* Línea decorativa */}
            {!isCollapsed && filteredMenuItems.length > 0 && (
              <div className="mt-8 mb-6 mx-4">
                <div className="h-px bg-gradient-to-r from-transparent via-[#d3b7a0]/30 to-transparent"></div>
                <div className="flex justify-center mt-3">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-[#d3b7a0] rounded-full opacity-60" style={{animation: 'dotPulse 3s ease-in-out infinite'}}></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80" style={{animation: 'dotPulse 3s ease-in-out infinite 1s'}}></div>
                    <div className="w-1 h-1 bg-[#d3b7a0] rounded-full opacity-60" style={{animation: 'dotPulse 3s ease-in-out infinite 2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}