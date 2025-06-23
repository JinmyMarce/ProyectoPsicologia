import React from 'react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8e161a] via-[#a52a2a] to-[#d3b7a0] flex items-center justify-center relative overflow-hidden">
      {/* Efecto de fondo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#8e161a]/20 to-[#d3b7a0]/20 animate-pulse"></div>
      
      <div className="relative z-10 text-center">
        <div className="relative mb-16">
          <img 
            src="/images/icons/psicologia.png"
            alt="Logo Institucional"
            className="w-64 h-64 object-contain drop-shadow-2xl filter brightness-110 animate-pulse mx-auto"
          />
          <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#8e161a]/30 to-[#d3b7a0]/30 rounded-full"></div>
        </div>
        
        <h1 className="text-7xl font-black text-white tracking-tight drop-shadow-2xl mb-8 animate-pulse">
          Sistema de Gestión
        </h1>
        <p className="text-4xl text-white/95 font-bold mb-6 drop-shadow-lg">
          Instituto Túpac Amaru
        </p>
        <p className="text-3xl text-white/80 font-semibold mb-16 drop-shadow-lg">
          Psicología Clínica
        </p>
        
        <div className="flex justify-center">
          <div className="w-20 h-20 border-6 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
        
        <p className="text-2xl text-white/90 font-semibold mt-12 animate-pulse">
          Cargando sistema...
        </p>
      </div>
    </div>
  );
} 