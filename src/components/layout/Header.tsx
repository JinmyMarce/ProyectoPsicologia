import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { getNotificationStats } from '../../services/notifications';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { messageService } from '../../services/messages';
import { getPsychologistStats } from '../../services/appointments';
import { psychologicalSessionsService } from '../../services/psychologicalSessions';
import { getUserStats } from '../../services/users';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
  notifications?: number;
}

export function Header({ onMenuClick, notifications = 0 }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(notifications);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Estados para el menú de usuario
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Estados para estadísticas reales del usuario
  const [userStats, setUserStats] = useState({
    stat1: 0,
    stat2: 0,
    progress: 0,
    lastSession: 'Sin datos'
  });

  // Cargar estadísticas de notificaciones y del usuario
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [notificationStats] = await Promise.all([
          getNotificationStats(),
          messageService.getStats()
        ]);
        setNotificationCount((notificationStats.unread as number) || 0);
      } catch (err) {
        console.log('Error cargando estadísticas:', err);
      }
    };

    const loadUserStats = async () => {
      if (!user) return;

      try {
        let stats = { stat1: 0, stat2: 0, progress: 0, lastSession: 'Sin datos' };

        switch (user.role) {
          case 'student':
            try {
              // Para estudiantes: sesiones psicológicas
              const sessionData = await psychologicalSessionsService.getStats();
              if (sessionData.success) {
                stats = {
                  stat1: sessionData.data.realizadas || 0,
                  stat2: sessionData.data.programadas || 0,
                  progress: sessionData.data.total_sessions > 0 
                    ? Math.round((sessionData.data.realizadas / sessionData.data.total_sessions) * 100)
                    : 0,
                  lastSession: 'Hoy 10:30 AM' // Esto debería venir del API
                };
              }
            } catch (error) {
              console.log('Error cargando estadísticas de estudiante:', error);
            }
            break;

          case 'psychologist':
            try {
              // Para psicólogos: citas y reportes
              const psychStats = await getPsychologistStats();
              stats = {
                stat1: psychStats.total_patients || 0,
                stat2: psychStats.total_reports || 0,
                progress: psychStats.completion_rate || 95,
                lastSession: psychStats.last_session || 'Sin datos'
              };
            } catch (error) {
              console.log('Error cargando estadísticas de psicólogo:', error);
            }
            break;

          case 'admin':
          case 'super_admin':
            try {
              // Para admins: estadísticas generales
              const adminStats = await getUserStats();
              stats = {
                stat1: (adminStats.active_users as number) || 0,
                stat2: (adminStats.new_registrations as number) || 0,
                progress: (adminStats.system_health as number) || 98,
                lastSession: 'Hoy 09:15 AM'
              };
            } catch (error) {
              console.log('Error cargando estadísticas de admin:', error);
            }
            break;

          case 'tutor':
            // Para tutores: estudiantes y derivaciones
            const tutorUser = user as any; // Casting temporal para propiedades específicas de tutor
            stats = {
              stat1: tutorUser.total_students || 0,
              stat2: tutorUser.active_derivations || 0,
              progress: 92,
              lastSession: 'Ayer 3:45 PM'
            };
            break;
        }

        setUserStats(stats);
      } catch (error) {
        console.log('Error cargando estadísticas del usuario:', error);
      }
    };

    loadStats();
    loadUserStats();
  }, [user]);

  // Cerrar paneles al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'psychologist':
        return 'Psicólogo';
      case 'student':
        return 'Estudiante';
      case 'tutor':
        return 'Tutor';
      default:
        return role;
    }
  };

  const getStatsLabels = (role: string) => {
    switch (role) {
      case 'student':
        return { 
          stat1: 'Realizadas', 
          stat2: 'Programadas', 
          progress: 'Progreso' 
        };
      case 'psychologist':
        return { 
          stat1: 'Pacientes', 
          stat2: 'Reportes', 
          progress: 'Progreso' 
        };
      case 'admin':
      case 'super_admin':
        return { 
          stat1: 'Usuarios', 
          stat2: 'Nuevos', 
          progress: 'Sistema' 
        };
      case 'tutor':
        return { 
          stat1: 'Estudiantes', 
          stat2: 'Derivaciones', 
          progress: 'Progreso' 
        };
      default:
        return { 
          stat1: 'Datos', 
          stat2: 'Actividad', 
          progress: 'Estado' 
        };
    }
  };

  return (
    <header className="sticky top-0 z-50 h-[80px] md:h-[90px] flex items-center shadow-xl" style={{
      background: `
        linear-gradient(135deg, 
          #0f1419 0%, 
          #1a1f29 12%, 
          #2c1d1d 24%, 
          #1e2a37 36%, 
          #142025 48%, 
          #1a1f29 60%, 
          #2c1d1d 72%, 
          #1e2a37 84%, 
          #0f1419 100%
        ),
        radial-gradient(ellipse at 15% 50%, rgba(142, 22, 26, 0.08) 0%, transparent 65%),
        radial-gradient(ellipse at 85% 50%, rgba(211, 183, 160, 0.06) 0%, transparent 65%),
        linear-gradient(90deg, transparent 0%, rgba(211, 183, 160, 0.02) 50%, transparent 100%)
      `,
      borderBottom: '2px solid rgba(211, 183, 160, 0.2)',
      boxShadow: `
        0 4px 20px rgba(0, 0, 0, 0.25),
        0 8px 40px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.08),
        inset 0 -1px 0 rgba(211, 183, 160, 0.1)
      `,
      backdropFilter: 'blur(12px)'
    }}>
      {/* Efectos de fondo mejorados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Partículas elegantes */}
        <div className="absolute top-4 left-20 w-1 h-1 bg-[#d3b7a0] rounded-full opacity-50" style={{animation: 'sparkle 10s ease-in-out infinite'}}></div>
        <div className="absolute top-6 right-32 w-0.5 h-0.5 bg-white rounded-full opacity-60" style={{animation: 'twinkle 12s ease-in-out infinite 2s'}}></div>
        <div className="absolute bottom-5 left-48 w-0.5 h-0.5 bg-[#8e161a] rounded-full opacity-40" style={{animation: 'sparkle 14s ease-in-out infinite 4s'}}></div>
        <div className="absolute top-3 right-64 w-1 h-1 bg-[#d3b7a0] rounded-full opacity-35" style={{animation: 'twinkle 16s ease-in-out infinite 6s'}}></div>
        
        {/* Ondas decorativas */}
        <div className="absolute inset-0" style={{
          background: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 80px,
              rgba(211, 183, 160, 0.02) 82px,
              rgba(211, 183, 160, 0.02) 84px,
              transparent 86px
            )
          `,
          animation: 'waveSlide 25s linear infinite'
        }}></div>
        
        {/* Efecto de brillo superior */}
        <div className="absolute top-0 left-0 w-full h-1" style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(211, 183, 160, 0.3) 50%, transparent 100%)',
          animation: 'headerShine 20s ease-in-out infinite'
        }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-4 h-full max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-4 pl-0">
          <Button
            variant="ghost"
            size="lg"
            onClick={onMenuClick}
            className="text-white hover:bg-white/8 focus:bg-white/8 rounded-lg p-3 transition-all duration-300 lg:hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
            aria-label="Abrir menú"
          >
            <Menu className="w-7 h-7" />
          </Button>
          
          {/* Título sin logo */}
          <div className="flex items-center">
            <div>
              <h1 className="font-bold text-xl md:text-2xl lg:text-3xl tracking-wide leading-tight" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 20%, #d3b7a0 40%, #e8e8e8 60%, #ffffff 80%, #f5f5f5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                backgroundSize: '200% 100%',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                fontFamily: 'Georgia, serif',
                animation: 'titleShimmer 15s ease-in-out infinite'
              }}>
                Portal Psicológico Túpac Amaru
          </h1>
              <p className="hidden md:block text-sm lg:text-base text-[#d3b7a0] font-medium tracking-wide" style={{
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
                opacity: 0.9,
                animation: 'subtitleGlow 12s ease-in-out infinite 2s'
              }}>
                Sistema Integral de Psicología
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          {/* Área de notificaciones mejorada */}
          <div className="flex items-center space-x-4">
            {(user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'psychologist' || user?.role === 'student') && (
              <div className="relative" ref={notificationRef}>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/8 focus:bg-white/8 relative rounded-lg p-3 transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                  onClick={() => setShowNotifications((v) => !v)}
                  aria-label="Notificaciones"
                >
                  <Bell className="w-5 h-5 opacity-90" />
                  {notificationCount > 0 && (
                    <div 
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs text-white font-medium"
                      style={{
                        background: 'linear-gradient(135deg, #8e161a 0%, #b91c1c 100%)',
                        boxShadow: '0 1px 4px rgba(142, 22, 26, 0.3)'
                      }}
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </div>
                  )}
                </Button>
                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-80 bg-white rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden animate-fade-in border border-[#d3b7a0]/30">
                    <NotificationPanel 
                      onClose={() => setShowNotifications(false)} 
                      onNotificationUpdate={() => {}} 
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Área de usuario mejorada */}
          <div className="flex items-center space-x-4 pr-6">
            {/* Información del usuario con diseño mejorado */}
            <div className="hidden md:block text-right">
              <p className="font-semibold text-base leading-tight" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #d3b7a0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}>
                {user?.name}
              </p>
              <p className="text-[#d3b7a0] text-sm font-medium" style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
              }}>
                {getRoleDisplayName(user?.role || '')}
              </p>
            </div>

            {/* Avatar mejorado con efectos */}
            <div className="relative">
              <div 
                className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full cursor-pointer relative group transition-all duration-300 hover:scale-105"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      #8e161a 0%, 
                      #a52a2a 50%, 
                      #8e161a 100%
                    )
                  `,
                  boxShadow: `
                    0 2px 8px rgba(142, 22, 26, 0.25),
                    0 4px 15px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15)
                  `,
                  border: '1px solid rgba(211, 183, 160, 0.2)'
                }}
                onClick={() => setShowUserMenu((v) => !v)}
              >
                {/* Efectos de brillo sutiles en el avatar */}
                <div className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-35 transition-opacity duration-300" style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 70%)'
                }}></div>
                
                <User className="w-5 h-5 md:w-6 md:h-6 text-white relative z-10 opacity-90" />
                
                {/* Indicador de estado más sutil */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white opacity-80" style={{
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                }}></div>
              </div>

              {/* Modal de usuario mejorado */}
              {showUserMenu && (
                <div ref={userMenuRef} className="absolute right-0 top-16 w-80 bg-white text-gray-900 rounded-2xl shadow-2xl border-2 border-[#d3b7a0]/40 z-50 animate-fade-in overflow-hidden" style={{
                  boxShadow: `
                    0 25px 80px rgba(0, 0, 0, 0.4), 
                    0 15px 40px rgba(142, 22, 26, 0.3),
                    0 5px 15px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `,
                  backdropFilter: 'blur(10px)'
                }}>
                  {/* Header del modal con avatar y información */}
                  <div className="relative px-6 py-6" style={{
                    background: `
                      linear-gradient(135deg, 
                        #0f1419 0%, 
                        #1a1f29 25%, 
                        #2c1d1d 50%, 
                        #8e161a 75%, 
                        #d3b7a0 100%
                      )
                    `
                  }}>
                    {/* Efectos de fondo en el header */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-2 right-4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                      <div className="absolute bottom-3 left-6 w-0.5 h-0.5 bg-[#d3b7a0] rounded-full" style={{animation: 'sparkle 4s ease-in-out infinite'}}></div>
                    </div>
                    
                    <div className="relative z-10 flex items-center space-x-4">
                      {/* Avatar grande */}
                      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{
                        background: `
                          linear-gradient(135deg, 
                            #8e161a 0%, 
                            #a52a2a 50%, 
                            #d3b7a0 100%
                          )
                        `,
                        boxShadow: `
                          0 4px 15px rgba(0, 0, 0, 0.3),
                          inset 0 1px 0 rgba(255, 255, 255, 0.2)
                        `
                      }}>
                        <User className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Información del usuario */}
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg leading-tight" style={{
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                        }}>
                          {user?.name}
                        </h3>
                        <p className="text-[#d3b7a0] text-sm font-medium opacity-90" style={{
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                        }}>
                          {getRoleDisplayName(user?.role || '')}
                        </p>
                        {user?.email && (
                          <p className="text-white/70 text-xs mt-1 truncate">
                            {user.email}
                          </p>
                        )}
                      </div>
                      
                      {/* Indicador de estado */}
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mb-1" style={{
                          boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
                          animation: 'statusPulse 2s ease-in-out infinite'
                        }}></div>
                        <span className="text-white/60 text-xs">En línea</span>
                      </div>
                    </div>
                  </div>

                  {/* Sección de estadísticas reales */}
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#8e161a]">
                          {userStats.stat1}
                        </div>
                        <div className="text-xs text-gray-600">
                          {getStatsLabels(user?.role || '').stat1}
                        </div>
                      </div>
                      <div className="text-center border-x border-gray-300">
                        <div className="text-lg font-bold text-[#8e161a]">
                          {userStats.stat2}
                        </div>
                        <div className="text-xs text-gray-600">
                          {getStatsLabels(user?.role || '').stat2}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {userStats.progress}%
                        </div>
                        <div className="text-xs text-gray-600">
                          {getStatsLabels(user?.role || '').progress}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Opciones del menú mejoradas */}
                  <div className="py-2">
                  <button
                      className="w-full text-left px-6 py-4 hover:bg-gradient-to-r hover:from-[#8e161a]/8 hover:to-[#d3b7a0]/8 text-base font-medium flex items-center gap-4 transition-all duration-300 group"
                    onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                  >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8e161a]/10 to-[#d3b7a0]/10 flex items-center justify-center group-hover:from-[#8e161a]/20 group-hover:to-[#d3b7a0]/20 transition-all duration-300">
                    <User className="w-5 h-5 text-[#8e161a]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-800 font-medium">Mi perfil</div>
                        <div className="text-gray-500 text-sm">Configurar cuenta y preferencias</div>
                      </div>
                      <div className="w-5 h-5 text-gray-400 group-hover:text-[#8e161a] transition-colors duration-300">
                        →
                      </div>
                  </button>
                    
                  <button
                      className="w-full text-left px-6 py-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 text-base font-medium flex items-center gap-4 transition-all duration-300 group text-red-600"
                    onClick={logout}
                  >
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-all duration-300">
                        <LogOut className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-red-600 font-medium">Cerrar sesión</div>
                        <div className="text-red-400 text-sm">Salir de forma segura</div>
                      </div>
                      <div className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors duration-300">
                        ↗
                      </div>
                  </button>
                  </div>

                  {/* Footer con información real */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Última sesión: {userStats.lastSession}</span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {user?.active ? 'Conectado' : 'Desconectado'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}