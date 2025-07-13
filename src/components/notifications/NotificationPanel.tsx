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

interface NotificationPanelProps {
  onClose: () => void;
  onNotificationUpdate: () => void;
}

export function NotificationPanel({ onClose, onNotificationUpdate }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'appointment':
        return <Bell className="w-4 h-4 text-blue-500" />;
      case 'reminder':
        return <Bell className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
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
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8e161a]" />
        <p className="text-sm text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header con acciones */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-[#8e161a]" />
          <span className="text-sm font-medium text-gray-900">
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
          </span>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs text-[#8e161a] hover:bg-[#8e161a] hover:text-white"
          >
            Marcar todas
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
          {error}
        </div>
      )}

      {/* Lista de notificaciones */}
      {notifications.length === 0 ? (
        <div className="text-center py-6">
          <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No tienes notificaciones</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {notifications.slice(0, 10).map((notification) => (
            <div 
              key={notification.id}
              className={`p-3 border rounded-lg transition-all duration-200 ${
                notification.read_at 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start space-x-2">
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </h4>
                    {!notification.read_at && (
                      <Badge variant="warning" className="text-xs px-1 py-0">
                        Nueva
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
                <div className="flex space-x-1 ml-2">
                  {!notification.read_at && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-1 h-6 w-6"
                      title="Marcar como leída"
                    >
                      <CheckCircle className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="p-1 h-6 w-6 text-red-600 hover:bg-red-50"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {notifications.length > 10 && (
            <div className="text-center py-2">
              <p className="text-xs text-gray-500">
                Y {notifications.length - 10} notificaciones más...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="w-full text-xs"
        >
          Ver todas las notificaciones
        </Button>
      </div>
    </div>
  );
} 