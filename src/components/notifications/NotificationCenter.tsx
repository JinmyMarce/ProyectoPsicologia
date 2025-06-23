import React, { useState, useEffect } from 'react';
import { Notification } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Calendar,
  Trash2,
  Check,
  X,
  Loader2
} from 'lucide-react';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de notificaciones (en un caso real, harías una llamada a la API)
      const mockNotifications: Notification[] = [
        {
          id: '1',
          userId: '1',
          type: 'appointment',
          title: 'Nueva cita confirmada',
          message: 'Tu cita con Dr. Ana García ha sido confirmada para mañana a las 10:00',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutos atrás
        },
        {
          id: '2',
          userId: '1',
          type: 'reminder',
          title: 'Recordatorio de cita',
          message: 'Tienes una cita programada en 2 horas con Dr. Luis Mendoza',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 horas atrás
        },
        {
          id: '3',
          userId: '1',
          type: 'status',
          title: 'Cita completada',
          message: 'Tu sesión con Dr. Carmen Silva ha sido marcada como completada',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 día atrás
        },
        {
          id: '4',
          userId: '1',
          type: 'system',
          title: 'Mantenimiento programado',
          message: 'El sistema estará en mantenimiento el próximo domingo de 2:00 a 4:00 AM',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 días atrás
        },
        {
          id: '5',
          userId: '1',
          type: 'appointment',
          title: 'Cita cancelada',
          message: 'Tu cita con Dr. Ana García ha sido cancelada',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 días atrás
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error: any) {
      setError('Error al cargar las notificaciones');
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error: any) {
      setError('Error al marcar como leída');
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error: any) {
      setError('Error al marcar todas como leídas');
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      return;
    }

    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error: any) {
      setError('Error al eliminar la notificación');
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
      return;
    }

    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications([]);
    } catch (error: any) {
      setError('Error al eliminar todas las notificaciones');
      console.error('Error clearing all notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'status':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Badge variant="info">Cita</Badge>;
      case 'reminder':
        return <Badge variant="warning">Recordatorio</Badge>;
      case 'status':
        return <Badge variant="success">Estado</Badge>;
      case 'system':
        return <Badge variant="default">Sistema</Badge>;
      default:
        return <Badge variant="default">General</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Ahora mismo';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Centro de Notificaciones</h1>
        <p className="text-gray-600">Gestiona todas tus notificaciones</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Controles */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {unreadCount} no leída{unreadCount !== 1 ? 's' : ''}
              </span>
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              <option value="unread">No leídas</option>
              <option value="read">Leídas</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              disabled={unreadCount === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              Marcar todas como leídas
            </Button>
            
            <Button
              onClick={clearAllNotifications}
              variant="outline"
              size="sm"
              disabled={notifications.length === 0}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar todo
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de notificaciones */}
      {filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {notifications.length === 0 ? 'No tienes notificaciones' : 'No hay notificaciones con este filtro'}
          </h3>
          <p className="text-gray-600">
            {notifications.length === 0 
              ? 'Cuando recibas notificaciones, aparecerán aquí.'
              : 'Intenta cambiar el filtro para ver más notificaciones.'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`p-4 transition-all hover:shadow-md ${
                !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icono */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      {getNotificationBadge(notification.type)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                      
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {notification.message}
                  </p>
                  
                  <div className="flex gap-2">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Marcar como leída
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Estadísticas */}
      {notifications.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {notifications.length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {unreadCount}
              </div>
              <div className="text-sm text-gray-600">No leídas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.read).length}
              </div>
              <div className="text-sm text-gray-600">Leídas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {notifications.filter(n => n.type === 'appointment').length}
              </div>
              <div className="text-sm text-gray-600">Citas</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}