import React, { useEffect, useRef } from 'react';
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
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

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
          className="fixed inset-0 bg-black/80 z-[90] lg:hidden backdrop-blur-md"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Premium Professional Design */}
      <aside
        ref={sidebarRef}
        className={`h-full transition-all duration-500 text-white ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isCollapsed ? 'w-20' : 'w-72'} flex-shrink-0 fixed lg:static top-0 left-0 z-[100]`}
        style={{
          background: 'linear-gradient(180deg, #0a0e17 0%, #020408 50%, #000000 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5), inset -1px 0 0 rgba(255, 255, 255, 0.02)',
          height: '100vh'
        }}
      >
        {/* Collapse Button - Modern Micro-interactions */}
        <div className="hidden lg:flex absolute -right-[11px] top-1/2 transform -translate-y-1/2 z-50">
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-[22px] h-11 rounded-full bg-gradient-to-br from-red-900/90 via-red-950 to-black border-2 border-red-700/50 shadow-[0_0_24px_rgba(239,68,68,0.4),0_4px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_0_32px_rgba(239,68,68,0.6),0_6px_16px_rgba(0,0,0,0.6)] hover:border-red-600/70 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none group ring-2 ring-[#0a0e17] backdrop-blur-sm relative overflow-hidden"
            aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {/* Modern pulse effect on hover */}
            <div className="absolute inset-0 rounded-full bg-red-500/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>

            {isCollapsed ?
              <ChevronRight className="w-3.5 h-3.5 text-red-50 stroke-[2.5] drop-shadow-[0_0_6px_rgba(248,113,113,0.7)] group-hover:scale-110 transition-transform relative z-10" /> :
              <ChevronLeft className="w-3.5 h-3.5 text-red-50 stroke-[2.5] drop-shadow-[0_0_6px_rgba(248,113,113,0.7)] group-hover:scale-110 transition-transform relative z-10" />
            }
          </button>
        </div>

        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Enhanced ambient lighting effects */}
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/5 to-transparent pointer-events-none"></div>
          <div className="absolute top-1/4 right-0 w-32 h-32 bg-red-500/3 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-0 w-24 h-24 bg-purple-500/2 rounded-full blur-2xl pointer-events-none"></div>

          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>

          {/* Header del sidebar */}
          <div className={`flex flex-col items-center justify-center relative ${isCollapsed ? 'py-2' : 'py-6'} transition-all duration-500 z-10`}>

            {/* Logo Container - Ultra Modern Design */}
            <div className={`relative flex items-center justify-center ${isCollapsed ? 'w-11 h-11' : 'w-20 h-20'} transition-all duration-500 group ${isCollapsed ? 'mb-1' : 'mb-3'}`}>

              {/* Multi-layer premium glow with modern colors */}
              <div className={`absolute inset-0 rounded-[1.25rem] bg-gradient-to-br from-red-500/12 via-purple-500/5 to-blue-500/8 blur-2xl transition-all duration-500 group-hover:from-red-500/18 group-hover:via-purple-500/8 group-hover:to-blue-500/12 group-hover:blur-3xl`}></div>

              {/* Modern glassmorphism container with depth */}
              <div className={`absolute inset-0 rounded-[1.25rem] bg-gradient-to-br from-slate-800/50 via-slate-900/70 to-black/90 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md flex items-center justify-center overflow-hidden z-10 transition-all duration-500 group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.15)]`}>
                {/* Enhanced top shine with modern gradient */}
                <div className="absolute top-0 left-0 right-0 h-2/5 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent"></div>
                {/* Subtle side highlights for depth */}
                <div className="absolute top-0 left-0 bottom-0 w-1/4 bg-gradient-to-r from-white/[0.02] to-transparent"></div>
                <div className="absolute top-0 right-0 bottom-0 w-1/4 bg-gradient-to-l from-white/[0.02] to-transparent"></div>
                {/* Modern bottom depth shadow */}
                <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>
                {/* Subtle inner glow */}
                <div className="absolute inset-[2px] rounded-[1.15rem] bg-gradient-to-br from-white/[0.01] to-transparent opacity-50"></div>
              </div>

              <img
                src="/images/icons/Icono del sitema.png"
                alt="Logo SAPTA"
                className={`${isCollapsed ? 'w-6 h-6' : 'w-14 h-14'} object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] relative z-20 transition-all duration-500 transform group-hover:scale-105 group-hover:drop-shadow-[0_6px_20px_rgba(0,0,0,0.7)]`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              {/* Fallback Logo */}
              <div className="hidden w-full h-full flex items-center justify-center bg-slate-900 rounded-[1.25rem] relative z-20">
                <span className="text-white font-serif font-bold text-3xl">Ψ</span>
              </div>
            </div>

            {/* Branding SAPTA - Compact Premium Design with Wings */}
            {!isCollapsed && (
              <div className="text-center px-5 animate-fade-in w-full relative z-10 mt-2">
                {/* Subtle ambient glow */}
                <div className="absolute inset-0 bg-gradient-radial from-red-500/4 via-transparent to-transparent blur-3xl pointer-events-none"></div>

                {/* SAPTA Title with Wings - Compact & Modern */}
                <div className="mb-3 relative group">
                  <div className="flex items-center justify-center gap-3">
                    {/* Left Wing - Larger and More Visible */}
                    <svg className="w-7 h-7 text-red-500/60 group-hover:text-red-400/80 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 13.5L12 3v7.5L3 13.5zm0 0L12 21v-7.5L3 13.5z" opacity="0.8" />
                      <path d="M12 10.5V3l9 10.5-9-3zm0 0v10.5l9-10.5-9 3z" opacity="0.5" />
                    </svg>

                    <h1 className="text-[1.75rem] font-black text-white tracking-[0.45em] font-sans relative inline-block transition-all duration-300 group-hover:tracking-[0.5em]">
                      SAPTA
                    </h1>

                    {/* Right Wing - Larger and More Visible */}
                    <svg className="w-7 h-7 text-red-500/60 group-hover:text-red-400/80 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 13.5L12 3v7.5l9 3zm0 0L12 21v-7.5l9 3z" opacity="0.8" />
                      <path d="M12 10.5V3L3 13.5l9-3zm0 0v10.5L3 13.5l9 3z" opacity="0.5" />
                    </svg>
                  </div>
                  {/* Modern animated dual underline */}
                  <div className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/70 to-transparent rounded-full transition-all duration-300 group-hover:via-red-400/90"></div>
                  <div className="absolute -bottom-0.5 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-300 group-hover:via-white/30"></div>
                  {/* Subtle glow on hover */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-red-500/0 blur-md transition-all duration-300 group-hover:bg-red-500/20"></div>
                </div>

                {/* Subtitle - Compact Hierarchy */}
                <div className="space-y-2 relative">
                  <p className="text-[9.5px] font-medium text-slate-300/75 uppercase tracking-[0.25em] leading-tight">
                    Sistema de Atención Psicológica
                  </p>

                  {/* Túpac Amaru - Featured */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-red-500/40 to-red-500/60 rounded-full"></div>
                    <p className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-300 to-red-400 uppercase tracking-[0.2em] drop-shadow-[0_2px_6px_rgba(248,113,113,0.3)]">
                      Túpac Amaru
                    </p>
                    <div className="h-[1px] w-8 bg-gradient-to-l from-transparent via-red-500/40 to-red-500/60 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Separator - More Visible */}
          <div className={`w-full ${isCollapsed ? 'px-3' : 'px-6'} mb-3 mt-3`}>
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent shadow-[0_1px_3px_rgba(255,255,255,0.1)]"></div>
          </div>


          {/* Menu - Modern Professional Cards */}
          <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} ${isCollapsed ? 'py-2' : 'py-2'} overflow-y-auto custom-scrollbar z-10 ${isCollapsed ? 'space-y-1' : 'space-y-2'}`}>
            {filteredMenuItems.map((item, idx) => {
              const isActive = location.pathname === item.page;

              return (
                <button
                  key={item.label + idx}
                  onClick={() => handleItemClick(item.page)}
                  className={`flex items-center w-full ${isCollapsed ? 'justify-center p-2.5' : 'px-4 py-3'} rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                    ? `text-white shadow-[0_4px_24px_rgba(239,68,68,0.2)] bg-gradient-to-r from-red-900/30 via-red-800/15 to-transparent ${isCollapsed ? '' : 'border-2 border-red-800/40'}`
                    : `text-slate-400 hover:text-slate-100 hover:bg-white/[0.03] ${isCollapsed ? '' : 'border-2 border-white/[0.08] hover:border-white/[0.12]'}`
                    }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-red-400 via-red-500 to-red-600 rounded-r-full shadow-[0_0_16px_rgba(239,68,68,0.6)]"></div>
                  )}

                  {/* Hover shine effect */}
                  {!isActive && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`relative z-10 ${isCollapsed ? '' : 'mr-3'} transition-all duration-300 ${isActive ? 'text-red-400 scale-105' : 'text-slate-500 group-hover:text-slate-300 group-hover:scale-105'}`}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : ''}`} />
                  </div>

                  {/* Label */}
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between relative z-10">
                      <span className={`text-sm ${isActive ? 'font-semibold text-white' : 'font-medium'}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-[0_2px_8px_rgba(239,68,68,0.3)]' : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                      {item.label}
                      {/* Arrow */}
                      <div className="absolute left-0 top-1/2 -ml-1 -mt-1 w-2 h-2 bg-slate-900 border-l border-b border-white/10 transform rotate-45"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer - Logout Button Enhanced */}
          <div className={`p-2 border-t border-white/[0.06] z-10 bg-gradient-to-t from-black/30 to-transparent relative`}>
            {/* Subtle top glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>

            <button
              onClick={logout}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all duration-300 group text-slate-400 hover:text-red-400 hover:bg-red-950/20 ${isCollapsed ? '' : 'border-2 border-white/[0.06] hover:border-red-900/30'} shadow-sm hover:shadow-[0_4px_16px_rgba(239,68,68,0.15)] relative overflow-hidden`}
            >
              {/* Hover shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/[0.05] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </div>

              <LogOut className={`w-5 h-5 transition-transform duration-300 relative z-10 ${isCollapsed ? '' : 'group-hover:-translate-x-0.5'}`} />
              {!isCollapsed && <span className="text-sm font-medium relative z-10">Cerrar sesión</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}