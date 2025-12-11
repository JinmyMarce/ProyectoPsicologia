import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Trash2, 
  Eye,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification
} from '../../services/notifications';
import { Notification } from '../../services/notifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationPanelProps {
  onClose: () => void;
  onNotificationUpdate: () => void;
}

export function NotificationPanel({ onClose, onNotificationUpdate }: NotificationPanelProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Determinar el rol del usuario
  const userRole = user?.role || 'student';
  
  // Sistema de estilos por rol para el panel
  const getRoleStyles = () => {
    switch (userRole) {
      case 'psychologist':
        return {
          headerBg: 'bg-[#02040a]',
          headerBorder: 'border-white/10',
          headerText: 'text-white',
          buttonBg: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
          notificationUnread: 'bg-white/5 border-white/10',
          notificationRead: 'bg-transparent border-white/5',
          iconBg: 'bg-white/10 border-white/20',
          iconColor: 'text-slate-400',
          badgeNew: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          textTitle: 'text-white',
          textMessage: 'text-slate-300',
          textDate: 'text-slate-500',
          footerBg: 'bg-[#02040a]',
          footerButton: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
          emptyIcon: 'text-slate-600',
          errorBg: 'bg-red-950/50 border-red-900/50 text-red-200'
        };
      case 'super_admin':
        return {
          headerBg: 'bg-gradient-to-r from-red-950 to-black',
          headerBorder: 'border-red-900',
          headerText: 'text-red-100',
          buttonBg: 'bg-red-900 hover:bg-red-800 text-red-100 border-red-800',
          notificationUnread: 'bg-red-950/30 border-red-900/50',
          notificationRead: 'bg-slate-900 border-slate-800',
          iconBg: 'bg-red-900/30 border-red-800/30',
          iconColor: 'text-red-400',
          badgeNew: 'bg-red-900/50 text-red-200 border-red-800/50',
          textTitle: 'text-red-100',
          textMessage: 'text-red-200/80',
          textDate: 'text-red-300/60',
          footerBg: 'bg-gradient-to-r from-red-900 to-black',
          footerButton: 'bg-red-800 hover:bg-red-700 text-red-100 border-red-700',
          emptyIcon: 'text-red-500',
          errorBg: 'bg-red-950 border-red-900 text-red-200'
        };
      case 'admin':
        return {
          headerBg: 'bg-gradient-to-r from-blue-900 to-indigo-900',
          headerBorder: 'border-blue-800',
          headerText: 'text-blue-100',
          buttonBg: 'bg-blue-800 hover:bg-blue-700 text-blue-100 border-blue-700',
          notificationUnread: 'bg-blue-950/30 border-blue-800/50',
          notificationRead: 'bg-slate-800 border-slate-700',
          iconBg: 'bg-blue-800/30 border-blue-700/30',
          iconColor: 'text-blue-300',
          badgeNew: 'bg-blue-800/50 text-blue-200 border-blue-700/50',
          textTitle: 'text-blue-100',
          textMessage: 'text-blue-200/80',
          textDate: 'text-blue-300/60',
          footerBg: 'bg-gradient-to-r from-blue-800 to-indigo-800',
          footerButton: 'bg-blue-700 hover:bg-blue-600 text-blue-100 border-blue-600',
          emptyIcon: 'text-blue-500',
          errorBg: 'bg-red-950 border-red-900 text-red-200'
        };
      case 'tutor':
        return {
          headerBg: 'bg-gradient-to-r from-gray-800 to-slate-800',
          headerBorder: 'border-gray-700',
          headerText: 'text-gray-100',
          buttonBg: 'bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600',
          notificationUnread: 'bg-gray-800/30 border-gray-700/50',
          notificationRead: 'bg-slate-800 border-slate-700',
          iconBg: 'bg-gray-700/30 border-gray-600/30',
          iconColor: 'text-gray-300',
          badgeNew: 'bg-gray-700/50 text-gray-200 border-gray-600/50',
          textTitle: 'text-gray-100',
          textMessage: 'text-gray-200/80',
          textDate: 'text-gray-300/60',
          footerBg: 'bg-gradient-to-r from-gray-700 to-slate-700',
          footerButton: 'bg-gray-600 hover:bg-gray-500 text-gray-100 border-gray-500',
          emptyIcon: 'text-gray-500',
          errorBg: 'bg-red-950 border-red-900 text-red-200'
        };
      case 'student':
      default:
        return {
          headerBg: 'bg-[#02040a]',
          headerBorder: 'border-white/10',
          headerText: 'text-white',
          buttonBg: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
          notificationUnread: 'bg-white/5 border-white/10',
          notificationRead: 'bg-transparent border-white/5',
          iconBg: 'bg-white/10 border-white/20',
          iconColor: 'text-slate-400',
          badgeNew: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          textTitle: 'text-white',
          textMessage: 'text-slate-300',
          textDate: 'text-slate-500',
          footerBg: 'bg-[#02040a]',
          footerButton: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
          emptyIcon: 'text-slate-600',
          errorBg: 'bg-red-950/50 border-red-900/50 text-red-200'
        };
    }
  };
  
  const roleStyles = getRoleStyles();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getNotifications();
      setNotifications(data);
    } catch (error: unknown) {
      console.error('Error loading notifications:', error);
      setError('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read_at: new Date().toISOString() } : notif
        )
      );
      onNotificationUpdate();
    } catch (error: unknown) {
      console.error('Error marking notification as read:', error);
      setError('Error al marcar como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
      );
      onNotificationUpdate();
    } catch (error: unknown) {
      console.error('Error marking all notifications as read:', error);
      setError('Error al marcar todas como leídas');
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      onNotificationUpdate();
    } catch (error: unknown) {
      console.error('Error deleting notification:', error);
      setError('Error al eliminar la notificación');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'appointment':
        return <Bell className="w-4 h-4 text-blue-600" />;
      case 'reminder':
        return <Bell className="w-4 h-4 text-yellow-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'success':
        return 'Éxito';
      case 'warning':
        return 'Advertencia';
      case 'error':
        return 'Error';
      case 'appointment':
        return 'Cita';
      case 'reminder':
        return 'Recordatorio';
      case 'info':
        return 'Información';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className={`w-6 h-6 animate-spin mx-auto mb-2 ${roleStyles.emptyIcon}`} />
        <p className={`text-xs font-bold ${roleStyles.textMessage}`}>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full sm:max-h-[450px] w-full">
      {/* Contador de notificaciones con estilos por rol - Compacto */}
      <div className={`px-3 py-2 border-b flex-shrink-0 ${roleStyles.headerBg} border-b ${roleStyles.headerBorder}`}>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-bold ${roleStyles.headerText} leading-tight flex-1`}>
            {unreadCount > 0 ? `${unreadCount} nueva${unreadCount > 1 ? 's' : ''}` : 'Sin notificaciones'}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all duration-200 whitespace-nowrap flex-shrink-0 ${roleStyles.buttonBg}`}
            >
              Leer todas
            </button>
          )}
        </div>
      </div>

      {/* Error con estilos por rol */}
      {error && (
        <div className={`mx-3 mt-2 p-2 ${roleStyles.errorBg} border rounded-md text-[10px]`}>
          <div className="flex items-center space-x-1.5">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        </div>
      )}

      {/* Lista de notificaciones con estilos por rol */}
      {notifications.length === 0 ? (
        <div className="text-center py-8 px-3">
          <Bell className={`w-10 h-10 mx-auto mb-2 ${roleStyles.emptyIcon}`} />
          <p className={`text-xs font-bold ${roleStyles.textMessage}`}>
            Sin notificaciones
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {notifications.slice(0, 10).map((notification) => (
            <div 
              key={notification.id}
              className={`border-b last:border-b-0 transition-colors ${
                notification.read_at ? roleStyles.notificationRead : roleStyles.notificationUnread
              } hover:bg-white/10 cursor-pointer`}
              onClick={async () => {
                if (!notification.read_at) {
                  await handleMarkAsRead(notification.id);
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
                onClose();
                navigate('/notifications', { state: { openNotificationId: notification.id } });
              }}
            >
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className={`flex-shrink-0 p-1 rounded ${roleStyles.iconBg}`}>
                    <div className={roleStyles.iconColor}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className={`text-xs font-bold ${roleStyles.textTitle} line-clamp-1 flex-1`}>
                        {notification.title}
                      </h4>
                      {!notification.read_at && (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${roleStyles.badgeNew} flex-shrink-0 uppercase tracking-wide`}>
                          Nueva
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] ${roleStyles.textDate} block mt-0.5`}>
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                    className={`p-1 ${roleStyles.textDate} hover:text-red-400 transition-colors flex-shrink-0`}
                    title="Eliminar"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {notifications.length > 10 && (
            <div className={`px-3 py-2 ${roleStyles.headerBg} border-t ${roleStyles.headerBorder}`}>
              <p className={`text-[10px] ${roleStyles.textDate} text-center`}>
                +{notifications.length - 10} más
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer con botón de ver todas - estilos por rol */}
      <div className={`px-3 py-2 border-t flex-shrink-0 ${roleStyles.footerBg} ${roleStyles.headerBorder}`}>
        <button
          onClick={() => { onClose(); navigate('/notifications'); }}
          className={`w-full py-2 px-3 rounded-md text-xs font-bold transition-all duration-200 border ${roleStyles.footerButton}`}
        >
          Ver todas
        </button>
      </div>
    </div>
  );
} 