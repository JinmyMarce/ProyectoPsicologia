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
          icon: <UserPlus className="w-8 h-8 text-blue-600" />,
          title: '¡Bienvenido al Sistema!',
          message: `Hola ${userName}, tu cuenta ha sido creada exitosamente. Puedes comenzar a usar el sistema de citas psicológicas.`,
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'synced_user':
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          title: '¡Datos Sincronizados!',
          message: `Hola ${userName}, tus datos han sido sincronizados con la información registrada por el psicólogo. Toda tu información está disponible.`,
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
      case 'existing_user':
        return {
          icon: <Users className="w-8 h-8 text-purple-600" />,
          title: '¡Bienvenido de nuevo!',
          message: `Hola ${userName}, nos alegra verte de nuevo. Tu información está actualizada y lista para usar.`,
          bgColor: 'bg-purple-50 border-purple-200',
          textColor: 'text-purple-800',
          buttonColor: 'bg-purple-600 hover:bg-purple-700'
        };
      default:
        return {
          icon: <Info className="w-8 h-8 text-gray-600" />,
          title: 'Bienvenido',
          message: `Hola ${userName}`,
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          buttonColor: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const config = getMessageConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${config.bgColor} border max-w-md w-full mx-4 rounded-xl shadow-2xl p-6`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {config.icon}
          </div>
          <h2 className={`text-xl font-bold ${config.textColor} mb-3`}>
            {config.title}
          </h2>
          <p className={`${config.textColor} mb-6 text-sm leading-relaxed`}>
            {config.message}
          </p>
          <button
            onClick={onClose}
            className={`${config.buttonColor} text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200`}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};