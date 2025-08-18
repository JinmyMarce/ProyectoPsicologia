import { apiClient } from './apiClient';

// Tipos para la API del chatbot
export interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'options' | 'info' | 'interactive';
  options?: string[];
  priority?: 'high' | 'medium' | 'low';
  category?: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data: {
    type: string;
    title: string;
    message: string;
    quick_replies?: string[];
    priority?: 'high' | 'medium' | 'low';
  };
}

export interface KnowledgeBaseResponse {
  success: boolean;
  message: string;
  data: Record<string, {
    title: string;
    content: any;
  }>;
}

export interface ChatBotStatsResponse {
  success: boolean;
  message: string;
  data: {
    sistema: {
      usuarios_activos: number;
      psicologos_disponibles: number;
      estudiantes_registrados: number;
    };
    citas: {
      total_mes: number;
      pendientes: number;
      confirmadas_hoy: number;
    };
    feriados: {
      proximos_30_dias: number;
      total_año: number;
    };
    horarios: {
      bloques_disponibles: number;
      horario_inicio: string;
      horario_fin: string;
      dias_atencion: number;
    };
  };
}

export interface FeedbackRequest {
  rating: number;
  feedback?: string;
  conversation_id?: string;
  user_profile?: string;
}

export interface ConversationContext {
  lastTopic: string;
  userIntent: string;
  conversationFlow: string[];
  userProfile?: 'estudiante' | 'psicologo' | 'admin' | 'unknown';
}

class ChatBotService {
  /**
   * Enviar mensaje al chatbot y obtener respuesta
   */
  async sendMessage(params: {
    message: string;
    user_profile?: 'estudiante' | 'psicologo' | 'admin' | 'unknown';
    context?: ConversationContext;
  }): Promise<ChatResponse> {
    const response = await apiClient.post('/chatbot/chat', {
      message: params.message,
      user_profile: params.user_profile || 'unknown',
      context: params.context || {}
    });
    return response.data;
  }

  /**
   * Obtener base de conocimiento
   */
  async getKnowledgeBase(category?: string): Promise<KnowledgeBaseResponse> {
    const response = await apiClient.get('/chatbot/knowledge-base', {
      params: { category }
    });
    return response.data;
  }

  /**
   * Enviar feedback sobre la conversación
   */
  async submitFeedback(feedback: FeedbackRequest): Promise<{
    success: boolean;
    message: string;
    data: {
      rating: number;
      timestamp: string;
      message: string;
    };
  }> {
    const response = await apiClient.post('/chatbot/feedback', feedback);
    return response.data;
  }

  /**
   * Obtener estadísticas del chatbot
   */
  async getStats(): Promise<ChatBotStatsResponse> {
    const response = await apiClient.get('/chatbot/stats');
    return response.data;
  }

  /**
   * Convertir respuesta de API a mensaje de chat
   */
  convertApiResponseToChatMessage(apiResponse: ChatResponse['data'], messageId: number): ChatMessage {
    return {
      id: messageId,
      text: apiResponse.message,
      isBot: true,
      timestamp: new Date(),
      type: apiResponse.quick_replies ? 'interactive' : 'text',
      options: apiResponse.quick_replies,
      priority: apiResponse.priority || 'medium',
      category: apiResponse.type
    };
  }

  /**
   * Detectar perfil del usuario basado en el mensaje
   */
  detectUserProfile(message: string): 'estudiante' | 'psicologo' | 'admin' | 'unknown' {
    const normalizedMessage = message.toLowerCase();
    
    if (normalizedMessage.includes('estudiante') || normalizedMessage.includes('alumno')) {
      return 'estudiante';
    } else if (normalizedMessage.includes('psicólogo') || normalizedMessage.includes('terapeuta') || normalizedMessage.includes('profesional')) {
      return 'psicologo';
    } else if (normalizedMessage.includes('admin') || normalizedMessage.includes('administrador')) {
      return 'admin';
    }
    
    return 'unknown';
  }

  /**
   * Analizar intención del usuario
   */
  analyzeUserIntent(message: string): {
    intent: string;
    confidence: number;
    keywords: string[];
  } {
    const normalizedMessage = message.toLowerCase();
    
    const intentPatterns = {
      'agendar_cita': ['agendar', 'reservar', 'cita', 'turno', 'hora', 'fecha', 'consulta', 'sesión'],
      'servicios': ['servicio', 'terapia', 'consulta', 'tratamiento', 'ayuda', 'apoyo'],
      'horarios': ['horario', 'tiempo', 'hora', 'cuando', 'disponibilidad', 'calendario'],
      'feriados': ['feriado', 'festivo', 'holiday', 'vacaciones', 'libre'],
      'roles': ['rol', 'usuario', 'tipo', 'función', 'puede', 'permiso', 'acceso'],
      'emergencia': ['emergencia', 'crisis', 'urgente', 'ayuda', 'inmediato'],
      'saludo': ['hola', 'buenos', 'buenas', 'saludos', 'hi', 'hello']
    };

    let bestMatch = { intent: 'general', confidence: 0, keywords: [] as string[] };

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      const matches = patterns.filter(pattern => normalizedMessage.includes(pattern));
      const confidence = matches.length / patterns.length;
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { intent, confidence, keywords: matches };
      }
    }

    return bestMatch;
  }

  /**
   * Obtener sugerencias contextuales
   */
  getContextualSuggestions(context: ConversationContext): string[] {
    const suggestions: string[] = [];
    
    if (context.lastTopic === 'agendar_cita') {
      suggestions.push('⏰ Horarios disponibles hoy', '📝 Qué incluir en motivo de consulta');
    } else if (context.lastTopic === 'servicios') {
      suggestions.push('📅 Cómo acceder a estos servicios', '💰 Costos y requisitos');
    } else if (context.lastTopic === 'horarios') {
      suggestions.push('📅 Agendar una cita ahora', '🔔 Configurar recordatorios');
    } else if (context.lastTopic === 'feriados') {
      suggestions.push('📅 Ver calendario completo', '⏰ ¿Afectan las citas?');
    }
    
    if (context.userProfile === 'estudiante') {
      suggestions.push('🎓 Tips para estudiantes');
    } else if (context.userProfile === 'psicologo') {
      suggestions.push('👨‍⚕️ Herramientas profesionales');
    }
    
    return suggestions.slice(0, 4);
  }

  /**
   * Formatear tiempo de mensaje
   */
  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  /**
   * Generar ID único para mensajes
   */
  generateMessageId(): number {
    return Date.now() + Math.random();
  }

  /**
   * Validar mensaje antes de enviar
   */
  validateMessage(message: string): { valid: boolean; error?: string } {
    if (!message || message.trim().length === 0) {
      return { valid: false, error: 'El mensaje no puede estar vacío' };
    }
    
    if (message.length > 1000) {
      return { valid: false, error: 'El mensaje es demasiado largo (máximo 1000 caracteres)' };
    }
    
    return { valid: true };
  }

  /**
   * Obtener mensajes predefinidos por categoría
   */
  getPredefinedMessages(category: 'emergencia' | 'horarios' | 'servicios' | 'feriados'): string[] {
    const messages = {
      emergencia: [
        '🚨 ¿Qué hago en una emergencia psicológica?',
        '📞 ¿Cuáles son los números de emergencia?',
        '🤝 ¿Cómo ayudo a un amigo en crisis?'
      ],
      horarios: [
        '⏰ ¿Cuáles son los horarios de atención?',
        '📅 ¿Qué días atienden?',
        '🕐 ¿Cuánto dura una sesión?'
      ],
      servicios: [
        '🏥 ¿Qué servicios ofrecen?',
        '💰 ¿Cuánto cuesta la atención?',
        '👥 ¿Hay terapia grupal?'
      ],
      feriados: [
        '🎉 ¿Cuáles son los próximos feriados?',
        '📅 ¿Atienden en feriados?',
        '🗓️ Ver calendario de feriados'
      ]
    };
    
    return messages[category] || [];
  }

  /**
   * Procesar opciones de respuesta rápida
   */
  processQuickReply(option: string, context: ConversationContext): string {
    // Remover emojis y caracteres especiales para procesar la opción
    const cleanOption = option.replace(/[📅🏥⏰🚨👥🎓🧠📝💰🔔]/g, '').trim();
    
    // Convertir la opción en un mensaje más natural
    const optionMappings: Record<string, string> = {
      'Horarios disponibles hoy': '¿Qué horarios están disponibles hoy?',
      'Cómo agendar una cita': '¿Cómo puedo agendar una cita paso a paso?',
      'Próximos feriados': '¿Cuáles son los próximos feriados en Perú?',
      'Servicios disponibles': '¿Qué servicios psicológicos están disponibles?',
      'Emergencias': '¿Qué hago en caso de una emergencia psicológica?'
    };
    
    return optionMappings[cleanOption] || cleanOption;
  }

  /**
   * Obtener historial de conversación (simulado)
   */
  getConversationHistory(): ChatMessage[] {
    // En una implementación real, esto se obtendría del localStorage o base de datos
    const savedHistory = localStorage.getItem('chatbot_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (error) {
        console.error('Error parsing conversation history:', error);
      }
    }
    return [];
  }

  /**
   * Guardar historial de conversación
   */
  saveConversationHistory(messages: ChatMessage[]): void {
    try {
      const serialized = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }));
      localStorage.setItem('chatbot_history', JSON.stringify(serialized));
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  }

  /**
   * Limpiar historial de conversación
   */
  clearConversationHistory(): void {
    localStorage.removeItem('chatbot_history');
  }
}

export const chatBotService = new ChatBotService();



