import React, { useState, useEffect } from 'react';
import { messageService, Recipient } from '../../services/messages';
import { X, Send, Search, User } from 'lucide-react';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSent?: () => void;
  defaultRecipient?: Recipient;
  defaultSubject?: string;
  defaultContent?: string;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  onMessageSent,
  defaultRecipient,
  defaultSubject,
  defaultContent
}) => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(defaultRecipient || null);
  const [subject, setSubject] = useState(defaultSubject || '');
  const [content, setContent] = useState(defaultContent || '');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [type, setType] = useState<'general' | 'appointment' | 'session' | 'system'>('general');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRecipients();
    }
  }, [isOpen, searchTerm]);

  const loadRecipients = async () => {
    try {
      const response = await messageService.getRecipients({ search: searchTerm });
      if (response.success) {
        setRecipients(response.data);
      }
    } catch (error) {
      console.error('Error cargando destinatarios:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRecipient) {
      alert('Por favor selecciona un destinatario');
      return;
    }

    if (!subject.trim()) {
      alert('Por favor ingresa un asunto');
      return;
    }

    if (!content.trim()) {
      alert('Por favor ingresa el contenido del mensaje');
      return;
    }

    setLoading(true);
    try {
      const response = await messageService.sendMessage({
        recipient_id: selectedRecipient.id,
        subject: subject.trim(),
        content: content.trim(),
        priority,
        type
      });

      if (response.success) {
        alert('Mensaje enviado exitosamente');
        onMessageSent?.();
        handleClose();
      } else {
        alert('Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRecipient(defaultRecipient || null);
    setSubject(defaultSubject || '');
    setContent(defaultContent || '');
    setPriority('normal');
    setType('general');
    setSearchTerm('');
    setShowRecipientDropdown(false);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'normal':
        return 'text-blue-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-blue-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <Send className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Enviar mensaje</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Recipient Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Destinatario *
            </label>
            <div className="relative">
              <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowRecipientDropdown(true);
                  }}
                  onFocus={() => setShowRecipientDropdown(true)}
                  className="flex-1 outline-none"
                />
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              
              {showRecipientDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {recipients.length === 0 ? (
                    <div className="p-3 text-gray-500">No se encontraron estudiantes</div>
                  ) : (
                    recipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        onClick={() => {
                          setSelectedRecipient(recipient);
                          setSearchTerm(recipient.name);
                          setShowRecipientDropdown(false);
                        }}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{recipient.name}</div>
                        <div className="text-sm text-gray-600">{recipient.email}</div>
                        <div className="text-xs text-gray-500">DNI: {recipient.dni}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            {selectedRecipient && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{selectedRecipient.name}</div>
                    <div className="text-sm text-gray-600">{selectedRecipient.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecipient(null);
                      setSearchTerm('');
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Asunto *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto del mensaje"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Priority and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="appointment">Cita</option>
                <option value="session">Sesión</option>
                <option value="system">Sistema</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Contenido *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Priority Indicator */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Prioridad:</span>
            <span className={`text-sm font-medium ${getPriorityColor(priority)}`}>
              {priority === 'urgent' && '🔴 Urgente'}
              {priority === 'high' && '🟠 Alta'}
              {priority === 'normal' && '🔵 Normal'}
              {priority === 'low' && '⚪ Baja'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRecipient || !subject.trim() || !content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar mensaje</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendMessageModal; 