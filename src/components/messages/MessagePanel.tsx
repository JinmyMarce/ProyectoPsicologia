import React, { useState, useEffect } from 'react';
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

  return (
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
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[70] p-4" 
      style={{
        paddingLeft: window.innerWidth >= 1024 ? 'calc(2rem + 288px)' : '1rem' // Ajustar para la barra lateral solo en desktop
      }}
      onClick={(e) => {
        // Cerrar modal al hacer clic fuera de él
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }"
        style={{
          background: '#ffffff',
          boxShadow: `
            0 10px 25px rgba(0, 0, 0, 0.1),
            0 4px 10px rgba(0, 0, 0, 0.05)
          `,
          border: '1px solid #e5e7eb'
        }}
        onClick={(e) => e.stopPropagation()} // Prevenir que se cierre al hacer clic dentro del modal
      >
        {/* Header - Formal y Sutil */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white" style={{
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 border border-gray-200">
            <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                El Mensajero
              </h2>
            {stats && (
                <div className="flex items-center space-x-4 text-xs mt-1 text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Total: {stats.total}
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    No leídos: {stats.unread}
                  </span>
              </div>
            )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-gray-100 border border-gray-200"
            title="Cerrar"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Tabs - Formal y Sutil */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 py-3 px-6 text-center font-medium transition-all duration-200 ${
              activeTab === 'inbox'
                ? 'bg-white text-gray-800 border-b-2 border-gray-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            Bandeja de entrada
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-3 px-6 text-center font-medium transition-all duration-200 ${
              activeTab === 'sent'
                ? 'bg-white text-gray-800 border-b-2 border-gray-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            Enviados
          </button>
        </div>

        {/* Search and Filters - Formal y Sutil */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative" style={{ minWidth: '200px' }}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar mensajes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg transition-all duration-200 text-gray-700 text-sm"
                style={{
                  borderColor: '#d1d5db',
                  borderWidth: '1px',
                  '--tw-placeholder-color': '#4a0e0f'
                } as any}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4a0e0f';
                  e.target.style.boxShadow = '0 0 0 2px rgba(74, 14, 15, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#4a0e0f';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#d1d5db';
                }}
              />
            </div>
            <div className="relative dropdown-container" style={{ minWidth: '50px', flex: '0.15' }}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-3 py-2 border rounded-lg transition-all duration-200 text-gray-700 bg-white w-full text-left flex items-center justify-between text-sm"
                style={{
                  borderColor: '#d1d5db',
                  borderWidth: '1px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#4a0e0f';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <span>
                  {filter === 'all' ? 'Todos' : filter === 'unread' ? 'No leídos' : 'Leídos'}
                </span>
                <svg
                  className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setFilter('all');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left transition-colors duration-200 first:rounded-t-lg text-sm"
                    style={{
                      backgroundColor: 'white',
                      color: '#374151'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4a0e0f';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#374151';
                    }}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => {
                      setFilter('unread');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left transition-colors duration-200 text-sm"
                    style={{
                      backgroundColor: 'white',
                      color: '#374151'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4a0e0f';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#374151';
                    }}
                  >
                    No leídos
                  </button>
                  <button
                    onClick={() => {
                      setFilter('read');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left transition-colors duration-200 last:rounded-b-lg text-sm"
                    style={{
                      backgroundColor: 'white',
                      color: '#374151'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4a0e0f';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#374151';
                    }}
                  >
                    Leídos
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowNewMessageModal(true);
                }}
                className="px-3 py-2 text-white rounded-lg flex items-center space-x-2 transition-all duration-200 text-sm"
                style={{
                  background: '#4a0e0f',
                  border: '1px solid #4a0e0f'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#6b1013';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#4a0e0f';
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium">Nuevo</span>
              </button>
              {activeTab === 'inbox' && stats && stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                  className="px-4 py-2 text-white rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md bg-gray-700 hover:bg-gray-800 border border-gray-600"
              >
                <Eye className="w-4 h-4" />
                  <span className="font-medium">Marcar todos como leídos</span>
              </button>
            )}
            </div>
          </div>
        </div>

        {/* Barra de herramientas Gmail-style */}
        {selectedMessages.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-200 bg-blue-50 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedMessages.length} seleccionado{selectedMessages.length > 1 ? 's' : ''}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkMarkAsRead}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  title="Marcar como leído"
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  Leído
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Eliminar
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedMessages([]);
                setSelectAll(false);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Message List - Formal */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-gray-50">
            {/* Header con checkbox para seleccionar todos */}
            {messages.length > 0 && (
              <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Seleccionar todos
                </span>
              </div>
            )}
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600"></div>
                  <span className="text-sm font-medium">Cargando mensajes...</span>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="flex flex-col items-center space-y-3">
                  <Mail className="w-12 h-12 text-gray-400" />
                  <span className="text-sm font-medium">
                No hay mensajes {activeTab === 'inbox' ? 'recibidos' : 'enviados'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 transition-all duration-200 hover:bg-white hover:shadow-sm ${
                      selectedMessage?.id === message.id ? 'bg-white shadow-sm' : ''
                    } ${!message.read && activeTab === 'inbox' ? 'bg-white/80' : ''}`}
                    style={{
                      borderRight: selectedMessage?.id === message.id ? '3px solid #6b7280' : '3px solid transparent',
                      backgroundColor: !message.read && activeTab === 'inbox' ? 'rgba(107, 114, 128, 0.05)' : 'transparent',
                      borderRadius: selectedMessage?.id === message.id ? '0.5rem 0 0 0.5rem' : '0'
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Checkbox para selección individual */}
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(message.id)}
                        onChange={() => handleSelectMessage(message.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                      />
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{
                            backgroundColor: !message.read && activeTab === 'inbox' ? 'rgba(107, 114, 128, 0.1)' : '#f3f4f6',
                            border: '1px solid rgba(107, 114, 128, 0.1)'
                          }}>
                            <span className="text-sm font-semibold" style={{
                              color: !message.read && activeTab === 'inbox' ? '#6b7280' : '#6b7280'
                            }}>
                            {message.sender?.name?.charAt(0) || message.recipient?.name?.charAt(0) || '?'}
                          </span>
                          </div>
                          {/* Indicador de no leído como Gmail */}
                          {!message.read && activeTab === 'inbox' && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                      </div>
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold truncate text-gray-900">
                            {activeTab === 'inbox' ? message.sender?.name : message.recipient?.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Aquí se podría implementar la funcionalidad de estrella
                              }}
                              className="text-gray-400 hover:text-yellow-500 transition-colors"
                              title="Marcar como importante"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                            <span className="text-xs">{getPriorityIcon(message.priority)}</span>
                            <span className="text-xs text-gray-500 font-medium">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm truncate font-medium mb-1 text-gray-800">
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-500 truncate leading-relaxed">
                          {message.content.substring(0, 60)}...
                        </p>
                        {/* Etiquetas como Gmail */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.priority === 'urgent' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Urgente
                            </span>
                          )}
                          {!message.read && activeTab === 'inbox' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              No leído
                            </span>
                          )}
                          {activeTab === 'sent' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
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

          {/* Message Detail */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedMessage ? (
              <>
                {/* Message Header - Granate Super Oscuro */}
                <div className="p-6 border-b border-gray-200" style={{ 
                  background: 'linear-gradient(135deg, #4a0e0f 0%, #6b1013 100%)',
                  borderBottom: '2px solid #4a0e0f',
                  borderRadius: '0 0 0.5rem 0.5rem'
                }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 text-white tracking-wide">{selectedMessage.subject}</h3>
                      <div className="flex items-center space-x-4 text-xs text-white/85 mb-2 font-medium">
                        <span className="flex items-center gap-2">
                          <span className="font-semibold">De:</span>
                          <span className="text-white">{selectedMessage.sender?.name}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="font-semibold">Para:</span>
                          <span className="text-white">{selectedMessage.recipient?.name}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-white/75">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                        {new Date(selectedMessage.created_at).toLocaleString('es-ES')}
                        </span>
                        <span className={`flex items-center gap-1 ${getPriorityColor(selectedMessage.priority)}`}>
                          {getPriorityIcon(selectedMessage.priority)} {selectedMessage.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {activeTab === 'inbox' && !selectedMessage.read && (
                        <button
                          onClick={() => handleMarkAsRead(selectedMessage.id)}
                          className="p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                          style={{ 
                            border: '1px solid rgba(255, 255, 255, 0.15)'
                          }}
                          title="Marcar como leído"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                        className="p-2 text-white hover:bg-red-500/20 rounded-lg transition-all duration-200"
                        style={{ border: '1px solid rgba(255, 255, 255, 0.15)' }}
                        title="Eliminar mensaje"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base">
                      {selectedMessage.content}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Mail className="w-16 h-16 mx-auto mb-4" style={{ color: '#6b1013', opacity: 0.3 }} />
                  <p className="text-lg font-medium text-gray-600 mb-2">Selecciona un mensaje</p>
                  <p className="text-sm text-gray-500">para ver su contenido</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Modal de Nuevo Mensaje */}
    {showNewMessageModal && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[80] p-4">
        <div 
          className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[75vh] overflow-y-auto flex flex-col"
          style={{
            border: '1px solid #e5e7eb'
          }}
        >
          {/* Header - Formal y Sutil */}
          <div className="p-4 bg-white" style={{
            borderBottom: '2px solid #1a2332'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{
                  backgroundColor: '#4a0e0f'
                }}>
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Nuevo Mensaje</h3>
              </div>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 bg-white border border-gray-200 hover:bg-gray-50"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Contenido del formulario */}
          <div className="flex-1 p-4 space-y-4 bg-white">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Para:</label>
                <input
                  type="text"
                  placeholder="Nombre del destinatario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-400 focus:outline-none transition-colors text-sm"
                />
              </div>
              
              <div style={{ width: '140px' }} className="relative priority-dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad:</label>
                <button
                  onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-200 text-gray-700 bg-white text-left flex items-center justify-between text-sm"
                  style={{
                    borderColor: '#d1d5db'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4a0e0f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
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
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => {
                        setSelectedPriority('normal');
                        setIsPriorityDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left transition-colors duration-200 first:rounded-t-md text-sm"
                      style={{
                        backgroundColor: 'white',
                        color: '#374151'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4a0e0f';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.color = '#374151';
                      }}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPriority('high');
                        setIsPriorityDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left transition-colors duration-200 text-sm"
                      style={{
                        backgroundColor: 'white',
                        color: '#374151'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4a0e0f';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.color = '#374151';
                      }}
                    >
                      Alta
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPriority('urgent');
                        setIsPriorityDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left transition-colors duration-200 last:rounded-b-md text-sm"
                      style={{
                        backgroundColor: 'white',
                        color: '#374151'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4a0e0f';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.color = '#374151';
                      }}
                    >
                      Urgente
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asunto:</label>
              <input
                type="text"
                placeholder="Asunto del mensaje"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-400 focus:outline-none transition-colors text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje:</label>
              <textarea
                placeholder="Escribe tu mensaje aquí..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-gray-400 focus:outline-none transition-colors text-sm resize-none"
              />
            </div>
          </div>
          
          {/* Footer - Formal y Sutil */}
          <div className="p-4 flex justify-end space-x-2 bg-white" style={{
            borderTop: '2px solid #1a2332'
          }}>
            <button
              onClick={() => setShowNewMessageModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                // Aquí se enviaría el mensaje
                setShowNewMessageModal(false);
                // Mostrar notificación de éxito
              }}
              className="px-4 py-2 text-white rounded-md transition-colors text-sm font-medium"
              style={{
                background: '#4a0e0f',
                border: '1px solid #4a0e0f'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#6b1013';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#4a0e0f';
              }}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default MessagePanel; 