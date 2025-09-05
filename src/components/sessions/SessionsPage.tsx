import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  ClipboardList, 
  Calendar, 
  BarChart3,
  FileText,
  Users,
  Clock
} from 'lucide-react';
import { SessionRegistration } from './SessionRegistration';
import { SessionList } from './SessionList';

export function SessionsPage() {
  const [activeView, setActiveView] = useState<'overview' | 'register' | 'history'>('history');

  const sessionStats = [
    {
      title: 'Sesiones del Mes',
      value: '24',
      icon: Calendar,
      color: 'bg-gray-100 text-gray-800',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Pacientes Activos',
      value: '18',
      icon: Users,
      color: 'bg-gray-100 text-gray-700',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Sesiones Pendientes',
      value: '3',
      icon: Clock,
      color: 'bg-gray-100 text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Reportes Generados',
      value: '12',
      icon: FileText,
      color: 'bg-gray-100 text-gray-500',
      bgColor: 'bg-gray-50'
    }
  ];

  const quickActions = [
    {
      title: 'Registrar Nueva Sesión',
      description: 'Crear un nuevo registro de sesión psicológica',
      icon: Plus,
      color: 'bg-gray-800 hover:bg-gray-700',
      action: () => setActiveView('register')
    },
    {
      title: 'Ver Historial',
      description: 'Consultar sesiones anteriores y reportes',
      icon: ClipboardList,
      color: 'bg-gray-700 hover:bg-gray-600',
      action: () => setActiveView('history')
    },
    {
      title: 'Generar Reporte',
      description: 'Crear reportes estadísticos de sesiones',
      icon: BarChart3,
      color: 'bg-gray-600 hover:bg-gray-500',
      action: () => alert('Funcionalidad en desarrollo')
    },
    {
      title: 'Programar Sesión',
      description: 'Agendar próximas sesiones con pacientes',
      icon: Calendar,
      color: 'bg-gray-500 hover:bg-gray-400',
      action: () => alert('Funcionalidad en desarrollo')
    }
  ];

     if (activeView === 'register') {
     return (
       <div>
         <div className="mb-4">
           <button
             onClick={() => setActiveView('overview')}
             className="flex items-center text-gray-600 hover:text-gray-800 font-medium"
           >
             ← Volver a Sesión Psicológica
           </button>
         </div>
         <SessionRegistration />
       </div>
     );
   }

     if (activeView === 'history') {
     return (
       <div>
         <div className="mb-4">
           <button
             onClick={() => setActiveView('overview')}
             className="flex items-center text-gray-600 hover:text-gray-800 font-medium"
           >
             ← Volver a Sesión Psicológica
           </button>
         </div>
         <SessionList />
       </div>
     );
   }

  return (
    <div className="max-w-7xl mx-auto">
             {/* Título Principal */}
       <div className="text-center mb-6">
         <div className="inline-block px-20 py-4 bg-white border border-gray-200 rounded-lg shadow-md">
           <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
             Gestión de Sesiones Psicológicas
           </h1>
           <div className="w-28 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto rounded-full"></div>
         </div>
       </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {sessionStats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

             {/* Acciones Rápidas */}
       <div className="mb-8">
         <h2 className="text-xl font-bold text-gray-800 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={action.action}
            >
              <div className="flex items-start space-x-4">
                <div className={`${action.color} p-3 rounded-lg text-white transition-colors duration-200`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Sesiones Recientes */}
         <div className="bg-white rounded-xl p-6 border border-gray-200">
           <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
             <Clock className="w-5 h-5 mr-2 text-gray-600" />
             Sesiones Recientes
           </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Paciente {item}</p>
                  <p className="text-sm text-gray-600">Terapia individual - 45 min</p>
                </div>
                <span className="text-xs text-gray-500">Hace 2 días</span>
              </div>
            ))}
          </div>
                     <button 
             onClick={() => setActiveView('history')}
             className="w-full mt-4 text-gray-600 hover:text-gray-800 font-medium text-sm"
           >
             Ver todas las sesiones →
           </button>
        </div>

                 {/* Próximas Citas */}
         <div className="bg-white rounded-xl p-6 border border-gray-200">
           <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
             <Calendar className="w-5 h-5 mr-2 text-gray-600" />
             Próximas Citas
           </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Paciente {item + 3}</p>
                  <p className="text-sm text-gray-600">Evaluación inicial</p>
                </div>
                <span className="text-xs text-gray-500">En 3 días</span>
              </div>
            ))}
          </div>
                     <button className="w-full mt-4 text-gray-600 hover:text-gray-800 font-medium text-sm">
             Ver calendario completo →
           </button>
        </div>
      </div>
    </div>
  );
}