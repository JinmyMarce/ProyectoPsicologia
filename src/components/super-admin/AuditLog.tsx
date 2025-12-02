import React, { useState, useEffect } from 'react';
import { 
  History, 
  Download, 
  FileText, 
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  Search,
  Filter,
  Calendar,
  User,
  Shield,
  Settings,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AuditLogEntry {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
  details?: string;
}

export const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  useEffect(() => {
    fetchLogs();
  }, [filterType, filterDate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterDate) params.append('date', filterDate);

      const response = await fetch(`http://localhost:8000/api/audit-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
      }
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('create') || action.includes('crear')) return <Edit className="w-4 h-4 text-green-600" />;
    if (action.includes('update') || action.includes('actualizar')) return <Edit className="w-4 h-4 text-blue-600" />;
    if (action.includes('delete') || action.includes('eliminar')) return <Trash2 className="w-4 h-4 text-red-600" />;
    if (action.includes('login') || action.includes('iniciar')) return <Shield className="w-4 h-4 text-purple-600" />;
    if (action.includes('view') || action.includes('ver')) return <Eye className="w-4 h-4 text-gray-600" />;
    return <Settings className="w-4 h-4 text-gray-600" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('crear')) return 'bg-green-100 text-green-800';
    if (action.includes('update') || action.includes('actualizar')) return 'bg-blue-100 text-blue-800';
    if (action.includes('delete') || action.includes('eliminar')) return 'bg-red-100 text-red-800';
    if (action.includes('login') || action.includes('iniciar')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const exportToPDF = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/audit-logs/export/pdf', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err: any) {
      console.error('Error exporting PDF:', err);
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/audit-logs/export/excel', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err: any) {
      console.error('Error exporting Excel:', err);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                <History className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Módulo de Auditoría</h1>
                <p className="text-sm sm:text-base text-white/70 mt-1">Registro de todas las acciones del sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={exportToPDF}
                className="text-xs xs:text-sm font-bold rounded-lg px-3 xs:px-4 py-1.5 xs:py-2 transition-all hover:scale-105 border border-white/20 text-white hover:bg-white/20 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                PDF
              </button>
              <button
                onClick={exportToExcel}
                className="text-xs xs:text-sm font-bold rounded-lg px-3 xs:px-4 py-1.5 xs:py-2 transition-all hover:scale-105 border border-white/20 text-white hover:bg-white/20 flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                Excel
              </button>
              <button
                onClick={fetchLogs}
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
        {/* Filtros */}
        <Card className="p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por usuario, acción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a]"
              />
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a]"
              >
                <option value="all">Todas las acciones</option>
                <option value="create">Crear</option>
                <option value="update">Actualizar</option>
                <option value="delete">Eliminar</option>
                <option value="login">Inicio de sesión</option>
                <option value="view">Ver</option>
              </select>
            </div>
            <div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#8e161a] focus:border-[#8e161a]"
              />
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Cargando registros...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron registros de auditoría</p>
              </div>
            ) : (
              <div className="relative">
                {/* Línea vertical del timeline */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  {filteredLogs.map((log, index) => (
                    <div key={log.id} className="relative flex items-start gap-4">
                      {/* Punto del timeline */}
                      <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-white rounded-full border-4 border-gray-200 flex items-center justify-center">
                        {getActionIcon(log.action)}
                      </div>
                      
                      {/* Contenido */}
                      <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getActionColor(log.action)}>
                                {log.action}
                              </Badge>
                              <span className="text-sm text-gray-600">en</span>
                              <span className="text-sm font-medium text-gray-900">{log.resource_type}</span>
                            </div>
                            {log.details && (
                              <p className="text-sm text-gray-600 mt-2">{log.details}</p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(log.created_at)}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="font-medium">{log.user_name}</span>
                            <span className="text-gray-400">({log.user_email})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span>{log.ip_address}</span>
                          </div>
                          {log.resource_id && (
                            <div className="text-gray-400">
                              ID: {log.resource_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

