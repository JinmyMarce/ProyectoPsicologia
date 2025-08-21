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

interface NotificationPanelProps {
  onClose: () => void;
  onNotificationUpdate: () => void;
}

export function NotificationPanel({ onClose, onNotificationUpdate }: NotificationPanelProps) {
  const navigate = useNavigate();
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
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8e161a]" />
        <p className="text-sm text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-0">
      {/* Contador de notificaciones */}
      <div className="px-4 py-3 border-b bg-gray-50" style={{
        borderColor: '#e5e7eb'
      }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {unreadCount > 0 ? `${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer` : 'Todas las notificaciones leídas'}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-medium px-2 py-1 rounded border transition-colors"
              style={{
                background: '#0a0f14', // Azul super oscuro
                color: 'white',
                borderColor: '#0a0f14'
              }}
            >
              Marcar todas
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Lista de notificaciones */}
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: '#0a0f14' }} /> {/* Azul super oscuro */}
          <p className="text-sm font-medium text-gray-500">
            No tienes notificaciones
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Las notificaciones aparecerán aquí cuando las recibas
          </p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {notifications.slice(0, 10).map((notification) => (
            <div 
              key={notification.id}
              className={`border-b last:border-b-0 ${
                notification.read_at ? 'bg-white' : 'bg-blue-50'
              }`}
              style={{
                borderColor: '#f3f4f6'
              }}
            >
              <div className="px-4 py-3">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`text-sm font-medium truncate ${
                            notification.read_at ? 'text-gray-900' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read_at && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{
                              background: '#1a0f14',
                              color: 'white'
                            }}>
                              Nueva
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.created_at)}
                          </span>
                          <div className="flex space-x-1">
                            {!notification.read_at && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Marcar como leída"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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
            <div className="px-4 py-3 bg-gray-50 border-t" style={{
              borderColor: '#e5e7eb'
            }}>
              <p className="text-xs text-gray-500 text-center">
                Y {notifications.length - 10} notificación{notifications.length - 10 > 1 ? 'es' : ''} más...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer con botón de ver todas */}
      <div className="px-4 py-3 border-t" style={{
        background: '#0a0f14',
        borderColor: '#1a0f14'
      }}>
        <button
          onClick={() => { onClose(); navigate('/notifications'); }}
          className="w-full py-2 px-4 rounded text-sm font-medium transition-colors"
          style={{
            background: '#1a2332', // Azul oscuro que combina
            color: 'white',
            border: '1px solid #1a2332'
          }}
        >
          Ver todas las notificaciones
        </button>
      </div>
    </div>
  );
} 