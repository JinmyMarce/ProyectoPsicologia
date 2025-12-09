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
  Loader2,
  RefreshCw,
  Sparkles,
  User
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
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
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
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
            background: 'linear-gradient(180deg, rgba(207, 250, 254, 1) 0%, rgba(186, 230, 253, 1) 50%, rgba(165, 243, 252, 1) 100%)',
            overlay: 'from-cyan-100/50 via-transparent to-sky-100/30',
            decorative1: 'from-cyan-100/50 via-sky-100/30',
            decorative2: 'from-sky-100/40',
            textColor: 'text-cyan-800',
            textColorAccent: 'text-cyan-700',
            badgeText: 'SAPTA',
            titleColor: 'text-cyan-900',
            borderColor: 'border-cyan-200/40',
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
            bg: 'bg-white/90 backdrop-blur-sm border-cyan-100',
            activeBg: 'bg-gradient-to-r from-cyan-300 to-sky-300 text-cyan-900',
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
            background: 'linear-gradient(180deg, #0a0e17 0%, #020408 50%, #000000 100%)',
            overlay: 'from-[#09090b]/50 via-transparent to-[#09090b]/30',
            decorative1: 'from-[#0a0e17]/10 via-[#020408]/5',
            decorative2: 'from-[#020408]/8',
            textColor: 'text-red-100',
            textColorAccent: 'text-red-200/80',
            badgeText: 'SUPER ADMIN',
            titleColor: 'text-white',
            borderColor: 'border-white/10',
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
            bg: 'bg-slate-900/80 backdrop-blur-sm border-slate-800',
            activeBg: 'bg-gradient-to-r from-red-900 to-red-800 text-white',
            inactiveBg: 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
            background: 'linear-gradient(180deg, #1e3a5f 0%, #1a2f4f 50%, #0f1b2e 100%)',
            overlay: 'from-blue-900/50 via-transparent to-indigo-900/30',
            decorative1: 'from-blue-600/10 via-indigo-500/5',
            decorative2: 'from-cyan-600/8',
            textColor: 'text-blue-100',
            textColorAccent: 'text-blue-200/80',
            badgeText: 'ADMINISTRADOR',
            titleColor: 'text-white',
            borderColor: 'border-white/10',
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
            bg: 'bg-slate-800/80 backdrop-blur-sm border-slate-700',
            activeBg: 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white',
            inactiveBg: 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
            background: 'linear-gradient(180deg, #1f2937 0%, #111827 50%, #0f172a 100%)',
            overlay: 'from-gray-800/50 via-transparent to-gray-900/30',
            decorative1: 'from-gray-600/10 via-gray-500/5',
            decorative2: 'from-slate-600/8',
            textColor: 'text-gray-100',
            textColorAccent: 'text-gray-200/80',
            badgeText: 'TUTOR',
            titleColor: 'text-white',
            borderColor: 'border-white/10',
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
            bg: 'bg-slate-800/80 backdrop-blur-sm border-slate-700',
            activeBg: 'bg-gradient-to-r from-gray-700 to-slate-700 text-white',
            inactiveBg: 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
            overlay: 'from-slate-800/50 via-transparent to-slate-900/30',
            decorative1: 'from-slate-600/10 via-slate-500/5',
            decorative2: 'from-slate-700/8',
            textColor: 'text-slate-100',
            textColorAccent: 'text-slate-200/80',
            badgeText: 'ESTUDIANTE',
            titleColor: 'text-white',
            borderColor: 'border-white/10',
            badgeBg: 'bg-white/15 text-white border-white/20 hover:bg-white/25',
            buttonStyle: 'border border-white/20 text-white hover:bg-white/20'
          },
          notification: {
            unreadBg: 'bg-gradient-to-r from-violet-950/30 to-slate-950/50',
            unreadBorder: 'border-violet-700/50 hover:border-violet-600/70',
            readBg: 'bg-slate-800',
            readBorder: 'border-slate-700 hover:border-slate-600',
            iconBg: 'bg-gradient-to-br from-violet-800/30 to-purple-900/50 border-violet-700/30',
            iconColor: 'text-violet-300',
            badgeNew: 'bg-violet-800/50 text-violet-200 border-violet-700/50',
            badgeType: 'bg-purple-800/30 text-purple-300 border-purple-700/40',
            textTitle: 'text-slate-100',
            textMessage: 'text-slate-200/80',
            textDate: 'text-slate-300/60'
          },
          stats: {
            cardBg: 'bg-slate-800',
            cardBorder: 'border-slate-700 hover:border-slate-600',
            iconBg: 'bg-gradient-to-br from-violet-800/30 to-purple-900/50',
            iconColor: 'text-violet-300',
            numberColor: 'text-slate-100',
            labelBg: 'bg-violet-950/30',
            labelText: 'text-violet-300'
          },
          filters: {
            bg: 'bg-slate-800/80 backdrop-blur-sm border-slate-700',
            activeBg: 'bg-gradient-to-r from-violet-700 to-purple-700 text-white',
            inactiveBg: 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          },
          modal: {
            headerBg: 'bg-gradient-to-r from-violet-700 to-purple-700',
            headerText: 'text-white',
            contentBg: 'bg-slate-800',
            borderColor: 'border-slate-700'
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
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'warning':
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'appointment':
        return <Bell className="w-4 h-4 text-violet-600" />;
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
            <div className="w-7 h-7 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-600 font-semibold text-sm">Cargando notificaciones...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-slate-100 selection:text-slate-900 w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Header Section - Compact & Professional */}
      <div className={`rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg relative overflow-hidden mt-2 sm:mt-3 lg:mt-4 ${userRole === 'psychologist' ? 'border border-cyan-200/40' : 'border border-white/10'}`} style={userRole === 'psychologist' ? {
        background: headerConfig.background
      } : {
        background: headerConfig.background,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}>
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

        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-5 lg:pt-6 pb-5 sm:pb-6 lg:pb-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
            <div className="animate-fade-in flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-xl text-[9px] sm:text-[10px] font-bold flex items-center tracking-wide uppercase shadow-sm transition-all duration-300 ${
                  userRole === 'psychologist' 
                    ? 'bg-white/70 text-cyan-700 border border-cyan-300/50 hover:bg-white/80' 
                    : 'bg-white/15 text-white border border-white/20 hover:bg-white/25 shadow-lg'
                }`}>
                  <Sparkles className={`w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5 flex-shrink-0 ${userRole === 'psychologist' ? '' : 'animate-pulse'}`} />
                  <span className="hidden xs:inline">{headerConfig.badgeText}</span>
                  <span className="xs:hidden">{headerConfig.badgeText.split(' ')[0]}</span>
                </span>
              </div>
              <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight mb-1 sm:mb-1.5 leading-tight ${
                userRole === 'psychologist' 
                  ? 'text-cyan-900' 
                  : 'text-white drop-shadow-lg'
              }`}>
                Centro de Notificaciones
              </h1>
              <p className={`${headerConfig.textColor} text-[10px] sm:text-[11px] md:text-xs lg:text-sm max-w-2xl font-medium leading-relaxed ${userRole === 'psychologist' ? '' : 'drop-shadow-md'}`}>
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
                className={`w-full md:w-auto text-xs xs:text-sm font-bold rounded-lg px-3 xs:px-4 py-1.5 xs:py-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-1.5 ${
                  userRole === 'psychologist'
                    ? 'border border-cyan-300/40 text-cyan-800 hover:bg-white/20 bg-white/80 backdrop-blur-xl shadow-sm'
                    : 'border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${refreshing ? 'animate-spin' : ''}`} />
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

      <div className="w-full -mt-4 relative z-20">
        {/* Mensajes de estado - Compactos */}
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3 shadow-sm flex items-center space-x-2.5 animate-fade-in">
            <div className="bg-red-100 p-1.5 rounded-full flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-red-800 font-bold text-sm">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Estadísticas mejoradas - Estilo Dashboard con estilos por rol */}
        {stats && (
          <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 gap-2 xs:gap-3 mb-3">
            {/* Total */}
            <div className={`group relative ${roleStyles.stats.cardBg} rounded-xl shadow-md hover:shadow-lg p-3 border ${roleStyles.stats.cardBorder} overflow-hidden hover:-translate-y-0.5 transition-all duration-300`}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-slate-200/60 transition-all duration-500"></div>
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className={`w-8 h-8 ${roleStyles.stats.iconBg} rounded-lg flex items-center justify-center ${roleStyles.stats.iconColor} shadow-sm group-hover:scale-110 transition-all duration-300`}>
                  <Bell className="w-4 h-4" />
                </div>
                <span className={`text-[9px] font-bold ${roleStyles.stats.labelText} ${roleStyles.stats.labelBg} px-2 py-0.5 rounded-full uppercase tracking-wider`}>Total</span>
              </div>
              <div className="flex items-baseline gap-1.5 relative z-10">
                <p className={`text-2xl xs:text-3xl font-black ${roleStyles.stats.numberColor} tracking-tight`}>{stats.total || 0}</p>
              </div>
            </div>
            
            {/* No leídas */}
            <div className={`group relative ${roleStyles.stats.cardBg} rounded-xl shadow-md hover:shadow-lg p-3 border ${roleStyles.stats.cardBorder} overflow-hidden hover:-translate-y-0.5 transition-all duration-300`}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-50/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-red-100/60 transition-all duration-500"></div>
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className={`w-8 h-8 ${roleStyles.stats.iconBg} rounded-lg flex items-center justify-center ${roleStyles.stats.iconColor} shadow-sm group-hover:scale-110 transition-all duration-300`}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span className={`text-[9px] font-bold ${roleStyles.stats.labelText} ${roleStyles.stats.labelBg} px-2 py-0.5 rounded-full uppercase tracking-wider`}>Nuevas</span>
              </div>
              <div className="flex items-baseline gap-1.5 relative z-10">
                <p className={`text-2xl xs:text-3xl font-black ${roleStyles.stats.numberColor} tracking-tight`}>{unreadCount}</p>
              </div>
            </div>
            
            {/* Leídas */}
            <div className={`group relative ${roleStyles.stats.cardBg} rounded-xl shadow-md hover:shadow-lg p-3 border ${roleStyles.stats.cardBorder} overflow-hidden hover:-translate-y-0.5 transition-all duration-300`}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-50/50 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:from-green-100/60 transition-all duration-500"></div>
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className={`w-8 h-8 ${roleStyles.stats.iconBg} rounded-lg flex items-center justify-center ${roleStyles.stats.iconColor} shadow-sm group-hover:scale-110 transition-all duration-300`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className={`text-[9px] font-bold ${roleStyles.stats.labelText} ${roleStyles.stats.labelBg} px-2 py-0.5 rounded-full uppercase tracking-wider`}>Leídas</span>
              </div>
              <div className="flex items-baseline gap-1.5 relative z-10">
                <p className={`text-2xl xs:text-3xl font-black ${roleStyles.stats.numberColor} tracking-tight`}>{stats.read || 0}</p>
              </div>
            </div>
            
          </div>
        )}

        {/* Filtros - Diseño Moderno con estilos por rol */}
        <div className={`${roleStyles.filters.bg} backdrop-blur-sm rounded-xl shadow-md p-4 mb-6 border`}>
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'unread', label: 'No leídas' },
              { key: 'read', label: 'Leídas' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`
                  px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
                  ${filter === key
                    ? `${roleStyles.filters.activeBg} shadow-lg transform scale-105`
                    : `${roleStyles.filters.inactiveBg} hover:shadow-md`
                  }
                  hover:scale-105 active:scale-95
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Notificaciones */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 text-center">
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-100/50">
                <Bell className="w-7 h-7 text-violet-500" />
              </div>
              <h3 className="text-slate-900 font-bold mb-1.5 text-base">No tienes notificaciones</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                Las notificaciones aparecerán aquí cuando las recibas
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`group relative ${notification.read_at ? roleStyles.notification.readBg : roleStyles.notification.unreadBg} rounded-xl shadow-md hover:shadow-lg p-3 xs:p-4 border transition-all duration-300 hover:-translate-y-0.5 overflow-hidden ${
                  notification.read_at 
                    ? roleStyles.notification.readBorder
                    : roleStyles.notification.unreadBorder
                }`}
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-slate-50/50 to-transparent rounded-full -mr-10 -mt-10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center gap-2 xs:gap-2.5 mb-2">
                        <div className={`w-8 h-8 xs:w-10 xs:h-10 rounded-lg flex items-center justify-center shadow-sm border flex-shrink-0 ${
                          notification.read_at 
                            ? 'bg-slate-100 border-slate-200' 
                            : roleStyles.notification.iconBg
                        }`}>
                          <div className={notification.read_at ? 'text-slate-600' : roleStyles.notification.iconColor}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className={`text-sm sm:text-base font-bold ${roleStyles.notification.textTitle} tracking-tight truncate`}>
                              {notification.title}
                            </h3>
                            {!notification.read_at && (
                              <Badge className={`${roleStyles.notification.badgeNew} px-2 py-0.5 text-[9px] xs:text-[10px] font-bold rounded-lg border`}>
                                Nueva
                              </Badge>
                            )}
                            <Badge className={`${roleStyles.notification.badgeType} px-2 py-0.5 text-[9px] xs:text-[10px] font-bold rounded-lg border`}>
                              {getNotificationTypeText(notification.type)}
                            </Badge>
                          </div>
                          <p className={`text-xs sm:text-sm ${roleStyles.notification.textMessage} mb-1.5 line-clamp-2`}>{notification.message}</p>
                          <p className={`text-[10px] xs:text-xs font-semibold ${roleStyles.notification.textDate}`}>
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 self-start sm:self-center flex-shrink-0">
                      <button
                        onClick={() => handleViewNotificationDetails(notification)}
                        title="Ver detalles"
                        className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-slate-100 hover:scale-110 text-slate-600 hover:text-violet-600"
                      >
                        <Eye className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                      </button>
                      {!notification.read_at && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Marcar como leída"
                          className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-green-100 hover:scale-110 text-green-600"
                        >
                          <CheckCircle className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        title="Eliminar"
                        className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-red-100 hover:scale-110 text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles de notificación */}
      {showNotificationDetails && selectedNotification && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[9999] p-3 sm:p-4" onClick={() => setShowNotificationDetails(false)}>
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-slate-200 relative" 
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: `
                0 32px 64px rgba(0, 0, 0, 0.16), 
                0 16px 32px rgba(0, 0, 0, 0.12),
                0 8px 16px rgba(0, 0, 0, 0.08)
              `
            }}
          >
            {/* Header del Modal con estilos por rol */}
            <div className={`${roleStyles.modal.headerBg} p-3 xs:p-4 border-b ${roleStyles.modal.borderColor}/20`}>
              <div className="flex justify-between items-center gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className={`text-base xs:text-lg font-black ${roleStyles.modal.headerText} tracking-tight`}>Detalles de la Notificación</h3>
                  <p className={`text-[10px] xs:text-xs ${roleStyles.modal.headerText}/80 font-medium mt-0.5`}>Información completa</p>
                </div>
                <button
                  onClick={() => setShowNotificationDetails(false)}
                  className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 border border-white/30 hover:border-white/50 flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Contenido del Modal con estilos por rol */}
            <div className={`p-3 xs:p-4 overflow-y-auto max-h-[calc(90vh-80px)] ${roleStyles.modal.contentBg}`}>
              <div className="space-y-3">
                {/* Tipo y Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`w-10 h-10 ${roleStyles.notification.iconBg} rounded-lg flex items-center justify-center border`}>
                    {getNotificationIcon(selectedNotification.type)}
                  </div>
                  <Badge className={`${roleStyles.notification.badgeType} px-2.5 py-1 text-xs font-bold rounded-lg border`}>
                    {getNotificationTypeText(selectedNotification.type)}
                  </Badge>
                  {!selectedNotification.read_at && (
                    <Badge className={`${roleStyles.notification.badgeNew} px-2.5 py-1 text-xs font-bold rounded-lg border`}>
                      Nueva
                    </Badge>
                  )}
                </div>
                
                {/* Título */}
                <div className={`${roleStyles.modal.contentBg} rounded-lg p-3 border ${roleStyles.modal.borderColor}/50`}>
                  <p className={`text-xs font-bold ${roleStyles.notification.textDate} uppercase tracking-wide mb-1`}>Título</p>
                  <p className={`text-base font-bold ${roleStyles.notification.textTitle}`}>{selectedNotification.title}</p>
                </div>
                
                {/* Mensaje */}
                <div className={`${roleStyles.modal.contentBg} rounded-lg p-3 border ${roleStyles.modal.borderColor}/50`}>
                  <p className={`text-xs font-bold ${roleStyles.notification.textDate} uppercase tracking-wide mb-1`}>Mensaje</p>
                  <p className={`text-sm ${roleStyles.notification.textMessage} leading-relaxed`}>{selectedNotification.message}</p>
                </div>
                
                {/* Fecha */}
                <div className={`${roleStyles.modal.contentBg} rounded-lg p-3 border ${roleStyles.modal.borderColor}/50`}>
                  <p className={`text-xs font-bold ${roleStyles.notification.textDate} uppercase tracking-wide mb-1`}>Fecha</p>
                  <p className={`text-sm font-bold ${roleStyles.notification.textTitle}`}>{formatDate(selectedNotification.created_at)}</p>
                </div>
                
                {/* Datos adicionales */}
                {selectedNotification.data && (
                  <div className={`${roleStyles.modal.contentBg} rounded-lg p-3 border ${roleStyles.modal.borderColor}/50`}>
                    <p className={`text-xs font-bold ${roleStyles.notification.textDate} uppercase tracking-wide mb-2`}>Datos adicionales</p>
                    <pre className={`text-xs ${roleStyles.notification.readBg} p-2.5 rounded-lg border ${roleStyles.modal.borderColor} overflow-auto max-h-40`}>
                      {JSON.stringify(selectedNotification.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Botones del Modal */}
            <div className="p-3 xs:p-4 border-t border-slate-200 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowNotificationDetails(false)}
                  className="px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg transition-all duration-300 flex items-center justify-center font-bold text-sm hover:bg-slate-50"
                >
                  Cerrar
                </button>
                {!selectedNotification.read_at && (
                  <button
                    onClick={() => {
                      handleMarkAsRead(selectedNotification.id);
                      setShowNotificationDetails(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg font-bold text-sm hover:scale-105"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como leída
                  </button>
                )}
                {/* Botones de aprobar/rechazar solo para notificaciones de cita */}
                {selectedNotification.type === 'appointment' && selectedNotification.data && typeof (selectedNotification.data as any).appointment_id === 'number' && (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          await approveAppointment(Number((selectedNotification.data as any).appointment_id));
                          setShowNotificationDetails(false);
                          handleRefresh();
                        } catch (e) {
                          setError('Error al aprobar la cita');
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg font-bold text-sm hover:scale-105"
                    >
                      Aprobar cita
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg font-bold text-sm hover:scale-105"
                    >
                      Rechazar cita
                    </button>
                  </>
                )}
              </div>
              {/* Formulario para rechazar cita */}
              {showRejectForm && selectedNotification.type === 'appointment' && selectedNotification.data && typeof (selectedNotification.data as any).appointment_id === 'number' && (
                <div className="mt-4 p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Motivo del rechazo
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all duration-300 mb-3"
                    placeholder="Escribe el motivo del rechazo..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg transition-all duration-300 font-bold text-sm hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
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
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-lg transition-all duration-300 font-bold text-sm hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                      Confirmar rechazo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      </div>
    </div>
  );
}