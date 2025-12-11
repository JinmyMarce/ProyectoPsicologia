import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Trash2, 
  Eye, 
  RefreshCw,
  Sparkles,
  User
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats
} from '../../services/notifications';
import { Notification } from '../../services/notifications';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Determinar el rol del usuario para aplicar el color correspondiente
  const userRole = user?.role || 'student';
  
  // Sistema completo de configuración de estilos por rol
  const getRoleStyles = () => {
    switch (userRole) {
      case 'psychologist':
        return {
          // Header
          header: {
            overlay: 'from-cyan-100/50 via-transparent to-sky-100/30',
            decorative1: 'from-cyan-100/50 via-sky-100/30',
            decorative2: 'from-sky-100/40',
            textColor: 'text-cyan-800',
            textColorAccent: 'text-cyan-700',
            badgeText: 'SAPTA - Psicología',
            titleColor: 'text-cyan-900',
            badgeBg: 'bg-white/70 text-cyan-700 border-cyan-300/50 hover:bg-white/80',
            buttonStyle: 'border border-cyan-300/40 text-cyan-800 hover:bg-white/20 bg-white/80 backdrop-blur-xl shadow-sm'
          },
          // Notificaciones
          notification: {
            unreadBg: 'bg-gradient-to-r from-cyan-50/80 to-sky-50/50',
            unreadBorder: 'border-cyan-200 hover:border-cyan-300',
            readBg: 'bg-white',
            readBorder: 'border-cyan-100 hover:border-cyan-200',
            iconBg: 'bg-gradient-to-br from-cyan-100 to-sky-200 border-cyan-100',
            iconColor: 'text-cyan-700',
            badgeNew: 'bg-cyan-100 text-cyan-800 border-cyan-200',
            badgeType: 'bg-sky-100 text-sky-800 border-sky-200',
            textTitle: 'text-cyan-900',
            textMessage: 'text-cyan-700',
            textDate: 'text-cyan-600'
          },
          // Estadísticas
          stats: {
            cardBg: 'bg-white',
            cardBorder: 'border-cyan-100 hover:border-cyan-200',
            iconBg: 'bg-gradient-to-br from-cyan-100 to-sky-200',
            iconColor: 'text-cyan-700',
            numberColor: 'text-cyan-900',
            labelBg: 'bg-cyan-50',
            labelText: 'text-cyan-700'
          },
          // Filtros
          filters: {
            bg: 'bg-white border-cyan-100',
            activeBg: 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white',
            inactiveBg: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
          },
          // Modal
          modal: {
            headerBg: 'bg-gradient-to-r from-cyan-500 to-sky-500',
            headerText: 'text-white',
            contentBg: 'bg-gradient-to-br from-cyan-50/50 to-sky-50/30',
            borderColor: 'border-cyan-200'
          }
        };
      case 'super_admin':
        return {
          header: {
            overlay: 'from-[#09090b]/50 via-transparent to-[#09090b]/30',
            decorative1: 'from-[#0a0e17]/10 via-[#020408]/5',
            decorative2: 'from-[#020408]/8',
            textColor: 'text-red-100',
            textColorAccent: 'text-red-200/80',
            badgeText: 'SUPER ADMIN',
            titleColor: 'text-white',
            badgeBg: 'bg-white/15 text-white border-white/20 hover:bg-white/25',
            buttonStyle: 'border border-white/20 text-white hover:bg-white/20'
          },
          notification: {
            unreadBg: 'bg-gradient-to-r from-red-950/30 to-black/50',
            unreadBorder: 'border-red-800/50 hover:border-red-700/70',
            readBg: 'bg-slate-900',
            readBorder: 'border-slate-800 hover:border-slate-700',
            iconBg: 'bg-gradient-to-br from-red-900/30 to-black/50 border-red-800/30',
            iconColor: 'text-red-400',
            badgeNew: 'bg-red-900/50 text-red-200 border-red-800/50',
            badgeType: 'bg-red-800/30 text-red-300 border-red-700/40',
            textTitle: 'text-red-100',
            textMessage: 'text-red-200/80',
            textDate: 'text-red-300/60'
          },
          stats: {
            cardBg: 'bg-slate-900',
            cardBorder: 'border-slate-800 hover:border-slate-700',
            iconBg: 'bg-gradient-to-br from-red-900/30 to-black/50',
            iconColor: 'text-red-400',
            numberColor: 'text-red-100',
            labelBg: 'bg-red-950/30',
            labelText: 'text-red-300'
          },
          filters: {
            bg: 'bg-white border-slate-200',
            activeBg: 'bg-gradient-to-r from-red-900 to-black text-white',
            inactiveBg: 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          },
          modal: {
            headerBg: 'bg-gradient-to-r from-red-900 to-black',
            headerText: 'text-white',
            contentBg: 'bg-slate-900',
            borderColor: 'border-slate-800'
          }
        };
      case 'admin':
        return {
          header: {
            overlay: 'from-blue-900/50 via-transparent to-blue-900/30',
            decorative1: 'from-blue-600/10 via-blue-500/5',
            decorative2: 'from-cyan-600/8',
            textColor: 'text-blue-100',
            textColorAccent: 'text-blue-200/80',
            badgeText: 'ADMINISTRADOR',
            titleColor: 'text-white',
            badgeBg: 'bg-white/15 text-white border-white/20 hover:bg-white/25',
            buttonStyle: 'border border-white/20 text-white hover:bg-white/20'
          },
          notification: {
            unreadBg: 'bg-gradient-to-r from-blue-950/30 to-indigo-950/50',
            unreadBorder: 'border-blue-700/50 hover:border-blue-600/70',
            readBg: 'bg-slate-800',
            readBorder: 'border-slate-700 hover:border-slate-600',
            iconBg: 'bg-gradient-to-br from-blue-800/30 to-indigo-900/50 border-blue-700/30',
            iconColor: 'text-blue-300',
            badgeNew: 'bg-blue-800/50 text-blue-200 border-blue-700/50',
            badgeType: 'bg-indigo-800/30 text-indigo-300 border-indigo-700/40',
            textTitle: 'text-blue-100',
            textMessage: 'text-blue-200/80',
            textDate: 'text-blue-300/60'
          },
          stats: {
            cardBg: 'bg-slate-800',
            cardBorder: 'border-slate-700 hover:border-slate-600',
            iconBg: 'bg-gradient-to-br from-blue-800/30 to-indigo-900/50',
            iconColor: 'text-blue-300',
            numberColor: 'text-blue-100',
            labelBg: 'bg-blue-950/30',
            labelText: 'text-blue-300'
          },
          filters: {
            bg: 'bg-white border-slate-200',
            activeBg: 'bg-gradient-to-r from-blue-900 to-blue-950 text-white',
            inactiveBg: 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          },
          modal: {
            headerBg: 'bg-gradient-to-r from-blue-700 to-indigo-700',
            headerText: 'text-white',
            contentBg: 'bg-slate-800',
            borderColor: 'border-slate-700'
          }
        };
      case 'tutor':
        return {
          header: {
            overlay: 'from-gray-800/50 via-transparent to-gray-900/30',
            decorative1: 'from-gray-600/10 via-gray-500/5',
            decorative2: 'from-slate-600/8',
            textColor: 'text-gray-100',
            textColorAccent: 'text-gray-200/80',
            badgeText: 'TUTOR',
            titleColor: 'text-white',
            badgeBg: 'bg-white/15 text-white border-white/20 hover:bg-white/25',
            buttonStyle: 'border border-white/20 text-white hover:bg-white/20'
          },
          notification: {
            unreadBg: 'bg-gradient-to-r from-gray-800/30 to-slate-900/50',
            unreadBorder: 'border-gray-700/50 hover:border-gray-600/70',
            readBg: 'bg-slate-800',
            readBorder: 'border-slate-700 hover:border-slate-600',
            iconBg: 'bg-gradient-to-br from-gray-700/30 to-slate-800/50 border-gray-600/30',
            iconColor: 'text-gray-300',
            badgeNew: 'bg-gray-700/50 text-gray-200 border-gray-600/50',
            badgeType: 'bg-slate-700/30 text-slate-300 border-slate-600/40',
            textTitle: 'text-gray-100',
            textMessage: 'text-gray-200/80',
            textDate: 'text-gray-300/60'
          },
          stats: {
            cardBg: 'bg-slate-800',
            cardBorder: 'border-slate-700 hover:border-slate-600',
            iconBg: 'bg-gradient-to-br from-gray-700/30 to-slate-800/50',
            iconColor: 'text-gray-300',
            numberColor: 'text-gray-100',
            labelBg: 'bg-gray-800/30',
            labelText: 'text-gray-300'
          },
          filters: {
            bg: 'bg-white border-slate-200',
            activeBg: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white',
            inactiveBg: 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          },
          modal: {
            headerBg: 'bg-gradient-to-r from-gray-700 to-slate-700',
            headerText: 'text-white',
            contentBg: 'bg-slate-800',
            borderColor: 'border-slate-700'
          }
        };
      case 'student':
      default:
        return {
          header: {
            overlay: 'from-slate-800/50 via-transparent to-slate-800/30',
            decorative1: 'from-slate-600/10 via-slate-500/5',
            decorative2: 'from-slate-700/8',
            textColor: 'text-slate-300',
            textColorAccent: 'text-slate-400',
            badgeText: 'SAPTA',
            titleColor: 'text-white',
            badgeBg: 'bg-white/15 text-white border-white/20 hover:bg-white/25',
            buttonStyle: 'border border-white/20 text-white hover:bg-white/20'
          },
          notification: {
            unreadBg: 'bg-white',
            unreadBorder: 'border-slate-200 hover:border-slate-300',
            readBg: 'bg-white',
            readBorder: 'border-slate-200 hover:border-slate-300',
            iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-200',
            iconColor: 'text-blue-700',
            badgeNew: 'bg-blue-50 text-blue-700 border-blue-200',
            badgeType: 'bg-slate-100 text-slate-700 border-slate-200',
            textTitle: 'text-slate-900',
            textMessage: 'text-slate-600',
            textDate: 'text-slate-500'
          },
          stats: {
            cardBg: 'bg-white',
            cardBorder: 'border-slate-200 hover:border-slate-300',
            iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200',
            iconColor: 'text-blue-700',
            numberColor: 'text-slate-900',
            labelBg: 'bg-slate-100',
            labelText: 'text-slate-600'
          },
          filters: {
            bg: 'bg-white border-slate-200',
            activeBg: 'bg-gradient-to-r from-slate-800 to-slate-900 text-white',
            inactiveBg: 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          },
          modal: {
            headerBg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
            headerText: 'text-white',
            contentBg: 'bg-white',
            borderColor: 'border-slate-200'
          }
        };
    }
  };

  const roleStyles = getRoleStyles();
  const headerConfig = roleStyles.header;

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  // Abrir modal automáticamente si viene el ID de notificación desde el header
  useEffect(() => {
    const openNotification = async () => {
      const state = location.state as { openNotificationId?: number } | null;
      if (state?.openNotificationId && notifications.length > 0) {
        const notification = notifications.find(n => n.id === state.openNotificationId);
        if (notification) {
          await handleViewNotificationDetails(notification);
          // Limpiar el state para no abrir el modal cada vez que se recargue
          navigate(location.pathname, { replace: true, state: {} });
        }
      }
    };
    openNotification();
  }, [location.state, notifications]);

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
      const readAt = new Date().toISOString();
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read_at: readAt } : notif
        )
      );
      // Actualizar también la notificación seleccionada si está abierta
      if (selectedNotification && selectedNotification.id === id) {
        setSelectedNotification({ ...selectedNotification, read_at: readAt });
      }
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

  const handleViewNotificationDetails = async (notification: Notification) => {
    setSelectedNotification(notification);
    setShowNotificationDetails(true);
    
    // Marcar como leída si no lo está
    if (!notification.read_at) {
      await handleMarkAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'warning':
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'appointment':
        return <Bell className="w-4 h-4" />;
      case 'reminder':
        return <Bell className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
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

  // Filtrar notificaciones según el filtro seleccionado
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read_at;
    if (filter === 'read') return !!notification.read_at;
    return true;
  });

  if (loading) {
    return (
      <div className="h-screen overflow-hidden bg-gray-50 font-sans flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 text-center">
          <div className="flex items-center justify-center">
            <div className="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-600 font-semibold text-sm">Cargando notificaciones...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900">
      {/* Header Section - Compact & Professional */}
      <div className={`rounded-2xl shadow-2xl relative overflow-hidden mx-2 sm:mx-3 mt-3 ${
        userRole === 'psychologist' 
          ? 'bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-50 border border-cyan-200/40' 
          : userRole === 'super_admin'
          ? 'bg-gradient-to-br from-[#0a0e17] via-[#020408] to-black border border-white/10'
          : userRole === 'admin'
          ? 'bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 border border-white/10'
          : userRole === 'tutor'
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-slate-900 border border-white/10'
          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10'
      }`}>
        {/* Subtle gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-tr ${headerConfig.overlay} animate-pulse`}></div>

        {/* Minimal decorative elements */}
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${headerConfig.decorative1} to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`}></div>
        <div className={`absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr ${headerConfig.decorative2} to-transparent rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none`}></div>

        {/* Subtle dots */}
        <div className={`absolute inset-0 ${userRole === 'psychologist' ? 'opacity-5' : 'opacity-10'}`}>
          <div className={`absolute top-12 left-16 w-1.5 h-1.5 ${userRole === 'psychologist' ? 'bg-cyan-400' : 'bg-white'} rounded-full animate-pulse`}></div>
          <div className={`absolute top-20 right-32 w-1 h-1 ${userRole === 'psychologist' ? 'bg-sky-300' : 'bg-slate-300'} rounded-full animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
          <div className={`absolute bottom-16 left-1/3 w-1.5 h-1.5 ${userRole === 'psychologist' ? 'bg-cyan-300' : 'bg-slate-400'} rounded-full animate-pulse`} style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center tracking-wide uppercase shadow-lg ${
                  userRole === 'psychologist' 
                    ? 'bg-white/70 text-cyan-700 border border-cyan-300/50 hover:bg-white/80' 
                    : 'bg-white/15 backdrop-blur-xl text-white border border-white/20 hover:bg-white/25'
                } transition-all duration-300`}>
                  <Sparkles className={`w-3 h-3 mr-1.5 ${userRole === 'psychologist' ? '' : 'animate-pulse'}`} />
                  {headerConfig.badgeText}
                </span>
              </div>
              <h1 className={`text-3xl md:text-4xl font-black tracking-tight mb-1.5 leading-tight ${
                userRole === 'psychologist' 
                  ? 'text-cyan-900' 
                  : 'text-white drop-shadow-lg'
              }`}>
                Centro de Notificaciones
              </h1>
              <p className={`${headerConfig.textColor} text-sm max-w-2xl font-medium leading-relaxed ${userRole === 'psychologist' ? '' : 'drop-shadow-md'}`}>
                Gestiona y revisa todas tus notificaciones.
                <span className={`hidden sm:inline ${headerConfig.textColorAccent}`}> Mantente al día con el sistema.</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {userRole === 'psychologist' && (
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-white/80 backdrop-blur-xl rounded-xl px-4 py-2 border border-cyan-300/40 text-cyan-800 hover:bg-white/90 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 font-semibold text-sm"
                >
                  <User className="w-4 h-4" />
                  Mi Perfil
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`text-xs font-bold rounded-lg px-4 py-2 transition-all disabled:opacity-50 flex items-center gap-1.5 ${
                  userRole === 'psychologist'
                    ? 'border border-cyan-300/40 text-cyan-800 hover:bg-white/20 bg-white/80 backdrop-blur-xl shadow-sm'
                    : 'border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Wave pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="white" fillOpacity="0.08" />
            <path d="M0,20 C200,100 400,100 600,60 C800,20 1000,20 1200,60 L1200,120 L0,120 Z" fill="white" fillOpacity="0.04" />
          </svg>
        </div>
      </div>

      <div className="w-full px-3 sm:px-4 lg:px-6 -mt-4 relative z-20">
        {/* Mensajes de estado - Compactos */}
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3 shadow-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Estadísticas mejoradas - Estilo Dashboard del Estudiante */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {/* Total */}
            <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-3 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-slate-200/60 transition-all duration-500"></div>
              
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className={`w-9 h-9 ${roleStyles.stats.iconBg} rounded-lg flex items-center justify-center ${roleStyles.stats.iconColor} shadow-sm group-hover:scale-110 transition-all duration-300`}>
                  <Bell className="w-4 h-4" />
                </div>
                <span className={`text-[9px] font-bold ${roleStyles.stats.labelText} ${roleStyles.stats.labelBg} px-2 py-0.5 rounded-full uppercase tracking-wider`}>Total</span>
              </div>
              
              <div className="flex items-baseline gap-1.5 relative z-10">
                <p className={`text-3xl font-black ${roleStyles.stats.numberColor} tracking-tight`}>{stats.total || 0}</p>
                <p className="text-sm font-bold text-slate-600">Mensajes</p>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">Todas las notificaciones recibidas</p>
            </div>
            
            {/* No leídas */}
            <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-3 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-blue-100/60 transition-all duration-500"></div>
              
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-700 shadow-sm group-hover:scale-110 transition-all duration-300">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Nuevas</span>
              </div>
              
              <div className="flex items-baseline gap-1.5 relative z-10">
                <p className="text-3xl font-black text-slate-900 tracking-tight">{unreadCount}</p>
                <p className="text-sm font-bold text-slate-600">Alertas</p>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">Requieren tu atención</p>
            </div>
            
            {/* Leídas */}
            <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg p-3 border border-slate-200 hover:border-slate-300 overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-50/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-green-100/60 transition-all duration-500"></div>
              
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 shadow-sm group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Leídas</span>
              </div>
              
              <div className="flex items-baseline gap-1.5 relative z-10">
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.read || 0}</p>
                <p className="text-sm font-bold text-slate-600">Revisadas</p>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5 relative z-10">Ya fueron atendidas</p>
            </div>
          </div>
        )}

        {/* Filtros - Diseño limpio con cards blancas */}
        <div className={`${roleStyles.filters.bg} rounded-xl shadow-md p-3 mb-4 border`}>
          <div className="flex gap-2 justify-center flex-wrap">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'unread', label: 'No leídas' },
              { key: 'read', label: 'Leídas' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  filter === key
                    ? `${roleStyles.filters.activeBg} shadow-md`
                    : `${roleStyles.filters.inactiveBg}`
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Notificaciones */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Bell className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-slate-900 font-bold mb-1.5 text-base">No tienes notificaciones</h3>
            <p className="text-sm text-slate-500">Las notificaciones aparecerán aquí cuando las recibas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`group relative bg-white rounded-xl shadow-md hover:shadow-lg p-3 border ${
                  notification.read_at 
                    ? 'border-slate-200 hover:border-slate-300'
                    : 'border-blue-200 hover:border-blue-300'
                } transition-all duration-300 hover:-translate-y-0.5`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-50 to-transparent rounded-full -mr-6 -mt-6 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="flex justify-between items-start gap-3 relative z-10">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 ${
                          notification.read_at 
                        ? 'bg-slate-100 border border-slate-200 text-slate-600' 
                        : `${roleStyles.notification.iconBg} ${roleStyles.notification.iconColor}`
                        }`}>
                            {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className={`text-sm font-bold ${roleStyles.notification.textTitle} truncate`}>
                              {notification.title}
                            </h3>
                            {!notification.read_at && (
                          <Badge className={`${roleStyles.notification.badgeNew} px-2 py-0.5 text-[9px] font-bold rounded-lg border`}>
                                Nueva
                              </Badge>
                            )}
                        <Badge className={`${roleStyles.notification.badgeType} px-2 py-0.5 text-[9px] font-bold rounded-lg border`}>
                              {getNotificationTypeText(notification.type)}
                            </Badge>
                          </div>
                      <p className={`text-sm ${roleStyles.notification.textMessage} mb-1 line-clamp-2`}>{notification.message}</p>
                      <p className={`text-xs font-semibold ${roleStyles.notification.textDate}`}>
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                      </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleViewNotificationDetails(notification)}
                        title="Ver detalles"
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                      >
                      <Eye className="w-4 h-4" />
                      </button>
                      {!notification.read_at && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Marcar como leída"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-green-50 text-green-600"
                        >
                        <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        title="Eliminar"
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-50 text-red-600"
                      >
                      <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles de notificación */}
      {showNotificationDetails && selectedNotification && createPortal(
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[9999] p-2 sm:p-3 animate-in fade-in duration-200" onClick={() => setShowNotificationDetails(false)}>
          <div 
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden border border-slate-700/50 relative animate-in zoom-in-95 duration-300" 
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.05),
                0 32px 64px rgba(0, 0, 0, 0.5), 
                0 16px 32px rgba(0, 0, 0, 0.4),
                0 8px 16px rgba(0, 0, 0, 0.3)
              `
            }}
          >
            {/* Header del Modal - Compacto */}
            <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-3 border-b border-slate-700/50">
              {/* Decoración de fondo */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>
              
              <div className="flex justify-between items-center gap-2 relative z-10">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-blue-500/30 backdrop-blur-sm shadow-lg flex-shrink-0">
                    <Bell className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-white tracking-tight truncate">
                      Detalles de Notificación
                    </h3>
                  </div>
                  {!selectedNotification.read_at && (
                    <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 text-[9px] font-bold rounded flex-shrink-0">
                      Nueva
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => setShowNotificationDetails(false)}
                  className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 border border-slate-600/50 hover:border-slate-500/50 group flex-shrink-0"
                  title="Cerrar"
                >
                  <X className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Contenido del Modal - Formal y Profesional */}
            <div className="p-5 overflow-y-auto max-h-[calc(85vh-140px)] bg-slate-900/30">
              <div className="space-y-4">
                {/* Header con Tipo y Estado */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Tipo de Notificación */}
                  <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50 shadow-lg">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categoría</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-900/60 rounded-lg flex items-center justify-center border-2 border-white/20 shadow-lg">
                    {getNotificationIcon(selectedNotification.type)}
                  </div>
                      <p className="text-xs font-bold text-white">{getNotificationTypeText(selectedNotification.type)}</p>
                    </div>
                </div>
                
                  {/* Estado de Lectura */}
                  <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50 shadow-lg">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Estado</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-900/60 rounded-lg flex items-center justify-center border-2 border-white/20 shadow-lg">
                        <CheckCircle className={`w-5 h-5 ${selectedNotification.read_at ? 'text-green-400' : 'text-amber-400'}`} />
                      </div>
                      <p className="text-xs font-bold text-white">
                        {selectedNotification.read_at ? 'Leída' : 'No Leída'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Mensaje Principal */}
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-900/60 rounded-lg flex items-center justify-center border-2 border-white/20 shadow-lg flex-shrink-0">
                      <Bell className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Asunto</p>
                      <p className="text-sm font-bold text-white leading-snug mb-2">{selectedNotification.title}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{selectedNotification.message}</p>
                    </div>
                  </div>
                </div>
                
                {/* Información de la Cita (si es tipo appointment) */}
                {selectedNotification.type === 'appointment' && selectedNotification.data && (
                  <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-600/50 shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-950/60 px-4 py-3 border-b border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center border-2 border-white/20 shadow">
                          <User className="w-5 h-5 text-slate-300" />
                        </div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wide">Información de la Cita</h4>
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* FECHA - DESTACADA */}
                      {(selectedNotification.data as any).date && (
                        <div className="bg-slate-950/60 rounded-lg p-4 border-2 border-white/20 shadow-xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Fecha de la Cita</p>
                          <p className="text-xl font-black text-white tracking-tight">{(selectedNotification.data as any).date}</p>
                        </div>
                      )}

                      {/* Resto de información - Normal */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Paciente */}
                        {(selectedNotification.data as any).student_name && (
                          <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/50 col-span-2">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Paciente</p>
                            <p className="text-sm font-semibold text-white">{(selectedNotification.data as any).student_name}</p>
                            {(selectedNotification.data as any).student_email && (
                              <p className="text-xs text-slate-400 mt-1">{(selectedNotification.data as any).student_email}</p>
                            )}
                          </div>
                        )}

                        {/* Hora */}
                        {(selectedNotification.data as any).time && (
                          <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Hora</p>
                            <p className="text-sm font-semibold text-white">{(selectedNotification.data as any).time}</p>
                          </div>
                        )}

                        {/* Estado */}
                        {(selectedNotification.data as any).status && (
                          <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Estado</p>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                ['aprobada', 'approved', 'confirmada', 'confirmed', 'completada', 'completed', 'activa', 'active'].includes(String((selectedNotification.data as any).status || '').toLowerCase())
                                  ? 'bg-green-400' 
                                  : ['rechazada', 'rejected', 'cancelada', 'cancelled', 'canceled'].includes(String((selectedNotification.data as any).status || '').toLowerCase())
                                  ? 'bg-red-400'
                                  : 'bg-blue-400'
                              }`}></div>
                              <p className="text-xs font-semibold text-white">
                                {(() => {
                                  const status = String((selectedNotification.data as any).status || '').toLowerCase().trim();
                                  const translations: { [key: string]: string } = {
                                    'pendiente': 'Pendiente',
                                    'pending': 'Pendiente',
                                    'programada': 'Programada',
                                    'scheduled': 'Programada',
                                    'agendada': 'Agendada',
                                    'aprobada': 'Aprobada',
                                    'approved': 'Aprobada',
                                    'rechazada': 'Rechazada',
                                    'rejected': 'Rechazada',
                                    'confirmada': 'Confirmada',
                                    'confirmed': 'Confirmada',
                                    'cancelada': 'Cancelada',
                                    'cancelled': 'Cancelada',
                                    'canceled': 'Cancelada',
                                    'completada': 'Completada',
                                    'completed': 'Completada',
                                    'en curso': 'En Curso',
                                    'in progress': 'En Curso',
                                    'activa': 'Activa',
                                    'active': 'Activa'
                                  };
                                  return translations[status] || (selectedNotification.data as any).status;
                                })()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Motivo de Consulta */}
                      {(selectedNotification.data as any).reason && (
                        <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/50">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Motivo de Consulta</p>
                          <p className="text-xs font-semibold text-white leading-relaxed">{(selectedNotification.data as any).reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Fecha de la notificación */}
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-900/60 rounded-lg flex items-center justify-center border-2 border-white/20 shadow-lg">
                      <AlertCircle className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Fecha de Recepción</p>
                      <p className="text-xs font-bold text-white">{formatDate(selectedNotification.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones del Modal - Compacto */}
            <div className="p-2.5 border-t border-slate-700/50 bg-slate-950/80 backdrop-blur-sm">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setShowNotificationDetails(false)}
                  className="px-3 py-1.5 bg-slate-800/80 border border-slate-600/50 hover:bg-slate-700/80 hover:border-slate-500/50 text-slate-300 hover:text-white rounded-lg transition-all duration-300 flex items-center justify-center font-bold text-xs shadow-lg"
                >
                  Cerrar
                </button>
                {!selectedNotification.read_at && (
                  <button
                    onClick={async () => {
                      await handleMarkAsRead(selectedNotification.id);
                      setShowNotificationDetails(false);
                    }}
                    className="flex-1 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-emerald-500/25 font-bold text-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Marcar leída
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}