import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { getNotificationStats } from '../../services/notifications';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { messageService } from '../../services/messages';
import { getPsychologistStats } from '../../services/appointments';
import { psychologicalSessionsService } from '../../services/psychologicalSessions';
import { getUserStats } from '../../services/users';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
  notifications?: number;
}

export function Header({ onMenuClick, notifications = 0 }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(notifications);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Cargar estadísticas de notificaciones
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

    loadStats();
  }, []);

  // Cerrar paneles al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setShowNotifications(false);
    setShowUserMenu(false);
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Recalcular posición del modal cuando cambie el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      // Recalcular posición si es necesario
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showUserMenu]);

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

  // Calcular posición cuando se abre el modal
  const handleUserMenuToggle = () => {
    setShowUserMenu((v) => !v);
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-40" style={{
      background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 20%, #2c3e50 40%, #1a2332 60%, #0f1419 80%, #1a2332 100%)',
      borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(20px)',
      zIndex: 40,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 2px 10px rgba(142, 22, 26, 0.2)'
    }}>
      {/* Efectos de fondo estáticos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Partículas estáticas */}
        <div className="absolute top-2 left-4 w-0.5 h-0.5 bg-white rounded-full opacity-50"></div>
        <div className="absolute top-3 right-8 w-0.5 h-0.5 bg-[#d3b7a0] rounded-full opacity-60"></div>
        <div className="absolute bottom-2 left-12 w-0.5 h-0.5 bg-white rounded-full opacity-40"></div>
        <div className="absolute top-3 right-20 w-0.5 h-0.5 bg-[#8e161a] rounded-full opacity-30"></div>
        <div className="absolute top-4 left-20 w-0.5 h-0.5 bg-white rounded-full opacity-25"></div>
        
        {/* Ondas sutiles estáticas */}
        <div className="absolute inset-0" style={{
          background: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 100px,
              rgba(255, 255, 255, 0.005) 102px,
              rgba(255, 255, 255, 0.005) 104px,
              transparent 106px
            )
          `
        }}></div>
        
        {/* Efecto de brillo superior estático */}
        <div className="absolute top-0 left-0 w-full h-0.5" style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
        }}></div>

        {/* Efecto de profundidad estático */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/15"></div>
      </div>

      <div className="relative z-10 px-4 py-3">
        <div className="flex items-center justify-between w-full">
          {/* Lado izquierdo - Botón de menú y título */}
          <div className="flex items-center space-x-4">
            {/* Botón de menú móvil */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-300 group" style={{
                background: 'linear-gradient(135deg, rgba(142, 22, 26, 0.3) 0%, rgba(44, 62, 80, 0.3) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Menu className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
            </button>
            
            {/* Título */}
            <div>
              <h1 className="text-lg font-bold text-white" style={{
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(0, 0, 0, 0.6)'
              }}>
                Espacio Psicológico
              </h1>
            </div>
          </div>

          {/* Lado derecho - Notificaciones y usuario */}
          <div className="flex items-center space-x-4">
            {/* Botón de notificaciones */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300 group" style={{
                  background: 'linear-gradient(135deg, rgba(142, 22, 26, 0.3) 0%, rgba(44, 62, 80, 0.3) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Bell className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                
                {/* Badge de notificaciones */}
                {notificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center" style={{
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
                  }}>
                    <span className="text-white text-xs font-bold">{notificationCount}</span>
                  </div>
                )}
              </button>

              {/* Panel de notificaciones */}
              {showNotifications && (
                <div ref={notificationRef} className="absolute top-full right-0 mt-2 w-80 rounded-md shadow-xl border z-50 animate-fade-in overflow-hidden" style={{
                  maxHeight: '480px',
                  background: '#ffffff',
                  borderColor: '#0a0f14',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                  {/* Header del modal */}
                  <div className="px-4 py-3 border-b" style={{
                    background: '#0a0f14',
                    borderColor: '#1a0f14'
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-white" />
                        <span className="text-sm font-medium text-white">
                          Notificaciones
                        </span>
                      </div>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <NotificationPanel 
                    onClose={() => setShowNotifications(false)} 
                    onNotificationUpdate={() => {}} 
                  />
                </div>
              )}
            </div>

            {/* Información del usuario */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-white text-sm font-medium" style={{
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #d3b7a0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {user?.name}
                </p>
                <p className="text-white/70 text-xs" style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)'
                }}>
                  {getRoleDisplayName(user?.role || '')}
                </p>
              </div>

              {/* Avatar del usuario */}
              <div className="relative">
                <button
                  onClick={() => handleUserMenuToggle()}
                  className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden hover:scale-105 transition-all duration-300 group" style={{
                    background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 25%, #2c3e50 50%, #1a2332 75%, #0f1419 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  {/* Efecto de brillo en hover */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300" style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 70%)'
                  }}></div>
                  
                  {(() => {
                    // Para estudiantes y super_admin, mostrar google_avatar si existe
                    if ((user?.role === 'student' || user?.role === 'super_admin') && user?.google_avatar) {
                      return (
                        <img 
                          src={user.google_avatar}
                          alt={`Avatar de ${user.name}`}
                          className="w-full h-full object-cover rounded-full relative z-10"
                        />
                      );
                    }
                    // Para otros usuarios, mostrar avatar si existe
                    else if (user?.avatar) {
                      return (
                        <img 
                          src={user.avatar}
                          alt={`Avatar de ${user.name}`}
                          className="w-full h-full object-cover rounded-full relative z-10"
                        />
                      );
                    }
                    // Si no hay avatar, mostrar icono por defecto
                    else {
                      return <User className="w-5 h-5 text-white relative z-10" />;
                    }
                  })()}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de usuario - Posicionado relativo al header */}
      {showUserMenu && (
        <div ref={userMenuRef} className="absolute top-full right-0 mt-2 w-56 sm:w-60 md:w-64 lg:w-68 xl:w-72 rounded-xl sm:rounded-xl shadow-2xl border z-50 animate-fade-in overflow-hidden" style={{
          background: 'linear-gradient(135deg, #1a0f0f 0%, #4a0f0f 20%, #8e161a 40%, #4a0f0f 60%, #8e161a 80%, #1a0f0f 100%)',
          borderColor: 'rgba(255, 255, 255, 0.4)',
          boxShadow: `
            0 25px 80px rgba(0, 0, 0, 0.9), 
            0 15px 40px rgba(142, 22, 26, 0.6),
            0 5px 15px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.2)
          `,
          backdropFilter: 'blur(25px)',
          maxWidth: 'calc(100vw - 2rem)',
          minWidth: '300px'
        }}>
          {/* Header del modal */}
          <div className="relative px-3 sm:px-3 md:px-4 lg:px-4 py-2 sm:py-3 md:py-3 lg:py-4" style={{
            background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 20%, #2c3e50 40%, #1a2332 60%, #0f1419 80%, #1a2332 100%)'
          }}>
            {/* Efectos de fondo en el header */}
            <div className="absolute inset-0 opacity-50">
              <div className="absolute top-2 sm:top-2 right-3 sm:right-4 w-0.5 sm:w-0.5 h-0.5 sm:h-0.5 bg-white rounded-full"></div>
              <div className="absolute bottom-2 sm:bottom-3 left-4 sm:left-5 w-0.5 h-0.5 bg-[#d3b7a0] rounded-full"></div>
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
              <div className="absolute top-1/2 left-1/4 w-0.5 h-0.5 bg-[#d3b7a0] rounded-full opacity-50"></div>
              <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-white rounded-full opacity-30"></div>
              <div className="absolute top-1/4 right-1/4 w-0.5 h-0.5 bg-[#8e161a] rounded-full opacity-40"></div>
              <div className="absolute bottom-1/4 right-1/3 w-0.5 h-0.5 bg-[#d3b7a0] rounded-full opacity-35"></div>
            </div>
            
            <div className="relative z-10 flex items-center space-x-2 sm:space-x-3 md:space-x-3 lg:space-x-4 xl:space-x-4">
              {/* Lado izquierdo - Avatar y punto verde */}
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 md:space-y-2">
                {/* Avatar grande */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-12 lg:h-12 xl:w-12 xl:h-12 rounded-full flex items-center justify-center overflow-hidden relative" style={{
                  background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 25%, #2c3e50 50%, #1a2332 75%, #0f1419 100%)',
                  boxShadow: `
                    0 10px 30px rgba(0, 0, 0, 0.8),
                    inset 0 1px 0 rgba(255, 255, 255, 0.5),
                    0 0 0 2px rgba(255, 255, 255, 0.5),
                    0 0 0 3px rgba(0, 0, 0, 0.3)
                  `,
                  border: '3px solid rgba(255, 255, 255, 0.95)'
                }}>
                  {/* Efecto de brillo en el avatar */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-300" style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6) 0%, transparent 70%)'
                  }}></div>
                  
                  {(() => {
                    // Para estudiantes y super_admin, mostrar google_avatar si existe
                    if ((user?.role === 'student' || user?.role === 'super_admin') && user?.google_avatar) {
                      return (
                        <img 
                          src={user.google_avatar}
                          alt={`Avatar de ${user.name}`}
                          className="w-full h-full object-cover rounded-full relative z-10"
                        />
                      );
                    }
                    // Para otros usuarios, mostrar avatar si existe
                    else if (user?.avatar) {
                      return (
                        <img 
                          src={user.avatar}
                          alt={`Avatar de ${user.name}`}
                          className="w-full h-full object-cover rounded-full relative z-10"
                        />
                      );
                    }
                    // Si no hay avatar, mostrar icono por defecto
                    else {
                      return <User className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 xl:w-6 xl:h-6 text-white relative z-10" />;
                    }
                  })()}
                </div>
                
                {/* Indicador de estado debajo del avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-3 lg:h-3 xl:w-3 xl:h-3 bg-green-500 rounded-full border-2 border-white mb-0.5 relative" style={{
                    boxShadow: '0 0 20px rgba(34, 197, 94, 1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                  }}>
                    {/* Efecto de pulso */}
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-60"></div>
                  </div>
                  <span className="text-white/95 text-xs font-medium" style={{
                    textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)'
                  }}>En línea</span>
                </div>
              </div>
              
              {/* Lado derecho - Información del usuario */}
              <div className="flex-1">
                <h3 className="text-white font-bold text-xs sm:text-sm md:text-sm lg:text-sm xl:text-sm leading-tight" style={{
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.9), 0 4px 20px rgba(0, 0, 0, 0.8)'
                }}>
                  {user?.name}
                </h3>
                {user?.email && (
                  <p className="text-white/80 text-xs mt-0.5 truncate" style={{
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)'
                  }}>
                    {user.email}
                  </p>
                )}
              </div>
              
              {/* Rol a la derecha */}
              <div className="text-right">
                <p className="text-[#d3b7a0] text-xs sm:text-xs md:text-xs lg:text-xs xl:text-xs font-medium opacity-95" style={{
                  textShadow: '0 1px 5px rgba(0, 0, 0, 0.8)'
                }}>
                  {getRoleDisplayName(user?.role || '')}
                </p>
              </div>
            </div>
          </div>

          {/* Opciones del menú */}
          <div className="py-1 sm:py-1 md:py-2 lg:py-2 xl:py-2" style={{
            background: 'linear-gradient(135deg, rgba(15, 20, 25, 0.98) 0%, rgba(26, 35, 50, 0.98) 50%, rgba(15, 20, 25, 0.98) 100%)'
          }}>
            <button
              className="w-full text-left px-3 sm:px-3 md:px-3 lg:px-4 xl:px-4 py-1.5 sm:py-2 md:py-2 lg:py-2.5 xl:py-2.5 hover:bg-gradient-to-r hover:from-[#8e161a]/25 hover:to-[#d3b7a0]/25 text-sm font-medium flex items-center gap-2 sm:gap-2 md:gap-3 lg:gap-3 xl:gap-3 transition-all duration-300 group"
              onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
            >
              <div className="w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-7 lg:h-7 xl:w-7 xl:h-7 rounded-lg bg-gradient-to-br from-[#8e161a]/25 to-[#d3b7a0]/25 flex items-center justify-center group-hover:from-[#8e161a]/35 group-hover:to-[#d3b7a0]/35 transition-all duration-300" style={{
                boxShadow: '0 3px 12px rgba(142, 22, 26, 0.4)'
              }}>
                <User className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-3.5 lg:h-3.5 xl:w-3.5 xl:h-3.5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm">Mi perfil</div>
                <div className="text-white/75 text-xs">Datos personales</div>
              </div>
              <div className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-3 lg:h-3 xl:w-3 xl:h-3 text-white/70 group-hover:text-white transition-colors duration-300">
                →
              </div>
            </button>
            
            <button
              className="w-full text-left px-3 sm:px-3 md:px-3 lg:px-4 xl:px-4 py-1.5 sm:py-2 md:py-2 lg:py-2.5 xl:py-2.5 hover:bg-gradient-to-r hover:from-red-500/25 hover:to-red-400/25 text-sm font-medium flex items-center gap-2 sm:gap-2 md:gap-3 lg:gap-3 xl:gap-3 transition-all duration-300 group text-red-200"
              onClick={logout}
            >
              <div className="w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-7 lg:h-7 xl:w-7 xl:h-7 rounded-lg bg-gradient-to-br from-red-500/25 to-red-400/25 flex items-center justify-center group-hover:from-red-500/35 group-hover:to-red-400/35 transition-all duration-300" style={{
                boxShadow: '0 3px 12px rgba(239, 68, 68, 0.4)'
              }}>
                <LogOut className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-3.5 lg:h-3.5 xl:w-3.5 xl:h-3.5 text-red-200" />
              </div>
              <div className="flex-1">
                <div className="text-red-200 font-medium text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm">Cerrar sesión</div>
                <div className="text-red-300/80 text-xs">Salir de forma segura</div>
              </div>
              <div className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-3 lg:h-3 xl:w-3 xl:h-3 text-red-300/70 group-hover:text-red-200 transition-colors duration-300">
                ↗
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Menú móvil expandido */}
      {showMobileMenu && (
        <div ref={mobileMenuRef} className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40" style={{
          backdropFilter: 'blur(20px)'
        }}>
          <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
            <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl border border-gray-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center overflow-hidden" style={{
                background: '#1a2332',
                border: '2px solid rgba(255, 255, 255, 0.8)'
              }}>
                {(() => {
                  // Para estudiantes y super_admin, mostrar google_avatar si existe
                  if ((user?.role === 'student' || user?.role === 'super_admin') && user?.google_avatar) {
                    return (
                      <img 
                        src={user.google_avatar}
                        alt={`Avatar de ${user.name}`}
                        className="w-full h-full object-cover rounded-full"
                      />
                    );
                  }
                  // Para otros usuarios, mostrar avatar si existe
                  else if (user?.avatar) {
                    return (
                      <img 
                        src={user.avatar}
                        alt={`Avatar de ${user.name}`}
                        className="w-full h-full object-cover rounded-full"
                      />
                    );
                  }
                  // Si no hay avatar, mostrar icono por defecto
                  else {
                    return <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />;
                  }
                })()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">{user?.name}</p>
                <p className="text-gray-600 text-xs sm:text-sm">{getRoleDisplayName(user?.role || '')}</p>
              </div>
            </div>
            
            <button
              onClick={() => { setShowMobileMenu(false); navigate('/profile'); }}
              className="w-full text-left p-3 sm:p-4 hover:bg-gray-50 rounded-lg sm:rounded-xl transition-colors duration-200 flex items-center space-x-2 sm:space-x-3 group"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#8e161a] group-hover:scale-110 transition-transform duration-200" />
              <span className="text-gray-700 font-medium text-sm sm:text-base">Mi perfil</span>
            </button>
            
            <button
              onClick={() => { setShowMobileMenu(false); logout(); }}
              className="w-full text-left p-3 sm:p-4 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors duration-200 flex items-center space-x-2 sm:space-x-3 text-red-600 group"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium text-sm sm:text-base">Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}