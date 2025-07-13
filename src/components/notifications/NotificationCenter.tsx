import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Trash2, 
  Eye, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PageHeader } from '../ui/PageHeader';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats
} from '../../services/notifications';
import { approveAppointment, rejectAppointment } from '../../services/appointments';
import { Notification } from '../../services/notifications';

interface NotificationStats {
  total: number;
  read: number;
  unread: number;
  by_type: {
    appointment: number;
    reminder: number;
    status: number;
    system: number;
  };
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Cargando notificaciones...');
      const data = await getNotifications();
      console.log('📦 Notificaciones recibidas:', data);
      setNotifications(data);
    } catch (error: unknown) {
      console.error('❌ Error loading notifications:', error);
      setError('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getNotificationStats();
      setStats((data as unknown) as NotificationStats);
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    await loadStats();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read_at: new Date().toISOString() } : notif
        )
      );
      await loadStats(); // Recargar estadísticas
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
      await loadStats(); // Recargar estadísticas
    } catch (error: unknown) {
      console.error('Error marking all notifications as read:', error);
      setError('Error al marcar todas como leídas');
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      await loadStats(); // Recargar estadísticas
    } catch (error: unknown) {
      console.error('Error deleting notification:', error);
      setError('Error al eliminar la notificación');
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
      return;
    }

    try {
      await deleteAllNotifications();
      setNotifications([]);
      await loadStats(); // Recargar estadísticas
    } catch (error: unknown) {
      console.error('Error deleting all notifications:', error);
      setError('Error al eliminar todas las notificaciones');
    }
  };

  const handleViewNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowNotificationDetails(true);
    
    // Marcar como leída si no lo está
    if (!notification.read_at) {
      handleMarkAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'appointment':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#8e161a]" />
          <p className="text-gray-600">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Centro de Notificaciones"
        subtitle="Gestiona tus notificaciones"
      >
        <div className="flex items-center justify-between">
          <p className="text-base text-gray-500 font-medium text-center">
            Instituto Túpac Amaru - Psicología Clínica
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="ml-4"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </PageHeader>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
            <div className="text-sm text-gray-600">Total</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            <div className="text-sm text-gray-600">No leídas</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.read || 0}</div>
            <div className="text-sm text-gray-600">Leídas</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.by_type?.appointment || 0}</div>
            <div className="text-sm text-gray-600">Citas</div>
          </Card>
        </div>
      )}

      {/* Acciones */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-[#8e161a]" />
            Notificaciones ({notifications.length})
          </h2>
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAllNotifications}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar todas
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 border rounded-lg transition-all duration-200 ${
                  notification.read_at 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        {!notification.read_at && (
                          <Badge variant="warning" className="text-xs">
                            Nueva
                          </Badge>
                        )}
                        <Badge variant="default" className="text-xs">
                          {getNotificationTypeText(notification.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewNotificationDetails(notification)}
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {!notification.read_at && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Marcar como leída"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      title="Eliminar"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de detalles de notificación */}
      {showNotificationDetails && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Detalles de la Notificación</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotificationDetails(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {getNotificationIcon(selectedNotification.type)}
                <Badge variant="default">
                  {getNotificationTypeText(selectedNotification.type)}
                </Badge>
                {!selectedNotification.read_at && (
                  <Badge variant="warning">Nueva</Badge>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Título</p>
                <p className="text-base font-semibold text-gray-900">{selectedNotification.title}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Mensaje</p>
                <p className="text-base text-gray-900">{selectedNotification.message}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha</p>
                <p className="text-base text-gray-900">{formatDate(selectedNotification.created_at)}</p>
              </div>
              
              {selectedNotification.data && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Datos adicionales</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowNotificationDetails(false)}
              >
                Cerrar
              </Button>
              {!selectedNotification.read_at && (
                <Button
                  onClick={() => {
                    handleMarkAsRead(selectedNotification.id);
                    setShowNotificationDetails(false);
                  }}
                >
                  Marcar como leída
                </Button>
              )}
              {/* Botones de aprobar/rechazar solo para notificaciones de cita */}
              {selectedNotification.type === 'appointment' && selectedNotification.data && typeof (selectedNotification.data as any).appointment_id === 'number' && (
                <React.Fragment>
                  <Button
                    variant="primary"
                    onClick={async () => {
                      try {
                        await approveAppointment(Number((selectedNotification.data as any).appointment_id));
                        setShowNotificationDetails(false);
                        handleRefresh();
                      } catch (e) {
                        setError('Error al aprobar la cita');
                      }
                    }}
                  >
                    Aprobar cita
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowRejectForm(true)}
                  >
                    Rechazar cita
                  </Button>
                </React.Fragment>
              )}
            </div>
            {/* Formulario para rechazar cita */}
            {showRejectForm && selectedNotification.type === 'appointment' && selectedNotification.data && typeof (selectedNotification.data as any).appointment_id === 'number' && (
              <div className="mt-4">
                <textarea
                  className="w-full border rounded p-2 mb-2"
                  placeholder="Motivo del rechazo"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowRejectForm(false)}>Cancelar</Button>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      try {
                        await rejectAppointment(Number((selectedNotification.data as any).appointment_id), rejectReason);
                        setShowRejectForm(false);
                        setShowNotificationDetails(false);
                        handleRefresh();
                      } catch (e) {
                        setError('Error al rechazar la cita');
                      }
                    }}
                    disabled={!rejectReason.trim()}
                  >
                    Confirmar rechazo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}