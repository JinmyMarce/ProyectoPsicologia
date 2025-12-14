import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Plug, 
  Save, 
  RefreshCw,
  Sparkles,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
  };
  security: {
    passwordMinLength: number;
    requireTwoFactor: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableIpWhitelist: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    emailNotifications: boolean;
    appointmentReminders: boolean;
    systemAlerts: boolean;
  };
  integrations: {
    googleCalendar: boolean;
    googleCalendarApiKey: string;
    smsProvider: string;
    smsApiKey: string;
    emailProvider: string;
    emailApiKey: string;
  };
}

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'Sistema de Psicología',
      siteDescription: 'Sistema de gestión de citas psicológicas',
      timezone: 'America/Lima',
      language: 'es',
      maintenanceMode: false
    },
    security: {
      passwordMinLength: 8,
      requireTwoFactor: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enableIpWhitelist: false
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      emailNotifications: true,
      appointmentReminders: true,
      systemAlerts: true
    },
    integrations: {
      googleCalendar: false,
      googleCalendarApiKey: '',
      smsProvider: 'twilio',
      smsApiKey: '',
      emailProvider: 'smtp',
      emailApiKey: ''
    }
  });

  const [activeSection, setActiveSection] = useState<'general' | 'security' | 'notifications' | 'integrations'>('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setSettings(data.data);
        }
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Error al guardar configuraciones');
      }

      setSuccessMessage('Configuraciones guardadas exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar configuraciones');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'integrations', label: 'Integraciones', icon: Plug }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, #0a0e17 0%, #020408 50%, #000000 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#09090b]/50 via-transparent to-[#09090b]/30"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl backdrop-blur-sm border border-white/10">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Configuraciones del Sistema</h1>
                <p className="text-sm sm:text-base text-white/70 mt-1">Gestiona las configuraciones generales del sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchSettings}
                disabled={loading}
                className="text-xs xs:text-sm font-bold rounded-lg px-3 xs:px-4 py-1.5 xs:py-2 transition-all hover:scale-105 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <svg className="absolute bottom-0 left-0 right-0 w-full h-8 text-slate-50" preserveAspectRatio="none" viewBox="0 0 1200 120" fill="currentColor">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,26.07,87.09,47.12,34.44,25.51,70.81,58.51,112.74,61.4,43.55,3.01,88.4-12.24,124.6-31.87,54.3-29.75,99.62-70.21,133.18-111.58V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de secciones */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-[#8e161a] to-[#6b1115] text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Contenido de la sección activa */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {activeSection === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Configuración General</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del sitio</label>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                      className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del sitio</label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                      className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zona horaria</label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                      >
                        <option value="America/Lima">America/Lima (GMT-5)</option>
                        <option value="America/New_York">America/New_York (GMT-5)</option>
                        <option value="America/Mexico_City">America/Mexico_City (GMT-6)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                      <select
                        value={settings.general.language}
                        onChange={(e) => updateSetting('general', 'language', e.target.value)}
                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      checked={settings.general.maintenanceMode}
                      onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                      className="w-4 h-4 text-[#8e161a] border-gray-300 rounded focus:ring-[#8e161a]"
                    />
                    <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
                      Modo de mantenimiento
                    </label>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Configuración de Seguridad</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitud mínima de contraseña</label>
                    <input
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                      className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                      min="6"
                      max="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo de sesión (minutos)</label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                      min="5"
                      max="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Intentos máximos de login</label>
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                      min="3"
                      max="10"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="requireTwoFactor"
                        checked={settings.security.requireTwoFactor}
                        onChange={(e) => updateSetting('security', 'requireTwoFactor', e.target.checked)}
                        className="w-4 h-4 text-[#8e161a] border-gray-300 rounded focus:ring-[#8e161a]"
                      />
                      <label htmlFor="requireTwoFactor" className="text-sm font-medium text-gray-700">
                        Requerir autenticación de dos factores
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="enableIpWhitelist"
                        checked={settings.security.enableIpWhitelist}
                        onChange={(e) => updateSetting('security', 'enableIpWhitelist', e.target.checked)}
                        className="w-4 h-4 text-[#8e161a] border-gray-300 rounded focus:ring-[#8e161a]"
                      />
                      <label htmlFor="enableIpWhitelist" className="text-sm font-medium text-gray-700">
                        Habilitar lista blanca de IPs
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Configuración de Notificaciones</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Notificaciones por Email</label>
                        <p className="text-xs text-gray-500 mt-1">Habilitar envío de notificaciones por correo electrónico</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailEnabled}
                        onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
                        className="w-4 h-4 text-[#8e161a] border-gray-300 rounded focus:ring-[#8e161a]"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Notificaciones por SMS</label>
                        <p className="text-xs text-gray-500 mt-1">Habilitar envío de notificaciones por mensaje de texto</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsEnabled}
                        onChange={(e) => updateSetting('notifications', 'smsEnabled', e.target.checked)}
                        className="w-4 h-4 text-[#8e161a] border-gray-300 rounded focus:ring-[#8e161a]"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Notificaciones Push</label>
                        <p className="text-xs text-gray-500 mt-1">Habilitar notificaciones push en el navegador</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushEnabled}
                        onChange={(e) => updateSetting('notifications', 'pushEnabled', e.target.checked)}
                        className="w-4 h-4 text-[#8e161a] border-gray-300 rounded focus:ring-[#8e161a]"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Notificaciones</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                          className="w-4 h-4 text-[#8e161a] border-gray-300 rounded focus:ring-[#8e161a]"
                        />
                        <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                          Notificaciones por email
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="appointmentReminders"
                          checked={settings.notifications.appointmentReminders}
                          onChange={(e) => updateSetting('notifications', 'appointmentReminders', e.target.checked)}
                          className="w-4 h-4 text-[#8e161a] border-gray-300 rounded focus:ring-[#8e161a]"
                        />
                        <label htmlFor="appointmentReminders" className="text-sm font-medium text-gray-700">
                          Recordatorios de citas
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="systemAlerts"
                          checked={settings.notifications.systemAlerts}
                          onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
                          className="w-4 h-4 text-[#8e161a] border-gray-300 rounded focus:ring-[#8e161a]"
                        />
                        <label htmlFor="systemAlerts" className="text-sm font-medium text-gray-700">
                          Alertas del sistema
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'integrations' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Integraciones</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">Google Calendar</h3>
                          <p className="text-xs text-gray-500 mt-1">Sincronizar citas con Google Calendar</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.integrations.googleCalendar}
                          onChange={(e) => updateSetting('integrations', 'googleCalendar', e.target.checked)}
                          className="w-4 h-4 text-[#8e161a] border-gray-300 rounded focus:ring-[#8e161a]"
                        />
                      </div>
                      {settings.integrations.googleCalendar && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-700 mb-2">Clave API de Google Calendar</label>
                          <input
                            type="password"
                            value={settings.integrations.googleCalendarApiKey}
                            onChange={(e) => updateSetting('integrations', 'googleCalendarApiKey', e.target.value)}
                            className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                            placeholder="Ingresa tu clave API"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-2">Proveedor de SMS</label>
                        <select
                          value={settings.integrations.smsProvider}
                          onChange={(e) => updateSetting('integrations', 'smsProvider', e.target.value)}
                          className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                        >
                          <option value="twilio">Twilio</option>
                          <option value="nexmo">Nexmo</option>
                          <option value="other">Otro</option>
                        </select>
                      </div>
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 mb-2">Clave API de SMS</label>
                        <input
                          type="password"
                          value={settings.integrations.smsApiKey}
                          onChange={(e) => updateSetting('integrations', 'smsApiKey', e.target.value)}
                          className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                          placeholder="Ingresa tu clave API"
                        />
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-2">Proveedor de Email</label>
                        <select
                          value={settings.integrations.emailProvider}
                          onChange={(e) => updateSetting('integrations', 'emailProvider', e.target.value)}
                          className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                        >
                          <option value="smtp">SMTP</option>
                          <option value="sendgrid">SendGrid</option>
                          <option value="mailgun">Mailgun</option>
                        </select>
                      </div>
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 mb-2">Clave API de Email</label>
                        <input
                          type="password"
                          value={settings.integrations.emailApiKey}
                          onChange={(e) => updateSetting('integrations', 'emailApiKey', e.target.value)}
                          className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a] transition-all"
                          placeholder="Ingresa tu clave API"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-[#8e161a] to-[#6b1115] hover:from-[#6b1115] hover:to-[#5a0e11] text-white font-bold shadow-lg transition-all duration-200 hover:shadow-xl flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};






