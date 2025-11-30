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
  const [loadingPsychologist, setLoadingPsychologist] = useState(false);
  const { user } = useAuth();

  // Cargar psicólogo inmediatamente cuando el componente se monta o cuando isOpen cambia
  useEffect(() => {
    if (user?.role === 'student' && !defaultRecipient && !selectedRecipient) {
      // Cargar inmediatamente, no esperar a que isOpen sea true
      loadMyPsychologist();
    }
  }, [user?.role, defaultRecipient]);

  useEffect(() => {
    if (isOpen) {
      // Si es estudiante y ya tenemos el psicólogo, no cargar de nuevo
      if (user?.role === 'student' && !defaultRecipient && !selectedRecipient) {
        loadMyPsychologist();
      } else if (user?.role !== 'student') {
        loadRecipients();
      }
    }
  }, [isOpen, searchTerm]);

  const loadMyPsychologist = async () => {
    // Si ya tenemos el psicólogo, no cargar de nuevo
    if (selectedRecipient) return;
    
    setLoadingPsychologist(true);
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
    } finally {
      setLoadingPsychologist(false);
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
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] p-2 xs:p-3 sm:p-4 animate-in fade-in duration-200" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-slate-800/20 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          backgroundColor: '#ffffff', 
          borderColor: '#1e293b',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(30, 41, 59, 0.1)'
        }}
      >
        {/* Header - Minimalista */}
        <div className="px-5 xs:px-6 py-4 xs:py-5 border-b border-slate-700/30 bg-gradient-to-r from-slate-800 to-slate-900 relative overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-white/20 rounded-full"></div>
              <div>
                <h2 className="text-lg xs:text-xl font-semibold text-white tracking-tight">Nuevo mensaje</h2>
                <p className="text-xs xs:text-sm text-slate-300/80 mt-0.5">Este mensaje es privado y confidencial.</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 xs:w-9 xs:h-9 flex items-center justify-center rounded-xl hover:bg-slate-700/60 active:scale-95 transition-all duration-200 text-white/80 hover:text-white backdrop-blur-sm"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4 xs:w-5 xs:h-5" />
            </button>
          </div>
        </div>

        {/* Form - Compacto */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">
          <div className="flex-1 overflow-y-auto p-5 xs:p-6 space-y-4 xs:space-y-5">
            {/* Información del psicólogo - Una sola línea */}
            {user?.role === 'student' && (
              loadingPsychologist ? (
                <div className="relative pb-3 xs:pb-4 border-b border-gray-200/30 bg-white rounded-2xl p-4 xs:p-5 -mx-5 xs:-mx-6 shadow-sm border border-gray-100/50 animate-pulse">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-800/20 via-slate-700/10 to-transparent rounded-t-2xl"></div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-3 w-24 bg-slate-200 rounded mb-2"></div>
                      <div className="h-4 w-32 bg-slate-200 rounded mb-1.5"></div>
                      <div className="h-3 w-40 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ) : selectedRecipient ? (
                <div className="relative pb-3 xs:pb-4 border-b border-gray-200/30 bg-white rounded-2xl p-4 xs:p-5 -mx-5 xs:-mx-6 shadow-sm border border-gray-100/50">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-800/20 via-slate-700/10 to-transparent rounded-t-2xl"></div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs xs:text-sm text-gray-500 mb-1.5 font-semibold tracking-wide">Psicólogo asignado</div>
                      <div className="text-sm xs:text-base text-gray-900 font-semibold break-words">
                        <span className="break-words">{selectedRecipient.name}</span>
                      </div>
                      <div className="text-xs xs:text-sm text-gray-500 break-all mt-0.5">{selectedRecipient.email}</div>
                    </div>
                  </div>
                </div>
              ) : null
            )}

            {/* Búsqueda de destinatario para otros roles */}
            {user?.role !== 'student' && (
              <div className="space-y-2.5">
                <label className="block text-xs xs:text-sm font-semibold text-gray-700 pl-1">
                  Destinatario <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="flex items-center gap-3 p-3 xs:p-3.5 border border-gray-300/60 rounded-2xl bg-white focus-within:border-slate-800 focus-within:ring-2 focus-within:ring-slate-800/10 focus-within:shadow-lg transition-all duration-200 group">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 group-focus-within:bg-slate-100 transition-colors">
                      <User className="w-4 h-4 xs:w-5 xs:h-5 text-gray-500 flex-shrink-0" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar destinatario..."
                      value={selectedRecipient ? selectedRecipient.name : searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowRecipientDropdown(true);
                        if (!e.target.value) {
                          setSelectedRecipient(null);
                        }
                      }}
                      onFocus={() => setShowRecipientDropdown(true)}
                      className="flex-1 outline-none text-sm xs:text-base min-w-0 text-gray-900 placeholder-gray-400 bg-transparent"
                      style={{ outline: 'none' }}
                    />
                    <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 group-focus-within:bg-slate-100 transition-colors">
                      <Search className="w-4 h-4 xs:w-5 xs:h-5 text-gray-500 flex-shrink-0" />
                    </div>
                  </div>
                
                  {showRecipientDropdown && user && (user.role === 'psychologist' || user.role === 'admin' || user.role === 'super_admin') && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-40 xs:max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                      {recipients.length === 0 ? (
                        <div className="p-2.5 xs:p-3 text-xs xs:text-sm text-gray-500 text-center">
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
                            className="p-2.5 xs:p-3 hover:bg-slate-50 active:bg-slate-100 cursor-pointer border-b border-gray-100/50 last:border-b-0 transition-all duration-150 first:rounded-t-xl last:rounded-b-xl"
                          >
                            <div className="text-sm xs:text-base font-semibold text-gray-900 break-words">{recipient.name}</div>
                            <div className="text-xs xs:text-sm text-gray-500 truncate break-all mt-0.5">{recipient.email}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mensaje si no hay psicólogo asignado */}
            {user?.role === 'student' && !selectedRecipient && (
              <div className="relative text-xs xs:text-sm text-slate-700 bg-white border border-slate-200/60 rounded-2xl p-4 xs:p-5 shadow-sm">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 rounded-l-2xl"></div>
                <div className="pl-3">No tienes psicólogo asignado. Agenda una cita primero.</div>
              </div>
            )}

            {/* Asunto */}
            <div className="space-y-2.5">
              <label htmlFor="subject" className="block text-xs xs:text-sm font-semibold text-gray-700 pl-1">
                Asunto <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Motivo del mensaje"
                  className="w-full p-3 xs:p-3.5 text-sm xs:text-base border border-gray-300/60 rounded-2xl focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 focus:shadow-lg transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white pl-4"
                  required
                  aria-required="true"
                  style={{ outline: 'none' }}
                />
              </div>
            </div>

            {/* Mensaje */}
            <div className="space-y-2.5">
              <label htmlFor="content" className="block text-xs xs:text-sm font-semibold text-gray-700 pl-1">
                Mensaje <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  rows={6}
                  className="w-full p-3 xs:p-3.5 text-sm xs:text-base border border-gray-300/60 rounded-2xl focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 focus:shadow-lg resize-y min-h-[140px] xs:min-h-[160px] transition-all duration-200 leading-relaxed text-gray-900 placeholder-gray-400 bg-white"
                  required
                  aria-required="true"
                  style={{ outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Footer - Compacto */}
          <div className="border-t border-gray-200/30 bg-white px-5 xs:px-6 py-4 xs:py-5 flex flex-row items-center justify-end gap-3 xs:gap-3.5 sm:gap-4 flex-nowrap">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 text-xs xs:text-sm sm:text-base font-semibold text-gray-700 bg-white border border-gray-300/60 rounded-2xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-[0.98] transition-all duration-200 whitespace-nowrap flex-shrink-0"
              aria-label="Cancelar"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRecipient || !subject.trim() || !content.trim()}
              className="px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 bg-[#4A0A0A] text-white rounded-2xl hover:bg-[#3A0808] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-2 xs:gap-2.5 text-xs xs:text-sm sm:text-base font-semibold transition-all duration-200 shadow-lg whitespace-nowrap flex-shrink-0 relative overflow-hidden group"
              aria-label="Enviar mensaje"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" aria-hidden="true"></div>
                  <span className="hidden xs:inline relative z-10">Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 relative z-10" aria-hidden="true" />
                  <span className="hidden xs:inline relative z-10">Enviar mensaje</span>
                  <span className="xs:hidden relative z-10">Enviar</span>
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