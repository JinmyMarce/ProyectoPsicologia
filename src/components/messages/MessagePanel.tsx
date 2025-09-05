import React, { useState, useEffect } from 'react';
import { messageService, Message, MessageStats } from '../../services/messages';
import { Bell, Mail, Send, Trash2, Eye, EyeOff, Search, Filter, Plus } from 'lucide-react';

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

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      loadStats();
    }
  }, [isOpen, activeTab, searchTerm, filter]);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold">Mensajes</h2>
            {stats && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Total: {stats.total}</span>
                <span className="text-gray-700">No leídos: {stats.unread}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'inbox'
                ? 'text-gray-800 border-b-2 border-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Bandeja de entrada
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'sent'
                ? 'text-gray-800 border-b-2 border-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Enviados
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar mensajes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
                             className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="unread">No leídos</option>
              <option value="read">Leídos</option>
            </select>
                         {activeTab === 'inbox' && stats && stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                                 className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Marcar todos como leídos</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Message List */}
          <div className="w-1/3 border-r overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Cargando...</div>
            ) : messages.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No hay mensajes {activeTab === 'inbox' ? 'recibidos' : 'enviados'}
              </div>
            ) : (
              <div className="divide-y">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                                         className={`p-4 cursor-pointer hover:bg-gray-50 ${
                       selectedMessage?.id === message.id ? 'bg-gray-50 border-r-2 border-gray-600' : ''
                     } ${!message.read && activeTab === 'inbox' ? 'bg-gray-50' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                                                 <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                           <span className="text-sm font-medium text-gray-600">
                            {message.sender?.name?.charAt(0) || message.recipient?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium truncate ${
                            !message.read && activeTab === 'inbox' ? 'font-semibold' : ''
                          }`}>
                            {activeTab === 'inbox' ? message.sender?.name : message.recipient?.name}
                          </p>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs">{getPriorityIcon(message.priority)}</span>
                            <span className="text-xs text-gray-500">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm truncate ${
                          !message.read && activeTab === 'inbox' ? 'font-medium' : 'text-gray-600'
                        }`}>
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {message.content.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Detail */}
          <div className="flex-1 flex flex-col">
            {selectedMessage ? (
              <>
                {/* Message Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
                      <p className="text-sm text-gray-600">
                        De: {selectedMessage.sender?.name} • Para: {selectedMessage.recipient?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(selectedMessage.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${getPriorityColor(selectedMessage.priority)}`}>
                        {getPriorityIcon(selectedMessage.priority)} {selectedMessage.priority}
                      </span>
                      {activeTab === 'inbox' && !selectedMessage.read && (
                        <button
                          onClick={() => handleMarkAsRead(selectedMessage.id)}
                                                     className="p-2 text-gray-500 hover:text-gray-600"
                          title="Marcar como leído"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                                                 className="p-2 text-gray-500 hover:text-gray-600"
                        title="Eliminar mensaje"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-800">
                      {selectedMessage.content}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Selecciona un mensaje para ver su contenido
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePanel; 