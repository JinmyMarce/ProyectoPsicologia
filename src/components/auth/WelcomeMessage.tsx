import React from 'react';
import { CheckCircle, Info, Users, UserPlus } from 'lucide-react';

interface WelcomeMessageProps {
  type: 'new_user' | 'synced_user' | 'existing_user';
  userName: string;
  isVisible: boolean;
  onClose: () => void;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  type,
  userName,
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  const getMessageConfig = () => {
    switch (type) {
      case 'new_user':
        return {
          icon: <UserPlus className="w-8 h-8 text-white" />,
          title: '¡Bienvenido al Sistema!',
          message: `Hola ${userName}, tu cuenta ha sido creada exitosamente. Puedes comenzar a usar el sistema de citas psicológicas.`
        };
      case 'synced_user':
        return {
          icon: <CheckCircle className="w-8 h-8 text-white" />,
          title: '¡Datos Sincronizados!',
          message: `Hola ${userName}, tus datos han sido sincronizados con la información registrada por el psicólogo. Toda tu información está disponible.`
        };
      case 'existing_user':
        return {
          icon: <Users className="w-8 h-8 text-white" />,
          title: '¡Bienvenido de nuevo!',
          message: `Hola ${userName}, nos alegra verte de nuevo. Tu información está actualizada y lista para usar.`
        };
      default:
        return {
          icon: <Info className="w-8 h-8 text-white" />,
          title: 'Bienvenido',
          message: `Hola ${userName}`
        };
    }
  };

  const config = getMessageConfig();

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
        {/* Header con fondo exacto del login */}
        <div className="p-4 text-center relative overflow-hidden" style={{
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
          backgroundSize: '500% 500%, 60% 60%, 55% 55%, 75% 75%, 65% 65%, 250% 250%'
        }}>
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-[#6d1115] rounded-full flex items-center justify-center shadow-lg border border-white/20">
              {config.icon}
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2 tracking-wide drop-shadow-lg">
            {config.title}
          </h2>
          
          {/* Línea dorado verde */}
          <div className="w-16 h-0.5 bg-[#c2b280] rounded-full mx-auto shadow-sm"></div>
        </div>
        
        {/* Contenido blanco formal */}
        <div className="p-5 bg-white">
          <div className="text-center mb-5">
            <p className="text-[#1e2a37] text-sm leading-relaxed font-medium mb-4">
              {config.message}
            </p>
            
            {/* Línea granate */}
            <div className="w-20 h-0.5 bg-[#6d1115] rounded-full mx-auto mb-5"></div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-[#6d1115] text-white py-3 px-7 rounded-lg font-semibold text-sm hover:bg-[#4a0e10] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#6d1115] focus:ring-offset-2 shadow-md hover:shadow-lg"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};