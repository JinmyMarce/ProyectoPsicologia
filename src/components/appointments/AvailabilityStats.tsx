import React from 'react';
import { Calendar, Clock, User, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';

interface AvailabilityStatsProps {
  psychologist: {
    name: string;
    specialization: string;
    email: string;
  } | null | undefined;
}

export const AvailabilityStats: React.FC<AvailabilityStatsProps> = ({
  psychologist
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-[#8e161a]" />
        Información de Disponibilidad
      </h3>

      {psychologist && (
        <div className="space-y-4">
          {/* Información del psicólogo */}
          <div className="bg-gradient-to-r from-[#8e161a]/5 to-[#d3b7a0]/5 rounded-lg p-4 border border-[#8e161a]/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Dr. {psychologist.name}</h4>
                <p className="text-sm text-gray-600">{psychologist.specialization}</p>
                <p className="text-xs text-gray-500">{psychologist.email}</p>
              </div>
            </div>
          </div>

          {/* Información adicional */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h6 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Horarios de Atención
              </h6>
              <div className="text-xs text-yellow-700 space-y-1">
                <p>• Lunes a Viernes: 8:00 AM - 2:00 PM</p>
                <p>• Duración de sesión: 45 minutos</p>
                <p>• Horarios disponibles: 8:00, 8:45, 9:30, 10:15, 11:00, 11:45, 12:30, 13:15</p>
                <p>• No se atiende fines de semana</p>
              </div>
            </div>

          {/* Consejos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h6 className="text-sm font-semibold text-blue-800 mb-2">
              💡 Consejos para agendar
            </h6>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Selecciona un horario que se adapte a tu agenda</p>
              <p>• Llega 10 minutos antes de tu cita</p>
              <p>• Cancela con al menos 24 horas de anticipación</p>
              <p>• Trae tu documento de identidad</p>
            </div>
          </div>

          {/* Información importante */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h6 className="text-sm font-semibold text-green-800 mb-2">
              ✅ Información importante
            </h6>
            <div className="text-xs text-green-700 space-y-1">
              <p>• Las citas requieren aprobación del psicólogo</p>
              <p>• Recibirás notificación cuando sea aprobada</p>
              <p>• Puedes ver el estado en tu perfil</p>
              <p>• Confidencialidad garantizada</p>
            </div>
          </div>
        </div>
      )}

      {!psychologist && (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No hay psicólogo disponible</p>
        </div>
      )}
    </Card>
  );
}; 