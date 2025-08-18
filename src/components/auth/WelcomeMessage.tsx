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
          icon: <UserPlus className="w-8 h-8" style={{color: '#8e161a'}} />,
          title: '¡Bienvenido al Sistema!',
          message: `Hola ${userName}, tu cuenta ha sido creada exitosamente. Puedes comenzar a usar el sistema de citas psicológicas.`,
          bgColor: 'border-2',
          textColor: '',
          buttonColor: 'hover:opacity-90',
          customStyle: {
            background: 'linear-gradient(135deg, rgba(142, 22, 26, 0.05) 0%, rgba(211, 183, 160, 0.05) 100%)',
            borderColor: '#8e161a',
            color: '#2c3e50'
          }
        };
      case 'synced_user':
        return {
          icon: <CheckCircle className="w-8 h-8" style={{color: '#d3b7a0'}} />,
          title: '¡Datos Sincronizados!',
          message: `Hola ${userName}, tus datos han sido sincronizados con la información registrada por el psicólogo. Toda tu información está disponible.`,
          bgColor: 'border-2',
          textColor: '',
          buttonColor: 'hover:opacity-90',
          customStyle: {
            background: 'linear-gradient(135deg, rgba(211, 183, 160, 0.05) 0%, rgba(142, 22, 26, 0.05) 100%)',
            borderColor: '#d3b7a0',
            color: '#2c3e50'
          }
        };
      case 'existing_user':
        return {
          icon: <Users className="w-8 h-8" style={{color: '#34495e'}} />,
          title: '¡Bienvenido de nuevo!',
          message: `Hola ${userName}, nos alegra verte de nuevo. Tu información está actualizada y lista para usar.`,
          bgColor: 'border-2',
          textColor: '',
          buttonColor: 'hover:opacity-90',
          customStyle: {
            background: 'linear-gradient(135deg, rgba(52, 73, 94, 0.05) 0%, rgba(44, 62, 80, 0.05) 100%)',
            borderColor: '#34495e',
            color: '#2c3e50'
          }
        };
      default:
        return {
          icon: <Info className="w-8 h-8" style={{color: '#2c3e50'}} />,
          title: 'Bienvenido',
          message: `Hola ${userName}`,
          bgColor: 'border-2',
          textColor: '',
          buttonColor: 'hover:opacity-90',
          customStyle: {
            background: 'linear-gradient(135deg, rgba(44, 62, 80, 0.05) 0%, rgba(52, 73, 94, 0.05) 100%)',
            borderColor: '#2c3e50',
            color: '#2c3e50'
          }
        };
    }
  };

  const config = getMessageConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className={`${config.bgColor} max-w-md w-full mx-4 rounded-xl shadow-2xl p-6`}
        style={config.customStyle}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {config.icon}
          </div>
          <h2 className={`text-xl font-bold ${config.textColor} mb-3`} style={{color: config.customStyle?.color}}>
            {config.title}
          </h2>
          <p className={`${config.textColor} mb-6 text-sm leading-relaxed`} style={{color: config.customStyle?.color}}>
            {config.message}
          </p>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${config.buttonColor}`}
            style={{
              background: 'linear-gradient(135deg, #8e161a 0%, #d3b7a0 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};