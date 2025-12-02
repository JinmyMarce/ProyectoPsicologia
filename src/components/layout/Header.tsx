
import { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, LogOut, Menu, User, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { getNotificationStats } from '../../services/notifications';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { messageService } from '../../services/messages';
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
  const [showPsychologyModal, setShowPsychologyModal] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(true);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Resetear estados de carga cuando cambie el usuario o su avatar
  useEffect(() => {
    const avatarSrc = user?.avatar || user?.google_avatar;
    if (avatarSrc) {
      setAvatarLoadError(false);
      setAvatarLoading(true);
      
      // Pre-cargar la imagen para carga más rápida
      const img = new Image();
      img.src = avatarSrc;
      img.onload = () => {
        setAvatarLoading(false);
      };
      img.onerror = () => {
        setAvatarLoadError(true);
        setAvatarLoading(false);
      };
    } else {
      setAvatarLoadError(true);
      setAvatarLoading(false);
    }
  }, [user?.avatar, user?.google_avatar]);

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

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300" style={{
      backgroundColor: '#09090b', // Carbon / Zinc 950
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
    }}>
      <div className="px-2 sm:px-3 lg:px-4">
        <div className="flex items-center justify-between h-14">
          {/* Lado izquierdo - Botón de menú y título */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onMenuClick) {
                  onMenuClick();
                }
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onMenuClick) {
                  onMenuClick();
                }
              }}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors touch-manipulation z-50 relative"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Botón de Información de Psicología */}
            <button
              onClick={() => setShowPsychologyModal(true)}
              className="relative p-1.5 rounded-lg bg-gradient-to-br from-red-950/30 via-red-900/20 to-transparent border border-red-900/30 hover:border-red-800/50 hover:bg-red-950/40 transition-all duration-300 group"
              title="Información de Psicología y Tutoría"
            >
              <span className="text-red-500 text-lg font-serif font-bold drop-shadow-[0_2px_4px_rgba(127,29,29,0.5)] group-hover:scale-110 transition-transform inline-block">Ψ</span>
            </button>

            {/* Título móvil - clickeable para ir al dashboard */}
            <h1 
              onClick={() => navigate('/dashboard')}
              className="lg:hidden text-base font-black text-white font-sans tracking-widest cursor-pointer hover:text-blue-400 transition-colors active:scale-95"
            >
              SAPTA
            </h1>
          </div>

          {/* Lado derecho - Acciones */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notificaciones */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 relative group"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full border border-[#02040a] shadow-lg">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Panel de notificaciones */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[#02040a] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-fade-in z-50">
                  <div className="p-4 border-b border-white/5">
                    <h3 className="text-sm font-bold text-white">Notificaciones</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 text-center text-slate-400 text-sm">
                      No hay notificaciones nuevas
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Separador vertical sutil */}
            <div className="h-6 w-px bg-white/5 hidden sm:block"></div>

            {/* Usuario */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800 group-hover:border-slate-500 transition-colors shadow-sm relative">
                  {user?.avatar || user?.google_avatar ? (
                    <>
                      {avatarLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                          <span className="text-xs font-bold text-slate-400">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      {!avatarLoadError && (
                        <img
                          src={user?.avatar || user?.google_avatar}
                          alt={user?.name}
                          loading="eager"
                          fetchPriority="high"
                          className={`w-full h-full object-cover ${avatarLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                          onLoad={() => setAvatarLoading(false)}
                          onError={() => {
                            setAvatarLoadError(true);
                            setAvatarLoading(false);
                          }}
                        />
                      )}
                      {avatarLoadError && (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <span className="text-xs font-bold text-slate-400">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{user?.name || 'Usuario'}</p>
                  <p className="text-[10px] text-slate-400 leading-tight capitalize">{getRoleDisplayName(user?.role || '')}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors hidden sm:block" />
              </button>

              {/* Dropdown Menu - Diseño "Deepest Midnight" Compacto */}
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[#02040a] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-fade-in z-50 origin-top-right backdrop-blur-xl">

                  {/* Header del Menú */}
                  <div className="p-4 relative overflow-hidden border-b border-white/5">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                    <div className="relative z-10 flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full border-2 border-slate-800 overflow-hidden bg-slate-900 shadow-lg ring-2 ring-[#02040a]">
                          {user?.avatar || user?.google_avatar ? (
                            <img src={user?.avatar || user?.google_avatar} alt={user?.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#02040a] rounded-full"></div>
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="font-bold text-sm text-white truncate leading-tight tracking-wide">{user?.name}</p>
                        <p className="text-slate-500 text-xs truncate mt-0.5 font-medium">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                            {getRoleDisplayName(user?.role || '')}
                          </span>
                          <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Activo
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Opciones del Menú */}
                  <div className="p-1.5 space-y-0.5 bg-[#02040a]/50">
                    <button
                      onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 group"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-900/50 text-slate-500 group-hover:text-red-400 group-hover:bg-red-900/10 transition-colors">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      Mi Perfil
                    </button>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1 mx-2"></div>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl transition-all duration-200 group"
                    >
                      <div className="p-1.5 rounded-lg bg-red-950/30 text-red-500 group-hover:text-red-400 transition-colors">
                        <LogOut className="w-3.5 h-3.5" />
                      </div>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Información de Psicología y Tutoría */}
      {showPsychologyModal && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setShowPsychologyModal(false)}
          ></div>

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 max-w-3xl w-full max-h-[85vh] overflow-hidden pointer-events-auto animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del Modal */}
              <div className="relative px-6 py-5 border-b border-white/10 bg-gradient-to-r from-red-900/20 via-red-800/10 to-transparent">
                <div className="flex items-center gap-3">
                  {/* Ícono Psi */}
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 via-red-600/10 to-transparent border border-red-500/30 flex items-center justify-center backdrop-blur-sm shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                    <span className="text-red-400 text-2xl font-serif font-bold drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)]">Ψ</span>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">Atención de Psicología</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Sistema de Atención Psicológica Túpac Amaru</p>
                  </div>

                  {/* Botón cerrar */}
                  <button
                    onClick={() => setShowPsychologyModal(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenido del Modal */}
              <div className="px-6 py-5 overflow-y-auto max-h-[calc(85vh-80px)] custom-scrollbar">
                {/* Descripción */}
                <div className="mb-6">
                  <p className="text-slate-300 leading-relaxed text-sm">
                    El área de Psicología desarrolla programas de tutoría, consejería y asesoramiento personal y académico a todos los estudiantes de la institución durante su proceso formativo, así como el acompañamiento emocional y orientación a padres de familia.
                  </p>
                </div>

                {/* Funciones */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
                    Funciones
                  </h3>

                  <ul className="space-y-3">
                    <li className="flex gap-3 text-sm text-slate-300">
                      <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                      <span>Ejecutar las políticas y normas establecidas, en el ámbito de su competencia funcional.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-300">
                      <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                      <span>Proponer el plan de trabajo de los programas de servicios de asistencia y consultoría psicológica, establecidos por la Dirección.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-300">
                      <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                      <span>Implementar los programas de servicios de asistencia, consejería y tratamiento psicológico para los estudiantes.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-300">
                      <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                      <span>Brindar orientación y consejería psicológica a los estudiantes, docentes y personal administrativo de la Institución.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-300">
                      <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                      <span>Realizar estudios psicopedagógicos en la población estudiantil, a fin de identificar los principales problemas y causas que originan el bajo rendimiento de los estudiantes.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-300">
                      <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                      <span>Proponer e implementar programas preventivos promocionales y de tratamiento en salud mental, de acuerdo con un diagnóstico psicopedagógico del estudiante.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-300">
                      <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                      <span>Ejecutar los programas preventivos promocionales en salud mental programados para la comunidad del Instituto.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-300">
                      <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                      <span>Desarrollar programas de terapias individuales o grupales.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-300">
                      <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                      <span>Desarrollar talleres de asistencia y apoyo para estudiantes de bajo rendimiento; estudiando las causas que originan su bajo desempeño académico.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-300">
                      <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                      <span>Realizar campañas relacionadas con la salud mental y el bienestar de la comunidad del Instituto.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-300">
                      <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                      <span>Diagnosticar, tratar y realizar el seguimiento de casos individuales de estudiantes con problemas de salud de carácter psicológico.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-300">
                      <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                      <span>Elaborar informes individuales o grupales sobre las evaluaciones y tratamientos.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-300">
                      <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                      <span>Desempeñar las demás funciones afines que le asigne el Jefe del Servicio Atención Integral a la Persona Humana, en el ámbito de su competencia.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )
      }
    </header >
  );
}