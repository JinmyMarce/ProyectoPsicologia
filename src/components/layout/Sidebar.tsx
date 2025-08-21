import React, { useState, useEffect, useRef } from 'react';
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
  Send,
  School,
  GraduationCap,
  X,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';

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
  badge?: number;
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
    roles: ['student']
  },
  {
    label: 'Historial de Citas',
    icon: Clock,
    page: 'appointments/history',
    roles: ['student']
  },
  {
    label: 'Reprogramar Cita',
    icon: RefreshCw,
    page: 'appointments/reschedule',
    roles: ['student']
  },
  {
    label: 'Notificaciones',
    icon: Bell,
    page: 'notifications',
    roles: ['student', 'psychologist', 'admin', 'super_admin', 'tutor'],
    badge: 3
  },
  {
    label: 'Mensajes',
    icon: MessageSquare,
    page: 'messages',
    roles: ['student'],
    badge: 2
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
    label: 'Reprogramar Cita',
    icon: RefreshCw,
    page: 'appointments/reprogram',
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const handleItemClick = (page: string) => {
    if (onPageChange) {
      onPageChange(page);
    }
    // Cerrar sidebar en móvil después de hacer clic
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // Cerrar sidebar al hacer clic fuera en móvil
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (window.innerWidth < 1024 && isOpen) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    if (window.innerWidth < 1024 && isOpen) {
      onClose();
    }
  }, [location.pathname, isOpen, onClose]);

  return (
    <>
      {/* Overlay para móviles mejorado */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-md"
          onClick={onClose}
        />
      )}

      {/* Sidebar con colores simplificados - azul marino oscuro y granate bien oscuro */}
      <aside 
        ref={sidebarRef}
        className={`h-full transition-all duration-500 text-white ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isCollapsed ? 'w-20' : 'w-72'} ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex-shrink-0`}
        style={{
          background: '#1a2332',
          borderRight: '2px solid rgba(255, 255, 255, 0.3)',
          height: '100vh',
          zIndex: 60
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header del sidebar con azul marino oscuro */}
          <div className={`flex flex-col items-center justify-center relative ${isCollapsed ? 'py-6' : 'py-8'} transition-all duration-500`} 
               style={{
                 background: '#1a2332',
                 borderBottom: '3px solid rgba(255, 255, 255, 0.8)',
                 boxShadow: 'inset 0 -3px 0 rgba(255, 255, 255, 0.1)'
               }}>
            
            {/* Efectos de fondo sutiles */}
            <div className="absolute inset-0 overflow-hidden opacity-15">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `
                  radial-gradient(1px 1px at 25px 35px, rgba(142, 22, 26, 0.3), transparent),
                  radial-gradient(1px 1px at 45px 75px, rgba(44, 62, 80, 0.2), transparent),
                  radial-gradient(1px 1px at 65px 25px, rgba(25, 42, 61, 0.15), transparent)
                `,
                backgroundRepeat: 'repeat',
                backgroundSize: '90px 70px'
              }}></div>
            </div>

            {/* Logo */}
            <div className={`relative flex items-center justify-center ${isCollapsed ? 'w-18 h-18' : 'w-32 h-32'} transition-all duration-700`}>
              <div className={`absolute inset-0 ${isCollapsed ? 'w-18 h-18' : 'w-32 h-32'} rounded-full shadow-2xl transition-all duration-700`} style={{
                boxShadow: '0 0 50px rgba(255, 255, 255, 0.5), inset 0 0 40px rgba(255, 255, 255, 0.3), 0 0 80px rgba(255, 255, 255, 0.4)',
                background: `
                  radial-gradient(circle at 30% 30%, #ffffff 0%, #f8fafc 15%, #e2e8f0 30%, #cbd5e1 45%, #94a3b8 60%, #64748b 75%, #475569 85%, #334155 95%, #1e293b 100%)
                `
              }}>
                {/* Logo dentro de la luna */}
                <div className={`absolute inset-0 ${isCollapsed ? 'w-18 h-18' : 'w-32 h-32'} flex items-center justify-center transition-all duration-700`}>
                  <img 
                    src={window.location.origin + "/images/icons/psicologia.png"}
                    alt="Logo Institucional"
                    className={`${isCollapsed ? 'w-16 h-16' : 'w-28 h-28'} object-contain drop-shadow-2xl transition-all duration-700`}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%',
                      imageRendering: 'crisp-edges',
                      filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))',
                      transform: isCollapsed ? 'scale(1)' : 'scale(1.6)'
                    }}
                    onError={(e) => {
                      const target = e.currentTarget;
                      const nextSibling = target.nextElementSibling as HTMLElement;
                      if (target && nextSibling) {
                        target.style.display = 'none';
                        nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <div className={`${isCollapsed ? 'w-16 h-16' : 'w-28 h-28'} bg-gradient-to-tr from-[#8e161a] via-[#a52a2a] to-[#d3b7a0] rounded-full flex items-center justify-center hidden shadow-2xl transition-all duration-700`} style={{
                    transform: isCollapsed ? 'scale(1)' : 'scale(1.6)'
                  }}>
                    <span 
                      className={`font-bold text-white ${isCollapsed ? 'text-3xl' : 'text-6xl'} transition-all duration-700`}
                      style={{fontFamily: 'Georgia, serif'}}
                    >
                      Ψ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Título institucional */}
            {!isCollapsed && (
              <div className="mt-6 text-center px-3">
                <h1 className="text-xl font-black text-white mb-2 tracking-tight leading-tight" style={{
                  textShadow: '0 0 25px rgba(255, 255, 255, 0.9), 0 3px 8px rgba(0, 0, 0, 0.7), 0 0 40px rgba(211, 183, 160, 0.6)',
                  fontFamily: 'Georgia, serif'
                }}>
                  Instituto Túpac Amaru
                </h1>
                <div className="relative">
                  <p className="text-lg font-bold text-[#d3b7a0] tracking-wider leading-relaxed" style={{
                    textShadow: '0 0 20px rgba(211, 183, 160, 0.9), 0 2px 5px rgba(0, 0, 0, 0.9)'
                  }}>
                    Sistema de Psicología
                  </p>
                  <div className="mt-2 mx-auto w-24 h-1.5" style={{
                    background: 'linear-gradient(90deg, transparent 0%, #d3b7a0 50%, transparent 100%)',
                    boxShadow: '0 0 12px rgba(211, 183, 160, 0.6)'
                  }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Botón de colapsar/expandir - profesional y estable */}
          <div
            style={{
              position: 'fixed',
              bottom: '4rem',
              right: isCollapsed ? '-0.25rem' : '-0.5rem',
              zIndex: 60,
            }}
            className="hidden lg:block"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="text-white rounded-full p-0 shadow-2xl hover:shadow-3xl hover:scale-125 focus:scale-125 transition-all duration-500"
              aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
              style={{
                width: '1.5rem',
                height: '1.5rem',
                borderRadius: 9999,
                background: '#8e161a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#ffffff',
                borderStyle: 'solid',
                boxShadow: `
                  0 6px 20px rgba(142, 22, 26, 0.8),
                  0 3px 10px rgba(0, 0, 0, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3),
                  0 0 0 2px rgba(255, 255, 255, 0.4),
                  0 0 0 3px rgba(0, 0, 0, 0.3)
                `,
                margin: 0,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              <div className="w-3 h-3 flex items-center justify-center">
                {isCollapsed ? <ChevronRight className="w-2.5 h-2.5 text-white" /> : <ChevronLeft className="w-2.5 h-2.5 text-white" />}
              </div>
            </Button>
          </div>

          {/* Menú de opciones con colores simplificados */}
          <nav className={`flex-1 ${isCollapsed ? 'py-4 px-2 space-y-2' : 'py-4 px-3 space-y-2'} overflow-y-auto`}>
            {filteredMenuItems.map((item, idx) => {
              const isActive = location.pathname === item.page;
              
              return (
                <button
                  key={item.label + idx}
                  onClick={() => handleItemClick(item.page)}
                  className={`flex items-center w-full ${isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-3'} rounded-2xl transition-all duration-500 group focus:outline-none relative overflow-hidden ${
                    isActive 
                      ? 'text-white shadow-2xl' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10 focus:bg-white/10'
                  }`}
                  style={isActive ? {
                    background: '#1a2332',
                    border: '2px solid #8e161a',
                    boxShadow: `
                      0 6px 20px rgba(142, 22, 26, 0.4),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2),
                      0 0 0 1px rgba(142, 22, 26, 0.3),
                      0 0 0 2px rgba(0, 0, 0, 0.1)
                    `
                  } : {
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                  tabIndex={0}
                  aria-label={item.label}
                >
                  {/* Indicador lateral para elemento activo */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#8e161a] rounded-r-full" style={{
                      boxShadow: '0 0 12px rgba(142, 22, 26, 0.6)'
                    }}></div>
                  )}
                  
                  {/* Efecto de hover con granate desvanecido */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{
                    background: 'rgba(142, 22, 26, 0.15)',
                    border: '1px solid rgba(142, 22, 26, 0.3)'
                  }}></div>
                  
                  {/* Icono */}
                  <div className={`relative z-10 ${isCollapsed ? 'w-6' : 'w-5 mr-3'} flex items-center justify-center transition-all duration-500`}>
                    <div className={`w-full h-full flex items-center justify-center`} style={isActive ? {
                      filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.6))'
                    } : {}}>
                      <item.icon className={`w-full h-full transition-all duration-500 ${
                        isActive 
                          ? 'text-white drop-shadow-2xl' 
                          : 'text-white opacity-90 group-hover:scale-110'
                      }`} />
                    </div>
                  </div>
                  
                  {/* Texto del menú */}
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`transition-all duration-500 relative z-10 font-medium ${
                        isActive ? 'font-bold' : 'group-hover:font-semibold'
                      }`} style={isActive ? {
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)'
                      } : {}}>
                        {item.label}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
            
            {/* Línea decorativa */}
            {!isCollapsed && filteredMenuItems.length > 0 && (
              <div className="mt-6 mb-4 mx-3">
                <div className="h-px bg-gradient-to-r from-transparent via-[#8e161a]/40 to-transparent" style={{
                  boxShadow: '0 0 12px rgba(142, 22, 26, 0.3)'
                }}></div>
              </div>
            )}
          </nav>

          {/* Footer con botón de cerrar sesión */}
          {!isCollapsed && (
            <div className="p-4 border-t border-white/20">
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-500 group text-gray-300 hover:text-white hover:bg-red-500/20"
                style={{
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <LogOut className="w-5 h-5 group-hover:text-red-400 group-hover:scale-110 transition-all duration-300" />
                <span className="text-sm font-medium">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}