import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAvailableSlots, getPsychologists, createAppointment } from '../../services/appointments';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import dayjs, { Dayjs } from 'dayjs';
import CalendarProfessional from './CalendarProfessional';

export function TestAuth() {
  const { user, token, simulateAuth } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Verificar autenticación
      addResult('🔍 Verificando autenticación...');
      if (!user || !token) {
        addResult('❌ No hay usuario autenticado');
        return;
      }
      addResult(`✅ Usuario autenticado: ${user.name} (${user.role})`);
      addResult(`✅ Token: ${token.substring(0, 20)}...`);

      // Test 2: Obtener psicólogos
      addResult('🔍 Probando obtener psicólogos...');
      try {
        const psychologists = await getPsychologists();
        addResult(`✅ Psicólogos obtenidos: ${psychologists.length}`);
        if (psychologists.length > 0) {
          addResult(`   - ${psychologists[0].name} (ID: ${psychologists[0].id})`);
        }
      } catch (error: any) {
        addResult(`❌ Error obteniendo psicólogos: ${error.message}`);
      }

      // Test 3: Obtener horarios disponibles
      addResult('🔍 Probando obtener horarios disponibles...');
      try {
        const today = new Date().toISOString().split('T')[0];
        const slots = await getAvailableSlots(1, today); // Usar ID 1 como prueba
        addResult(`✅ Horarios obtenidos: ${slots.length}`);
        const availableSlots = slots.filter(slot => slot.available);
        addResult(`   - Horarios disponibles: ${availableSlots.length}`);
        if (availableSlots.length > 0) {
          addResult(`   - Primer horario: ${availableSlots[0].time}`);
        }
      } catch (error: any) {
        addResult(`❌ Error obteniendo horarios: ${error.message}`);
        if (error.response) {
          addResult(`   - Status: ${error.response.status}`);
          addResult(`   - Data: ${JSON.stringify(error.response.data)}`);
        }
      }

      // Test 4: Crear cita de prueba
      addResult('🔍 Probando crear cita de prueba...');
      try {
        const appointmentData = {
          user_email: user.email,
          psychologist_id: 1,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
          time: '09:00',
          reason: 'Cita de prueba desde frontend',
          status: 'pending'
        };
        
        const appointment = await createAppointment(appointmentData);
        addResult(`✅ Cita creada exitosamente: ID ${appointment.id}`);
        addResult(`   - Fecha: ${appointment.date} ${appointment.time}`);
        addResult(`   - Motivo: ${appointment.reason}`);
      } catch (error: any) {
        addResult(`❌ Error creando cita: ${error.message}`);
        if (error.response) {
          addResult(`   - Status: ${error.response.status}`);
          addResult(`   - Data: ${JSON.stringify(error.response.data)}`);
        }
      }

    } catch (error: any) {
      addResult(`❌ Error general: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">🧪 Pruebas de Autenticación y API</h3>
      
      <div className="space-y-4 mb-4">
        <div>
          <strong>Estado actual:</strong>
          <div className="text-sm text-gray-600">
            {user ? (
              <>
                <div>✅ Usuario: {user.name}</div>
                <div>📧 Email: {user.email}</div>
                <div>👤 Rol: {user.role}</div>
                <div>🔑 Token: {token ? 'Presente' : 'Ausente'}</div>
              </>
            ) : (
              <div>❌ No autenticado</div>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={simulateAuth}
            variant="outline"
            size="sm"
          >
            🔐 Simular Autenticación
          </Button>
          
          <Button 
            onClick={runTests}
            disabled={loading || !user}
            size="sm"
          >
            {loading ? '🔄 Probando...' : '🧪 Ejecutar Pruebas'}
          </Button>
          
          <Button 
            onClick={clearResults}
            variant="outline"
            size="sm"
          >
            🗑️ Limpiar
          </Button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-2">Resultados de las pruebas:</h4>
          <div className="space-y-1 text-sm">
            {testResults.map((result, index) => (
              <div key={index} className="font-mono">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 350, margin: '0 auto', padding: 24 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Reserva tu cita</h2>
        <CalendarProfessional value={selectedDate} onChange={setSelectedDate} />
        {selectedDate && (
          <div style={{ marginTop: 16, textAlign: 'center', color: '#8e161a', fontWeight: 600 }}>
            Fecha seleccionada: {selectedDate.format('dddd, DD [de] MMMM YYYY')}
          </div>
        )}
      </div>
    </Card>
  );
} 