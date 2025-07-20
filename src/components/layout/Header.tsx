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

export function Header({ onMenuClick, notifications = 0 }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(notifications);
  const [loading, setLoading] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
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
        setError(null);
        const [notificationStats, messageStats] = await Promise.all([
          getNotificationStats(),
          messageService.getStats()
        ]);
        setNotificationCount((notificationStats.unread as number) || 0);
        setMessageCount((messageStats.data.unread as number) || 0);
        // Aquí podrías cargar notificaciones reales si tienes endpoint
        setNotificationsList([]); // Simulación: vacío
      } catch (err) {
        setError('No se pudieron cargar las notificaciones');
        setNotificationsList([]);
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
    <header className="bg-[#8e161a] text-white shadow-lg border-b border-[#6e1014] sticky top-0 z-50 h-[72px] md:h-[88px] flex items-center">
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
          <h1 className="font-extrabold text-xl md:text-2xl tracking-wide whitespace-nowrap ml-0 pl-0">
            Portal Psicológico Tupac Amaru
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            {(user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'psychologist' || user?.role === 'student') && (
              <div className="relative" ref={notificationRef}>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-[#7a1417] focus:bg-[#7a1417] relative rounded-md p-3"
                  onClick={() => setShowNotifications((v) => !v)}
                  aria-label="Notificaciones"
                >
                  <Bell className="w-5 h-5" />
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
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-hidden animate-fade-in">
                    <NotificationPanel 
                      onClose={() => setShowNotifications(false)} 
                      onNotificationUpdate={() => {}} 
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-5 pr-4">
            {/* Nombre de usuario y avatar aquí */}
            <div className="hidden sm:block text-right mr-3">
              <p className="text-white font-semibold text-base">
                {user?.name}
              </p>
              <p className="text-gray-200 text-xs">
                {getRoleDisplayName(user?.role || '')}
              </p>
            </div>
            {/* Icono de usuario más separado del borde */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#7a1417] cursor-pointer relative group ml-2" onClick={() => setShowUserMenu((v) => !v)}>
              <User className="w-5 h-5 text-white" />
              {/* Menú desplegable */}
              {showUserMenu && (
                <div className="absolute right-0 top-14 min-w-[180px] bg-white text-gray-900 rounded-xl shadow-2xl border-2 border-[#8e161a] z-50 animate-fade-in overflow-hidden">
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