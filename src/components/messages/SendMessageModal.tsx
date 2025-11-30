import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { messageService, Recipient } from '../../services/messages';
import { useAuth } from '../../contexts/AuthContext';
import { X, Send, Search, User } from 'lucide-react';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSent?: () => void;
  onSuccess?: (message: string) => void;
  defaultRecipient?: Recipient | null;
  defaultSubject?: string;
  defaultContent?: string;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  onMessageSent,
  onSuccess,
  defaultRecipient,
  defaultSubject,
  defaultContent
}) => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(defaultRecipient || null);
  const [subject, setSubject] = useState(defaultSubject || '');
  const [content, setContent] = useState(defaultContent || '');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      // Si es estudiante, cargar su psicólogo asignado automáticamente
      if (user?.role === 'student' && !defaultRecipient) {
        loadMyPsychologist();
      } else {
        loadRecipients();
      }
    }
  }, [isOpen, searchTerm]);

  const loadMyPsychologist = async () => {
    try {
      const response = await messageService.getMyPsychologist();
      if (response.success && response.data) {
        setSelectedRecipient(response.data);
        setRecipients([response.data]); // Mostrar solo el psicólogo asignado
      } else if (response.message) {
        // No hay psicólogo asignado aún
        setRecipients([]);
      }
    } catch (error) {
      console.error('Error cargando psicólogo asignado:', error);
      setRecipients([]);
    }
  };

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
        priority: 'normal',
        type: 'general'
      });

      if (response.success) {
        onSuccess?.('Mensaje enviado exitosamente');
        onMessageSent?.();
        handleClose();
      } else {
        onSuccess?.('Error al enviar el mensaje');
      }
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al enviar el mensaje';
      onSuccess?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRecipient(defaultRecipient || null);
    setSubject(defaultSubject || '');
    setContent(defaultContent || '');
    setSearchTerm('');
    setShowRecipientDropdown(false);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-2 xs:p-3 sm:p-4" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Limpio */}
        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo Mensaje</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Recipient Selection */}
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              {user?.role === 'student' ? 'Psicólogo asignado' : 'Destinatario'} <span className="text-red-500">*</span>
            </label>
            {user?.role === 'student' ? (
              <div className="p-4 border border-gray-300 rounded-lg bg-gray-50/50">
                {selectedRecipient ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <User className="w-6 h-6 text-gray-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-base text-gray-900 truncate mb-0.5">{selectedRecipient.name}</div>
                        <div className="text-sm text-gray-600 truncate">{selectedRecipient.email}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecipient(null);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-amber-600 flex items-center gap-2.5 py-1">
                    <X className="w-4 h-4 flex-shrink-0" />
                    <span>No tienes psicólogo asignado. Agenda una cita primero.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2.5 p-3.5 border border-gray-300 rounded-lg bg-white focus-within:border-gray-500 focus-within:ring-2 focus-within:ring-gray-200 transition-all">
                  <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder={user?.role === 'psychologist' ? 'Buscar paciente...' : 'Buscar destinatario...'}
                    value={selectedRecipient ? selectedRecipient.name : searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowRecipientDropdown(true);
                      if (!e.target.value) {
                        setSelectedRecipient(null);
                      }
                    }}
                    onFocus={() => setShowRecipientDropdown(true)}
                    className="flex-1 outline-none text-base min-w-0 text-gray-900 placeholder-gray-400"
                  />
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              
              {showRecipientDropdown && user && (user.role === 'psychologist' || user.role === 'admin' || user.role === 'super_admin') && (
                <div className="absolute z-10 w-full mt-1.5 bg-white border border-gray-300 rounded-lg shadow-xl max-h-52 overflow-y-auto">
                  {recipients.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      {user.role === 'psychologist' ? 'No hay pacientes asignados' : 'No se encontraron destinatarios'}
                    </div>
                  ) : (
                    recipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        onClick={() => {
                          setSelectedRecipient(recipient);
                          setSearchTerm(recipient.name);
                          setShowRecipientDropdown(false);
                        }}
                        className="p-3.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-semibold text-sm text-gray-900 mb-0.5">{recipient.name}</div>
                        <div className="text-sm text-gray-600 truncate">{recipient.email}</div>
                        {recipient.dni && <div className="text-xs text-gray-500 mt-1.5">DNI: {recipient.dni}</div>}
                      </div>
                    ))
                  )}
                </div>
              )}
              </div>
            )}
            
            {selectedRecipient && user?.role !== 'student' && (
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-11 h-11 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <User className="w-6 h-6 text-blue-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-base text-gray-900 truncate mb-0.5">{selectedRecipient.name}</div>
                      <div className="text-sm text-gray-600 truncate">{selectedRecipient.email}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecipient(null);
                      setSearchTerm('');
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-blue-100 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Asunto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ingresa el asunto del mensaje"
              className="w-full p-3.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500 transition-all text-gray-900 placeholder-gray-400"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Contenido del mensaje <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe aquí el contenido de tu mensaje..."
              rows={8}
              className="w-full p-3.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500 resize-y min-h-[200px] transition-all leading-relaxed text-gray-900 placeholder-gray-400"
              required
            />
          </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-white px-5 py-4 flex items-center justify-end gap-3">

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRecipient || !subject.trim() || !content.trim()}
              className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-colors"
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
    </div>,
    document.body
  );
};

export default SendMessageModal; 