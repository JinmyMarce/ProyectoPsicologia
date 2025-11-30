import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, UserRound, Shield, Brain, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { ChatBot, ChatBotToggle } from '../chatbot/ChatBot';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const { login, loginWithGoogle, loading, error, setUser, setToken } = useAuth();

  // Efecto de animación al cargar
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Efecto para mostrar el formulario
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Manejar callback de Google OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      console.error('Error en autenticación:', errorParam);
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Guardar en localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Actualizar contexto
        setToken(token);
        setUser(user);
        
        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error procesando callback:', error);
        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [setUser, setToken]);

  // Función para limpiar errores cuando el usuario empieza a escribir
  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Función de validación del formulario
  const validateForm = (): boolean => {
    const newErrors: typeof fieldErrors = {};
    let isValid = true;

    // Validar email
    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
      isValid = false;
    } else if (!email.includes('@')) {
      newErrors.email = 'Por favor ingresa un correo electrónico válido';
      isValid = false;
    } else if (!email.endsWith('@istta.edu.pe') && !email.includes('@gmail.com') && !email.includes('@hotmail.com') && !email.includes('@outlook.com')) {
      newErrors.email = 'Los estudiantes deben usar su correo institucional (@istta.edu.pe)';
      isValid = false;
    }

    // Validar contraseña
    if (!password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    // Los términos y condiciones se aceptan automáticamente al iniciar sesión

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      // Los errores del backend se manejan en el contexto de autenticación
    }
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center relative overflow-hidden pt-2 pb-1 sm:pt-2 sm:pb-2 lg:p-3" style={{
      background: `
        linear-gradient(135deg, 
          #0f1419 0%, 
          #1a1f29 12%, 
          #2c1d1d 25%, 
          #1e2a37 38%, 
          #3d1f1f 50%, 
          #2c3e50 62%, 
          #4a2020 75%, 
          #34495e 88%, 
          #8e161a 100%
        ),
        radial-gradient(ellipse at 20% 20%, rgba(142, 22, 26, 0.35) 0%, transparent 40%),
        radial-gradient(ellipse at 80% 80%, rgba(44, 62, 80, 0.25) 0%, transparent 40%),
        radial-gradient(ellipse at 50% 5%, rgba(25, 42, 61, 0.18) 0%, transparent 60%),
        radial-gradient(ellipse at 10% 90%, rgba(142, 22, 26, 0.15) 0%, transparent 50%),
        linear-gradient(45deg, rgba(44, 62, 80, 0.08) 0%, rgba(142, 22, 26, 0.06) 50%, rgba(25, 42, 61, 0.04) 100%)
      `,
      backgroundSize: '500% 500%, 60% 60%, 55% 55%, 75% 75%, 65% 65%, 250% 250%',
      animation: 'professionalGradient 25s ease-in-out infinite'
    }}>
      {/* Partículas ultra modernas del sistema */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `
            radial-gradient(2px 2px at 25px 35px, rgba(142, 22, 26, 0.8), transparent),
            radial-gradient(1.8px 1.8px at 50px 80px, rgba(44, 62, 80, 0.7), transparent),
            radial-gradient(1.4px 1.4px at 100px 50px, rgba(25, 42, 61, 0.6), transparent),
            radial-gradient(1.2px 1.2px at 75px 25px, rgba(142, 22, 26, 0.5), transparent),
            radial-gradient(1.6px 1.6px at 120px 90px, rgba(52, 73, 94, 0.5), transparent),
            radial-gradient(1px 1px at 40px 110px, rgba(255, 255, 255, 0.3), transparent),
            radial-gradient(0.8px 0.8px at 160px 60px, rgba(25, 42, 61, 0.4), transparent),
            radial-gradient(1.2px 1.2px at 30px 140px, rgba(44, 62, 80, 0.4), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px 120px',
          animation: 'sparkle 12s linear infinite'
        }}></div>
      </div>

      {/* Patrón ultra moderno de psicología */}
      <div className="absolute inset-0 overflow-hidden opacity-15">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(142, 22, 26, 0.2) 1.2px, transparent 1.2px),
            radial-gradient(circle at 75% 75%, rgba(44, 62, 80, 0.18) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, rgba(25, 42, 61, 0.15) 0.8px, transparent 0.8px),
            radial-gradient(circle at 75% 25%, rgba(142, 22, 26, 0.12) 0.9px, transparent 0.9px),
            radial-gradient(circle at 25% 75%, rgba(52, 73, 94, 0.14) 0.7px, transparent 0.7px),
            radial-gradient(circle at 60% 40%, rgba(25, 42, 61, 0.1) 0.6px, transparent 0.6px),
            linear-gradient(90deg, transparent 49.2%, rgba(142, 22, 26, 0.08) 50%, transparent 50.8%),
            linear-gradient(45deg, transparent 49.2%, rgba(44, 62, 80, 0.06) 50%, transparent 50.8%),
            linear-gradient(-45deg, transparent 49.2%, rgba(25, 42, 61, 0.05) 50%, transparent 50.8%),
            linear-gradient(0deg, transparent 49.3%, rgba(52, 73, 94, 0.04) 50%, transparent 50.7%)
          `,
          backgroundSize: '100px 100px, 140px 140px, 80px 80px, 120px 120px, 90px 90px, 110px 110px, 200px 200px, 230px 230px, 260px 260px, 180px 180px',
          animation: 'patternMove 25s linear infinite'
        }}></div>
      </div>

      {/* Puntos decorativos pequeños dispersos */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 15% 25%, rgba(142, 22, 26, 0.4) 1px, transparent 1px),
            radial-gradient(circle at 85% 15%, rgba(44, 62, 80, 0.3) 1px, transparent 1px),
            radial-gradient(circle at 25% 75%, rgba(25, 42, 61, 0.5) 1px, transparent 1px),
            radial-gradient(circle at 75% 85%, rgba(52, 73, 94, 0.3) 1px, transparent 1px),
            radial-gradient(circle at 45% 35%, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            radial-gradient(circle at 65% 65%, rgba(142, 22, 26, 0.3) 1px, transparent 1px),
            radial-gradient(circle at 35% 55%, rgba(25, 42, 61, 0.4) 1px, transparent 1px),
            radial-gradient(circle at 55% 25%, rgba(44, 62, 80, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px, 120px 120px, 100px 100px, 140px 140px, 90px 90px, 110px 110px, 95px 95px, 125px 125px',
          animation: 'floatDots 20s ease-in-out infinite'
        }}></div>
      </div>

      {/* Ilustraciones SVG animadas de bienestar psicológico - Fondo de la interfaz */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-15">
        {/* SVG Principal Central */}
        <svg className="w-full h-full max-w-4xl max-h-screen" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          {/* Ondas de tranquilidad en el centro */}
          <g className="animate-pulse-gentle">
            <circle cx="400" cy="400" r="120" fill="none" stroke="rgba(142, 22, 26, 0.35)" strokeWidth="3" className="animate-wave-expand" />
            <circle cx="400" cy="400" r="180" fill="none" stroke="rgba(44, 62, 80, 0.25)" strokeWidth="2.5" className="animate-wave-expand-delayed" />
            <circle cx="400" cy="400" r="240" fill="none" stroke="rgba(25, 42, 61, 0.18)" strokeWidth="2" className="animate-wave-expand-slow" />
          </g>
          
          {/* Elementos de equilibrio distribuidos */}
          <g className="animate-float-gentle">
            {/* Hojas minimalistas superior izquierda */}
            <path d="M200 200 Q220 180 240 200 Q220 220 200 200" fill="rgba(44, 62, 80, 0.4)" className="animate-leaf-1" />
            <path d="M160 240 Q180 220 200 240 Q180 260 160 240" fill="rgba(142, 22, 26, 0.3)" className="animate-leaf-2" />
            
            {/* Hojas superior derecha */}
            <path d="M600 200 Q620 180 640 200 Q620 220 600 200" fill="rgba(142, 22, 26, 0.3)" className="animate-leaf-1" />
            <path d="M580 160 Q600 140 620 160 Q600 180 580 160" fill="rgba(25, 42, 61, 0.4)" className="animate-leaf-2" />
            
            {/* Hojas inferior izquierda */}
            <path d="M180 580 Q200 560 220 580 Q200 600 180 580" fill="rgba(52, 73, 94, 0.4)" className="animate-leaf-2" />
            <path d="M140 620 Q160 600 180 620 Q160 640 140 620" fill="rgba(142, 22, 26, 0.3)" className="animate-leaf-1" />
            
            {/* Hojas inferior derecha */}
            <path d="M620 600 Q640 580 660 600 Q640 620 620 600" fill="rgba(25, 42, 61, 0.3)" className="animate-leaf-2" />
            <path d="M580 640 Q600 620 620 640 Q600 660 580 640" fill="rgba(44, 62, 80, 0.4)" className="animate-leaf-1" />
          </g>
          
          {/* Símbolos de mente saludable */}
          <g>
            <circle cx="300" cy="300" r="5" fill="rgba(211, 183, 160, 0.6)" className="animate-mindful-dot-1" />
            <circle cx="500" cy="300" r="4" fill="rgba(142, 22, 26, 0.5)" className="animate-mindful-dot-2" />
            <circle cx="300" cy="500" r="4" fill="rgba(142, 22, 26, 0.5)" className="animate-mindful-dot-3" />
            <circle cx="500" cy="500" r="5" fill="rgba(211, 183, 160, 0.6)" className="animate-mindful-dot-1" />
            <circle cx="150" cy="350" r="3" fill="rgba(211, 183, 160, 0.4)" className="animate-mindful-dot-2" />
            <circle cx="650" cy="350" r="3" fill="rgba(142, 22, 26, 0.4)" className="animate-mindful-dot-3" />
            <circle cx="400" cy="100" r="2.5" fill="rgba(211, 183, 160, 0.4)" className="animate-mindful-dot-2" />
            <circle cx="380" cy="700" r="2.5" fill="rgba(142, 22, 26, 0.4)" className="animate-mindful-dot-3" />
          </g>
          
          {/* Ondas de respiración suaves */}
          <g className="animate-breathe">
            <ellipse cx="400" cy="400" rx="90" ry="60" fill="none" stroke="rgba(211, 183, 160, 0.3)" strokeWidth="2" className="animate-breathing-1" />
            <ellipse cx="400" cy="400" rx="60" ry="90" fill="none" stroke="rgba(142, 22, 26, 0.25)" strokeWidth="2" className="animate-breathing-2" />
          </g>
        </svg>
      </div>

      {/* Textura ultra moderna del sistema */}
      <div className="absolute inset-0 overflow-hidden opacity-22">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 30% 25%, rgba(142, 22, 26, 0.35) 0.5px, transparent 0.5px),
            radial-gradient(circle at 70% 35%, rgba(211, 183, 160, 0.3) 0.45px, transparent 0.45px),
            radial-gradient(circle at 25% 75%, rgba(142, 22, 26, 0.25) 0.4px, transparent 0.4px),
            radial-gradient(circle at 75% 65%, rgba(186, 158, 134, 0.22) 0.35px, transparent 0.35px),
            radial-gradient(circle at 50% 50%, rgba(211, 183, 160, 0.28) 0.4px, transparent 0.4px),
            radial-gradient(circle at 15% 55%, rgba(142, 22, 26, 0.18) 0.3px, transparent 0.3px),
            radial-gradient(circle at 85% 45%, rgba(255, 255, 255, 0.15) 0.25px, transparent 0.25px),
            radial-gradient(circle at 40% 80%, rgba(186, 158, 134, 0.16) 0.3px, transparent 0.3px),
            radial-gradient(circle at 60% 20%, rgba(211, 183, 160, 0.2) 0.3px, transparent 0.3px)
          `,
          backgroundSize: '60px 60px, 85px 85px, 70px 70px, 100px 100px, 55px 55px, 110px 110px, 75px 75px, 90px 90px, 65px 65px',
          animation: 'twinkleDots 14s ease-in-out infinite'
        }}></div>
      </div>

      {/* Elemento Central Único - Cerebro Académico del Instituto */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 opacity-10 pointer-events-none" style={{
        animation: 'brainPulse 8s ease-in-out infinite'
      }}>
        {/* Núcleo central - Representa el conocimiento */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-[#8e161a] to-[#d3b7a0] rounded-full" style={{
          animation: 'coreGlow 6s ease-in-out infinite',
          boxShadow: '0 0 20px rgba(142, 22, 26, 0.3)'
        }}></div>
        
        {/* Hemisferios cerebrales estilizados */}
        <div className="absolute top-1/4 left-1/4 w-6 h-8 border-2 border-[#8e161a]/20 rounded-t-full rounded-bl-full" style={{
          animation: 'hemisphereLeft 10s ease-in-out infinite'
        }}></div>
        <div className="absolute top-1/4 right-1/4 w-6 h-8 border-2 border-[#d3b7a0]/20 rounded-t-full rounded-br-full" style={{
          animation: 'hemisphereRight 10s ease-in-out infinite 2s'
        }}></div>
        
        {/* Conexiones neuronales - Representan el aprendizaje */}
        <div className="absolute top-1/3 left-1/2 w-8 h-0.5 bg-gradient-to-r from-[#8e161a]/30 to-transparent origin-left" style={{
          animation: 'connectionPulse 4s ease-in-out infinite'
        }}></div>
        <div className="absolute top-2/3 right-1/2 w-8 h-0.5 bg-gradient-to-l from-[#d3b7a0]/30 to-transparent origin-right" style={{
          animation: 'connectionPulse 4s ease-in-out infinite 1s'
        }}></div>
        <div className="absolute top-1/2 left-1/3 w-0.5 h-6 bg-gradient-to-b from-[#8e161a]/25 to-transparent" style={{
          animation: 'connectionPulse 5s ease-in-out infinite 0.5s'
        }}></div>
        <div className="absolute top-1/2 right-1/3 w-0.5 h-6 bg-gradient-to-b from-[#d3b7a0]/25 to-transparent" style={{
          animation: 'connectionPulse 5s ease-in-out infinite 1.5s'
        }}></div>
        
        {/* Puntos de conocimiento - Libros/Ideas */}
        <div className="absolute top-1/6 left-1/2 w-2 h-2 bg-[#8e161a]/40 rounded-full" style={{
          animation: 'knowledgePoint 7s ease-in-out infinite'
        }}></div>
        <div className="absolute bottom-1/6 left-1/3 w-1.5 h-1.5 bg-[#d3b7a0]/40 rounded-full" style={{
          animation: 'knowledgePoint 7s ease-in-out infinite 2s'
        }}></div>
        <div className="absolute top-1/2 right-1/6 w-1.5 h-1.5 bg-[#8e161a]/30 rounded-full" style={{
          animation: 'knowledgePoint 6s ease-in-out infinite 1s'
        }}></div>
        
        {/* Ondas de pensamiento */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-[#8e161a]/10 rounded-full" style={{
          animation: 'thoughtWave 12s linear infinite'
        }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-[#d3b7a0]/8 rounded-full" style={{
          animation: 'thoughtWave 15s linear infinite reverse'
        }}></div>
        
        {/* Símbolos académicos micro */}
        <div className="absolute top-1/5 right-1/4 text-[#8e161a]/30 text-xs" style={{
          animation: 'symbolFloat 8s ease-in-out infinite'
        }}>Ψ</div>
        <div className="absolute bottom-1/4 left-1/5 text-[#d3b7a0]/30 text-xs" style={{
          animation: 'symbolFloat 9s ease-in-out infinite 3s'
        }}>📚</div>
        <div className="absolute top-2/3 right-1/5 text-[#8e161a]/25 text-xs" style={{
          animation: 'symbolFloat 7s ease-in-out infinite 1.5s'
        }}>🧠</div>
      </div>

      <div className={`w-full max-w-full flex flex-col items-center relative z-10 transition-all duration-1000 ${showForm ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 items-start sm:items-center">
        
        {/* Columna izquierda - Logo y Bienvenida mejorada */}
        <div className="flex flex-col items-center justify-start sm:justify-center text-center pt-12 pb-1 sm:pt-16 sm:pb-2 md:pt-20 md:pb-3 lg:pt-24 lg:pb-3">
          <div className="flex flex-row lg:flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-0 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2.5">
            <div className="relative w-[80px] h-[80px] sm:w-[110px] sm:h-[110px] md:w-[130px] md:h-[130px] lg:w-[280px] lg:h-[280px] flex items-center justify-center flex-shrink-0">
              {/* Fondo del logo - Luna realista más pequeña */}
              <div className="absolute inset-0 w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[95px] md:h-[95px] lg:w-[200px] lg:h-[200px] rounded-full shadow-2xl" style={{
                animation: 'moonGlow 12s ease-in-out infinite, moonFloat 8s ease-in-out infinite',
        boxShadow: '0 0 60px rgba(255, 255, 255, 0.6), inset 0 0 40px rgba(255, 255, 255, 0.2), 0 0 100px rgba(255, 255, 255, 0.3)',
        background: `radial-gradient(circle at 25% 25%, #ffffff 0%, #f8fafc 30%, #e2e8f0 60%, #cbd5e1 80%, #94a3b8 90%, #64748b 95%, #475569 100%), radial-gradient(circle at 70% 70%, rgba(148, 163, 184, 0.15) 0%, transparent 70%), radial-gradient(circle at 40% 60%, rgba(100, 116, 139, 0.1) 0%, transparent 60%)`
      }}>
        {/* Textura lunar realista */}
        <div className="absolute inset-0 rounded-full" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(148, 163, 184, 0.2) 1px, transparent 1px),
            radial-gradient(circle at 60% 40%, rgba(100, 116, 139, 0.25) 1px, transparent 1px),
            radial-gradient(circle at 80% 60%, rgba(71, 85, 105, 0.15) 1px, transparent 1px),
            radial-gradient(circle at 40% 80%, rgba(51, 65, 85, 0.2) 1px, transparent 1px)
          `,
                  backgroundSize: '25px 25px, 38px 38px, 30px 30px, 42px 42px'
        }}></div>
        
                {/* Brillo lunar natural */}
                <div className="absolute top-1 left-1 w-2 h-2 bg-gradient-to-br from-white to-transparent rounded-full opacity-80"></div>
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-90"></div>
              </div>
              
              {/* Contenedor del logo dentro del círculo */}
              <div className="absolute inset-0 w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[95px] md:h-[95px] lg:w-[200px] lg:h-[200px] flex items-center justify-center">
                <img 
                  src={window.location.origin + "/images/icons/psicologia.png"}
                  alt="Logo Institucional"
                  className={`w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-48 lg:h-48 xl:w-56 xl:h-56 object-contain drop-shadow-lg transition-all duration-1000 ${isAnimated ? 'transform scale-100 rotate-0' : 'transform scale-75 rotate-12'}`}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%',
                    animation: 'logoFloat 6s ease-in-out infinite',
                    imageRendering: 'crisp-edges',
                    filter: 'none'
                  }}
                  onError={(e) => {
                    console.log('Error cargando imagen:', e);
                    const target = e.currentTarget;
                    const nextSibling = target.nextElementSibling as HTMLElement;
                    if (target && nextSibling) {
                      target.style.display = 'none';
                      nextSibling.style.display = 'flex';
                    }
                  }}
                  onLoad={() => {
                    console.log('Imagen cargada exitosamente');
                  }}
                />
                <div className="w-64 h-64 bg-gradient-to-tr from-[#8e161a] via-[#a52a2a] to-[#d3b7a0] rounded-full flex items-center justify-center hidden shadow-2xl">
                  <UserRound className="w-36 h-36 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
          
          <div className="space-y-3 sm:space-y-3 md:space-y-3.5 flex-1 text-left lg:text-center">
            <div className={`transition-all duration-1000 ${isAnimated ? 'transform translate-x-0' : 'transform -translate-x-8'}`}>
              <div className="mb-2 sm:mb-2 md:mb-2.5">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl font-black text-white mb-2 sm:mb-2 md:mb-2.5 tracking-tight leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-50 to-white drop-shadow-2xl"
                    style={{
                      textShadow: '0 0 30px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.2)',
                      letterSpacing: '-0.02em'
                    }}>
                    Bienvenido a SAPTA
                  </span>
                </h1>
              </div>
              <div className="px-1 sm:px-2 md:px-3">
                <h2 className="text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8e161a] via-[#c71f1f] via-[#d3b7a0] to-[#8e161a] mb-1.5 sm:mb-2 leading-relaxed"
                  style={{
                    backgroundSize: '200% auto',
                    animation: 'gradient-shift 3s ease infinite',
                    textShadow: '0 2px 8px rgba(142, 22, 26, 0.3)'
                  }}>
                  Sistema de Atención Psicológica Túpac Amaru
                </h2>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-300/80 mt-2 sm:mt-2 font-medium">
                  Cusco, Perú
                </p>
              </div>
            </div>
          </div>
          </div>
          
          {/* Características del sistema - Solo desktop */}
          <div className="hidden lg:block mt-32 xl:mt-40 2xl:mt-48">
            <div className={`flex flex-row justify-start items-center gap-2.5 xl:gap-3 transition-all duration-1000 delay-600 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
              <div className="flex items-center gap-1 text-gray-300 bg-black/30 backdrop-blur-md px-2.5 py-1 xl:px-3 xl:py-1.5 rounded-full border border-white/20 justify-center shadow-lg">
                <Shield className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-[#8e161a] flex-shrink-0" />
                <span className="text-xs xl:text-sm font-medium whitespace-nowrap">Seguro y Confidencial</span>
              </div>
              <div className="flex items-center gap-1 text-gray-300 bg-black/30 backdrop-blur-md px-2.5 py-1 xl:px-3 xl:py-1.5 rounded-full border border-white/20 justify-center shadow-lg">
                <Brain className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-[#d3b7a0] flex-shrink-0" />
                <span className="text-xs xl:text-sm font-medium whitespace-nowrap">Gestión Profesional</span>
              </div>
              <div className="flex items-center gap-1 text-gray-300 bg-black/30 backdrop-blur-md px-2.5 py-1 xl:px-3 xl:py-1.5 rounded-full border border-white/20 justify-center shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-[#8e161a] flex-shrink-0" />
                <span className="text-xs xl:text-sm font-medium whitespace-nowrap">Atención Personalizada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario de login mejorado */}
        <div className="flex flex-col items-center px-2 sm:px-3 md:px-4 lg:px-3 pt-2 sm:pt-4 md:pt-5 lg:pt-8 pb-2 sm:pb-4 md:pb-5 lg:pb-8">
          <div 
            className={`w-full max-w-sm sm:max-w-md md:max-w-md lg:max-w-md xl:max-w-lg rounded-3xl sm:rounded-[2rem] transition-all duration-700 ${isAnimated ? 'transform scale-100 translate-y-0' : 'transform scale-95 translate-y-4'}`}
            style={{
              animation: isAnimated ? 'formSlideIn 1s ease-out forwards' : 'none',
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.75), rgba(250, 250, 250, 0.75), rgba(245, 245, 245, 0.75))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(142, 22, 26, 0.15)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(142, 22, 26, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}
          >
            <Card padding="sm" className="p-4 sm:p-5 md:p-6 lg:p-7 bg-transparent border-0 shadow-none">
              <div className={`text-center mb-3 sm:mb-3.5 md:mb-4 transition-all duration-1000 delay-300 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
                <div className="flex flex-col items-center justify-center mb-2.5 sm:mb-3">
                  <div className="relative w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center mb-2 overflow-hidden p-1"
                    style={{
                      background: 'linear-gradient(135deg, rgba(142, 22, 26, 0.08) 0%, rgba(211, 183, 160, 0.08) 100%)',
                      boxShadow: '0 4px 12px rgba(142, 22, 26, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 0 0 1px rgba(142, 22, 26, 0.05)'
                    }}>
                    <img 
                      src="/images/icons/Icono del sitema.png"
                      alt="Logo del Sistema"
                      className="w-full h-full object-contain drop-shadow-sm"
                      onError={(e) => {
                        console.log('Error cargando logo del sistema:', e);
                        const target = e.currentTarget;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="text-center w-full">
                    <div className="inline-block px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-[#6d1115] via-[#5a0f0f] to-[#4d0d0d] border border-[#7a1515]/30 rounded-lg shadow-md"
                      style={{
                        boxShadow: '0 2px 8px rgba(61, 10, 10, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                      }}>
                      <p className="text-white font-semibold text-sm sm:text-base md:text-lg">
                        Ingresa a tu cuenta
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5 md:space-y-4" noValidate>
          <div className={`transition-all duration-1000 delay-500 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
            <div className="[&_input]:py-3 [&_label]:mb-2">
            <Input
              type="email"
              label="Correo Electrónico"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              icon={Mail}
              iconPosition="left"
              placeholderPosition="right"
              error={fieldErrors.email}
            />
            </div>
          </div>

          <div className={`transition-all duration-1000 delay-700 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
            <div className="[&_input]:py-3 [&_label]:mb-2">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              placeholder="••••••••••••••••••••"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              icon={Lock}
              iconPosition="left"
              placeholderPosition="right"
              hasRightButton={true}
              rightButton={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-[#8e161a] transition-all duration-200 p-1.5 rounded-lg focus:outline-none hover:scale-105"
                  tabIndex={-1}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              error={fieldErrors.password}
            />
            </div>
          </div>

          {/* Error del servidor - solo si no hay errores de campos específicos */}
          {error && !fieldErrors.email && !fieldErrors.password && (
            <div className="mt-2">
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {error}
              </p>
            </div>
          )}

                          {/* Aviso de términos y condiciones */}
                          <div className={`transition-all duration-1000 delay-900 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
                            <div className="p-2.5 bg-gradient-to-br from-white/80 via-gray-50/80 to-white/80 rounded-lg border border-gray-200/60 max-w-sm mx-auto backdrop-blur-sm text-left"
                              style={{
                                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.02)'
                              }}>
                              <p className="text-xs text-gray-600 leading-relaxed">
                              Al acceder al sistema, reconoces y aceptas de manera automática nuestros{' '}
                                <button
                                  type="button"
                                  onClick={() => setShowTermsModal(true)}
                                  className="text-[#8e161a] font-semibold hover:text-[#6d1115] underline transition-colors"
                                >
                                  Términos y Condiciones
                                </button>
                                {' '}y{' '}
                                <button
                                  type="button"
                                  onClick={() => setShowPrivacyModal(true)}
                                  className="text-[#8e161a] font-semibold hover:text-[#6d1115] underline transition-colors"
                                >
                                  Política de Privacidad
                                </button>
                                .
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-center pt-1 sm:pt-1.5">
          <Button
            type="submit"
                    className="w-3/4 sm:w-4/5 md:w-3/4 bg-gradient-to-r from-[#1a0a0a] via-[#2d0f0f] to-[#1e1b4b] text-white font-bold !py-2 sm:!py-2.5 md:!py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-[#0f0505] hover:via-[#1a0a0a] hover:to-[#15123a] transition-all duration-300 text-sm sm:text-base transform hover:scale-[1.02] active:scale-[0.98]"
            size="lg"
            loading={loading}
          >
                  {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </Button>
                </div>
        </form>

              <div className="mt-3">
                <div className="relative mb-2">
            <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200/60" />
            </div>
            <div className="relative flex justify-center text-sm">
                    <span className="px-3 py-0.5 bg-gradient-to-r from-white to-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm border border-gray-200/60 text-xs"
                      style={{
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}>
                      O continúa con
                    </span>
            </div>
          </div>

                          <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
                    className="w-3/4 sm:w-4/5 md:w-3/4 border-2 border-gray-500 hover:border-[#7f1d1d] text-gray-900 hover:text-[#7f1d1d] font-semibold bg-white hover:bg-red-200 transition-all duration-300 !py-2 sm:!py-2.5 md:!py-3 rounded-xl shadow-sm hover:shadow-md text-sm sm:text-base"
            size="lg"
            onClick={handleGoogleLogin}
            loading={loading}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 pointer-events-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
                   Google
          </Button>
                </div>
        </div>

              <div className="mt-3 p-1.5 sm:p-2 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 rounded-lg border border-blue-100/50 backdrop-blur-sm"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 2px 8px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                }}>
                <h4 className="text-[10px] sm:text-xs font-semibold text-gray-800 mb-1 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8e161a]" />
                  <span>Instrucciones de Acceso</span>
                </h4>
                <div className="space-y-0.5 text-[10px] sm:text-xs text-gray-700 text-center">
                  <p className="px-1 py-0.5">
                    <span className="font-semibold text-[#8e161a]">Estudiantes:</span>{' '}
                    <span className="text-gray-600">Accede utilizando tu correo institucional de Google.</span>
                  </p>
                  <p className="px-1 py-0.5">
                    <span className="font-semibold text-[#8e161a]">psicólogo:</span>{' '}
                    <span className="text-gray-600">Inicia sesión con tu correo y tu contraseña asignada.</span>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        </div>
        
        {/* Pie de página - Características del sistema - Solo móvil y tablet */}
        <div className="w-full mt-4 sm:mt-5 md:mt-6 lg:hidden px-2 sm:px-3 md:px-4">
          <div className={`flex flex-row flex-wrap justify-center items-center gap-2 sm:gap-2.5 md:gap-3 transition-all duration-1000 delay-600 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
            <div className="flex items-center gap-1.5 text-gray-300 bg-black/30 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 md:px-4 md:py-2 rounded-full border border-white/20 justify-center shadow-lg">
              <Shield className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-[#8e161a] flex-shrink-0" />
              <span className="text-xs sm:text-sm md:text-sm font-medium whitespace-nowrap">Seguro y Confidencial</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300 bg-black/30 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 md:px-4 md:py-2 rounded-full border border-white/20 justify-center shadow-lg">
              <Brain className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-[#d3b7a0] flex-shrink-0" />
              <span className="text-xs sm:text-sm md:text-sm font-medium whitespace-nowrap">Gestión Profesional</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300 bg-black/30 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 md:px-4 md:py-2 rounded-full border border-white/20 justify-center shadow-lg">
              <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-[#8e161a] flex-shrink-0" />
              <span className="text-xs sm:text-sm md:text-sm font-medium whitespace-nowrap">Atención Personalizada</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Términos y Condiciones */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Términos y Condiciones</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                <h3 className="text-lg font-semibold text-[#8e161a]">1. Aceptación de los Términos</h3>
                <p>Al acceder y utilizar el Sistema de Psicología del Instituto Túpac Amaru Cusco, Perú, usted acepta estar legalmente obligado por estos términos y condiciones.</p>
                
                <h3 className="text-lg font-semibold text-[#8e161a]">2. Uso del Sistema</h3>
                <p>Este sistema está destinado exclusivamente para estudiantes, psicólogos y personal administrativo autorizado del Instituto. El uso indebido resultará en la suspensión inmediata del acceso.</p>
                
                <h3 className="text-lg font-semibold text-[#8e161a]">3. Confidencialidad</h3>
                <p>Toda la información personal y académica manejada en este sistema es estrictamente confidencial y está protegida según las leyes peruanas de protección de datos.</p>
                
                <h3 className="text-lg font-semibold text-[#8e161a]">4. Responsabilidades del Usuario</h3>
                <p>Los usuarios son responsables de mantener la confidencialidad de sus credenciales y de reportar cualquier uso no autorizado de su cuenta.</p>
                
                <h3 className="text-lg font-semibold text-[#8e161a]">5. Limitación de Responsabilidad</h3>
                <p>El Instituto no será responsable por daños directos o indirectos derivados del uso de este sistema, excepto en casos de negligencia grave.</p>
                
                <h3 className="text-lg font-semibold text-[#8e161a]">6. Modificaciones</h3>
                <p>El Instituto se reserva el derecho de modificar estos términos en cualquier momento, notificando a los usuarios a través del sistema.</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full bg-[#8e161a] text-white py-3 rounded-xl font-semibold hover:bg-[#6d1115] transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Política de Privacidad */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Política de Privacidad</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                <h3 className="text-lg font-semibold text-[#8e161a]">1. Recopilación de Información</h3>
                <p>Recopilamos únicamente la información necesaria para brindar servicios educativos y psicológicos de calidad, incluyendo datos personales, académicos y de contacto.</p>
                
                <h3 className="text-lg font-semibold text-[#8e161a]">2. Uso de la Información</h3>
                <p>La información se utiliza exclusivamente para:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Gestión de servicios psicológicos</li>
                  <li>Seguimiento académico y terapéutico</li>
                  <li>Comunicación institucional</li>
                  <li>Mejora de nuestros servicios</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-[#8e161a]">3. Protección de Datos</h3>
                <p>Implementamos medidas de seguridad técnicas y organizacionales para proteger su información contra acceso no autorizado, alteración, divulgación o destrucción.</p>
                
                <h3 className="text-lg font-semibold text-[#8e161a]">4. Compartir Información</h3>
                <p>No compartimos información personal con terceros, excepto cuando sea requerido por ley o con consentimiento explícito del usuario.</p>
                
                <h3 className="text-lg font-semibold text-[#8e161a]">5. Derechos del Usuario</h3>
                <p>Tiene derecho a acceder, rectificar, cancelar y oponerse al tratamiento de sus datos personales según la Ley de Protección de Datos Personales del Perú.</p>
                
                <h3 className="text-lg font-semibold text-[#8e161a]">6. Contacto</h3>
                <p>Para consultas sobre esta política, contacte a: privacidad@istta.edu.pe</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full bg-[#8e161a] text-white py-3 rounded-xl font-semibold hover:bg-[#6d1115] transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <ChatBot 
        isVisible={showChatBot} 
        onClose={() => setShowChatBot(false)} 
      />
      
      {/* Botón flotante del chatbot */}
      {!showChatBot && (
        <ChatBotToggle onClick={() => setShowChatBot(true)} />
      )}
      
      {/* Estilos CSS para animaciones profesionales mejoradas */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes professionalGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes patternMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(10px, 10px); }
        }
        
        
        @keyframes moonGlow {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.15), 0 0 30px rgba(255, 255, 255, 0.1);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.35), inset 0 0 20px rgba(255, 255, 255, 0.2), 0 0 35px rgba(255, 255, 255, 0.12);
          }
        }
        
        
        @keyframes logoFloat {
          0%, 100% { 
            transform: translateY(0px) scale(1) rotate(0deg);
            filter: brightness(1) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
          }
          25% { 
            transform: translateY(-8px) scale(1.02) rotate(1deg);
            filter: brightness(1.1) drop-shadow(0 0 25px rgba(255, 255, 255, 0.4));
          }
          50% { 
            transform: translateY(-12px) scale(1.04) rotate(0deg);
            filter: brightness(1.2) drop-shadow(0 0 30px rgba(255, 255, 255, 0.6));
          }
          75% { 
            transform: translateY(-8px) scale(1.02) rotate(-1deg);
            filter: brightness(1.1) drop-shadow(0 0 25px rgba(255, 255, 255, 0.4));
          }
        }
        
        @keyframes moonFloat {
          0%, 100% { 
            transform: translateY(0px) scale(1) rotate(0deg);
          }
          25% { 
            transform: translateY(-6px) scale(1.01) rotate(0.5deg);
          }
          50% { 
            transform: translateY(-10px) scale(1.02) rotate(0deg);
          }
          75% { 
            transform: translateY(-6px) scale(1.01) rotate(-0.5deg);
          }
        }
        
        
        @keyframes floatDots {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          25% { 
            transform: translateY(-3px) translateX(2px);
            opacity: 0.4;
          }
          50% { 
            transform: translateY(2px) translateX(-1px);
            opacity: 0.35;
          }
          75% { 
            transform: translateY(-1px) translateX(3px);
            opacity: 0.4;
          }
        }
        
        @keyframes twinkleDots {
          0%, 100% { 
            opacity: 0.2;
            filter: brightness(1);
          }
          25% { 
            opacity: 0.3;
            filter: brightness(1.1);
          }
          50% { 
            opacity: 0.25;
            filter: brightness(1.05);
          }
          75% { 
            opacity: 0.35;
            filter: brightness(1.15);
          }
        }
        
        @keyframes brainPulse {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.1;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.05);
            opacity: 0.15;
          }
        }
        
        @keyframes coreGlow {
          0%, 100% { 
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 20px rgba(142, 22, 26, 0.3);
          }
          50% { 
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.1);
            box-shadow: 0 0 30px rgba(142, 22, 26, 0.5);
          }
        }
        
        @keyframes hemisphereLeft {
          0%, 100% { 
            opacity: 0.3;
            transform: translateX(0px);
          }
          50% { 
            opacity: 0.5;
            transform: translateX(-2px);
          }
        }
        
        @keyframes hemisphereRight {
          0%, 100% { 
            opacity: 0.3;
            transform: translateX(0px);
          }
          50% { 
            opacity: 0.5;
            transform: translateX(2px);
          }
        }
        
        @keyframes connectionPulse {
          0%, 100% { 
            opacity: 0.3;
            transform: scaleX(1);
          }
          50% { 
            opacity: 0.6;
            transform: scaleX(1.2);
          }
        }
        
        @keyframes knowledgePoint {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(1);
          }
          33% { 
            opacity: 0.7;
            transform: scale(1.3);
          }
          66% { 
            opacity: 0.5;
            transform: scale(0.8);
          }
        }
        
        @keyframes thoughtWave {
          0% { 
            opacity: 0.1;
            transform: translate(-50%, -50%) scale(0.8);
          }
          50% { 
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          100% { 
            opacity: 0.1;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }
        
        @keyframes symbolFloat {
          0%, 100% { 
            opacity: 0.3;
            transform: translateY(0px);
          }
          50% { 
            opacity: 0.6;
            transform: translateY(-3px);
          }
        }

        /* Animaciones SVG para bienestar psicológico */
        @keyframes wave-expand {
          0%, 100% { 
            r: 80px;
            stroke-opacity: 0.2;
          }
          50% { 
            r: 90px;
            stroke-opacity: 0.4;
          }
        }

        @keyframes wave-expand-delayed {
          0%, 100% { 
            r: 120px;
            stroke-opacity: 0.15;
          }
          50% { 
            r: 130px;
            stroke-opacity: 0.3;
          }
        }

        @keyframes wave-expand-slow {
          0%, 100% { 
            r: 160px;
            stroke-opacity: 0.1;
          }
          50% { 
            r: 170px;
            stroke-opacity: 0.2;
          }
        }

        @keyframes float-gentle {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.6;
          }
          33% { 
            transform: translateY(-2px) translateX(1px);
            opacity: 0.8;
          }
          66% { 
            transform: translateY(1px) translateX(-1px);
            opacity: 0.7;
          }
        }

        @keyframes leaf-1 {
          0%, 100% { 
            transform: rotate(0deg) scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: rotate(5deg) scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes leaf-2 {
          0%, 100% { 
            transform: rotate(0deg) scale(1);
            opacity: 0.2;
          }
          50% { 
            transform: rotate(-5deg) scale(1.1);
            opacity: 0.4;
          }
        }

        @keyframes mindful-dot-1 {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(1);
          }
          33% { 
            opacity: 0.8;
            transform: scale(1.3);
          }
          66% { 
            opacity: 0.6;
            transform: scale(0.9);
          }
        }

        @keyframes mindful-dot-2 {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          40% { 
            opacity: 0.7;
            transform: scale(1.2);
          }
          80% { 
            opacity: 0.5;
            transform: scale(0.8);
          }
        }

        @keyframes mindful-dot-3 {
          0%, 100% { 
            opacity: 0.5;
            transform: scale(1);
          }
          25% { 
            opacity: 0.9;
            transform: scale(1.4);
          }
          75% { 
            opacity: 0.7;
            transform: scale(0.7);
          }
        }

        @keyframes breathing-1 {
          0%, 100% { 
            rx: 60px;
            ry: 40px;
            stroke-opacity: 0.2;
          }
          50% { 
            rx: 70px;
            ry: 50px;
            stroke-opacity: 0.4;
          }
        }

        @keyframes breathing-2 {
          0%, 100% { 
            rx: 40px;
            ry: 60px;
            stroke-opacity: 0.15;
          }
          50% { 
            rx: 50px;
            ry: 70px;
            stroke-opacity: 0.3;
          }
        }

        @keyframes pulse-gentle {
          0%, 100% { 
            opacity: 0.6;
          }
          50% { 
            opacity: 1;
          }
        }

        @keyframes breathe {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.05);
            opacity: 1;
          }
        }

        /* Aplicar animaciones a los elementos SVG */
        .animate-wave-expand {
          animation: wave-expand 4s ease-in-out infinite;
        }

        .animate-wave-expand-delayed {
          animation: wave-expand-delayed 5s ease-in-out infinite 1s;
        }

        .animate-wave-expand-slow {
          animation: wave-expand-slow 6s ease-in-out infinite 2s;
        }

        .animate-float-gentle {
          animation: float-gentle 8s ease-in-out infinite;
        }

        .animate-leaf-1 {
          animation: leaf-1 6s ease-in-out infinite;
        }

        .animate-leaf-2 {
          animation: leaf-2 7s ease-in-out infinite 1.5s;
        }

        .animate-mindful-dot-1 {
          animation: mindful-dot-1 3s ease-in-out infinite;
        }

        .animate-mindful-dot-2 {
          animation: mindful-dot-2 4s ease-in-out infinite 1s;
        }

        .animate-mindful-dot-3 {
          animation: mindful-dot-3 5s ease-in-out infinite 2s;
        }

        .animate-breathing-1 {
          animation: breathing-1 4s ease-in-out infinite;
        }

        .animate-breathing-2 {
          animation: breathing-2 4s ease-in-out infinite 2s;
        }

        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }

        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}}>
      </style>
    </div>
  );
}