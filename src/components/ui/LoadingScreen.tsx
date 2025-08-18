// Elimino el import de React si no se usa explícitamente
// import React from 'react';

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
  showParticles?: boolean;
  showWaves?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingScreen({ 
  title = "Instituto Túpac Amaru",
  subtitle = "Sistema de Gestión Psicológica",
  showParticles = true,
  showWaves = true,
  size = 'lg'
}: LoadingScreenProps) {
  const logoSize = {
    sm: 'w-32 h-32',
    md: 'w-40 h-40', 
    lg: 'w-56 h-56'
  };

  const titleSize = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl'
  };

  const subtitleSize = {
    sm: 'text-lg',
    md: 'text-xl', 
    lg: 'text-2xl'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-granate-800 via-azul-marino-800 to-azul-oscuro-800 flex items-center justify-center relative overflow-hidden">
      {/* Efectos de fondo mejorados */}
      <div className="absolute inset-0 bg-granate-800/20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-azul-marino-500/10 via-transparent to-granate-800/10"></div>
      
      {/* Círculos decorativos con animación */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-azul-marino-500/20 rounded-full blur-xl loading-pulse-soft"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-granate-800/20 rounded-full blur-xl loading-pulse-soft" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-azul-marino-800/30 rounded-full blur-lg loading-pulse-soft" style={{animationDelay: '2s'}}></div>
      
      {/* Partículas flotantes */}
      {showParticles && (
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      )}
      
      <div className="text-center relative z-10">
        {/* Logo principal con efectos mejorados */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-granate-800 to-azul-marino-500 rounded-full blur-3xl opacity-30 scale-150 loading-glow"></div>
          <img 
            src="/images/icons/psicologia.png"
            alt="Logo Institucional"
            className={`${logoSize[size]} object-contain mx-auto relative z-10 drop-shadow-2xl filter brightness-110 loading-pulse-soft`}
          />
          {/* Ondas de carga alrededor del logo */}
          {showWaves && (
            <div className="loading-wave absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          )}
        </div>
        
        {/* Título institucional con efecto de gradiente */}
        <h1 className={`${titleSize[size]} font-black text-white mb-3 tracking-tight drop-shadow-lg professional-text`}>
          {title}
        </h1>
        <p className={`${subtitleSize[size]} font-bold text-azul-marino-200 mb-8 tracking-wide loading-shimmer`}>
          {subtitle}
        </p>
        
        {/* Animación de carga mejorada con colores profesionales */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="w-6 h-6 rounded-full bg-azul-marino-400 loading-bounce-delayed shadow-lg"></div>
          <div className="w-6 h-6 rounded-full bg-granate-800 loading-bounce-delayed shadow-lg" style={{animationDelay: '0.2s'}}></div>
          <div className="w-6 h-6 rounded-full bg-azul-marino-800 loading-bounce-delayed shadow-lg" style={{animationDelay: '0.4s'}}></div>
          <div className="w-6 h-6 rounded-full bg-azul-oscuro-800 loading-bounce-delayed shadow-lg" style={{animationDelay: '0.6s'}}></div>
          <div className="w-6 h-6 rounded-full bg-verde-esmeralda loading-bounce-delayed shadow-lg" style={{animationDelay: '0.8s'}}></div>
        </div>
        
        {/* Barra de progreso mejorada */}
        <div className="relative mb-6">
          <p className="text-white font-bold text-xl tracking-wide mb-4">
            Cargando sistema...
          </p>
          <div className="w-64 h-2 bg-azul-marino-400/30 rounded-full mx-auto overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-azul-marino-400 via-granate-800 to-azul-marino-800 rounded-full loading-shimmer"></div>
          </div>
        </div>
        
        {/* Información adicional con animación */}
        <div className="mt-8 text-azul-marino-200/90 text-sm font-medium space-y-2">
          <p className="loading-pulse-soft">Conectando con el servidor...</p>
          <p className="loading-pulse-soft" style={{animationDelay: '0.5s'}}>Verificando credenciales...</p>
          <p className="loading-pulse-soft" style={{animationDelay: '1s'}}>Inicializando módulos...</p>
        </div>
        
        {/* Indicador de estado */}
        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-verde-esmeralda rounded-full animate-pulse"></div>
          <span className="text-azul-marino-200 text-xs font-medium">Sistema operativo</span>
        </div>
      </div>
    </div>
  );
} 