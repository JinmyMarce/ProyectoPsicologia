import React, { useState } from 'react';
import { SyncNotification } from '../ui/SyncNotification';
import { useNotification } from '../../hooks/useNotification';
import { Calendar, Clock, User, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

export const AppointmentNotificationExample: React.FC = () => {
  const { notification, showSuccess, showError, showWarning, showInfo, showLoading, hideNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccessExample = () => {
    showSuccess(
      '¡Cita Confirmada!',
      'Tu cita psicológica ha sido agendada exitosamente para el 15 de marzo de 2024 a las 10:00 AM. Recibirás un recordatorio por email.',
      {
        autoClose: true,
        autoCloseDelay: 5000
      }
    );
  };

  const handleErrorExample = () => {
    showError(
      'Error al Agendar Cita',
      'No se pudo procesar tu solicitud. Por favor, verifica que todos los campos estén completos y vuelve a intentar.',
      {
        autoClose: false
      }
    );
  };

  const handleWarningExample = () => {
    showWarning(
      'Horario No Disponible',
      'El horario seleccionado ya no está disponible. Por favor, selecciona otro horario de la lista.',
      {
        autoClose: true,
        autoCloseDelay: 4000
      }
    );
  };

  const handleInfoExample = () => {
    showInfo(
      'Recordatorio Importante',
      'Recuerda llegar 15 minutos antes de tu cita. Si necesitas cancelar o reprogramar, hazlo con al menos 24 horas de anticipación.',
      {
        autoClose: true,
        autoCloseDelay: 6000
      }
    );
  };

  const handleLoadingExample = () => {
    setIsLoading(true);
    showLoading(
      'Procesando Solicitud',
      'Estamos verificando la disponibilidad y procesando tu solicitud de cita. Por favor espera...',
      {
        autoClose: false
      }
    );

    // Simular proceso
    setTimeout(() => {
      setIsLoading(false);
      hideNotification();
      showSuccess(
        '¡Proceso Completado!',
        'Tu solicitud ha sido procesada exitosamente.',
        {
          autoClose: true,
          autoCloseDelay: 3000
        }
      );
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Sistema de Notificaciones Mejorado
            </h1>
            <p className="text-gray-600 text-lg">
              Notificaciones profesionales con auto-cierre y detección de cambio de interfaz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mensaje de Éxito */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-green-800">Mensaje de Éxito</h3>
              </div>
              <p className="text-green-700 text-sm mb-4">
                Confirmación de cita agendada con auto-cierre en 5 segundos
              </p>
              <button
                onClick={handleSuccessExample}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Mostrar Ejemplo
              </button>
            </div>

            {/* Mensaje de Error */}
            <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl p-6 border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-red-800">Mensaje de Error</h3>
              </div>
              <p className="text-red-700 text-sm mb-4">
                Error al procesar sin auto-cierre (requiere acción del usuario)
              </p>
              <button
                onClick={handleErrorExample}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Mostrar Ejemplo
              </button>
            </div>

            {/* Mensaje de Advertencia */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-yellow-800">Mensaje de Advertencia</h3>
              </div>
              <p className="text-yellow-700 text-sm mb-4">
                Advertencia sobre horario no disponible con auto-cierre
              </p>
              <button
                onClick={handleWarningExample}
                className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Mostrar Ejemplo
              </button>
            </div>

            {/* Mensaje Informativo */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-blue-800">Mensaje Informativo</h3>
              </div>
              <p className="text-blue-700 text-sm mb-4">
                Información importante con auto-cierre en 6 segundos
              </p>
              <button
                onClick={handleInfoExample}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Mostrar Ejemplo
              </button>
            </div>

            {/* Mensaje de Carga */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-purple-800">Mensaje de Carga</h3>
              </div>
              <p className="text-purple-700 text-sm mb-4">
                Procesamiento con indicador de carga y cancelación
              </p>
              <button
                onClick={handleLoadingExample}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                {isLoading ? 'Procesando...' : 'Mostrar Ejemplo'}
              </button>
            </div>

            {/* Test de Navegación */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Test de Navegación</h3>
              </div>
              <p className="text-gray-700 text-sm mb-4">
                Muestra una notificación y luego navega para ver el auto-cierre
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => showInfo('Test de Navegación', 'Esta notificación se cerrará automáticamente si navegas a otra página.')}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
                >
                  Mostrar Notificación
                </button>
                <a
                  href="/dashboard"
                  className="block w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200 font-medium text-sm text-center"
                >
                  Navegar a Dashboard
                </a>
              </div>
            </div>
          </div>

          {/* Características del Sistema */}
          <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Características del Sistema Mejorado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Auto-cierre configurable</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Cierre automático al cambiar de interfaz</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Barra de progreso visual</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Diseño profesional y moderno</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Múltiples tipos de mensaje</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Hook personalizado para fácil uso</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notificación */}
      <SyncNotification
        isVisible={notification.isVisible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
        autoClose={notification.autoClose}
        autoCloseDelay={notification.autoCloseDelay}
        showProgress={notification.showProgress}
      />
    </div>
  );
};


