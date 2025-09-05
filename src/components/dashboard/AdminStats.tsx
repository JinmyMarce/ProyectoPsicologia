import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BarChart3, Users, Calendar, Download, Activity } from 'lucide-react';

export function AdminStats() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:8000/api/reports/admin-stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const data = await res.json();
        setStats(data.data);
      } catch (e) {
        setError('No se pudieron cargar las estadísticas.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const downloadPDF = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/reports/download-admin-stats-pdf', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'estadisticas_admin.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('No se pudo descargar el PDF.');
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Título Principal */}
      <div className="text-center mb-6">
        <div className="inline-block px-20 py-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
            Estadísticas del Sistema
          </h1>
          <div className="w-28 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto rounded-full"></div>
        </div>
      </div>
      <div className="flex justify-end mb-6">
        <Button
          className="bg-[#8e161a] text-white font-bold hover:bg-[#6b1115]"
          onClick={downloadPDF}
        >
          Descargar PDF Profesional
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <Users className="w-8 h-8 mx-auto text-[#8e161a] mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.total_users}</div>
          <div className="text-sm text-gray-600">Total Usuarios</div>
        </Card>
        <Card className="p-6 text-center">
          <Users className="w-8 h-8 mx-auto text-green-700 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.total_psychologists}</div>
          <div className="text-sm text-gray-600">Psicólogos</div>
        </Card>
        <Card className="p-6 text-center">
          <Users className="w-8 h-8 mx-auto text-orange-600 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.total_students}</div>
          <div className="text-sm text-gray-600">Estudiantes</div>
        </Card>
      </div>
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen de Citas</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Calendar className="w-6 h-6 mx-auto text-[#8e161a] mb-1" />
            <div className="text-lg font-bold">{stats.total_appointments}</div>
            <div className="text-xs text-gray-600">Total Citas</div>
          </div>
          <div className="text-center">
            <Activity className="w-6 h-6 mx-auto text-green-700 mb-1" />
            <div className="text-lg font-bold">{stats.completed_appointments}</div>
            <div className="text-xs text-gray-600">Citas Completadas</div>
          </div>
          <div className="text-center">
            <Activity className="w-6 h-6 mx-auto text-yellow-600 mb-1" />
            <div className="text-lg font-bold">{stats.pending_appointments}</div>
            <div className="text-xs text-gray-600">Citas Pendientes</div>
          </div>
          <div className="text-center">
            <Activity className="w-6 h-6 mx-auto text-red-600 mb-1" />
            <div className="text-lg font-bold">{stats.cancelled_appointments}</div>
            <div className="text-xs text-gray-600">Citas Canceladas</div>
          </div>
        </div>
      </Card>
    </div>
  );
} 