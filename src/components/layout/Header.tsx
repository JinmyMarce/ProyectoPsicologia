import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, User, LogOut, Settings, X, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getNotificationStats } from '../../services/notifications';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { messageService } from '../../services/messages';
import MessagePanel from '../messages/MessagePanel';

interface HeaderProps {
  onMenuClick: () => void;
  notifications?: number;
}

export function Header({ onMenuClick, notifications = 3 }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(notifications);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Estados para mensajes
  const [showMessages, setShowMessages] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const messageRef = useRef<HTMLDivElement>(null);

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
    <header className="bg-granate text-blanco shadow-sm border-b border-gris-medio">
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </Button>
          
          <h1 className="text-blanco font-bold text-lg hidden sm:block">
            Sistema de Gestión de Citas
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mensajes (solo para psicólogos) */}
          {user?.role === 'psychologist' && (
            <div className="relative" ref={messageRef}>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100 relative"
                onClick={() => setShowMessages(!showMessages)}
              >
                <Mail className="w-5 h-5" />
                {messageCount > 0 && (
                  <Badge 
                    variant="danger" 
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {messageCount > 9 ? '9+' : messageCount}
                  </Badge>
                )}
              </Button>

              {/* Panel de Mensajes */}
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
              size="sm"
              className="text-gray-600 hover:bg-gray-100 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge 
                  variant="danger" 
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>

            {/* Panel de Notificaciones */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-500 hover:text-gray-700"
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
                        // Recargar estadísticas cuando se actualice una notificación
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
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-gray-800 font-semibold text-sm">
                {user?.name}
              </p>
              <p className="text-gray-500 text-xs">
                {getRoleDisplayName(user?.role || '')}
              </p>
            </div>
            
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100 rounded-full w-9 h-9"
              >
                <User className="w-5 h-5" />
              </Button>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Configuración</span>
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}