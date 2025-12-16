import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Brain, Send, X, User, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { chatBotService } from '../../services/chatbot';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'options' | 'info' | 'interactive';
  options?: string[];
  priority?: 'high' | 'medium' | 'low';
  category?: string;
}

interface ConversationContext {
  lastTopic: string;
  userIntent: string;
  conversationFlow: string[];
  userProfile?: 'estudiante' | 'psicologo' | 'admin' | 'tutor' | 'unknown';
}

interface ChatBotProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export function ChatBot({ isVisible = false, onClose }: ChatBotProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hola, soy Marbot, tu asistente virtual del Sistema SAPTA (Sistema de Atención Psicológica Túpac Amaru).\n\nEstoy aquí para brindarte información clara y precisa sobre el uso del sistema. Puedo ayudarte con:\n• Agendamiento de citas\n• Funcionalidades disponibles según tu rol\n• Horarios y disponibilidad real del sistema\n• Navegación en el sistema\n• Procedimientos y políticas\n\nRecuerda: Solo proporciono información verificada del sistema. No proporciono diagnósticos clínicos ni consejos médicos. Para emergencias, contacta directamente con los servicios correspondientes.",
      isBot: true,
      timestamp: new Date(),
      type: 'interactive',
      category: 'bienvenida',
      options: [
        "¿Cómo agendo una cita?",
        "¿Qué puedo hacer según mi rol?",
        "¿Cuáles son los horarios disponibles?",
        "¿Qué información puedo ver?"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ConversationContext>({
    lastTopic: '',
    userIntent: '',
    conversationFlow: [],
    userProfile: user?.role === 'student' ? 'estudiante' : user?.role === 'psychologist' ? 'psicologo' : user?.role === 'admin' ? 'admin' : 'unknown'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sistema inteligente de análisis de intenciones
  const analyzeUserIntent = (input: string, currentContext: ConversationContext) => {
    const normalizedInput = input.toLowerCase().trim();
    
    // Detectar perfil del usuario
    let userProfile = currentContext.userProfile;
    if (normalizedInput.includes('estudiante') || normalizedInput.includes('alumno')) {
      userProfile = 'estudiante';
    } else if (normalizedInput.includes('psicólogo') || normalizedInput.includes('psicologo') || normalizedInput.includes('terapeuta') || normalizedInput.includes('profesional')) {
      userProfile = 'psicologo';
    } else if (normalizedInput.includes('tutor')) {
      userProfile = 'tutor';
    } else if (normalizedInput.includes('admin') || normalizedInput.includes('administrador')) {
      userProfile = 'admin';
    }

    // Detectar intención principal
    let intent = '';
    let confidence = 0;
    
    const intentPatterns = {
      'agendar_cita': [
        'agendar', 'reservar', 'cita', 'turno', 'hora', 'fecha', 'consulta', 'sesión',
        'appointment', 'booking', 'schedule', 'programar'
      ],
      'servicios': [
        'servicio', 'terapia', 'consulta', 'tratamiento', 'ayuda', 'apoyo',
        'atención', 'especialidad', 'ofrecen', 'disponible'
      ],
      'horarios': [
        'horario', 'tiempo', 'hora', 'cuando', 'disponibilidad', 'calendario',
        'timing', 'schedule', 'específico', 'exacto'
      ],
      'roles': [
        'rol', 'usuario', 'tipo', 'función', 'puede', 'permiso', 'acceso',
        'estudiante', 'psicólogo', 'admin', 'funcionalidad'
      ],
      'requisitos': [
        'requisito', 'necesito', 'documento', 'paper', 'condición', 'proceso',
        'requirement', 'needed', 'debe'
      ],
      'privacidad': [
        'privacidad', 'confidencial', 'seguro', 'datos', 'información',
        'protección', 'privacy', 'security'
      ],
      'emergencia': [
        'emergencia', 'crisis', 'urgente', 'ayuda', 'inmediato', 'emergency',
        'urgent', 'help'
      ],
      'estado_cita': [
        'estado', 'status', 'pendiente', 'confirmada', 'rechazada', 'cancelada'
      ]
    };

    for (const [intentType, patterns] of Object.entries(intentPatterns)) {
      const matches = patterns.filter(pattern => normalizedInput.includes(pattern)).length;
      const currentConfidence = matches / patterns.length;
      
      if (currentConfidence > confidence) {
        intent = intentType;
        confidence = currentConfidence;
      }
    }

    return { intent, confidence, userProfile };
  };

  const smartResponses: { [key: string]: (context: ConversationContext) => Message } = {
    "agendar_cita": (ctx) => ({
      id: 0,
        text: ctx.userProfile === 'estudiante' 
        ? `AGENDAMIENTO DE CITAS PARA ESTUDIANTES\n\nProceso paso a paso:\n\n1. ACCESO\n• Inicia sesión con tu email institucional @istta.edu.pe usando Google\n• El sistema te reconocerá automáticamente como estudiante\n\n2. NAVEGACIÓN\n• En el menú lateral, selecciona "Agendar Cita"\n• Se abrirá el calendario con las fechas disponibles\n\n3. SELECCIÓN\n• Horarios: Lunes a Viernes, 8:00 AM a 2:00 PM\n• Bloques: 08:00, 08:45, 09:30, 10:15, 11:00, 11:45, 12:30, 13:15\n• Duración: 45 minutos por sesión\n• Límite: Hasta las 13:10 del día actual para agendar el mismo día\n• Máximo: 2 semanas adelante desde hoy\n\n4. COMPLETAR FORMULARIO\n• Motivo de consulta (obligatorio, mínimo 10 caracteres)\n• Datos de contacto de emergencia (obligatorio)\n• Información médica (opcional)\n\n5. CONFIRMACIÓN\n• Tu cita quedará en estado PENDIENTE\n• Recibirás notificación por email\n• El psicólogo aprobará o rechazará tu solicitud\n\nRestricciones:\n• Solo 1 cita pendiente a la vez\n• No se pueden agendar fechas pasadas\n• No hay atención fines de semana ni feriados`
        : `FUNCIONALIDADES PARA PSICÓLOGOS\n\nEl sistema SAPTA ofrece las siguientes herramientas:\n\n1. AGENDAR CITA DIRECTAMENTE\n• Buscar estudiante por DNI o email\n• Agendar citas sin aprobación previa\n• Acceso completo al calendario\n• Horarios: Lunes a Viernes, 8:00 AM - 2:00 PM\n• Bloques: 08:00, 08:45, 09:30, 10:15, 11:00, 11:45, 12:30, 13:15\n\n2. GESTIÓN DE CITAS\n• Aprobar o rechazar citas pendientes de estudiantes\n• Indicar motivo al rechazar una cita\n• Ver detalles del estudiante antes de confirmar\n\n3. CALENDARIO\n• Ver tu agenda personal completa\n• Bloquear horarios no disponibles\n• Visualizar citas confirmadas y pendientes\n• Estadísticas de atención\n\n4. REGISTRO Y SEGUIMIENTO\n• Registrar sesiones psicológicas después de las citas\n• Ver historial de estudiantes\n• Registrar notas de sesión\n\n5. GESTIÓN DE PACIENTES\n• Acceso al registro de pacientes\n• Información completa de estudiantes`,
      isBot: true,
      timestamp: new Date(),
      type: 'interactive',
      category: 'citas',
        options: ctx.userProfile === 'estudiante' 
        ? ["¿Cómo accedo con mi email institucional?", "¿Qué horarios están disponibles hoy?", "¿Qué pongo en motivo de consulta?", "¿Qué pasa si es una emergencia?"]
        : ["¿Cómo busco un estudiante específico?", "¿Cómo veo mis estadísticas?", "¿Cómo bloqueo horarios?", "¿Cómo registro una sesión?"]
    }),
    "servicios": (ctx) => ({
      id: 0,
        text: `FUNCIONALIDADES DEL SISTEMA SAPTA\n\nEl sistema permite:\n\nPARA ESTUDIANTES:\n• Agendar citas psicológicas\n• Ver historial de citas\n• Reprogramar citas\n• Recibir notificaciones\n• Enviar y recibir mensajes\n• Gestionar perfil personal\n\nPARA PSICÓLOGOS:\n• Agendar citas directamente para estudiantes\n• Aprobar o rechazar citas pendientes\n• Gestionar registro de pacientes\n• Registrar sesiones psicológicas\n• Ver calendario y estadísticas\n• Bloquear horarios no disponibles\n\nHORARIOS DE ATENCIÓN:\n• Lunes a Viernes: 8:00 AM - 2:00 PM\n• Sesiones de 45 minutos\n• No hay atención fines de semana ni feriados\n\nACCESO:\n• Estudiantes: Email @istta.edu.pe con Google\n• Psicólogos: Email y contraseña asignada\n\n${ctx.userProfile === 'estudiante' ? '\nRECUERDA:\n• Solo puedes tener 1 cita pendiente a la vez\n• Límite de agendamiento: 13:10 del día actual\n• Máximo 2 semanas adelante' : ''}`,
      isBot: true,
      timestamp: new Date(),
      type: 'interactive',
      category: 'servicios',
        options: ctx.userProfile === 'estudiante' 
        ? ["¿Cómo agendo una cita?", "¿Cuánto duran las sesiones?", "¿Hay grupos disponibles?", "¿Cómo accedo a los servicios?"]
        : ["¿Cómo gestiono citas?", "¿Cómo uso el calendario?", "¿Qué información puedo ver?", "¿Cómo registro sesiones?"]
    }),
    "horarios": (ctx) => ({
      id: 0,
        text: `HORARIOS DETALLADOS DEL SISTEMA SAPTA\n\nCALENDARIO DE ATENCIÓN:\n\nDÍAS HÁBILES:\n• Lunes a Viernes únicamente\n• NO hay atención los fines de semana (sábados y domingos)\n• NO hay atención en feriados nacionales o regionales\n\nHORARIOS ESPECÍFICOS:\n• Inicio de atención: 8:00 AM (08:00)\n• Fin de atención: 2:00 PM (14:00)\n• Duración por sesión: 45 minutos\n• Tiempo entre citas: 15 minutos\n\nBLOQUES HORARIOS DISPONIBLES:\n• 08:00 - 08:45\n• 08:45 - 09:30\n• 09:30 - 10:15\n• 10:15 - 11:00\n• 11:00 - 11:45\n• 11:45 - 12:30\n• 12:30 - 13:15\n• 13:15 - 14:00\n\nRESTRICCIONES IMPORTANTES:\n• Límite de agendamiento: 13:10 (1:10 PM) del día actual\n• No se pueden agendar citas en fechas pasadas\n• Solo 1 cita pendiente por estudiante a la vez\n• Confirmación requerida del psicólogo\n• Límite temporal: Máximo 2 semanas adelante desde la fecha actual\n\nDISPONIBILIDAD DIGITAL:\n• Plataforma: Disponible 24/7 para consultas\n• Agendamiento online: Siempre activo durante horarios hábiles\n• Notificaciones: Automáticas por email\n• Recordatorios: Envío automático antes de las citas\n\n${ctx.userProfile === 'psicologo' ? '\nFUNCIONES PROFESIONALES:\n• Agendamiento directo sin restricciones de hora\n• Bloqueo de horarios personales no disponibles\n• Vista completa del calendario institucional\n• Estadísticas de ocupación y atención' : ''}\n\nCONTACTO DE EMERGENCIA:\n• Crisis psicológicas: Contacto directo al instituto\n• Soporte técnico: Disponible en horarios laborales (Lun-Vie 8AM-2PM)`,
      isBot: true,
      timestamp: new Date(),
      type: 'interactive',
      category: 'horarios',
        options: ctx.userProfile === 'estudiante'
        ? ["¿Qué horarios están libres hoy?", "¿Por qué no puedo agendar después de las 13:10?", "¿Cómo sé si mi horario fue confirmado?", "¿Cuándo llegan las notificaciones?"]
        : ["¿Cómo bloqueo mis horarios no disponibles?", "¿Cómo veo la ocupación semanal?", "¿Puedo extender sesiones?", "¿Cómo gestiono cancelaciones?"]
    }),
    "emergencia": (ctx) => ({
      id: 0,
        text: `ORIENTACIÓN SOBRE SITUACIONES DE EMERGENCIA\n\nPara situaciones de emergencia psicológica o crisis, es importante contactar con los servicios adecuados:\n\nCONTACTOS DE EMERGENCIA:\n\nLÍNEAS DE EMERGENCIA:\n• Línea 113 - Emergencia Nacional (Perú)\n• Bomberos - 116\n• Policía - 105\n• Servicios de salud mental locales\n\nEN EL INSTITUTO:\n• Contacta directamente con la Dirección Académica\n• Contacta con la Coordinación de Bienestar\n• Enfermería: Planta baja\n\nIMPORTANTE:\nSi estás experimentando una situación de emergencia, busca ayuda profesional inmediata. No uses este chat para emergencias médicas o psicológicas urgentes.\n\nEl sistema SAPTA está diseñado para agendamiento de citas regulares. Para situaciones de emergencia, contacta directamente con los servicios de emergencia o con personal del instituto.\n\n${ctx.userProfile === 'psicologo' ? '\nPARA PROFESIONALES:\n• Sigue los protocolos establecidos por el instituto\n• Contacta con supervisión según procedimientos\n• Documenta según las políticas del sistema' : ''}`,
      isBot: true,
      timestamp: new Date(),
      type: 'interactive',
      category: 'emergencia',
      priority: 'high',
        options: ctx.userProfile === 'estudiante'
        ? ["¿Cuáles son los contactos de emergencia?", "¿Cómo agendo una cita urgente?", "¿Cómo contacto al instituto?", "¿Qué servicios están disponibles?"]
        : ["¿Cómo contacto con supervisión?", "¿Cuáles son los protocolos del instituto?", "¿Cómo gestiono situaciones urgentes?", "¿Dónde encuentro información sobre procedimientos?"]
    })
  };

  // Sistema inteligente de procesamiento de respuestas
  const getIntelligentResponse = (userInput: string, currentContext: ConversationContext): Message => {
    const analysis = analyzeUserIntent(userInput, currentContext);
    
    // Actualizar contexto con la nueva información
    const newContext = {
      ...currentContext,
      lastTopic: analysis.intent,
      userIntent: analysis.intent,
      conversationFlow: [...currentContext.conversationFlow, analysis.intent],
      userProfile: analysis.userProfile
    };
    
    setContext(newContext);

    // Detectar emergencias con alta prioridad
    if (analysis.intent === 'emergencia' || analysis.confidence > 0.3 && userInput.toLowerCase().includes('crisis')) {
      return smartResponses["emergencia"](newContext);
    }

    // Respuestas contextuales basadas en la intención detectada
    if (analysis.confidence > 0.2 && smartResponses[analysis.intent]) {
      return smartResponses[analysis.intent](newContext);
    }

    // Respuestas de cortesía y conversacionales
    const input = userInput.toLowerCase();
    
    if (input.includes('hola') || input.includes('ayuda') || input.includes('información') || input.includes('bienvenido')) {
      return {
        id: 0,
        text: `Hola, bienvenido al Sistema SAPTA (Sistema de Atención Psicológica Túpac Amaru).\n\nSoy Marbot, tu asistente virtual. Estoy aquí para brindarte información sobre el uso del sistema. ${newContext.userProfile !== 'unknown' ? `He detectado que eres ${newContext.userProfile}, así que te daré información específica para tu rol.` : 'Cuéntame si eres estudiante, psicólogo, tutor o administrador para brindarte información personalizada.'}\n\nPuedo ayudarte con:\n• Agendamiento de citas paso a paso\n• Funcionalidades disponibles según tu rol\n• Horarios y disponibilidad del sistema\n• Navegación y uso de herramientas\n• Procedimientos y políticas\n\nImportante: No proporciono diagnósticos clínicos ni consejos médicos. Para emergencias, contacta directamente con los servicios correspondientes.`,
        isBot: true,
        timestamp: new Date(),
        type: 'interactive',
        category: 'bienvenida',
        options: newContext.userProfile === 'unknown' 
          ? ["Soy estudiante", "Soy psicólogo", "Soy tutor", "Soy administrador"]
          : ["¿Cómo agendo una cita?", "¿Qué puedo hacer en el sistema?", "¿Cuáles son los horarios?", "¿Cómo navego el sistema?"]
      };
    }
    
    if (input.includes('gracias') || input.includes('perfecto') || input.includes('entiendo') || input.includes('bien') || input.includes('ok')) {
      const followUpSuggestions = getContextualFollowUp(newContext);
      return {
        id: 0,
        text: `¡Perfecto! Me alegra poder ayudarte con información precisa sobre el sistema SAPTA.\n\n${followUpSuggestions.length > 0 ? '¿Te gustaría saber más sobre alguno de estos temas?' : 'Si tienes más preguntas, no dudes en preguntar. Estoy aquí para apoyarte en tu bienestar emocional y académico.'}`,
        isBot: true,
        timestamp: new Date(),
        type: followUpSuggestions.length > 0 ? 'options' : 'text',
        category: 'confirmacion',
        options: followUpSuggestions.length > 0 ? followUpSuggestions : undefined
      };
    }

    // Respuesta inteligente por defecto con sugerencias contextuales
    return {
      id: 0,
        text: `Entiendo tu consulta sobre "${userInput}".\n\nComo Marbot, tu asistente virtual del Sistema SAPTA, puedo brindarte información sobre el uso del sistema${newContext.userProfile !== 'unknown' ? ` para ${newContext.userProfile}s` : ''}:\n\nPuedo ayudarte con:\n• Proceso de agendamiento de citas\n• Funcionalidades disponibles según tu rol\n• Horarios y disponibilidad\n• Navegación en el sistema\n• Procedimientos y políticas\n\nImportante: No proporciono diagnósticos clínicos, consejos médicos o información personal de usuarios. Si tu consulta está fuera del alcance del sistema, te indicaré respetuosamente cómo puedo ayudarte.\n\n¿Sobre qué aspecto del sistema te gustaría información?`,
      isBot: true,
      timestamp: new Date(),
      type: 'interactive',
      category: 'inteligente',
        options: [
        "Proceso de agendamiento completo",
        "Funcionalidades del sistema", 
        "Horarios y disponibilidad",
        "¿Cómo navego el sistema?",
        `${newContext.userProfile !== 'unknown' ? `Funciones para ${newContext.userProfile}s` : 'Explícame los roles del sistema'}`
      ]
    };
  };

  // Sistema de sugerencias de seguimiento contextual
  const getContextualFollowUp = (ctx: ConversationContext): string[] => {
    const suggestions: string[] = [];
    
    if (ctx.lastTopic === 'agendar_cita') {
      suggestions.push("Horarios disponibles hoy", "Qué incluir en motivo de consulta");
    } else if (ctx.lastTopic === 'servicios') {
      suggestions.push("Cómo acceder a estos servicios", "Costos y requisitos");
    } else if (ctx.lastTopic === 'horarios') {
      suggestions.push("Agendar una cita ahora", "Configurar recordatorios");
    }
    
    if (ctx.userProfile === 'estudiante') {
      suggestions.push("Información para estudiantes");
    } else if (ctx.userProfile === 'psicologo') {
      suggestions.push("Herramientas profesionales");
    } else if (ctx.userProfile === 'tutor') {
      suggestions.push("Funciones de tutor");
    }
    
    return suggestions.slice(0, 4); // Máximo 4 sugerencias
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      isBot: false,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      // Obtener perfil del usuario actual
      const userProfile = user?.role === 'student' ? 'estudiante' : 
                         user?.role === 'psychologist' ? 'psicologo' : 
                         user?.role === 'admin' ? 'admin' : 'unknown';

      // Llamar al servicio real del backend
      const apiResponse = await chatBotService.sendMessage({
        message: currentInput,
        user_profile: userProfile,
        context: context
      });

      if (apiResponse.success && apiResponse.data) {
        // Convertir respuesta de API a mensaje de chat
        // Limpiar el texto de markdown y emojis para mejor visualización
        let cleanMessage = apiResponse.data.message || '';
        // Convertir markdown básico a texto plano
        cleanMessage = cleanMessage.replace(/\*\*(.*?)\*\*/g, '$1'); // Negrita
        cleanMessage = cleanMessage.replace(/\*(.*?)\*/g, '$1'); // Cursiva
        cleanMessage = cleanMessage.replace(/📅|🏥|⏰|🎉|🚨|🧠|👥|✅|⚠️|📞|👋|🎯|👨‍⚕️|👨‍💼|🎓/g, ''); // Remover emojis comunes
        
        const botResponse: Message = {
          id: Date.now() + 1,
          text: cleanMessage.trim(),
          isBot: true,
          timestamp: new Date(),
          type: apiResponse.data.quick_replies && apiResponse.data.quick_replies.length > 0 ? 'interactive' : 'text',
          options: apiResponse.data.quick_replies ? apiResponse.data.quick_replies.map((q: string) => q.replace(/📅|🏥|⏰|🎉|🚨|🧠|👥|✅|⚠️|📞|👋|🎯|👨‍⚕️|👨‍💼|🎓/g, '').trim()) : undefined,
          priority: apiResponse.data.priority || 'medium',
          category: apiResponse.data.type
        };

        // Actualizar contexto
        const analysis = analyzeUserIntent(currentInput, context);
        setContext({
          ...context,
          lastTopic: analysis.intent || apiResponse.data.type,
          userIntent: analysis.intent || apiResponse.data.type,
          conversationFlow: [...context.conversationFlow, analysis.intent || apiResponse.data.type],
          userProfile: analysis.userProfile || userProfile
        });

        setMessages(prev => [...prev, botResponse]);
      } else {
        // Si falla la API, usar respuesta local como respaldo
        const botResponse = getIntelligentResponse(currentInput, context);
        botResponse.id = Date.now() + 1;
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      // En caso de error, usar respuesta local
      const botResponse = getIntelligentResponse(currentInput, context);
      botResponse.id = Date.now() + 1;
      botResponse.text = "Lo siento, hubo un problema al procesar tu consulta. " + botResponse.text;
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptionClick = (option: string) => {
    setInputText(option);
    setTimeout(() => handleSendMessage(), 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isVisible) return null;

  return createPortal(
    <div className="fixed bottom-0 right-0 left-0 sm:left-auto w-full sm:w-96 h-screen sm:h-[500px] md:h-[550px] lg:h-[600px] max-h-screen sm:max-h-none bg-white rounded-tl-2xl sm:rounded-tl-2xl rounded-tr-2xl sm:rounded-tr-none shadow-2xl border border-gray-200 flex flex-col z-[9998] overflow-hidden" style={{
      boxShadow: '0 -20px 60px -12px rgba(0, 0, 0, 0.2), -8px 0 30px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header del Chatbot */}
      <div className="bg-gradient-to-r from-[#4a0d0d] via-[#3d0a0a] to-[#4a0d0d] text-white p-2.5 sm:p-3 md:p-4 flex items-center justify-between rounded-tl-2xl sm:rounded-tl-2xl rounded-tr-2xl sm:rounded-tr-none border-b border-[#2d0808] relative overflow-hidden flex-shrink-0" style={{
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 3px rgba(0, 0, 0, 0.3)'
      }}>
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 relative z-10 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0">
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-xs sm:text-sm md:text-base text-white tracking-tight mb-0.5 truncate">Marbot</h3>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-white/80 font-medium truncate">SAPTA</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-all duration-200 p-1 sm:p-1.5 hover:bg-white/10 rounded-lg relative z-10 flex-shrink-0 ml-2"
          aria-label="Cerrar chat"
        >
          <X className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4 bg-white min-h-0 w-full" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(74, 13, 13, 0.2) rgba(249, 250, 251, 1)'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex w-full ${message.isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}
          >
            <div className={`w-full max-w-[95%] xs:max-w-[92%] sm:max-w-[85%] md:max-w-[80%] flex flex-col ${message.isBot ? 'items-start' : 'items-end'}`}>
              {message.isBot && (
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-0.5 sm:mb-1 md:mb-1.5 px-1 flex-wrap">
                  <Brain className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-[#4a0d0d] flex-shrink-0" />
                  <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 font-medium">Marbot</span>
                  <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                </div>
              )}
              
              <div
                className={`w-full p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-lg sm:rounded-xl md:rounded-2xl ${
                  message.isBot
                    ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                    : 'bg-gradient-to-r from-[#4a0d0d] to-[#3d0a0a] text-white shadow-md'
                }`}
                style={message.isBot ? {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)'
                } : {
                  boxShadow: '0 4px 12px rgba(74, 13, 13, 0.3), 0 2px 4px rgba(74, 13, 13, 0.2)'
                }}
              >
                <div className="whitespace-pre-line text-[11px] sm:text-xs md:text-sm leading-relaxed break-words overflow-wrap-anywhere">
                  <div className={`${message.isBot ? 'text-gray-800' : 'text-white'} break-words`}>
                    {message.text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[\u{2600}-\u{26FF}]/gu, '').replace(/[\u{2700}-\u{27BF}]/gu, '')}
                  </div>
                </div>
                
                {message.options && (
                  <div className="mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-1.5 md:space-y-2 w-full">
                    {message.options.map((option, index) => {
                      const cleanOption = option.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[\u{2600}-\u{26FF}]/gu, '').replace(/[\u{2700}-\u{27BF}]/gu, '').trim().replace(/^\s+/g, '');
                      return (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          className="w-full text-left p-1.5 sm:p-2 md:p-2.5 lg:p-3 bg-gray-50 hover:bg-[#4a0d0d]/5 border border-gray-200 hover:border-[#4a0d0d]/30 rounded-md sm:rounded-lg md:rounded-xl text-[10px] sm:text-xs md:text-sm transition-all duration-200 text-gray-700 hover:text-[#4a0d0d] font-medium hover:shadow-sm break-words overflow-wrap-anywhere"
                          style={{
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                            wordBreak: 'break-word'
                          }}
                        >
                          {cleanOption}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {!message.isBot && (
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mt-0.5 sm:mt-1 md:mt-1.5 justify-end px-1 flex-wrap">
                  <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                  <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-gray-400 flex-shrink-0" />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start w-full">
            <div className="w-full max-w-[95%] xs:max-w-[92%] sm:max-w-[85%] md:max-w-[80%]">
              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-0.5 sm:mb-1 md:mb-1.5 px-1 flex-wrap">
                <Brain className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-[#4a0d0d] flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 font-medium">Marbot está escribiendo...</span>
              </div>
              <div className="bg-white border border-gray-200 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm w-full" style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)'
              }}>
                <div className="flex space-x-1 sm:space-x-1.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-[#4a0d0d] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-[#4a0d0d] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-[#4a0d0d] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <div className="p-2 sm:p-3 md:p-4 bg-white border-t border-gray-200 flex-shrink-0 w-full">
        <div className="flex gap-1.5 sm:gap-2 md:gap-2.5 w-full">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Escribe tu pregunta..."
            className="flex-1 min-w-0 p-2 sm:p-2.5 md:p-3 lg:p-3.5 bg-gray-50 border border-gray-300 rounded-md sm:rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a0d0d]/20 focus:border-[#4a0d0d] text-[11px] sm:text-xs md:text-sm text-gray-900 placeholder-gray-400 transition-all hover:border-gray-400"
            disabled={isTyping}
            style={{
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 lg:px-5 lg:py-3.5 bg-gradient-to-r from-[#4a0d0d] to-[#3d0a0a] hover:from-[#3d0a0a] hover:to-[#4a0d0d] text-white rounded-md sm:rounded-lg md:rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex-shrink-0"
            style={{
              boxShadow: '0 2px 8px rgba(74, 13, 13, 0.3)'
            }}
          >
            {isTyping ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4" />
            )}
          </Button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        `
      }} />
    </div>,
    document.body
  );
}

// Botón flotante inteligente para abrir el chatbot
export function ChatBotToggle({ onClick }: { onClick: () => void }) {
  const [isGlowing, setIsGlowing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlowing(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Renderizar usando portal para asegurar que esté en la esquina verdadera
  return createPortal(
    <button
      onClick={onClick}
      className={`fixed bottom-1 right-3 sm:bottom-2 sm:right-6 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#4a0d0d] to-[#3d0a0a] hover:from-[#3d0a0a] hover:to-[#4a0d0d] text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center z-[9999] ${isGlowing ? 'ring-2 ring-[#4a0d0d]/30' : ''} hover:ring-4 hover:ring-[#4a0d0d]/20`}
      style={{
        boxShadow: '0 4px 16px rgba(74, 13, 13, 0.4)'
      }}
      title="Asistente Virtual SAPTA"
      aria-label="Abrir asistente"
    >
      <Brain className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" style={{ width: '18px', height: '18px' }} />
    </button>,
    document.body
  );
}
