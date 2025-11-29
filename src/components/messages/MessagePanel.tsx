import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { messageService, Message, MessageStats } from '../../services/messages';
import { Mail, Trash2, Eye, Search, X, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface MessagePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('normal');

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      loadMessages();
      loadStats();
    } else {
      setIsAnimating(false);
    }
  }, [isOpen, activeTab, searchTerm, filter]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
      if (!target.closest('.priority-dropdown-container')) {
        setIsPriorityDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isPriorityDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen, isPriorityDropdownOpen]);

  // Efecto para cerrar modal cuando cambia la interfaz (navegación)
  useEffect(() => {
    const handleRouteChange = () => {
      if (isOpen) {
        handleClose();
      }
    };

    // Escuchar cambios en la URL
    const handlePopState = () => {
      handleRouteChange();
    };

    // Escuchar clics en enlaces de navegación
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.closest('a')) {
        handleRouteChange();
      }
    };

    if (isOpen) {
      window.addEventListener('popstate', handlePopState);
      document.addEventListener('click', handleLinkClick);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        document.removeEventListener('click', handleLinkClick);
      };
    }
  }, [isOpen]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filter !== 'all') params.read = filter === 'read';

      const response = activeTab === 'inbox' 
        ? await messageService.getMessages(params)
        : await messageService.getSentMessages(params);

      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await messageService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      const response = await messageService.markAsRead(messageId);
      if (response.success) {
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, read: true, read_at: new Date().toISOString() } : msg
        ));
        loadStats();
      }
    } catch (error) {
      console.error('Error marcando mensaje como leído:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await messageService.markAllAsRead();
      if (response.success) {
        setMessages(messages.map(msg => ({ ...msg, read: true, read_at: new Date().toISOString() })));
        loadStats();
      }
    } catch (error) {
      console.error('Error marcando todos los mensajes como leídos:', error);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      const response = await messageService.deleteMessage(messageId);
      if (response.success) {
        setMessages(messages.filter(msg => msg.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
        loadStats();
      }
    } catch (error) {
      console.error('Error eliminando mensaje:', error);
    }
  };

  // Funciones para selección múltiple como Gmail
  const handleSelectMessage = (messageId: number) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map((m: Message) => m.id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkMarkAsRead = async () => {
    try {
      for (const messageId of selectedMessages) {
        await messageService.markAsRead(messageId);
      }
      setMessages(messages.map((m: Message) => 
        selectedMessages.includes(m.id) ? { ...m, read: true } : m
      ));
      setSelectedMessages([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const messageId of selectedMessages) {
        await messageService.deleteMessage(messageId);
      }
      setMessages(messages.filter((m: Message) => !selectedMessages.includes(m.id)));
      setSelectedMessages([]);
      setSelectAll(false);
      if (selectedMessage && selectedMessages.includes(selectedMessage.id)) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting messages:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟠';
      case 'normal':
        return '🔵';
      case 'low':
        return '⚪';
      default:
        return '🔵';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-gray-800';
      case 'high':
        return 'text-gray-700';
      case 'normal':
        return 'text-gray-600';
      case 'low':
        return 'text-gray-500';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Baja';
      default:
        return 'Normal';
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <style>
        {`
          * {
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
          }
          select.custom-select {
            background-color: white !important;
            color: #374151 !important;
          }
          select.custom-select option {
            background-color: white !important;
            color: #374151 !important;
            padding: 8px 12px !important;
          }
          select.custom-select option:hover {
            background-color: #4a0e0f !important;
            color: white !important;
          }
          select.custom-select option:checked {
            background-color: #4a0e0f !important;
            color: white !important;
          }
          select.custom-select option:focus {
            background-color: #4a0e0f !important;
            color: white !important;
          }
          select.custom-select option:active {
            background-color: #4a0e0f !important;
            color: white !important;
          }
          select.custom-select option:selected {
            background-color: #4a0e0f !important;
            color: white !important;
          }
          select.custom-select::-ms-expand {
            display: none !important;
          }
        `}
      </style>
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[9999] p-3 sm:p-4" 
      onClick={(e) => {
        // Cerrar modal al hacer clic fuera de él
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className={`bg-white rounded-xl xs:rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] xs:h-[90vh] sm:h-[85vh] flex flex-col transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          background: '#ffffff',
          boxShadow: `
            0 32px 64px rgba(0, 0, 0, 0.16), 
            0 16px 32px rgba(0, 0, 0, 0.12),
            0 8px 16px rgba(0, 0, 0, 0.08)
          `,
          border: '1px solid #e5e7eb'
        }}
        onClick={(e) => e.stopPropagation()} // Prevenir que se cierre al hacer clic dentro del modal
      >
        {/* Header - Moderno con Gradiente Slate */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 xs:p-5 sm:p-6 border-b border-slate-700/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/50 via-transparent to-slate-800/30 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-slate-600/10 via-slate-500/5 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3 xs:space-x-4">
              <div className="w-10 h-10 xs:w-12 xs:h-12 bg-white/15 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                <Mail className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-base xs:text-lg sm:text-xl font-black text-white tracking-tight">
                  El Mensajero
                </h2>
                {stats && (
                  <div className="flex items-center space-x-2 xs:space-x-3 text-[10px] xs:text-xs mt-1 text-slate-300">
                    <span className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full backdrop-blur-xl border border-white/20">
                      <CheckCircle className="w-3 h-3" />
                      Total: {stats.total}
                    </span>
                    <span className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full backdrop-blur-xl border border-white/20">
                      <AlertCircle className="w-3 h-3" />
                      No leídos: {stats.unread}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 xs:w-9 xs:h-9 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-white/30 shadow-lg hover:scale-110"
              title="Cerrar"
            >
              <X className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs - Modernos */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 py-3 xs:py-3.5 px-4 xs:px-6 text-center font-bold text-sm xs:text-base transition-all duration-300 relative ${
              activeTab === 'inbox'
                ? 'bg-white text-slate-900 border-b-2 border-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Bandeja de entrada
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-3 xs:py-3.5 px-4 xs:px-6 text-center font-bold text-sm xs:text-base transition-all duration-300 relative ${
              activeTab === 'sent'
                ? 'bg-white text-slate-900 border-b-2 border-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Enviados
          </button>
        </div>

        {/* Search and Filters - Modernos */}
        <div className="p-3 xs:p-4 border-b border-slate-200 bg-slate-50/30">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 xs:gap-3">
            {/* Grupo de búsqueda y filtro juntos */}
            <div className="flex flex-1 items-center gap-2">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-2.5 xs:left-3 top-1/2 transform -translate-y-1/2 w-3.5 xs:w-4 h-3.5 xs:h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar mensajes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 xs:pl-10 pr-3 xs:pr-4 py-2 xs:py-2.5 border-2 border-slate-300 rounded-xl transition-all duration-300 text-slate-700 text-xs xs:text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
                />
              </div>
              <div className="relative dropdown-container flex-shrink-0 w-auto min-w-[120px]">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-3 py-2 xs:py-2.5 border-2 border-slate-300 rounded-xl transition-all duration-300 text-slate-700 bg-white text-left flex items-center justify-between text-xs xs:text-sm font-medium hover:border-slate-500 focus:ring-2 focus:ring-slate-500 whitespace-nowrap"
                >
                  <span>
                    {filter === 'all' ? 'Todos' : filter === 'unread' ? 'No leídos' : 'Leídos'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 flex-shrink-0 ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden min-w-full">
                    <button
                      onClick={() => {
                        setFilter('all');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left transition-all duration-200 text-sm font-medium ${
                        filter === 'all' ? 'bg-slate-50 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => {
                        setFilter('unread');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left transition-all duration-200 text-sm font-medium ${
                        filter === 'unread' ? 'bg-slate-50 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      No leídos
                    </button>
                    <button
                      onClick={() => {
                        setFilter('read');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left transition-all duration-200 text-sm font-medium ${
                        filter === 'read' ? 'bg-slate-50 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    Leídos
                  </button>
                </div>
              )}
            </div>
            {/* Botones de acción separados */}
            <div className="flex items-center gap-2 xs:gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowNewMessageModal(true);
                }}
                className="px-2.5 xs:px-3 py-1.5 xs:py-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg flex items-center gap-1.5 xs:gap-2 transition-all duration-300 text-xs xs:text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 border border-slate-700/50"
              >
                <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden xs:inline">Nuevo</span>
              </button>
              {activeTab === 'inbox' && stats && stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                  className="px-2.5 xs:px-4 py-1.5 xs:py-2 text-white rounded-lg flex items-center gap-1.5 xs:gap-2 transition-all duration-300 shadow-sm hover:shadow-md bg-slate-700 hover:bg-slate-800 border border-slate-600 text-xs xs:text-sm font-bold"
              >
                <Eye className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                  <span className="hidden xs:inline">Marcar todos como leídos</span>
                  <span className="xs:hidden">Todos leídos</span>
              </button>
            )}
            </div>
          </div>
        </div>

        {/* Barra de herramientas Gmail-style */}
        {selectedMessages.length > 0 && (
          <div className="px-3 xs:px-4 sm:px-6 py-2 xs:py-3 border-b border-slate-200 bg-slate-50 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-4">
            <div className="flex items-center gap-2 xs:gap-4 w-full xs:w-auto">
              <span className="text-xs xs:text-sm font-bold text-slate-700 whitespace-nowrap">
                {selectedMessages.length} seleccionado{selectedMessages.length > 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-1.5 xs:gap-2">
                <button
                  onClick={handleBulkMarkAsRead}
                  className="px-2 xs:px-3 py-1.5 text-xs bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-500 text-slate-700 font-bold transition-all duration-300"
                  title="Marcar como leído"
                >
                  <Eye className="w-3.5 h-3.5 xs:w-4 xs:h-4 inline xs:mr-1" />
                  <span className="hidden xs:inline">Leído</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-2 xs:px-3 py-1.5 text-xs bg-white border-2 border-red-300 rounded-lg hover:bg-red-50 hover:border-red-500 text-red-600 font-bold transition-all duration-300"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 inline xs:mr-1" />
                  <span className="hidden xs:inline">Eliminar</span>
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedMessages([]);
                setSelectAll(false);
              }}
              className="text-xs xs:text-sm text-slate-500 hover:text-slate-700 font-bold transition-colors whitespace-nowrap"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Message List - Responsivo */}
          <div className={`w-full md:w-1/3 border-r border-slate-200 overflow-y-auto bg-slate-50/50 ${
            selectedMessage ? 'hidden md:block' : 'block'
          }`}>
            {/* Header con checkbox para seleccionar todos */}
            {messages.length > 0 && (
              <div className="p-3 xs:p-4 border-b border-slate-200 bg-white flex items-center space-x-2 xs:space-x-3">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                    className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
                />
                <span className="text-xs xs:text-sm font-bold text-slate-700">
                  Seleccionar todos
                </span>
              </div>
            )}
            {loading ? (
              <div className="p-6 xs:p-8 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-7 h-7 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
                  <span className="text-sm font-semibold text-slate-600">Cargando mensajes...</span>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-6 xs:p-8 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-lg shadow-slate-100/50">
                    <Mail className="w-7 h-7 text-slate-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    No hay mensajes {activeTab === 'inbox' ? 'recibidos' : 'enviados'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`group relative p-3 xs:p-4 border-b border-slate-200 cursor-pointer transition-all duration-300 hover:bg-slate-50/50 ${
                      selectedMessage?.id === message.id ? 'bg-slate-50/50 border-l-4 border-slate-600' : ''
                    } ${!message.read && activeTab === 'inbox' ? 'bg-slate-50/30' : ''}`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start gap-2 xs:gap-3">
                      {/* Checkbox para selección individual */}
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(message.id)}
                        onChange={() => handleSelectMessage(message.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500 mt-1 flex-shrink-0"
                      />
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <div className={`w-10 h-10 xs:w-12 xs:h-12 rounded-xl flex items-center justify-center shadow-sm border-2 font-bold text-sm xs:text-base transition-all duration-300 group-hover:scale-110 ${
                            !message.read && activeTab === 'inbox' 
                              ? 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300 text-slate-700' 
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}>
                            {message.sender?.name?.charAt(0) || message.recipient?.name?.charAt(0) || '?'}
                          </div>
                          {/* Indicador de no leído */}
                          {!message.read && activeTab === 'inbox' && (
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-slate-600 rounded-full border-2 border-white shadow-sm"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <p className={`text-sm xs:text-base font-bold truncate ${
                            !message.read && activeTab === 'inbox' ? 'text-slate-900' : 'text-slate-700'
                          }`}>
                            {activeTab === 'inbox' ? message.sender?.name : message.recipient?.name}
                          </p>
                          <div className="flex items-center gap-1.5 xs:gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Aquí se podría implementar la funcionalidad de estrella
                              }}
                              className="text-slate-400 hover:text-amber-500 transition-all duration-300 hover:scale-110 p-1"
                              title="Marcar como importante"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                            <span className="text-xs">{getPriorityIcon(message.priority)}</span>
                            <span className="text-[10px] xs:text-xs text-slate-500 font-semibold whitespace-nowrap">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm xs:text-base truncate font-semibold mb-1.5 ${
                          !message.read && activeTab === 'inbox' ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {message.subject}
                        </p>
                        <p className="text-xs xs:text-sm text-slate-600 truncate leading-relaxed mb-2">
                          {message.content.substring(0, 60)}...
                        </p>
                        {/* Badges modernos */}
                        <div className="flex flex-wrap gap-1.5">
                          {message.priority === 'urgent' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] xs:text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                              Urgente
                            </span>
                          )}
                          {!message.read && activeTab === 'inbox' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] xs:text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              No leído
                            </span>
                          )}
                          {activeTab === 'sent' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] xs:text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                              Enviado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Detail - Desktop */}
          <div className="flex-1 flex flex-col bg-white hidden md:flex">
            {selectedMessage ? (
              <>
                {/* Message Header - Moderno con Gradiente Slate */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 xs:p-5 sm:p-6 border-b border-slate-700/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/50 via-transparent to-slate-800/30 animate-pulse"></div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-slate-600/10 via-slate-500/5 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base xs:text-lg sm:text-xl font-black mb-2 text-white tracking-tight">{selectedMessage.subject}</h3>
                      <div className="flex flex-wrap items-center gap-3 xs:gap-4 text-xs text-slate-300 mb-2 font-medium">
                        <span className="flex items-center gap-1.5 bg-white/15 px-2 py-1 rounded-lg backdrop-blur-xl border border-white/20">
                          <span className="font-bold">De:</span>
                          <span className="text-white">{selectedMessage.sender?.name}</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/15 px-2 py-1 rounded-lg backdrop-blur-xl border border-white/20">
                          <span className="font-bold">Para:</span>
                          <span className="text-white">{selectedMessage.recipient?.name}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 xs:gap-3 text-xs text-slate-300">
                        <span className="flex items-center gap-1.5 bg-white/15 px-2 py-1 rounded-lg backdrop-blur-xl border border-white/20">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(selectedMessage.created_at).toLocaleString('es-ES')}
                        </span>
                        <span className={`flex items-center gap-1.5 bg-white/15 px-2 py-1 rounded-lg backdrop-blur-xl border border-white/20 ${getPriorityColor(selectedMessage.priority)}`}>
                          {getPriorityIcon(selectedMessage.priority)} {selectedMessage.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      {activeTab === 'inbox' && !selectedMessage.read && (
                        <button
                          onClick={() => handleMarkAsRead(selectedMessage.id)}
                          className="w-9 h-9 xs:w-10 xs:h-10 text-white hover:bg-white/20 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/30 hover:border-white/50 flex items-center justify-center shadow-lg hover:scale-110"
                          title="Marcar como leído"
                        >
                          <Eye className="w-4 h-4 xs:w-5 xs:h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                        className="w-9 h-9 xs:w-10 xs:h-10 text-white hover:bg-red-500/30 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/30 hover:border-red-400/50 flex items-center justify-center shadow-lg hover:scale-110"
                        title="Eliminar mensaje"
                      >
                        <Trash2 className="w-4 h-4 xs:w-5 xs:h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 p-4 xs:p-5 sm:p-6 overflow-y-auto bg-slate-50/30">
                  <div className="bg-white rounded-xl p-4 xs:p-5 sm:p-6 border border-slate-200 shadow-sm">
                    <div className="whitespace-pre-wrap text-slate-800 leading-relaxed text-sm xs:text-base">
                      {selectedMessage.content}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-slate-50/30">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-100/50">
                    <Mail className="w-10 h-10 text-slate-600" />
                  </div>
                  <p className="text-base xs:text-lg font-bold text-slate-700 mb-1">Selecciona un mensaje</p>
                  <p className="text-sm text-slate-500">para ver su contenido</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Modal de Nuevo Mensaje */}
    {showNewMessageModal && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[80] p-2 xs:p-3 sm:p-4">
        <div 
          className="bg-white rounded-xl xs:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] xs:max-h-[90vh] sm:max-h-[85vh] md:max-h-[75vh] overflow-y-auto flex flex-col"
          style={{
            border: '1px solid #e5e7eb'
          }}
        >
          {/* Header - Moderno con Gradiente Slate */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 xs:p-5 sm:p-6 border-b border-slate-700/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/50 via-transparent to-slate-800/30 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-slate-600/10 via-slate-500/5 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-2 xs:space-x-3">
                <div className="w-9 h-9 xs:w-10 xs:h-10 bg-white/15 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                  <Mail className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                </div>
                <h3 className="text-base xs:text-lg sm:text-xl font-black text-white tracking-tight">Nuevo Mensaje</h3>
              </div>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="w-8 h-8 xs:w-9 xs:h-9 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-white/30 shadow-lg hover:scale-110"
              >
                <X className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Contenido del formulario */}
          <div className="flex-1 p-3 xs:p-4 sm:p-5 lg:p-6 space-y-3 xs:space-y-4 bg-white">
            <div className="flex flex-col xs:flex-row gap-3">
              <div className="flex-1 min-w-0">
                <label className="block text-xs xs:text-sm font-bold text-slate-700 mb-1.5">Para:</label>
                <input
                  type="text"
                  placeholder="Nombre del destinatario"
                  className="w-full px-3 py-2 xs:py-2.5 border-2 border-slate-300 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all duration-300 text-xs xs:text-sm sm:text-base bg-white"
                />
              </div>
              
              <div className="w-full xs:w-36 sm:w-40 relative priority-dropdown-container">
                <label className="block text-xs xs:text-sm font-bold text-slate-700 mb-1.5">Prioridad:</label>
                <button
                  onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                  className="w-full px-3 py-2 xs:py-2.5 border-2 border-slate-300 rounded-xl transition-all duration-300 text-slate-700 bg-white text-left flex items-center justify-between text-xs xs:text-sm sm:text-base font-medium hover:border-slate-500 focus:ring-2 focus:ring-slate-500"
                >
                  <span>{getPriorityText(selectedPriority)}</span>
                  <svg
                    className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isPriorityDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isPriorityDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden">
                    <button
                      onClick={() => {
                        setSelectedPriority('normal');
                        setIsPriorityDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left transition-all duration-200 text-sm font-medium ${
                        selectedPriority === 'normal' ? 'bg-slate-50 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPriority('high');
                        setIsPriorityDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left transition-all duration-200 text-sm font-medium ${
                        selectedPriority === 'high' ? 'bg-slate-50 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Alta
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPriority('urgent');
                        setIsPriorityDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left transition-all duration-200 text-sm font-medium ${
                        selectedPriority === 'urgent' ? 'bg-slate-50 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Urgente
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs xs:text-sm font-bold text-slate-700 mb-1.5">Asunto:</label>
              <input
                type="text"
                placeholder="Asunto del mensaje"
                className="w-full px-3 py-2 xs:py-2.5 border-2 border-slate-300 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all duration-300 text-xs xs:text-sm sm:text-base bg-white"
              />
            </div>
            
            <div>
              <label className="block text-xs xs:text-sm font-bold text-slate-700 mb-1.5">Mensaje:</label>
              <textarea
                placeholder="Escribe tu mensaje aquí..."
                rows={5}
                className="w-full px-3 py-2 xs:py-2.5 border-2 border-slate-300 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all duration-300 text-xs xs:text-sm sm:text-base resize-none bg-white"
              />
            </div>
          </div>
          
          {/* Footer - Moderno */}
          <div className="p-3 xs:p-4 sm:p-5 lg:p-6 flex flex-col xs:flex-row justify-end gap-2 xs:gap-3 bg-white border-t border-slate-200">
            <button
              onClick={() => setShowNewMessageModal(false)}
              className="px-4 py-2 xs:py-2.5 text-slate-600 border-2 border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 text-xs xs:text-sm font-bold order-2 xs:order-1"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                // Aquí se enviaría el mensaje
                setShowNewMessageModal(false);
                // Mostrar notificación de éxito
              }}
              className="px-5 py-2 xs:py-2.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl hover:from-slate-800 hover:to-slate-700 transition-all duration-300 text-xs xs:text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 border border-slate-700/50 order-1 xs:order-2"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    )}
      
  
    document.body
  );
};

export default MessagePanel;