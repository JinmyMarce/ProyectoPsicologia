import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Brain, Send } from 'lucide-react';
import { Button } from '../ui/Button';

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
  userProfile?: 'estudiante' | 'psicologo' | 'admin' | 'unknown';
}

interface ChatBotProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export function ChatBot({ isVisible = false, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola!  Soy tu Asistente Psicológico Inteligente del Instituto Túpac Amaru. \n\nEstoy aquí para brindarte información **precisa y personalizada** sobre nuestro sistema de bienestar mental. Puedo adaptarme a tu rol y necesidades específicas.",
      isBot: true,
      timestamp: new Date(),
      type: 'interactive',
      category: 'bienvenida',
      options: [
        "📅 ¿Cómo agendar una cita paso a paso?",
        "🏥 ¿Qué servicios psicológicos ofrecemos?",
        "👥 Explícame los roles del sistema",
        "⏰ Horarios y disponibilidad exacta",
        "🎓 Soy estudiante, ¿qué puedo hacer?",
        "🧠 Soy psicólogo, ¿cuáles son mis funciones?"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ConversationContext>({
    lastTopic: '',
    userIntent: '',
    conversationFlow: [],
    userProfile: 'unknown'
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
    } else if (normalizedInput.includes('psicólogo') || normalizedInput.includes('terapeuta') || normalizedInput.includes('profesional')) {
      userProfile = 'psicologo';
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
        ? `**📅 AGENDAMIENTO PARA ESTUDIANTES**\n\n**Proceso Completo Paso a Paso:**\n\n**1️⃣ ACCESO AL SISTEMA**\n• 🔐 Inicia sesión con tu email institucional **@istta.edu.pe**\n• ✅ El sistema te reconocerá automáticamente como estudiante\n\n**2️⃣ NAVEGACIÓN AL CALENDARIO**\n• 📋 Ve al menú "Citas" en tu dashboard\n• 🗓️ Selecciona "Agendar Nueva Cita"\n\n**3️⃣ SELECCIÓN DE FECHA Y HORA**\n• ⏰ **Horarios disponibles**: 8:00-14:00 (Lun-Vie)\n• 🕐 **Bloques**: 8:00, 8:45, 9:30, 10:15, 11:00, 11:45, 12:30, 13:15\n• ⏳ **Duración**: 45 minutos cada sesión\n• ⚠️ **Límite**: Hasta las 13:10 del día actual\n\n**4️⃣ FORMULARIO OBLIGATORIO**\n• 📝 **Motivo de consulta** (mínimo 10 caracteres)\n• 📞 **Contacto de emergencia**\n• 🏥 **Información médica** (opcional pero recomendado)\n\n**5️⃣ CONFIRMACIÓN**\n• ✅ Tu cita quedará **PENDIENTE DE APROBACIÓN**\n• 📧 Recibirás notificación por email\n• 🔔 El psicólogo revisará y confirmará\n\n💡 **Tip**: Solo puedes tener **1 cita pendiente** a la vez.`
        : `**📅 AGENDAMIENTO PARA PSICÓLOGOS**\n\n**Capacidades Profesionales:**\n\n**1️⃣ AGENDAMIENTO DIRECTO**\n• 🔍 Buscar estudiante por **DNI** o **email**\n• 📅 Agendar citas directamente sin aprobación\n• ⏰ Acceso completo al calendario institucional\n\n**2️⃣ GESTIÓN DE CITAS PENDIENTES**\n• ✅ **Aprobar** citas solicitadas por estudiantes\n• ❌ **Rechazar** con motivo específico\n• 📝 **Modificar** horarios si es necesario\n\n**3️⃣ CALENDARIO PROFESIONAL**\n• 📊 Vista completa de tu agenda\n• 🕐 Bloquear horarios no disponibles\n• 📈 Estadísticas de atención\n\n**4️⃣ SEGUIMIENTO**\n• 📋 Registro de sesiones posteriores\n• 📊 Historial clínico del estudiante\n• 📝 Notas de sesión confidenciales`,
      isBot: true,
      timestamp: new Date(),
      type: 'interactive',
      category: 'citas',
      options: ctx.userProfile === 'estudiante' 
        ? [" ¿Cómo accedo con mi email institucional?", "¿Qué horarios están disponibles hoy?", "¿Qué pongo en motivo de consulta?", "🚨 ¿Qué pasa si es una emergencia?"]
        : [" ¿Cómo busco un estudiante específico?", "¿Cómo veo mis estadísticas?", "¿Cómo bloqueo horarios?", "📝 ¿Cómo registro una sesión?"]
    }),
    "servicios": (ctx) => ({
      id: 0,
      text: `** SERVICIOS ESPECIALIZADOS DE PSICOLOGÍA**\n\n**🎯 SERVICIOS PERSONALIZADOS:**\n\n**🧠 CONSULTA PSICOLÓGICA INDIVIDUAL**\n• 🔍 **Evaluación diagnóstica** especializada\n• 🧘 **Terapia cognitivo-conductual** evidencia-basada\n• 🎓 **Orientación académica** y vocacional\n• ⏰ **Sesiones de 45 minutos** estructuradas\n• 📊 **Seguimiento personalizado** continuo\n• 🎯 **Planes de tratamiento** individualizados\n\n**👥 SERVICIOS GRUPALES TERAPÉUTICOS**\n• 🌟 **Talleres de bienestar emocional**\n• 🤝 **Grupos de apoyo estudiantil**\n• 📢 **Charlas preventivas** de salud mental\n• 🎲 **Dinámicas de integración** social\n• 💬 **Círculos de conversación** terapéuticos\n\n**📚 APOYO ACADÉMICO ESPECIALIZADO**\n• 🧠 **Técnicas de estudio** efectivas\n• 😰 **Manejo de estrés** académico y ansiedad\n• 🎯 **Orientación vocacional** y profesional\n• 🚨 **Apoyo en crisis** académicas\n• 📈 **Coaching académico** personalizado\n\n**💎 BENEFICIOS EXCLUSIVOS:**\n• ✅ **100% GRATUITO** para estudiantes ISTTA\n• 🔒 **Confidencialidad absoluta** garantizada\n• 👨‍⚕️ **Profesionales certificados** y especializados\n• 📱 **Plataforma digital** moderna y segura\n• 🔔 **Sistema de notificaciones** inteligente\n• 📊 **Seguimiento integral** del progreso\n\n${ctx.userProfile === 'estudiante' ? '\n**🎓 ESPECIAL PARA ESTUDIANTES:**\n• 🆓 **Acceso inmediato** con tu email @istta.edu.pe\n• 📱 **App móvil-friendly** para gestionar citas\n• 🔔 **Recordatorios automáticos**\n• 📈 **Historial personal** de sesiones' : ''}`,
      isBot: true,
      timestamp: new Date(),
      type: 'interactive',
      category: 'servicios',
      options: ctx.userProfile === 'estudiante' 
        ? ["🧠 ¿Qué incluye una evaluación diagnóstica?", "⏰ ¿Cuánto duran las terapias?", "👥 ¿Hay grupos de apoyo disponibles?", "🆓 ¿Realmente es gratis todo?"]
        : ["📊 ¿Cómo registro servicios grupales?", "👥 ¿Cómo gestiono grupos terapéuticos?", "📈 ¿Qué estadísticas puedo ver?", "🔍 ¿Cómo hago seguimiento de casos?"]
    }),
    "horarios": (ctx) => ({
      id: 0,
      text: `**⏰ HORARIOS DETALLADOS DEL SISTEMA**\n\n**📅 CALENDARIO DE ATENCIÓN:**\n\n**🗓️ DÍAS HÁBILES:**\n• **Lunes a Viernes** únicamente\n• ❌ **NO** hay atención fines de semana\n• ❌ **NO** hay atención en feriados\n\n**🕐 HORARIOS ESPECÍFICOS:**\n• **Inicio**: 8:00 AM\n• **Fin**: 2:00 PM (14:00)\n• **Duración por sesión**: 45 minutos\n• **Tiempo entre citas**: 15 minutos\n\n**⏰ BLOQUES DISPONIBLES:**\n• 🕐 **08:00 - 08:45**\n• 🕘 **08:45 - 09:30** \n• 🕤 **09:30 - 10:15**\n• 🕙 **10:15 - 11:00**\n• 🕚 **11:00 - 11:45**\n• 🕦 **11:45 - 12:30**\n• 🕧 **12:30 - 13:15**\n• 🕐 **13:15 - 14:00**\n\n**⚠️ RESTRICCIONES IMPORTANTES:**\n• 🚫 **Límite de agendamiento**: 13:10 del día actual\n• 📵 **No citas retroactivas**\n• ⚡ **Solo 1 cita pendiente** por estudiante\n• 🔔 **Confirmación requerida** del psicólogo\n\n**🌐 DISPONIBILIDAD DIGITAL:**\n• **Plataforma**: Disponible 24/7\n• **Agendamiento**: Siempre activo online\n• **Notificaciones**: Automáticas\n• **Recordatorios**: 24 y 2 horas antes\n\n${ctx.userProfile === 'psicologo' ? '\n**👨‍⚕️ FUNCIONES PROFESIONALES:**\n• 🔓 **Agendamiento directo** sin restricciones\n• ⏰ **Bloqueo de horarios** personales\n• 📊 **Vista calendario** completa\n• 📈 **Estadísticas de ocupación**' : ''}\n\n**📞 CONTACTO DE EMERGENCIA:**\n• **Crisis psicológicas**: Contacto directo al instituto\n• **Soporte técnico**: Horarios laborales`,
      isBot: true,
      timestamp: new Date(),
      type: 'interactive',
      category: 'horarios',
      options: ctx.userProfile === 'estudiante'
        ? ["🕐 ¿Qué horarios están libres hoy?", "⏰ ¿Por qué no puedo agendar después de 13:10?", "📅 ¿Cómo sé si mi horario fue confirmado?", "🔔 ¿Cuándo llegan las notificaciones?"]
        : ["⏰ ¿Cómo bloqueo mis horarios no disponibles?", "📊 ¿Cómo veo la ocupación semanal?", "🕐 ¿Puedo extender sesiones?", "📅 ¿Cómo gestiono cancelaciones?"]
    }),
    "emergencia": (ctx) => ({
      id: 0,
      text: `**🚨 PROTOCOLO DE EMERGENCIAS PSICOLÓGICAS**\n\n**⚡ SITUACIONES DE EMERGENCIA:**\n• 🧠 **Crisis psicológica aguda**\n• 😰 **Ataques de pánico severos**\n• 💔 **Ideación suicida**\n• 🎯 **Crisis de ansiedad extrema**\n• 🔥 **Episodios psicóticos**\n• 💥 **Trauma inmediato**\n\n**🆘 CONTACTOS DE EMERGENCIA INMEDIATA:**\n\n**📞 LÍNEAS DE CRISIS (24/7):**\n• **Línea 113** - Emergencia Nacional\n• **Centro de Salud Mental** - (01) XXX-XXXX\n• **Bomberos** - 116\n• **Policía** - 105\n\n**🏥 EN EL INSTITUTO:**\n• **Dirección Académica**: Extensión 101\n• **Coordinación de Bienestar**: Extensión 102\n• **Enfermería**: Planta baja, Pabellón A\n\n**🚀 PROTOCOLO DE ACCIÓN INMEDIATA:**\n\n**1️⃣ EVALUACIÓN RÁPIDA**\n• ❓ ¿Es una amenaza inmediata?\n• 🏥 ¿Requiere hospitalización?\n• 👥 ¿Necesita acompañamiento?\n\n**2️⃣ CONTACTO INMEDIATO**\n• 📞 Llamar a línea de emergencia\n• 👨‍⚕️ Localizar psicólogo de turno\n• 👥 Avisar a contacto de emergencia\n\n**3️⃣ MIENTRAS LLEGA AYUDA**\n• 🤝 **Mantenerse con la persona**\n• 💬 **Escuchar sin juzgar**\n• 🔒 **Retirar objetos peligrosos**\n• 😌 **Mantener calma**\n\n**⚠️ IMPORTANTE:**\n• 🚫 **NO dejar sola** a la persona\n• 🚫 **NO minimizar** los sentimientos\n• ✅ **SÍ tomar en serio** cualquier amenaza\n• ✅ **SÍ buscar ayuda profesional** inmediata\n\n**🔄 SEGUIMIENTO POST-EMERGENCIA:**\n• 📋 Evaluación profesional completa\n• 🎯 Plan de tratamiento intensivo\n• 👥 Coordinación con familia\n• 📊 Monitoreo continuo\n\n${ctx.userProfile === 'psicologo' ? '\n**👨‍⚕️ PROTOCOLO PROFESIONAL:**\n• 📋 **Evaluación de riesgo** inmediata\n• 📞 **Contacto con supervisión**\n• 🏥 **Derivación hospitalaria** si necesario\n• 📝 **Documentación completa** del caso' : ''}`,
      isBot: true,
      timestamp: new Date(),
      type: 'interactive',
      category: 'emergencia',
      priority: 'high',
      options: ctx.userProfile === 'estudiante'
        ? ["📞 ¿Cuáles son los números exactos?", "🤝 ¿Qué hago si un amigo está en crisis?", "⏰ ¿Hay psicólogo de turno ahora?", "🏥 ¿Cuándo debo ir al hospital?"]
        : ["📋 ¿Cómo evalúo riesgo suicida?", "📞 ¿A quién contacto primero?", "🏥 ¿Criterios para hospitalización?", "📝 ¿Cómo documento una emergencia?"]
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
        text: `¡Hola! 👋 **Bienvenido al Sistema Inteligente de Psicología ISTTA**\n\nSoy tu asistente personalizado y puedo adaptar mis respuestas según tu rol. ${newContext.userProfile !== 'unknown' ? `He detectado que eres **${newContext.userProfile}**, así que te daré información específica para ti.` : 'Cuéntame si eres estudiante, psicólogo o administrador para brindarte información personalizada.'}\n\n**🎯 Puedo ayudarte con:**\n• 📅 **Agendamiento inteligente** de citas\n• 🏥 **Servicios especializados** de psicología\n• 👥 **Funcionalidades por rol** específicas\n• ⏰ **Horarios detallados** y disponibilidad\n• 🚨 **Protocolos de emergencia**\n• 🔒 **Políticas de privacidad**\n\n💡 **Tip**: Soy más inteligente ahora. Puedes preguntarme en lenguaje natural.`,
        isBot: true,
        timestamp: new Date(),
        type: 'interactive',
        category: 'bienvenida',
        options: newContext.userProfile === 'unknown' 
          ? ["🎓 Soy estudiante", "🧠 Soy psicólogo", "👨‍💼 Soy administrador", "❓ No estoy seguro de mi rol"]
          : ["📅 ¿Cómo agendar una cita?", "🏥 ¿Qué servicios hay disponibles?", "⏰ ¿Cuáles son los horarios?", "🚨 ¿Qué hago en una emergencia?"]
      };
    }
    
    if (input.includes('gracias') || input.includes('perfecto') || input.includes('entiendo') || input.includes('bien') || input.includes('ok')) {
      const followUpSuggestions = getContextualFollowUp(newContext);
      return {
        id: 0,
        text: `¡Perfecto! 😊 Me alegra poder ayudarte con información precisa sobre nuestro sistema de psicología.\n\n${followUpSuggestions.length > 0 ? '**¿Te gustaría saber más sobre:**' : 'Si tienes más preguntas, no dudes en preguntar. Estoy aquí para apoyarte en tu bienestar emocional y académico.'}`,
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
      text: `Entiendo tu consulta sobre **"${userInput}"**. \n\nComo tu asistente inteligente especializado en el Sistema de Psicología ISTTA, puedo brindarte información detallada y personalizada${newContext.userProfile !== 'unknown' ? ` para ${newContext.userProfile}s` : ''}:\n\n🧠 **Respuestas Inteligentes sobre:**\n• 📅 **Agendamiento paso a paso** con horarios específicos\n• 🏥 **Servicios terapéuticos** individuales y grupales\n• 👥 **Funcionalidades por rol** (estudiante/psicólogo/admin)\n• ⏰ **Horarios exactos** y disponibilidad en tiempo real\n• 🚨 **Protocolos de emergencia** y crisis\n• 📋 **Requisitos específicos** según tu perfil\n\n💡 **Mi IA puede entender** preguntas como:\n- "¿Cómo agendo una cita para mañana?"\n- "¿Qué hago si tengo una crisis?"\n- "¿Cuáles son mis funciones como psicólogo?"\n\n¿Sobre qué te gustaría información específica?`,
      isBot: true,
      timestamp: new Date(),
      type: 'interactive',
      category: 'inteligente',
      options: [
        "📅 Proceso de agendamiento completo",
        "🏥 Servicios y terapias disponibles", 
        "⏰ Horarios y disponibilidad exacta",
        "🚨 ¿Qué hago en una emergencia?",
        `${newContext.userProfile !== 'unknown' ? `🎯 Funciones específicas para ${newContext.userProfile}s` : '👥 Explícame los roles del sistema'}`
      ]
    };
  };

  // Sistema de sugerencias de seguimiento contextual
  const getContextualFollowUp = (ctx: ConversationContext): string[] => {
    const suggestions: string[] = [];
    
    if (ctx.lastTopic === 'agendar_cita') {
      suggestions.push("⏰ Horarios disponibles hoy", "📝 Qué incluir en motivo de consulta");
    } else if (ctx.lastTopic === 'servicios') {
      suggestions.push("📅 Cómo acceder a estos servicios", "💰 Costos y requisitos");
    } else if (ctx.lastTopic === 'horarios') {
      suggestions.push("📅 Agendar una cita ahora", "🔔 Configurar recordatorios");
    }
    
    if (ctx.userProfile === 'estudiante') {
      suggestions.push("🎓 Tips para estudiantes");
    } else if (ctx.userProfile === 'psicologo') {
      suggestions.push("👨‍⚕️ Herramientas profesionales");
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

    // Simular procesamiento inteligente con tiempo variable según complejidad
    const processingTime = currentInput.toLowerCase().includes('emergencia') || currentInput.toLowerCase().includes('crisis') 
      ? 500  // Respuesta rápida para emergencias
      : 1000 + Math.random() * 1500; // Tiempo normal para otras consultas

    setTimeout(() => {
      const botResponse = getIntelligentResponse(currentInput, context);
      botResponse.id = Date.now() + 1;
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, processingTime);
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
    <div className="fixed bottom-0 right-0 w-80 h-[500px] bg-gradient-to-b from-[#0a0202] via-[#1a0507] to-[#0a0202] rounded-tl-2xl shadow-2xl border-l border-t border-[#8e161a]/30 flex flex-col z-[9998] overflow-hidden backdrop-blur-xl" style={{
      boxShadow: '0 -10px 50px -12px rgba(26, 5, 7, 0.8), -5px 0 20px rgba(26, 5, 7, 0.4), inset 0 1px 0 rgba(211, 183, 160, 0.1)'
    }}>
      {/* Header del Chatbot */}
      <div className="bg-gradient-to-r from-[#1a0507] via-[#2d0c0f] to-[#1a0507] text-white p-4 flex items-center justify-between rounded-tl-2xl border-b border-[#8e161a]/30 relative" style={{
        boxShadow: 'inset 0 1px 0 rgba(211, 183, 160, 0.1), 0 1px 0 rgba(142, 22, 26, 0.2)'
      }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#d3b7a0]/30 to-[#8e161a]/30 rounded-full flex items-center justify-center border border-[#d3b7a0]/40 shadow-lg">
            <span className="text-xl font-bold text-[#d3b7a0]">🧠</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#f5f5f5] tracking-wide">Asistente Psicológico</h3>
            <p className="text-sm text-[#d3b7a0]/90 font-medium">Sistema Integral ISTTA</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-[#d3b7a0]/80 hover:text-[#d3b7a0] transition-all duration-200 p-2 hover:bg-[#8e161a]/20 rounded-full border border-[#d3b7a0]/20 hover:border-[#d3b7a0]/40"
        >
          <span className="text-lg font-bold">×</span>
        </button>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0f0304] via-[#1a0507] to-[#0f0304] relative scrollbar-thin scrollbar-track-[#2d0c0f] scrollbar-thumb-[#8e161a]/60 hover:scrollbar-thumb-[#8e161a]/80" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(142, 22, 26, 0.6) rgba(45, 12, 15, 1)',
        background: 'linear-gradient(180deg, #0f0304 0%, #1a0507 50%, #0f0304 100%)'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}
          >
            <div className={`max-w-[85%] ${message.isBot ? 'order-2' : ''}`}>
              {message.isBot && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🧠</span>
                  <span className="text-xs text-[#d3b7a0] font-semibold">Asistente Psicológico</span>
                  <span className="text-xs text-[#d3b7a0]/60">{formatTime(message.timestamp)}</span>
                </div>
              )}
              
              <div
                className={`p-4 rounded-2xl ${
                  message.isBot
                    ? 'bg-gradient-to-br from-[#2d0c0f] to-[#1a0507] border border-[#8e161a]/30 text-[#f5f5f5] shadow-xl'
                    : 'bg-gradient-to-r from-[#8e161a] to-[#a52a2a] text-white shadow-lg'
                } backdrop-blur-sm`}
                style={message.isBot ? {
                  boxShadow: '0 8px 25px rgba(26, 5, 7, 0.4), inset 0 1px 0 rgba(211, 183, 160, 0.1)'
                } : {}}
              >
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {message.text}
                </div>
                
                {message.options && (
                  <div className="mt-4 space-y-2">
                    {message.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        className="w-full text-left p-3 bg-gradient-to-r from-[#8e161a]/20 to-[#d3b7a0]/20 hover:from-[#8e161a]/30 hover:to-[#d3b7a0]/30 border border-[#d3b7a0]/30 hover:border-[#d3b7a0]/50 rounded-lg text-sm transition-all duration-200 text-[#d3b7a0] font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        style={{
                          boxShadow: '0 4px 15px rgba(142, 22, 26, 0.2)'
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {!message.isBot && (
                <div className="flex items-center gap-2 mt-2 justify-end">
                  <span className="text-xs text-[#d3b7a0]/60">{formatTime(message.timestamp)}</span>
                  <span className="text-sm">👤</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="max-w-[85%]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">🧠</span>
                <span className="text-xs text-[#d3b7a0] font-semibold">Procesando...</span>
              </div>
              <div className="bg-gradient-to-br from-[#2d0c0f] to-[#1a0507] border border-[#8e161a]/30 p-4 rounded-2xl shadow-xl backdrop-blur-sm" style={{
                boxShadow: '0 8px 25px rgba(26, 5, 7, 0.4), inset 0 1px 0 rgba(211, 183, 160, 0.1)'
              }}>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-[#d3b7a0] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#d3b7a0] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#d3b7a0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <div className="p-4 bg-gradient-to-r from-[#1a0507] via-[#2d0c0f] to-[#1a0507] border-t border-[#8e161a]/30" style={{
        boxShadow: 'inset 0 1px 0 rgba(211, 183, 160, 0.1)'
      }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Escribe tu pregunta aquí..."
            className="flex-1 p-3 bg-gradient-to-r from-[#2d0c0f] to-[#1a0507] border border-[#8e161a]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d3b7a0] focus:border-[#d3b7a0] text-sm text-[#f5f5f5] placeholder-[#d3b7a0]/60 shadow-inner backdrop-blur-sm"
            style={{
              boxShadow: 'inset 0 2px 4px rgba(26, 5, 7, 0.3)'
            }}
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-3 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] text-white rounded-xl hover:from-[#6d1115] hover:to-[#b89a80] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 active:scale-95"
            style={{
              boxShadow: '0 4px 15px rgba(142, 22, 26, 0.3)'
            }}
          >
            <Send className="w-4 h-4" />
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
      className={`fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center z-[9999] ${isGlowing ? 'animate-pulse' : ''} hover:animate-none overflow-hidden`}
      style={{
        boxShadow: '0 4px 12px rgba(142, 22, 26, 0.2)',
        position: 'fixed' // Asegurar posición fija respecto al viewport
      }}
      title="🤖 Asistente Psicológico Inteligente - ¡Ahora con IA mejorada!"
    >
      <Brain className="w-6 h-6 relative z-10 text-white" />
    </button>,
    document.body
  );
}
