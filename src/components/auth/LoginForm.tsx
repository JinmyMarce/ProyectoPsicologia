import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, UserRound, Shield, Brain, Heart } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-1 sm:p-2 lg:p-3" style={{
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
          
          {/* Símbolos de mente saludable dispersos - Muchos más círculos */}
          <g>
            {/* Círculos principales */}
            <circle cx="300" cy="300" r="5" fill="rgba(211, 183, 160, 0.6)" className="animate-mindful-dot-1" />
            <circle cx="500" cy="300" r="4" fill="rgba(142, 22, 26, 0.5)" className="animate-mindful-dot-2" />
            <circle cx="300" cy="500" r="4" fill="rgba(142, 22, 26, 0.5)" className="animate-mindful-dot-3" />
            <circle cx="500" cy="500" r="5" fill="rgba(211, 183, 160, 0.6)" className="animate-mindful-dot-1" />
            
            {/* Círculos en las esquinas */}
            <circle cx="150" cy="350" r="3" fill="rgba(211, 183, 160, 0.4)" className="animate-mindful-dot-2" />
            <circle cx="650" cy="350" r="3" fill="rgba(142, 22, 26, 0.4)" className="animate-mindful-dot-3" />
            <circle cx="350" cy="150" r="3" fill="rgba(142, 22, 26, 0.4)" className="animate-mindful-dot-1" />
            <circle cx="450" cy="650" r="3" fill="rgba(211, 183, 160, 0.4)" className="animate-mindful-dot-2" />
            
            {/* Círculos pequeños distribuidos por toda la interfaz */}
            <circle cx="100" cy="200" r="2" fill="rgba(211, 183, 160, 0.3)" className="animate-mindful-dot-1" />
            <circle cx="700" cy="180" r="2" fill="rgba(142, 22, 26, 0.3)" className="animate-mindful-dot-2" />
            <circle cx="80" cy="400" r="2" fill="rgba(142, 22, 26, 0.3)" className="animate-mindful-dot-3" />
            <circle cx="720" cy="420" r="2" fill="rgba(211, 183, 160, 0.3)" className="animate-mindful-dot-1" />
            <circle cx="120" cy="600" r="2" fill="rgba(211, 183, 160, 0.3)" className="animate-mindful-dot-2" />
            <circle cx="680" cy="620" r="2" fill="rgba(142, 22, 26, 0.3)" className="animate-mindful-dot-3" />
            
            {/* Círculos medianos en zonas intermedias */}
            <circle cx="250" cy="150" r="3" fill="rgba(142, 22, 26, 0.35)" className="animate-mindful-dot-1" />
            <circle cx="550" cy="120" r="3" fill="rgba(211, 183, 160, 0.35)" className="animate-mindful-dot-2" />
            <circle cx="200" cy="650" r="3" fill="rgba(211, 183, 160, 0.35)" className="animate-mindful-dot-3" />
            <circle cx="600" cy="680" r="3" fill="rgba(142, 22, 26, 0.35)" className="animate-mindful-dot-1" />
            
            {/* Círculos muy pequeños dispersos */}
            <circle cx="180" cy="250" r="1.5" fill="rgba(211, 183, 160, 0.25)" className="animate-mindful-dot-2" />
            <circle cx="620" cy="270" r="1.5" fill="rgba(142, 22, 26, 0.25)" className="animate-mindful-dot-3" />
            <circle cx="160" cy="450" r="1.5" fill="rgba(142, 22, 26, 0.25)" className="animate-mindful-dot-1" />
            <circle cx="640" cy="480" r="1.5" fill="rgba(211, 183, 160, 0.25)" className="animate-mindful-dot-2" />
            <circle cx="220" cy="550" r="1.5" fill="rgba(211, 183, 160, 0.25)" className="animate-mindful-dot-3" />
            <circle cx="580" cy="520" r="1.5" fill="rgba(142, 22, 26, 0.25)" className="animate-mindful-dot-1" />
            
            {/* Círculos en el centro superior e inferior */}
            <circle cx="400" cy="100" r="2.5" fill="rgba(211, 183, 160, 0.4)" className="animate-mindful-dot-2" />
            <circle cx="380" cy="700" r="2.5" fill="rgba(142, 22, 26, 0.4)" className="animate-mindful-dot-3" />
            <circle cx="420" cy="80" r="2" fill="rgba(142, 22, 26, 0.3)" className="animate-mindful-dot-1" />
            <circle cx="360" cy="720" r="2" fill="rgba(211, 183, 160, 0.3)" className="animate-mindful-dot-2" />
            
            {/* Círculos en los lados izquierdo y derecho */}
            <circle cx="50" cy="300" r="2" fill="rgba(142, 22, 26, 0.3)" className="animate-mindful-dot-3" />
            <circle cx="750" cy="320" r="2" fill="rgba(211, 183, 160, 0.3)" className="animate-mindful-dot-1" />
            <circle cx="30" cy="500" r="2" fill="rgba(211, 183, 160, 0.3)" className="animate-mindful-dot-2" />
            <circle cx="770" cy="480" r="2" fill="rgba(142, 22, 26, 0.3)" className="animate-mindful-dot-3" />
            
            {/* Círculos adicionales para mayor densidad */}
            <circle cx="280" cy="220" r="1.5" fill="rgba(142, 22, 26, 0.2)" className="animate-mindful-dot-1" />
            <circle cx="520" cy="240" r="1.5" fill="rgba(211, 183, 160, 0.2)" className="animate-mindful-dot-2" />
            <circle cx="260" cy="580" r="1.5" fill="rgba(211, 183, 160, 0.2)" className="animate-mindful-dot-3" />
            <circle cx="540" cy="560" r="1.5" fill="rgba(142, 22, 26, 0.2)" className="animate-mindful-dot-1" />
            <circle cx="320" cy="380" r="1.5" fill="rgba(211, 183, 160, 0.2)" className="animate-mindful-dot-2" />
            <circle cx="480" cy="420" r="1.5" fill="rgba(142, 22, 26, 0.2)" className="animate-mindful-dot-3" />
            
            {/* Micro círculos para textura sutil */}
            <circle cx="140" cy="180" r="1" fill="rgba(211, 183, 160, 0.15)" className="animate-mindful-dot-1" />
            <circle cx="660" cy="160" r="1" fill="rgba(142, 22, 26, 0.15)" className="animate-mindful-dot-2" />
            <circle cx="120" cy="520" r="1" fill="rgba(142, 22, 26, 0.15)" className="animate-mindful-dot-3" />
            <circle cx="680" cy="540" r="1" fill="rgba(211, 183, 160, 0.15)" className="animate-mindful-dot-1" />
            <circle cx="340" cy="120" r="1" fill="rgba(142, 22, 26, 0.15)" className="animate-mindful-dot-2" />
            <circle cx="460" cy="680" r="1" fill="rgba(211, 183, 160, 0.15)" className="animate-mindful-dot-3" />
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

      {/* Elementos decorativos modernos del sistema */}
      <div className="absolute top-8 right-8 sm:top-10 sm:right-10 md:top-12 md:right-12 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 opacity-25" style={{
        animation: 'starTwinkle 8s ease-in-out infinite',
        background: `
          radial-gradient(circle at center, 
            rgba(142, 22, 26, 0.6) 0%, 
            rgba(44, 62, 80, 0.4) 30%, 
            rgba(25, 42, 61, 0.3) 60%, 
            rgba(255, 255, 255, 0.1) 80%, 
            transparent 100%
          )
        `,
        borderRadius: '50%',
        boxShadow: '0 0 15px rgba(142, 22, 26, 0.2), 0 0 30px rgba(44, 62, 80, 0.1)'
      }}>
        {/* Puntos de acento del sistema de psicología */}
        <div className="absolute top-1 left-1 w-1 h-1 rounded-full opacity-80" style={{ 
          background: 'rgba(142, 22, 26, 0.9)',
          animation: 'starSparkle 3s ease-in-out infinite' 
        }}></div>
        <div className="absolute top-2 right-1 w-0.5 h-0.5 rounded-full opacity-70" style={{ 
          background: 'rgba(44, 62, 80, 0.9)',
          animation: 'starSparkle 3.5s ease-in-out infinite 0.5s' 
        }}></div>
        <div className="absolute bottom-1 left-2 w-0.5 h-0.5 rounded-full opacity-75" style={{ 
          background: 'rgba(25, 42, 61, 0.8)',
          animation: 'starSparkle 4s ease-in-out infinite 1s' 
        }}></div>
      </div>
      
      {/* Elemento decorativo adicional esquina inferior */}
      <div className="absolute bottom-12 left-8 sm:bottom-16 sm:left-12 md:bottom-20 md:left-16 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 opacity-20" style={{
        animation: 'floatDots 12s ease-in-out infinite 2s',
        background: `
          linear-gradient(45deg, 
            rgba(142, 22, 26, 0.5) 0%, 
            rgba(44, 62, 80, 0.4) 50%, 
            rgba(25, 42, 61, 0.3) 100%
          )
        `,
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%'
      }}></div>

      <div className={`w-full max-w-full flex flex-col items-center relative z-10 transition-all duration-1000 ${showForm ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 items-center">
        
        {/* Columna izquierda - Logo y Bienvenida mejorada */}
        <div className="flex flex-col items-center justify-center text-center p-1 sm:p-2 lg:p-3">
          <div className="flex items-center justify-center mb-1 lg:mb-3">
            <div className="relative w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] lg:w-[360px] lg:h-[360px] flex items-center justify-center">
              {/* Fondo del logo - Luna realista más pequeña */}
              <div className="absolute inset-0 w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] md:w-[220px] md:h-[220px] lg:w-[250px] lg:h-[250px] rounded-full shadow-2xl" style={{
                animation: 'moonGlow 12s ease-in-out infinite, moonFloat 8s ease-in-out infinite',
        boxShadow: '0 0 60px rgba(255, 255, 255, 0.6), inset 0 0 40px rgba(255, 255, 255, 0.2), 0 0 100px rgba(255, 255, 255, 0.3)',
        background: `
          radial-gradient(circle at 25% 25%, #ffffff 0%, #f8fafc 30%, #e2e8f0 60%, #cbd5e1 80%, #94a3b8 90%, #64748b 95%, #475569 100%),
          radial-gradient(circle at 70% 70%, rgba(148, 163, 184, 0.15) 0%, transparent 70%),
          radial-gradient(circle at 40% 60%, rgba(100, 116, 139, 0.1) 0%, transparent 60%)
        `
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
        
        {/* Cráteres lunares realistas */}
                <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-70" style={{boxShadow: 'inset 0.5px 0.5px 1px rgba(0,0,0,0.3)'}}></div>
                <div className="absolute top-5 right-3 w-1 h-1 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-65" style={{boxShadow: 'inset 0.3px 0.3px 1px rgba(0,0,0,0.3)'}}></div>
                <div className="absolute bottom-3 left-4 w-1 h-1 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-75" style={{boxShadow: 'inset 0.3px 0.3px 1px rgba(0,0,0,0.3)'}}></div>
                
                {/* Brillo lunar natural */}
                <div className="absolute top-1 left-1 w-2 h-2 bg-gradient-to-br from-white to-transparent rounded-full opacity-80"></div>
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-90"></div>
              </div>
              
              {/* Contenedor del logo dentro del círculo */}
              <div className="absolute inset-0 w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] md:w-[220px] md:h-[220px] lg:w-[250px] lg:h-[250px] flex items-center justify-center">
                <img 
                  src={window.location.origin + "/images/icons/psicologia.png"}
                  alt="Logo Institucional"
                  className={`w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-64 lg:h-64 xl:w-72 xl:h-72 object-contain drop-shadow-lg transition-all duration-1000 ${isAnimated ? 'transform scale-100 rotate-0' : 'transform scale-75 rotate-12'}`}
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
          </div>
          
          <div className="space-y-2">
            <div className={`transition-all duration-1000 ${isAnimated ? 'transform translate-x-0' : 'transform -translate-x-8'}`}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-1 tracking-tight leading-tight text-left">
                Bienvenido al
          </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] mb-1 text-left">
            Sistema de Psicología
          </h2>
            </div>
            
            <div className={`transition-all duration-1000 delay-200 ${isAnimated ? 'transform translate-x-0' : 'transform -translate-x-8'}`}>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-200 font-semibold mb-1 text-left">
                Instituto Túpac Amaru
              </p>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 font-medium mb-1 text-left">
                Cusco, Perú
              </p>
            </div>
          </div>
          
          {/* Características del sistema - Solo visible en desktop */}
          <div className="hidden lg:block mt-4">
            <div className={`flex flex-row justify-start items-center gap-3 lg:gap-4 transition-all duration-1000 delay-600 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
              <div className="flex items-center gap-1 text-gray-300 bg-black/30 backdrop-blur-md px-2 md:px-3 py-1.5 rounded-full border border-white/20 justify-center shadow-lg">
                <Shield className="w-4 h-4 text-[#8e161a]" />
                <span className="text-sm font-medium">Seguro y Confidencial</span>
              </div>
              <div className="flex items-center gap-1 text-gray-300 bg-black/30 backdrop-blur-md px-2 md:px-3 py-1.5 rounded-full border border-white/20 justify-center shadow-lg">
                <Brain className="w-4 h-4 text-[#d3b7a0]" />
                <span className="text-sm font-medium">Gestión Profesional</span>
              </div>
              <div className="flex items-center gap-1 text-gray-300 bg-black/30 backdrop-blur-md px-2 md:px-3 py-1.5 rounded-full border border-white/20 justify-center shadow-lg">
                <Heart className="w-4 h-4 text-[#8e161a]" />
                <span className="text-sm font-medium">Atención Personalizada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario de login mejorado */}
        <div className="flex flex-col items-center px-1 sm:px-2 lg:px-3 pt-2 sm:pt-4 md:pt-6 lg:pt-8 pb-2 sm:pb-4 md:pb-6 lg:pb-8">
          <div 
            className={`w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-3xl sm:rounded-[2rem] transition-all duration-700 ${isAnimated ? 'transform scale-100 translate-y-0' : 'transform scale-95 translate-y-4'}`}
            style={{
              animation: isAnimated ? 'formSlideIn 1s ease-out forwards' : 'none',
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.25),
                0 8px 32px -8px rgba(142, 22, 26, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.6),
                0 0 0 1px rgba(255, 255, 255, 0.25)
              `
            }}
          >
            <Card padding="sm" className="p-3 sm:p-4 lg:p-5 bg-transparent border-0 shadow-none">
              <div className={`text-center mb-3 sm:mb-4 lg:mb-5 transition-all duration-1000 delay-300 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
                <div className="flex flex-col items-center justify-center mb-3">
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-2 overflow-hidden"
                    style={{
                      background: `
                        linear-gradient(135deg, 
                          #8e161a 0%, 
                          #b91c1c 50%, 
                          #d3b7a0 100%
                        )
                      `,
                      boxShadow: `
                        0 10px 30px -5px rgba(142, 22, 26, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2),
                        0 0 0 1px rgba(142, 22, 26, 0.1)
                      `
                    }}>
                    <UserRound className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white drop-shadow-sm" />
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none"></div>
                  </div>
                  <div className="text-center">
                    
                    <p className="text-gray-700 font-medium text-xs sm:text-sm">
                      Inicia sesión en tu cuenta
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-5" noValidate>
          <div className={`transition-all duration-1000 delay-500 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
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

          <div className={`transition-all duration-1000 delay-700 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
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
                  className="text-gray-500 hover:text-[#8e161a] transition-all duration-200 p-2 rounded-lg focus:outline-none hover:scale-105"
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
                            <div className="p-3 bg-white/70 rounded-xl border border-gray-300/40 max-w-sm mx-auto backdrop-blur-sm text-left"
                              style={{
                                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 3px rgba(0, 0, 0, 0.08)'
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

                          <div className="flex justify-center">
          <Button
            type="submit"
                    className="w-3/4 bg-gradient-to-r from-[#8e161a] via-[#a52a2a] to-[#d3b7a0] text-white font-bold py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:from-[#6d1115] hover:via-[#8b1a1a] hover:to-[#b89a8a] transition-all duration-300 text-sm transform hover:scale-[1.02] active:scale-[0.98]"
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
                    <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
                    <span className="px-4 py-1 bg-white/80 text-gray-700 font-semibold rounded-lg shadow-sm border border-gray-200/50"
                      style={{
                        backdropFilter: 'blur(8px)'
                      }}>
                      O continúa con
                    </span>
            </div>
          </div>

                          <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
                    className="w-3/4 border-2 border-gray-200 hover:border-[#8e161a] text-gray-700 hover:text-[#8e161a] font-semibold bg-white hover:bg-gray-50 transition-all duration-300 py-2.5 rounded-xl shadow-sm hover:shadow-md"
            size="lg"
            onClick={handleGoogleLogin}
            loading={loading}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
                      className="w-4 h-4 mr-3"
            />
                  Continuar con Google
          </Button>
                </div>
        </div>

              <div className="mt-3 p-3 bg-white/70 rounded-2xl border border-gray-300/40 backdrop-blur-sm"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 2px 8px rgba(0, 0, 0, 0.08)'
                }}>
                <div className="text-center">
                  <h4 className="text-xs font-bold text-gray-800 mb-2">Instrucciones de Acceso</h4>
                  <div className="space-y-1 text-xs text-gray-700">
                    <p><span className="font-semibold text-[#8e161a]">Estudiantes:</span> Usa tu cuenta de Google institucional</p>
                    <p><span className="font-semibold text-[#8e161a]">Personal:</span> Usa tu correo y contraseña</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        </div>
        
        {/* Pie de página - Características del sistema - Solo móvil y tablet */}
        <div className="w-full mt-2 sm:mt-3 lg:hidden px-1 sm:px-2 md:px-3">
          <div className={`flex flex-row justify-center items-center gap-1 sm:gap-2 md:gap-3 transition-all duration-1000 delay-600 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
            <div className="flex items-center gap-1 text-gray-300 bg-black/30 backdrop-blur-md px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 rounded-full border border-white/20 justify-center shadow-lg">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-[#8e161a]" />
              <span className="text-xs sm:text-sm font-medium">Seguro y Confidencial</span>
            </div>
            <div className="flex items-center gap-1 text-gray-300 bg-black/30 backdrop-blur-md px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 rounded-full border border-white/20 justify-center shadow-lg">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-[#d3b7a0]" />
              <span className="text-xs sm:text-sm font-medium">Gestión Profesional</span>
            </div>
            <div className="flex items-center gap-1 text-gray-300 bg-black/30 backdrop-blur-md px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 rounded-full border border-white/20 justify-center shadow-lg">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-[#8e161a]" />
              <span className="text-xs sm:text-sm font-medium">Atención Personalizada</span>
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
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes rotateSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        @keyframes waveFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(10deg); }
        }
        
        @keyframes hexagonFloat {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(-25px) rotate(45deg); }
        }
        
        @keyframes curveFloat {
          0%, 100% { transform: translateY(0px) rotate(12deg); opacity: 0.2; }
          50% { transform: translateY(-10px) rotate(12deg); opacity: 0.4; }
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
        
        @keyframes colorFade {
          0%, 100% { 
            filter: brightness(1) saturate(1);
            opacity: 1;
          }
          50% { 
            filter: brightness(1.3) saturate(0.8);
            opacity: 0.8;
          }
        }
        
        @keyframes starGlow {
          0%, 100% { 
            opacity: 0.8;
            filter: brightness(1) drop-shadow(0 0 20px rgba(255, 215, 0, 0.4));
          }
          50% { 
            opacity: 1;
            filter: brightness(1.3) drop-shadow(0 0 30px rgba(255, 215, 0, 0.6));
          }
        }
        
        @keyframes sunGlow {
          0%, 100% { 
            opacity: 0.7;
            filter: brightness(1) drop-shadow(0 0 40px rgba(255, 255, 255, 0.4));
          }
          25% { 
            opacity: 0.8;
            filter: brightness(1.2) drop-shadow(0 0 50px rgba(255, 255, 255, 0.5));
          }
          50% { 
            opacity: 0.75;
            filter: brightness(1.1) drop-shadow(0 0 45px rgba(255, 255, 255, 0.45));
          }
          75% { 
            opacity: 0.8;
            filter: brightness(1.3) drop-shadow(0 0 55px rgba(255, 255, 255, 0.6));
          }
        }
        
        @keyframes sunRays {
          0% { 
            transform: rotate(0deg);
          }
          100% { 
            transform: rotate(360deg);
          }
        }
        
        @keyframes sunSparkle {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.3);
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
        
        @keyframes logoGlow {
          0%, 100% { 
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.15)) brightness(1);
          }
          50% { 
            filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.25)) brightness(1.1);
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% { 
            opacity: 0.15;
            filter: brightness(1);
          }
          50% { 
            opacity: 0.25;
            filter: brightness(1.2);
          }
        }
        
        @keyframes backgroundBreathing {
          0%, 0% { 
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, rgba(255, 255, 255, 0.02) 100%);
          }
          25% { 
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, rgba(255, 255, 255, 0.01) 85%, rgba(255, 255, 255, 0.005) 100%);
          }
          50% { 
            background: linear-gradient(135deg, #16213e 0%, #0f3460 40%, rgba(255, 255, 255, 0.01) 70%, rgba(255, 255, 255, 0.005) 90%, rgba(255, 255, 255, 0.003) 100%);
          }
          75% { 
            background: linear-gradient(135deg, #0f3460 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.01) 80%, rgba(255, 255, 255, 0.005) 100%);
          }
        }
        
        @keyframes psychologicalSymbols {
          0%, 100% { 
            opacity: 0.03;
            transform: scale(1) rotate(0deg);
            filter: blur(4px) brightness(1);
          }
          25% { 
            opacity: 0.04;
            transform: scale(1.05) rotate(5deg);
            filter: blur(3px) brightness(1.1);
          }
          50% { 
            opacity: 0.035;
            transform: scale(1.02) rotate(-3deg);
            filter: blur(4px) brightness(1.05);
          }
          75% { 
            opacity: 0.045;
            transform: scale(1.08) rotate(8deg);
            filter: blur(2px) brightness(1.15);
          }
        }
        
        @keyframes starTwinkle {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.8;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.2), 0 0 60px rgba(255, 255, 255, 0.1);
          }
          50% { 
            transform: scale(1.2);
            opacity: 1;
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(255, 255, 255, 0.3), 0 0 90px rgba(255, 255, 255, 0.2);
          }
        }
        
        @keyframes starSparkle {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.5);
          }
        }
        
        @keyframes starRays {
          0% { 
            transform: rotate(0deg);
          }
          100% { 
            transform: rotate(360deg);
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
      `}} />
    </div>
  );
}