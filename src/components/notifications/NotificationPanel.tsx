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
          headerBg: 'bg-gradient-to-r from-cyan-50 to-sky-50',
          headerBorder: 'border-cyan-200',
          headerText: 'text-cyan-800',
          buttonBg: 'bg-cyan-100 hover:bg-cyan-200 text-cyan-900 border-cyan-300',
          notificationUnread: 'bg-cyan-50/80 border-cyan-100',
          notificationRead: 'bg-white border-cyan-50',
          iconBg: 'bg-cyan-100 border-cyan-200',
          iconColor: 'text-cyan-700',
          badgeNew: 'bg-cyan-200 text-cyan-900 border-cyan-300',
          textTitle: 'text-cyan-900',
          textMessage: 'text-cyan-700',
          textDate: 'text-cyan-600',
          footerBg: 'bg-gradient-to-r from-cyan-200 to-sky-200',
          footerButton: 'bg-cyan-300 hover:bg-cyan-400 text-cyan-900 border-cyan-400',
          emptyIcon: 'text-cyan-500',
          errorBg: 'bg-red-50 border-red-200 text-red-700'
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
          headerBg: 'bg-gradient-to-r from-slate-800 to-slate-900',
          headerBorder: 'border-slate-700',
          headerText: 'text-slate-100',
          buttonBg: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600',
          notificationUnread: 'bg-violet-950/30 border-violet-800/50',
          notificationRead: 'bg-slate-800 border-slate-700',
          iconBg: 'bg-violet-800/30 border-violet-700/30',
          iconColor: 'text-violet-300',
          badgeNew: 'bg-violet-800/50 text-violet-200 border-violet-700/50',
          textTitle: 'text-slate-100',
          textMessage: 'text-slate-200/80',
          textDate: 'text-slate-300/60',
          footerBg: 'bg-gradient-to-r from-slate-700 to-slate-800',
          footerButton: 'bg-slate-600 hover:bg-slate-500 text-slate-100 border-slate-500',
          emptyIcon: 'text-violet-500',
          errorBg: 'bg-red-950 border-red-900 text-red-200'
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
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  if (loading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className={`w-6 h-6 animate-spin mx-auto mb-2 ${roleStyles.emptyIcon}`} />
        <p className={`text-sm ${roleStyles.textMessage}`}>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-0">
      {/* Contador de notificaciones con estilos por rol */}
      <div className={`px-4 py-3 border-b ${roleStyles.headerBg} border-b ${roleStyles.headerBorder}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${roleStyles.headerText}`}>
            {unreadCount > 0 ? `${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer` : 'Todas las notificaciones leídas'}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className={`text-xs font-medium px-2 py-1 rounded border transition-colors ${roleStyles.buttonBg}`}
            >
              Marcar todas
            </button>
          )}
        </div>
      </div>

      {/* Error con estilos por rol */}
      {error && (
        <div className={`mx-4 mt-3 p-3 ${roleStyles.errorBg} border rounded text-xs`}>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Lista de notificaciones con estilos por rol */}
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className={`w-12 h-12 mx-auto mb-3 ${roleStyles.emptyIcon}`} />
          <p className={`text-sm font-medium ${roleStyles.textMessage}`}>
            No tienes notificaciones
          </p>
          <p className={`text-xs ${roleStyles.textDate} mt-1`}>
            Las notificaciones aparecerán aquí cuando las recibas
          </p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {notifications.slice(0, 10).map((notification) => (
            <div 
              key={notification.id}
              className={`border-b last:border-b-0 ${
                notification.read_at ? roleStyles.notificationRead : roleStyles.notificationUnread
              }`}
            >
              <div className="px-4 py-3">
                <div className="flex items-start space-x-3">
                  <div className={`mt-0.5 flex-shrink-0 p-1.5 rounded ${roleStyles.iconBg} border`}>
                    <div className={roleStyles.iconColor}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`text-sm font-medium truncate ${roleStyles.textTitle}`}>
                            {notification.title}
                          </h4>
                          {!notification.read_at && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${roleStyles.badgeNew}`}>
                              Nueva
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${roleStyles.textMessage} mt-1 mb-2`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${roleStyles.textDate}`}>
                            {formatDate(notification.created_at)}
                          </span>
                          <div className="flex space-x-1">
                            {!notification.read_at && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className={`p-1 ${roleStyles.textDate} transition-colors hover:opacity-70`}
                                title="Marcar como leída"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className={`p-1 ${roleStyles.textDate} hover:text-red-600 transition-colors`}
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {notifications.length > 10 && (
            <div className={`px-4 py-3 ${roleStyles.headerBg} border-t ${roleStyles.headerBorder}`}>
              <p className={`text-xs ${roleStyles.textDate} text-center`}>
                Y {notifications.length - 10} notificación{notifications.length - 10 > 1 ? 'es' : ''} más...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer con botón de ver todas - estilos por rol */}
      <div className={`px-4 py-3 border-t ${roleStyles.footerBg} ${roleStyles.headerBorder}`}>
        <button
          onClick={() => { onClose(); navigate('/notifications'); }}
          className={`w-full py-2 px-4 rounded text-sm font-medium transition-colors border ${roleStyles.footerButton}`}
        >
          Ver todas las notificaciones
        </button>
      </div>
    </div>
  );
} 