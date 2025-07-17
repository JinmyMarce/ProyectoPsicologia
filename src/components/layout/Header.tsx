import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, User, LogOut, Settings, X, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getNotificationStats } from '../../services/notifications';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { messageService } from '../../services/messages';
import MessagePanel from '../messages/MessagePanel';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
  notifications?: number;
}

export function Header({ onMenuClick, notifications = 3 }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(notifications);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Estados para mensajes
  const [showMessages, setShowMessages] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const messageRef = useRef<HTMLDivElement>(null);

  // Estados para el menú de usuario
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cargar estadísticas de notificaciones y mensajes
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [notificationStats, messageStats] = await Promise.all([
          getNotificationStats(),
          messageService.getStats()
        ]);
        setNotificationCount((notificationStats.unread as number) || 0);
        setMessageCount((messageStats.data.unread as number) || 0);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
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
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setShowMessages(false);
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
      default:
        return role;
    }
  };

  return (
    <header className="bg-[#8e161a] text-white shadow-lg border-b border-[#6e1014] sticky top-0 z-50 h-20 md:h-24 flex items-center">
      <div className="flex items-center justify-between px-0 h-full max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-4 pl-0">
          <Button
            variant="ghost"
            size="lg"
            onClick={onMenuClick}
            className="text-white hover:bg-[#7a1417] focus:bg-[#7a1417] rounded-md p-3 transition lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="w-9 h-9" />
          </Button>
          <h1 className="font-extrabold text-2xl md:text-3xl tracking-wide whitespace-nowrap ml-0 pl-0">
            Sistema de Gestión de Citas
          </h1>
        </div>
        <div className="flex items-center space-x-4 pr-0 ml-auto">
          {/* Mensajes (solo para psicólogos) */}
          {user?.role === 'psychologist' && (
            <div className="relative" ref={messageRef}>
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-[#7a1417] focus:bg-[#7a1417] relative rounded-md p-3"
                onClick={() => setShowMessages(!showMessages)}
                aria-label="Mensajes"
              >
                <Mail className="w-7 h-7" />
                {messageCount > 0 && (
                  <Badge 
                    variant="danger" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs shadow"
                  >
                    {messageCount > 9 ? '9+' : messageCount}
                  </Badge>
                )}
              </Button>
              {showMessages && (
                <MessagePanel 
                  isOpen={showMessages}
                  onClose={() => setShowMessages(false)}
                />
              )}
            </div>
          )}
          {/* Notificaciones */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-[#7a1417] focus:bg-[#7a1417] relative rounded-md p-3"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notificaciones"
            >
              <Bell className="w-7 h-7" />
              {notificationCount > 0 && (
                <Badge 
                  variant="danger" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs shadow"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Cerrar notificaciones"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8e161a] mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Cargando...</p>
                    </div>
                  ) : (
                    <NotificationPanel 
                      onClose={() => setShowNotifications(false)}
                      onNotificationUpdate={() => {
                        const loadStats = async () => {
                          try {
                            const stats = await getNotificationStats();
                            setNotificationCount((stats.unread as number) || 0);
                          } catch (error) {
                            console.error('Error reloading stats:', error);
                          }
                        };
                        loadStats();
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Usuario */}
          <div className="flex items-center space-x-3 relative">
            <div className="hidden sm:block text-right">
              <p className="text-white font-semibold text-base">
                {user?.name}
              </p>
              <p className="text-gray-200 text-xs">
                {getRoleDisplayName(user?.role || '')}
              </p>
            </div>
            {/* Menú de usuario */}
            <div ref={userMenuRef} className="flex items-center justify-center w-12 h-12 rounded-full bg-[#7a1417] cursor-pointer relative group" onClick={() => setShowUserMenu((v) => !v)}>
              <User className="w-7 h-7 text-white" />
              {/* Menú desplegable */}
              {showUserMenu && (
                <div className="absolute right-0 top-14 min-w-[180px] bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 z-50 animate-fade-in overflow-hidden">
                  <button
                    className="w-full text-left px-5 py-3 hover:bg-gray-100 text-base font-medium border-b border-gray-200 flex items-center gap-2"
                    onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                  >
                    <User className="w-5 h-5 text-[#8e161a]" />
                    Mi perfil
                  </button>
                  <button
                    className="w-full text-left px-5 py-3 hover:bg-gray-100 text-base font-medium flex items-center gap-2"
                    onClick={logout}
                  >
                    <LogOut className="w-5 h-5 text-[#8e161a]" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}