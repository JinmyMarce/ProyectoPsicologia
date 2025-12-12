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
  User,
  ChevronLeft,
  ChevronRight
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
import { approveAppointment, rejectAppointment } from '../../services/appointments';
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
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 5;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [appointmentToReject, setAppointmentToReject] = useState<number | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

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
            unreadBg: 'bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50',
            unreadBorder: 'border-blue-200 hover:border-blue-300',
            readBg: 'bg-gradient-to-r from-emerald-50/60 via-green-50/40 to-emerald-50/60',
            readBorder: 'border-emerald-200/60 hover:border-emerald-300/80',
            iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-200 border-blue-200',
            iconColor: 'text-blue-700',
            badgeNew: 'bg-blue-100 text-blue-800 border-blue-200',
            badgeType: 'bg-cyan-100 text-cyan-800 border-cyan-200',
            textTitle: 'text-slate-900',
            textMessage: 'text-slate-700',
            textDate: 'text-slate-500'
          },
          // Estadísticas
          stats: {
            cardBg: 'bg-white',
            cardBorder: 'border-slate-200 hover:border-slate-300',
            iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-200',
            iconColor: 'text-blue-700',
            numberColor: 'text-slate-900',
            labelBg: 'bg-slate-100',
            labelText: 'text-slate-600'
          },
          // Filtros - Azul marino super oscuro
          filters: {
            bg: 'bg-white border-slate-200',
            activeBg: 'bg-gradient-to-r from-[#001f3f] to-[#003366] text-white shadow-lg',
            inactiveBg: 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          },
          // Modal
          modal: {
            headerBg: 'bg-gradient-to-r from-[#001f3f] to-[#003366]',
            headerText: 'text-white',
            contentBg: 'bg-gradient-to-br from-slate-50 to-blue-50',
            borderColor: 'border-slate-200'
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
            readBg: 'bg-gradient-to-r from-emerald-50/60 via-green-50/40 to-emerald-50/60',
            readBorder: 'border-emerald-200/60 hover:border-emerald-300/80',
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
      console.log('📊 No leídas:', data.filter(n => !n.read).length, '/ Leídas:', data.filter(n => n.read).length);
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

  const handleMarkAsRead = async (id: number, event?: React.MouseEvent) => {
    // Prevenir propagación si viene de un botón
    if (event) {
      event.stopPropagation();
    }
    
    // Actualización optimista - actualizar UI inmediatamente
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    
    // Actualizar estadísticas optimistamente
    setStats(prev => ({
      ...prev,
      unread: Math.max(0, (prev.unread || 0) - 1),
      read: (prev.read || 0) + 1
    }));
    
    try {
      // Marcar en el servidor (sin recargar toda la interfaz)
      await markNotificationAsRead(id);
    } catch (error: unknown) {
      console.error('❌ Error marking notification as read:', error);
      // Revertir cambios si falla
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: false } : notif
        )
      );
      setStats(prev => ({
        ...prev,
        unread: (prev.unread || 0) + 1,
        read: Math.max(0, (prev.read || 0) - 1)
      }));
      setError('Error al marcar como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      await loadNotifications(); // Recargar desde servidor
      await loadStats(); // Recargar estadísticas
    } catch (error: unknown) {
      console.error('Error marking all notifications as read:', error);
      setError('Error al marcar todas como leídas');
    }
  };


  const handleDeleteNotificationConfirm = async () => {
    if (!notificationToDelete) return;
    
    try {
      await deleteNotification(notificationToDelete);
      await loadNotifications();
      await loadStats();
      setShowDeleteConfirm(false);
      setNotificationToDelete(null);
    } catch (error: unknown) {
      console.error('Error deleting notification:', error);
      setError('Error al eliminar la notificación');
    }
  };

  const handleDeleteClick = (id: number) => {
    setNotificationToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleApproveAppointment = async (appointmentId: number) => {
    try {
      setProcessingAction(true);
      await approveAppointment(appointmentId);
      await loadNotifications();
      await loadStats();
      setShowNotificationDetails(false);
      setError('');
    } catch (error: unknown) {
      console.error('Error approving appointment:', error);
      setError('Error al aprobar la cita');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectAppointment = async () => {
    if (!appointmentToReject || !rejectReason.trim()) {
      setError('Debes proporcionar una razón para rechazar la cita');
      return;
    }

    try {
      setProcessingAction(true);
      await rejectAppointment(appointmentToReject, rejectReason);
      await loadNotifications();
      await loadStats();
      setShowRejectModal(false);
      setShowNotificationDetails(false);
      setRejectReason('');
      setAppointmentToReject(null);
      setError('');
    } catch (error: unknown) {
      console.error('Error rejecting appointment:', error);
      setError('Error al rechazar la cita');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectClick = (appointmentId: number) => {
    setAppointmentToReject(appointmentId);
    setShowRejectModal(true);
  };

  const handleDeleteAllNotifications = async () => {
    try {
      await deleteAllNotifications();
      await loadNotifications();
      await loadStats();
    } catch (error: unknown) {
      console.error('Error deleting all notifications:', error);
      setError('Error al eliminar todas las notificaciones');
    }
  };

  const handleViewNotificationDetails = async (notification: Notification) => {
    // Mostrar el modal inmediatamente
    setSelectedNotification(notification);
    setShowNotificationDetails(true);
    
    // Marcar como leída automáticamente al abrir (sin recargar toda la interfaz)
    if (!notification.read) {
      // Actualización optimista
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notification.id ? { ...notif, read: true } : notif
        )
      );
      
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, (prev.unread || 0) - 1),
        read: (prev.read || 0) + 1
      }));
      
      try {
        // Marcar en el servidor en segundo plano
        await markNotificationAsRead(notification.id);
      } catch (error: unknown) {
        console.error('Error marking notification as read:', error);
        // Revertir si falla
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notification.id ? { ...notif, read: false } : notif
          )
        );
      }
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

  const unreadCount = notifications.filter(n => !n.read).length;

  // Filtrar notificaciones según el filtro seleccionado
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  // Paginación
  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);
  const startIndex = (currentPage - 1) * notificationsPerPage;
  const endIndex = startIndex + notificationsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

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

        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-6 pb-6 sm:pb-8 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
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
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-1.5 leading-tight ${
                userRole === 'psychologist' 
                  ? 'text-cyan-900' 
                  : 'text-white drop-shadow-lg'
              }`}>
                Centro de Notificaciones
              </h1>
              <p className={`${headerConfig.textColor} text-xs sm:text-sm max-w-2xl font-medium leading-relaxed ${userRole === 'psychologist' ? '' : 'drop-shadow-md'}`}>
                Gestiona y revisa todas tus notificaciones.
                <span className={`hidden md:inline ${headerConfig.textColorAccent}`}> Mantente al día con el sistema.</span>
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`text-xs font-bold rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 transition-all disabled:opacity-50 flex items-center gap-1.5 ${
                  userRole === 'psychologist'
                    ? 'border border-cyan-300/40 text-cyan-800 hover:bg-white/20 bg-white/80 backdrop-blur-xl shadow-sm'
                    : 'border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
                <span className="sm:hidden">Refrescar</span>
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

        {/* Estadísticas mejoradas - Compactas */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 mb-3">
            {/* Total */}
            <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md p-2.5 border border-slate-200 hover:border-slate-300 overflow-hidden transition-all duration-200">
              <div className="flex items-center justify-between mb-1.5 relative z-10">
                <div className={`w-8 h-8 ${roleStyles.stats.iconBg} rounded-lg flex items-center justify-center ${roleStyles.stats.iconColor} shadow-sm`}>
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <span className={`text-[8px] font-bold ${roleStyles.stats.labelText} ${roleStyles.stats.labelBg} px-1.5 py-0.5 rounded-full uppercase tracking-wider`}>Total</span>
              </div>
              
              <div className="flex items-baseline gap-1 relative z-10">
                <p className={`text-2xl font-black ${roleStyles.stats.numberColor} tracking-tight`}>{stats.total || 0}</p>
                <p className="text-xs font-bold text-slate-600">Mensajes</p>
              </div>
            </div>
            
            {/* No leídas */}
            <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md p-2.5 border border-slate-200 hover:border-slate-300 overflow-hidden transition-all duration-200">
              <div className="flex items-center justify-between mb-1.5 relative z-10">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-700 shadow-sm">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-[8px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Nuevas</span>
              </div>
              
              <div className="flex items-baseline gap-1 relative z-10">
                <p className="text-2xl font-black text-slate-900 tracking-tight">{unreadCount}</p>
                <p className="text-xs font-bold text-slate-600">Alertas</p>
              </div>
            </div>
            
            {/* Leídas */}
            <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md p-2.5 border border-slate-200 hover:border-slate-300 overflow-hidden transition-all duration-200">
              <div className="flex items-center justify-between mb-1.5 relative z-10">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-[8px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Leídas</span>
              </div>
              
              <div className="flex items-baseline gap-1 relative z-10">
                <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.read || 0}</p>
                <p className="text-xs font-bold text-slate-600">Revisadas</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros - Compactos y Responsivos */}
        <div className={`${roleStyles.filters.bg} rounded-lg shadow-sm p-2 sm:p-2.5 mb-3 border`}>
          <div className="flex gap-1 sm:gap-1.5 justify-center flex-wrap">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'unread', label: 'No leídas' },
              { key: 'read', label: 'Leídas' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all ${
                  filter === key
                    ? `${roleStyles.filters.activeBg} shadow-sm`
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
          <div className="bg-white rounded-2xl shadow-md p-8 border border-slate-200 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-slate-900 font-bold mb-2 text-lg">No tienes notificaciones</h3>
            <p className="text-sm text-slate-500 font-medium">Las notificaciones aparecerán aquí cuando las recibas</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {paginatedNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`group relative rounded-xl shadow-sm hover:shadow-md p-3 border transition-all duration-200 hover:-translate-y-0.5 ${
                    notification.read 
                      ? 'bg-gradient-to-r from-emerald-50/60 via-green-50/40 to-emerald-50/60 border-emerald-200/60 hover:border-emerald-300/80'
                      : 'bg-white border-blue-200 hover:border-blue-300 bg-gradient-to-r from-blue-50/30 via-cyan-50/20 to-white'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full -mr-6 -mt-6 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 sm:gap-3 relative z-10">
                    <div className="flex items-start gap-2 sm:gap-2.5 flex-1 min-w-0 w-full">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 transition-all duration-200 ${
                        notification.read 
                          ? 'bg-gradient-to-br from-emerald-100/80 to-green-100/60 border border-emerald-200/60 text-emerald-700' 
                          : `${roleStyles.notification.iconBg} ${roleStyles.notification.iconColor} border`
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-xs sm:text-sm font-bold ${roleStyles.notification.textTitle} line-clamp-1 mb-1`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-1 flex-wrap">
                          {!notification.read && (
                            <Badge className={`${roleStyles.notification.badgeNew} px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold rounded-md border`}>
                              Nueva
                            </Badge>
                          )}
                          <Badge className={`${roleStyles.notification.badgeType} px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold rounded-md border`}>
                            {getNotificationTypeText(notification.type)}
                          </Badge>
                        </div>
                        <p className={`text-[11px] sm:text-xs ${roleStyles.notification.textMessage} mb-1 leading-snug line-clamp-1 sm:line-clamp-2 font-medium`}>
                          {notification.message}
                        </p>
                        <p className={`text-[9px] sm:text-[10px] font-semibold ${roleStyles.notification.textDate}`}>
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewNotificationDetails(notification);
                        }}
                        title="Ver detalles"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all bg-gradient-to-br from-[#001f3f] to-[#003366] hover:from-[#002855] hover:to-[#004080] text-white shadow-sm hover:shadow-md"
                      >
                        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                      {!notification.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          title="Marcar como leída"
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md"
                        >
                          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(notification.id);
                        }}
                        title="Eliminar"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md"
                      >
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between bg-white rounded-xl shadow-sm p-3 border border-slate-200">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-[#001f3f] to-[#003366] hover:from-[#002855] hover:to-[#004080] text-white font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Página {currentPage} de {totalPages}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    ({filteredNotifications.length} notificaciones)
                  </span>
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-[#001f3f] to-[#003366] hover:from-[#002855] hover:to-[#004080] text-white font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de detalles de notificación - Oscuro, ancho y responsivo */}
      {showNotificationDetails && selectedNotification && createPortal(
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[9999] p-2 sm:p-4 animate-in fade-in duration-200" onClick={() => setShowNotificationDetails(false)}>
          <div 
            className="bg-gradient-to-br from-slate-950 via-black to-slate-950 rounded-lg shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden border border-slate-800/50 relative animate-in zoom-in-95 duration-300" 
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.03),
                0 20px 40px rgba(0, 0, 0, 0.8), 
                0 10px 20px rgba(0, 0, 0, 0.6)
              `
            }}
          >
            {/* Header del Modal - Oscuro y responsivo */}
            <div className="relative bg-gradient-to-r from-[#001329] via-[#001f3f] to-[#002855] p-3 sm:p-3.5 border-b border-blue-950/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-cyan-400/5"></div>
              
              <div className="flex justify-between items-center gap-2 sm:gap-3 relative z-10">
                <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-lg flex items-center justify-center border border-blue-400/30 backdrop-blur-sm shadow-lg flex-shrink-0">
                    <Bell className="w-4 h-4 text-blue-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                      Detalles de Notificación
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotificationDetails(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200 border border-white/20 hover:border-white/30 group flex-shrink-0"
                  title="Cerrar"
                >
                  <X className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Contenido del Modal - Reorganizado y claro */}
            <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(85vh-100px)] bg-gradient-to-br from-black/80 via-slate-950/60 to-black/80">
              <div className="space-y-3">
                {/* Alerta de acción requerida */}
                {selectedNotification.type === 'appointment' && 
                 ((selectedNotification.data as any)?.status === 'pending' || (selectedNotification.data as any)?.status === 'pendiente') && (
                  <div className="bg-gradient-to-r from-amber-950/60 to-amber-900/40 border border-amber-700/50 rounded-lg p-3 flex items-center gap-2.5 shadow-lg">
                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-500/40">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-amber-200">Acción Requerida</p>
                      <p className="text-xs text-amber-300/80">Debes aprobar o rechazar esta solicitud de cita</p>
                    </div>
                  </div>
                )}

                {/* Mensaje Principal */}
                <div className="bg-gradient-to-br from-slate-900/90 to-black/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50 shadow-lg">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-lg flex items-center justify-center border border-blue-400/30 shadow-md flex-shrink-0">
                      {getNotificationIcon(selectedNotification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 text-[10px] font-bold rounded">
                          {getNotificationTypeText(selectedNotification.type)}
                        </Badge>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDate(selectedNotification.created_at)}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white leading-snug mb-2">{selectedNotification.title}</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">{selectedNotification.message}</p>
                    </div>
                  </div>
                </div>
                
                {/* Información de la Cita (si es tipo appointment) */}
                {selectedNotification.type === 'appointment' && selectedNotification.data && (
                  <div className="bg-gradient-to-br from-slate-900/90 to-black/80 backdrop-blur-sm rounded-lg border border-slate-700/50 shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#001329] to-[#001f3f] px-3 py-2 border-b border-blue-950/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400/20 to-cyan-400/10 rounded-lg flex items-center justify-center border border-blue-400/40 shadow-md">
                          <User className="w-4 h-4 text-blue-300" />
                        </div>
                        <h4 className="text-sm font-black text-white">Información de la Cita</h4>
                      </div>
                    </div>

                    <div className="p-3 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Paciente */}
                        {(selectedNotification.data as any).student_name && (
                          <div className="bg-gradient-to-br from-slate-900/80 to-black/60 rounded-lg p-2.5 border border-slate-700/50 shadow-md sm:col-span-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Paciente</p>
                            <p className="text-sm font-bold text-white">{(selectedNotification.data as any).student_name}</p>
                            {(selectedNotification.data as any).student_email && (
                              <p className="text-xs text-slate-300 mt-1 font-medium">{(selectedNotification.data as any).student_email}</p>
                            )}
                          </div>
                        )}

                        {/* Fecha y Hora */}
                        {((selectedNotification.data as any).date || (selectedNotification.data as any).time) && (
                          <div className="bg-gradient-to-br from-[#001329]/40 to-[#001f3f]/30 rounded-lg p-2.5 border border-blue-500/30 shadow-md">
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-1.5">Fecha y Hora de Cita</p>
                            <p className="text-sm font-bold text-white">
                              {(selectedNotification.data as any).date && (selectedNotification.data as any).date}
                              {(selectedNotification.data as any).date && (selectedNotification.data as any).time && ' a las '}
                              {(selectedNotification.data as any).time && (selectedNotification.data as any).time}
                            </p>
                          </div>
                        )}

                        {/* Estado */}
                        {(selectedNotification.data as any).status && (
                          <div className="bg-gradient-to-br from-slate-900/80 to-black/60 rounded-lg p-2.5 border border-slate-700/50 shadow-md">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Estado de la Cita</p>
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full shadow ${
                                ['aprobada', 'approved', 'confirmada', 'confirmed', 'completada', 'completed', 'activa', 'active'].includes(String((selectedNotification.data as any).status || '').toLowerCase())
                                  ? 'bg-emerald-400' 
                                  : ['rechazada', 'rejected', 'cancelada', 'cancelled', 'canceled'].includes(String((selectedNotification.data as any).status || '').toLowerCase())
                                  ? 'bg-red-400'
                                  : 'bg-blue-400'
                              }`}></div>
                              <p className="text-sm font-bold text-white">
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

                        {/* Motivo de Consulta */}
                        {(selectedNotification.data as any).reason && (
                          <div className="bg-gradient-to-br from-slate-900/80 to-black/60 rounded-lg p-2.5 border border-slate-700/50 shadow-md sm:col-span-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Motivo de Consulta</p>
                            <p className="text-sm font-semibold text-slate-300 leading-relaxed">{(selectedNotification.data as any).reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botones del Modal - Responsivos con acciones */}
            <div className="p-3 border-t border-slate-800/50 bg-black/90 backdrop-blur-sm">
              {selectedNotification.type === 'appointment' && (selectedNotification.data as any)?.appointment_id && 
               ((selectedNotification.data as any)?.status === 'pending' || (selectedNotification.data as any)?.status === 'pendiente') ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setShowNotificationDetails(false)}
                    disabled={processingAction}
                    className="px-4 py-2.5 bg-slate-900/80 border border-slate-700/50 hover:bg-slate-800/80 text-slate-300 hover:text-white rounded-lg transition-all duration-200 font-bold text-sm disabled:opacity-50 sm:col-span-1"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => handleRejectClick((selectedNotification.data as any).appointment_id)}
                    disabled={processingAction}
                    className="px-4 py-2.5 bg-gradient-to-r from-red-900/90 to-red-950/80 hover:from-red-800/90 hover:to-red-900/80 border border-red-800/50 hover:border-red-700/50 text-red-200 hover:text-white rounded-lg transition-all duration-200 font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed sm:col-span-1"
                  >
                    {processingAction ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleApproveAppointment((selectedNotification.data as any).appointment_id)}
                    disabled={processingAction}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-900/90 to-teal-950/80 hover:from-emerald-800/90 hover:to-teal-900/80 border border-emerald-800/50 hover:border-emerald-700/50 text-emerald-200 hover:text-white rounded-lg transition-all duration-200 font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed sm:col-span-1"
                  >
                    {processingAction ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Aprobar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNotificationDetails(false)}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-[#001329] to-[#001f3f] hover:from-[#001f3f] hover:to-[#002855] text-white rounded-lg transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg font-bold text-sm"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200" onClick={() => setShowDeleteConfirm(false)}>
          <div 
            className="bg-gradient-to-br from-slate-950 via-black to-slate-950 rounded-lg shadow-2xl w-full max-w-md border border-slate-800/50 relative animate-in zoom-in-95 duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-red-950/80 via-red-900/60 to-red-950/80 p-3 border-b border-red-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-red-500/30 to-red-600/20 rounded-lg flex items-center justify-center border border-red-500/40 shadow-lg">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">Eliminar Notificación</h3>
                  <p className="text-xs text-red-200 font-medium">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                ¿Estás seguro de que deseas eliminar esta notificación? Esta acción es permanente y no podrás recuperar la información.
              </p>
            </div>

            {/* Botones */}
            <div className="p-3 border-t border-slate-800/50 bg-black/90 flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setNotificationToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-900/80 border border-slate-700/50 hover:bg-slate-800/80 text-slate-300 hover:text-white rounded-lg transition-all duration-200 font-bold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteNotificationConfirm}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de rechazo de cita - Oscuro y elegante */}
      {showRejectModal && createPortal(
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200" onClick={() => setShowRejectModal(false)}>
          <div 
            className="bg-gradient-to-br from-slate-950 via-black to-slate-950 rounded-lg shadow-2xl w-full max-w-lg border border-slate-800/50 relative animate-in zoom-in-95 duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Oscuro con rojo sutil */}
            <div className="relative bg-gradient-to-r from-slate-950 via-red-950/40 to-slate-950 p-3 border-b border-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-red-900/30 to-red-950/20 rounded-lg flex items-center justify-center border border-red-800/40 shadow-lg">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">Rechazar Cita</h3>
                  <p className="text-xs text-slate-400 font-medium">Proporciona el motivo del rechazo</p>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4 bg-gradient-to-br from-black/80 via-slate-950/60 to-black/80">
              <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3 mb-3">
                <p className="text-sm text-red-300/80 leading-relaxed">
                  El estudiante será notificado automáticamente del rechazo de su solicitud de cita.
                </p>
              </div>
              
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Motivo del rechazo <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Describe el motivo por el cual rechazas esta cita..."
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/50 rounded-lg focus:ring-2 focus:ring-red-800/50 focus:border-red-800/50 text-white placeholder-slate-500 transition-all duration-200 font-medium text-sm"
                rows={4}
                disabled={processingAction}
              />
            </div>

            {/* Botones - Combinando con el modal oscuro */}
            <div className="p-3 border-t border-slate-800/50 bg-black/90 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setAppointmentToReject(null);
                }}
                disabled={processingAction}
                className="px-4 py-2.5 bg-slate-900/80 border border-slate-700/50 hover:bg-slate-800/80 text-slate-300 hover:text-white rounded-lg transition-all duration-200 font-bold text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectAppointment}
                disabled={processingAction || !rejectReason.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-red-900/90 to-red-950/80 hover:from-red-800/90 hover:to-red-900/80 border border-red-800/50 hover:border-red-700/50 text-red-200 hover:text-white rounded-lg transition-all duration-200 font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingAction ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Rechazando...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Rechazar Cita
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}