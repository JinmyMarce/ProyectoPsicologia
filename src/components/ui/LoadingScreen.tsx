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
    sm: 'w-28 h-28',
    md: 'w-36 h-36', 
    lg: 'w-48 h-48'
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
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{
      background: `
        linear-gradient(135deg, 
          #0a0f14 0%, 
          #0f1419 15%, 
          #1a2332 30%, 
          #1a0f14 45%, 
          #0a0f14 60%, 
          #1a2332 75%, 
          #1a0f14 85%, 
          #0a0f14 92%, 
          #0f1419 100%
        ),
        radial-gradient(ellipse at 20% 20%, rgba(26, 15, 20, 0.6) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(26, 35, 50, 0.4) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(15, 20, 25, 0.3) 0%, transparent 70%),
        radial-gradient(ellipse at 10% 90%, rgba(26, 15, 20, 0.4) 0%, transparent 60%),
        radial-gradient(ellipse at 90% 10%, rgba(26, 35, 50, 0.3) 0%, transparent 60%),
        radial-gradient(ellipse at 50% 5%, rgba(15, 20, 25, 0.2) 0%, transparent 80%),
        radial-gradient(ellipse at 5% 50%, rgba(26, 15, 20, 0.2) 0%, transparent 80%)
      `
    }}>
      {/* Efectos de fondo mejorados */}
      <div className="absolute inset-0" style={{ 
        background: 'linear-gradient(135deg, rgba(26, 15, 20, 0.3) 0%, rgba(26, 35, 50, 0.2) 50%, rgba(26, 15, 20, 0.3) 100%)'
      }}></div>
      
      {/* Círculos decorativos con animación mejorada */}
      <div className="absolute top-16 left-16 w-40 h-40 rounded-full blur-2xl" style={{
        background: 'radial-gradient(circle, rgba(26, 15, 20, 0.4) 0%, transparent 70%)',
        animation: 'float-slow 6s ease-in-out infinite'
      }}></div>
      <div className="absolute bottom-16 right-16 w-48 h-48 rounded-full blur-2xl" style={{
        background: 'radial-gradient(circle, rgba(26, 35, 50, 0.4) 0%, transparent 70%)',
        animation: 'float-slow 6s ease-in-out infinite 2s'
      }}></div>
      <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full blur-xl" style={{
        background: 'radial-gradient(circle, rgba(15, 20, 25, 0.3) 0%, transparent 70%)',
        animation: 'float-slow 6s ease-in-out infinite 4s'
      }}></div>
      <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full blur-lg" style={{
        background: 'radial-gradient(circle, rgba(26, 35, 50, 0.3) 0%, transparent 70%)',
        animation: 'float-slow 6s ease-in-out infinite 1s'
      }}></div>
      
      {/* Nuevos elementos animados */}
      <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full blur-md" style={{
        background: 'radial-gradient(circle, rgba(26, 15, 20, 0.5) 0%, transparent 70%)',
        animation: 'pulse 3s ease-in-out infinite 0.5s'
      }}></div>
      <div className="absolute bottom-1/4 right-1/3 w-20 h-20 rounded-full blur-lg" style={{
        background: 'radial-gradient(circle, rgba(26, 35, 50, 0.4) 0%, transparent 70%)',
        animation: 'pulse 3s ease-in-out infinite 1.5s'
      }}></div>
      <div className="absolute top-3/4 left-1/2 w-12 h-12 rounded-full blur-sm" style={{
        background: 'radial-gradient(circle, rgba(26, 15, 20, 0.6) 0%, transparent 70%)',
        animation: 'bounce 2s ease-in-out infinite 1s'
      }}></div>
      
      {/* Partículas flotantes mejoradas */}
      {showParticles && (
        <div className="floating-particles">
          <div className="particle" style={{animationDelay: '0s', left: '10%', top: '20%'}}></div>
          <div className="particle" style={{animationDelay: '1s', left: '20%', top: '60%'}}></div>
          <div className="particle" style={{animationDelay: '2s', left: '30%', top: '40%'}}></div>
          <div className="particle" style={{animationDelay: '3s', left: '40%', top: '80%'}}></div>
          <div className="particle" style={{animationDelay: '4s', left: '50%', top: '10%'}}></div>
          <div className="particle" style={{animationDelay: '5s', left: '60%', top: '70%'}}></div>
          <div className="particle" style={{animationDelay: '6s', left: '70%', top: '30%'}}></div>
          <div className="particle" style={{animationDelay: '7s', left: '80%', top: '50%'}}></div>
          <div className="particle" style={{animationDelay: '8s', left: '90%', top: '25%'}}></div>
        </div>
      )}
      
      {/* Título institucional en la parte superior */}
      <div className="relative z-10 pt-8 pb-4">
        <div className="text-center">
          <h1 className={`${titleSize[size]} font-black text-white mb-4 tracking-tight drop-shadow-lg professional-text loading-shimmer`} style={{
            textShadow: '0 0 25px rgba(255, 255, 255, 0.9), 0 4px 8px rgba(0, 0, 0, 0.6), 0 0 40px rgba(211, 183, 160, 0.4)',
            fontFamily: 'Georgia, serif',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 25%, #d3b7a0 50%, #f8fafc 75%, #ffffff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {title}
          </h1>
          <div className="relative">
            <p className={`${subtitleSize[size]} font-bold tracking-wide loading-shimmer`} style={{
              color: '#d3b7a0',
              textShadow: '0 0 20px rgba(211, 183, 160, 0.9), 0 2px 5px rgba(0, 0, 0, 0.8)',
              fontFamily: 'Georgia, serif'
            }}>
              {subtitle}
            </p>
            <div className="mt-3 mx-auto w-32 h-1 rounded-full" style={{
              background: 'linear-gradient(90deg, transparent 0%, #d3b7a0 50%, transparent 100%)',
              boxShadow: '0 0 15px rgba(211, 183, 160, 0.8)'
            }}></div>
          </div>
        </div>
      </div>

      {/* Centro: Logo y "Cargando sistema..." */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Logo principal con luna y efectos mejorados */}
        <div className="relative mb-6">
          {/* Efecto de brillo detrás del logo */}
          <div className="absolute inset-0 rounded-full blur-3xl opacity-30 scale-150" style={{
            background: 'linear-gradient(135deg, #1a0f14 0%, #1a2332 50%, #0a0f14 100%)',
            animation: 'pulse 4s ease-in-out infinite'
          }}></div>
          
          {/* Luna contenedora mejorada */}
          <div className={`${logoSize[size]} mx-auto relative z-10 rounded-full shadow-2xl transition-all duration-700`} style={{
            boxShadow: `
              0 0 40px rgba(26, 15, 20, 0.6), 
              inset 0 0 30px rgba(26, 15, 20, 0.4), 
              0 0 60px rgba(26, 15, 20, 0.5),
              0 0 0 2px rgba(26, 15, 20, 0.3),
              0 0 0 3px rgba(15, 20, 25, 0.2)
            `,
            background: `
              radial-gradient(circle at 30% 30%, #ffffff 0%, #f8fafc 10%, #e2e8f0 20%, #cbd5e1 30%, #94a3b8 40%, #64748b 50%, #475569 60%, #334155 70%, #1e293b 80%, #0f172a 90%, #020617 100%)
            `,
            animation: 'float 4s ease-in-out infinite, pulse 6s ease-in-out infinite'
          }}>
            {/* Logo dentro de la luna */}
            <div className={`absolute inset-0 ${logoSize[size]} flex items-center justify-center transition-all duration-700`}>
              <img 
                src={window.location.origin + "/images/icons/psicologia.png"}
                alt="Logo Institucional"
                className={`${size === 'lg' ? 'w-44 h-44' : size === 'md' ? 'w-36 h-36' : 'w-24 h-24'} object-contain drop-shadow-2xl transition-all duration-700`}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  imageRendering: 'crisp-edges',
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))',
                  animation: 'rotate 8s linear infinite, bounce 3s ease-in-out infinite'
                }}
                onError={(e) => {
                  const target = e.currentTarget;
                  const nextSibling = target.nextElementSibling as HTMLElement;
                  if (target && nextSibling) {
                    target.style.display = 'none';
                    nextSibling.style.display = 'flex';
                  }
                }}
              />
              {/* Fallback con símbolo psi */}
              <div className={`${size === 'lg' ? 'w-44 h-44' : size === 'md' ? 'w-36 h-36' : 'w-24 h-24'} bg-gradient-to-tr from-[#1a0f14] via-[#1a2332] to-[#0a0f14] rounded-full flex items-center justify-center hidden shadow-2xl transition-all duration-700`} style={{
                animation: 'rotate 8s linear infinite, bounce 3s ease-in-out infinite'
              }}>
                <span 
                  className={`font-bold text-white ${size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-4xl' : 'text-2xl'} transition-all duration-700`}
                  style={{fontFamily: 'Georgia, serif'}}
                >
                  Ψ
                </span>
              </div>
            </div>
          </div>
          
          {/* Ondas de carga alrededor del logo */}
          {showWaves && (
            <div className="loading-wave absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          )}

          {/* Círculos rotatorios alrededor del logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-2 border-transparent border-t-[#1a0f14] animate-spin" style={{
              animation: 'spin 4s linear infinite'
            }}></div>
            <div className="absolute w-3/4 h-3/4 rounded-full border-2 border-transparent border-t-[#1a2332] animate-spin" style={{
              animation: 'spin 3s linear infinite reverse'
            }}></div>
            <div className="absolute w-1/2 h-1/2 rounded-full border-2 border-transparent border-t-[#0a0f14] animate-spin" style={{
              animation: 'spin 2s linear infinite'
            }}></div>
          </div>

          {/* Partículas flotantes alrededor del logo */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-[#1a0f14] rounded-full opacity-60" style={{
              animation: 'float-particle 3s ease-in-out infinite'
            }}></div>
            <div className="absolute top-1/4 right-0 w-1.5 h-1.5 bg-[#1a2332] rounded-full opacity-60" style={{
              animation: 'float-particle 3s ease-in-out infinite 1s'
            }}></div>
            <div className="absolute bottom-1/4 left-0 w-1 h-1 bg-[#0a0f14] rounded-full opacity-60" style={{
              animation: 'float-particle 3s ease-in-out infinite 2s'
            }}></div>
            <div className="absolute bottom-0 right-1/4 w-1.5 h-1.5 bg-[#1a0f14] rounded-full opacity-60" style={{
              animation: 'float-particle 3s ease-in-out infinite 0.5s'
            }}></div>
          </div>
        </div>
        
        {/* Solo "Cargando sistema..." en el centro */}
        <div className="text-center">
          <p className="text-white font-bold text-lg tracking-wide mb-4" style={{
            textShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.6)',
            animation: 'glow-text 2s ease-in-out infinite'
          }}>
            Cargando sistema...
          </p>
        </div>
      </div>

      {/* Parte inferior: Resto de elementos */}
      <div className="relative z-10 pb-6">
        {/* Animación de carga mejorada con colores profesionales */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-3 h-3 rounded-full shadow-lg" style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
            animation: 'bounce 1s ease-in-out infinite'
          }}></div>
          <div className="w-3 h-3 rounded-full shadow-lg" style={{
            backgroundColor: '#e2e8f0',
            boxShadow: '0 0 8px rgba(226, 232, 240, 0.8)',
            animation: 'bounce 1s ease-in-out infinite 0.2s'
          }}></div>
          <div className="w-3 h-3 rounded-full shadow-lg" style={{
            backgroundColor: '#cbd5e1',
            boxShadow: '0 0 8px rgba(203, 213, 225, 0.8)',
            animation: 'bounce 1s ease-in-out infinite 0.4s'
          }}></div>
        </div>
        
        {/* Barra de progreso con animación */}
        <div className="relative mb-4">
          <div className="w-48 h-1.5 rounded-full mx-auto overflow-hidden shadow-inner" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div className="h-full rounded-full" style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%)',
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
              animation: 'loading-progress 3s ease-in-out infinite'
            }}></div>
          </div>
        </div>

        {/* Puntos de carga adicionales */}
        <div className="flex items-center justify-center space-x-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" style={{
            animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
          }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#e2e8f0] animate-ping" style={{
            animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite 0.3s'
          }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1] animate-ping" style={{
            animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite 0.6s'
          }}></div>
        </div>
        
        {/* Nuevos elementos animados adicionales */}
        <div className="flex items-center justify-center space-x-3 mt-4">
          <div className="w-2 h-2 rounded-full bg-white opacity-90" style={{
            animation: 'pulse 2s ease-in-out infinite 0s'
          }}></div>
          <div className="w-2 h-2 rounded-full bg-[#e2e8f0] opacity-90" style={{
            animation: 'pulse 2s ease-in-out infinite 0.5s'
          }}></div>
          <div className="w-2 h-2 rounded-full bg-[#cbd5e1] opacity-90" style={{
            animation: 'pulse 2s ease-in-out infinite 1s'
          }}></div>
          <div className="w-2 h-2 rounded-full bg-white opacity-90" style={{
            animation: 'pulse 2s ease-in-out infinite 1.5s'
          }}></div>
        </div>
        
        {/* Líneas animadas */}
        <div className="flex items-center justify-center space-x-1 mt-3">
          <div className="w-8 h-0.5 bg-gradient-to-r from-white to-[#e2e8f0] rounded-full" style={{
            animation: 'pulse 1.5s ease-in-out infinite 0s'
          }}></div>
          <div className="w-6 h-0.5 bg-gradient-to-r from-[#e2e8f0] to-[#cbd5e1] rounded-full" style={{
            animation: 'pulse 1.5s ease-in-out infinite 0.3s'
          }}></div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-[#cbd5e1] to-white rounded-full" style={{
            animation: 'pulse 1.5s ease-in-out infinite 0.6s'
          }}></div>
        </div>
      </div>
    </div>
  );
} 