import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, UserRound, Shield, Brain, Heart, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [showForm, setShowForm] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.endsWith('@istta.edu.pe')) {
      // No mostrar error aquí, el backend se encargará de la validación
    }

    await login(email, password);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4" style={{
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0f172a 25%, #1e293b 50%, #334155 75%, rgba(255, 255, 255, 0.02) 100%)',
      backgroundSize: '400% 400%',
      animation: 'professionalGradient 15s ease-in-out infinite'
    }}>
      {/* Efecto de partículas brillantes sutil */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, #fbbf24, transparent),
            radial-gradient(1px 1px at 40px 70px, #f59e0b, transparent),
            radial-gradient(1px 1px at 90px 40px, #eab308, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 100px',
          animation: 'sparkle 12s linear infinite'
        }}></div>
      </div>

      {/* Patrón geométrico de fondo mejorado */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, #334155 1px, transparent 1px),
            radial-gradient(circle at 80% 80%, #1e293b 1px, transparent 1px),
            radial-gradient(circle at 40% 60%, #0f172a 1px, transparent 1px),
            radial-gradient(circle at 60% 40%, #475569 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px, 180px 180px, 150px 150px, 200px 200px',
          animation: 'patternMove 30s linear infinite'
        }}></div>
      </div>



      {/* Luna Real en el Espacio */}
      <div className="absolute top-20 right-20 w-24 h-24 rounded-full shadow-2xl" style={{
        animation: 'moonGlow 15s ease-in-out infinite',
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
          backgroundSize: '30px 30px, 45px 45px, 35px 35px, 50px 50px'
        }}></div>
        
        {/* Cráteres lunares realistas */}
        <div className="absolute top-3 left-3 w-2 h-2 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-70" style={{boxShadow: 'inset 0.5px 0.5px 1px rgba(0,0,0,0.3)'}}></div>
        <div className="absolute top-6 right-4 w-1.5 h-1.5 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-65" style={{boxShadow: 'inset 0.3px 0.3px 1px rgba(0,0,0,0.3)'}}></div>
        <div className="absolute bottom-4 left-5 w-1.5 h-1.5 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-75" style={{boxShadow: 'inset 0.3px 0.3px 1px rgba(0,0,0,0.3)'}}></div>
        
        {/* Brillo lunar natural */}
        <div className="absolute top-1 left-1 w-3 h-3 bg-gradient-to-br from-white to-transparent rounded-full opacity-80"></div>
        <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full opacity-90"></div>
      </div>

      <div className={`w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 transition-all duration-1000 ${showForm ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
        
        {/* Columna izquierda - Logo y Bienvenida mejorada */}
        <div className="flex flex-col items-center justify-center text-center lg:text-left p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-[500px] h-[500px] flex items-center justify-center">
              {/* Fondo del logo - Simbolismo psicológico */}
              <div className="absolute inset-0 w-[500px] h-[500px] shadow-2xl opacity-80" style={{
                boxShadow: '0 0 80px rgba(0, 0, 0, 0.6), 0 0 120px rgba(0, 0, 0, 0.4), 0 0 160px rgba(0, 0, 0, 0.3)',
                background: `
                  radial-gradient(ellipse at 45% 40%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.3) 30%, rgba(255, 255, 255, 0.2) 60%, rgba(255, 255, 255, 0.1) 80%, transparent 100%),
                  radial-gradient(ellipse at 60% 65%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 40%, rgba(255, 255, 255, 0.15) 70%, transparent 100%),
                  radial-gradient(ellipse at 30% 70%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)
                `,
                borderRadius: '45% 55% 52% 48% / 48% 52% 55% 45%',
                maskImage: `
                  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10 C30 10, 20 30, 20 50 C20 70, 30 90, 50 90 C70 90, 80 70, 80 50 C80 30, 70 10, 50 10 Z M50 20 C35 20, 30 35, 30 50 C30 65, 35 80, 50 80 C65 80, 70 65, 70 50 C70 35, 65 20, 50 20 Z M50 30 C40 30, 40 40, 40 50 C40 60, 40 70, 50 70 C60 70, 60 60, 60 50 C60 40, 60 30, 50 30 Z' fill='white'/%3E%3C/svg%3E"),
                  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10 Q60 20, 70 30 Q80 40, 85 50 Q80 60, 70 70 Q60 80, 50 90 Q40 80, 30 70 Q20 60, 15 50 Q20 40, 30 30 Q40 20, 50 10 Z M50 20 Q55 25, 60 30 Q65 35, 67 40 Q65 45, 60 50 Q55 55, 50 60 Q45 55, 40 50 Q35 45, 33 40 Q35 35, 40 30 Q45 25, 50 20 Z' fill='white'/%3E%3C/svg%3E"),
                  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 5 L60 25 L80 30 L65 45 L70 65 L50 55 L30 65 L35 45 L20 30 L40 25 Z M50 15 L55 25 L65 30 L55 35 L50 45 L45 35 L35 30 L45 25 Z' fill='white'/%3E%3C/svg%3E")
                `,
                maskSize: '400px 400px, 300px 300px, 200px 200px',
                maskPosition: 'center, center, center',
                maskRepeat: 'no-repeat',
                filter: 'blur(1px)',
                animation: 'psychologicalSymbols 40s ease-in-out infinite'
              }}>
                {/* Efectos de luz del círculo */}
                <div className="absolute inset-0" style={{
                  background: `
                    radial-gradient(ellipse at 40% 35%, rgba(255, 255, 255, 0.2) 0%, transparent 60%),
                    radial-gradient(ellipse at 65% 60%, rgba(240, 240, 240, 0.15) 0%, transparent 70%)
                  `,
                  animation: 'sunGlow 4s ease-in-out infinite'
                }}></div>
                
                {/* Puntos de luz en el círculo */}
                <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-white rounded-full opacity-60" style={{ animation: 'sunSparkle 3s ease-in-out infinite' }}></div>
                <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-white rounded-full opacity-65" style={{ animation: 'sunSparkle 3.5s ease-in-out infinite 0.5s' }}></div>
                <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-white rounded-full opacity-55" style={{ animation: 'sunSparkle 2.8s ease-in-out infinite 1s' }}></div>
              </div>
              
              {/* Contenedor del logo dentro del círculo */}
              <div className="absolute inset-0 w-[500px] h-[500px] flex items-center justify-center">
                <img 
                  src={window.location.origin + "/images/icons/psicologia.png"}
                  alt="Logo Institucional"
                  className={`w-64 h-64 object-contain drop-shadow-2xl transition-all duration-1000 ${isAnimated ? 'transform scale-100 rotate-0' : 'transform scale-75 rotate-12'}`}
                  style={{ 
                    maxWidth: '256px', 
                    maxHeight: '256px',
                    animation: 'logoFloat 6s ease-in-out infinite'
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
          
          <div className="space-y-6">
            <div className={`transition-all duration-1000 ${isAnimated ? 'transform translate-x-0' : 'transform -translate-x-8'}`}>
              <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
                Bienvenido al
          </h1>
              <h2 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] mb-2">
            Sistema de Psicología
          </h2>
            </div>
            
            <div className={`transition-all duration-1000 delay-200 ${isAnimated ? 'transform translate-x-0' : 'transform -translate-x-8'}`}>
              <p className="text-2xl lg:text-3xl text-gray-200 font-semibold mb-4">
                Instituto Túpac Amaru
              </p>
              <p className="text-xl text-gray-300 font-medium">
                Cusco, Perú
              </p>
            </div>

            {/* Características del sistema */}
            <div className={`flex flex-wrap justify-center lg:justify-start gap-6 mt-8 transition-all duration-1000 delay-400 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
              <div className="flex items-center gap-2 text-gray-300">
                <Shield className="w-5 h-5 text-[#8e161a]" />
                <span className="text-sm font-medium">Seguro y Confidencial</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Brain className="w-5 h-5 text-[#d3b7a0]" />
                <span className="text-sm font-medium">Gestión Profesional</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Heart className="w-5 h-5 text-[#8e161a]" />
                <span className="text-sm font-medium">Atención Personalizada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario de login mejorado */}
        <div className="flex items-center justify-center">
          <div 
            className={`w-full max-w-md shadow-2xl rounded-3xl bg-white/70 backdrop-blur-xl transition-all duration-700 ${isAnimated ? 'transform scale-100 translate-y-0' : 'transform scale-95 translate-y-4'}`}
            style={{
              animation: isAnimated ? 'formSlideIn 1s ease-out forwards' : 'none',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03)'
            }}
          >
            <Card padding="lg">
            <div className={`text-center mb-6 transition-all duration-1000 delay-300 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="w-14 h-14 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-xl flex items-center justify-center shadow-lg">
                  <UserRound className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                    Iniciar Sesión
                  </h3>
                  <p className="text-gray-500 font-medium text-sm">
                    Accede a tu cuenta profesional
                  </p>
                </div>
              </div>
            </div>

              <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`transition-all duration-1000 delay-500 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
            <Input
              type="email"
                     label="Correo Electrónico"
                     placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
                     iconPosition="left"
                     placeholderPosition="right"
              required
            />
          </div>

                                   <div className={`transition-all duration-1000 delay-700 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
                       placeholder="••••••••••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
                       iconPosition="left"
                       placeholderPosition="right"
                       hasRightButton={true}
                       rightButton={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-500 hover:text-[#8e161a] transition-all duration-200 p-2 rounded-lg hover:bg-[#8e161a]/10 focus:outline-none focus:ring-2 focus:ring-[#8e161a]/20 hover:scale-105"
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
                      required
                    />
          </div>

          {error && (
                  <div className={`p-4 bg-red-50 border-l-4 border-red-500 rounded-lg transition-all duration-500 ${isAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
                    <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </p>
            </div>
          )}

          <Button
            type="submit"
                  className="w-full bg-gradient-to-r from-[#8e161a] via-[#a52a2a] to-[#d3b7a0] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-[#6d1115] hover:via-[#8b1a1a] hover:to-[#b89a8a] transition-all duration-300 text-base transform hover:scale-[1.02] active:scale-[0.98]"
            size="lg"
            loading={loading}
          >
                  {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

              <div className="mt-6">
                <div className="relative mb-3">
            <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 font-semibold">O continúa con</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
                  className="w-full border-2 border-gray-200 hover:border-[#8e161a] text-gray-700 hover:text-[#8e161a] font-semibold bg-white hover:bg-gray-50 transition-all duration-300 py-3 rounded-xl shadow-sm hover:shadow-md"
            size="lg"
            onClick={handleGoogleLogin}
            loading={loading}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
                    className="w-5 h-5 mr-3"
            />
                  Continuar con Google
          </Button>
        </div>

              <div className="mt-6 p-3 bg-gradient-to-r from-[#8e161a]/5 to-[#6d1115]/5 rounded-xl border border-[#8e161a]/10">
                <div className="text-center">
                  <h4 className="text-xs font-bold text-gray-600 mb-1.5">Instrucciones de Acceso</h4>
                  <div className="space-y-0.5 text-xs text-gray-500">
                    <p><span className="font-semibold text-[#8e161a]">Estudiantes:</span> Usa tu cuenta de Google institucional</p>
                    <p><span className="font-semibold text-[#d3b7a0]">Psicólogos/Admin:</span> Usa tu correo personal y contraseña</p>
                  </div>
                </div>
            </div>
            </Card>
          </div>
        </div>
      </div>
      
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
            box-shadow: 0 0 60px rgba(255, 255, 255, 0.6), inset 0 0 40px rgba(255, 255, 255, 0.3), 0 0 80px rgba(255, 255, 255, 0.2);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 0 70px rgba(255, 255, 255, 0.7), inset 0 0 45px rgba(255, 255, 255, 0.35), 0 0 90px rgba(255, 255, 255, 0.25);
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
            transform: translateY(-12px) scale(1.05) rotate(0deg);
            filter: brightness(1.2) drop-shadow(0 0 30px rgba(255, 255, 255, 0.5));
          }
          75% { 
            transform: translateY(-8px) scale(1.02) rotate(-1deg);
            filter: brightness(1.1) drop-shadow(0 0 25px rgba(255, 255, 255, 0.4));
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
      `}} />
    </div>
  );
}
