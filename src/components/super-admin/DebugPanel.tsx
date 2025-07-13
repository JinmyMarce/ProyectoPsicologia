import React, { useState } from 'react';
import { apiClient } from '@/services/apiClient';

export const DebugPanel: React.FC = () => {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const endpoints = [
    { name: 'Test API', endpoint: '/test', method: 'GET' as const },
    { name: 'Server Status', endpoint: '/debug/server-status', method: 'GET' as const },
    { name: 'Debug Users', endpoint: '/debug/users', method: 'GET' as const },
    { name: 'Debug Auth', endpoint: '/debug/auth', method: 'GET' as const },
    { name: 'Debug Migrations', endpoint: '/debug/migrations', method: 'GET' as const },
    { name: 'Check Token', endpoint: '/debug/check-token', method: 'GET' as const },
    { name: 'Auth Test', endpoint: '/debug/auth-test', method: 'POST' as const, data: {} },
    { name: 'Test POST', endpoint: '/debug/test-post', method: 'POST' as const, data: { test: 'data' } },
    { name: 'Create User (Debug)', endpoint: '/debug/create-user', method: 'POST' as const, data: { name: 'Test User', email: 'test@example.com', password: 'password123', role: 'psychologist' } },
    { name: 'Users Test (No Auth)', endpoint: '/debug/users-test', method: 'POST' as const, data: { name: 'Test User', email: 'test@example.com', password: 'password123', role: 'psychologist' } },
    { name: 'Users Temp (No Middleware)', endpoint: '/users-temp', method: 'POST' as const, data: { name: 'Test User', email: 'test@example.com', password: 'password123', role: 'psychologist' } },
    { name: 'Users (Protected)', endpoint: '/users', method: 'GET' as const },
  ];

  const testEndpoint = async (name: string, endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      const config: any = {
        method,
        url: endpoint,
      };
      
      if (method === 'POST' && data) {
        config.data = data;
      }
      
      const response = await apiClient.request(config);
      setResults(prev => ({ ...prev, [name]: { success: true, data: response.data } }));
    } catch (error: any) {
      console.error(`Error testing ${name}:`, error);
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: false, 
          error: error.response?.data || error.message,
          status: error.response?.status
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Panel de Diagnóstico</h2>
      
      <div className="space-y-4">
        {endpoints.map(({ name, endpoint, method, data }) => (
          <div key={name} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{name}</h3>
              <button
                onClick={() => testEndpoint(name, endpoint, method, data)}
                disabled={loading[name]}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading[name] ? 'Probando...' : 'Probar'}
              </button>
            </div>
            
            {results[name] && (
              <div className="mt-2">
                <div className={`text-sm font-medium ${results[name].success ? 'text-green-600' : 'text-red-600'}`}>
                  {results[name].success ? '✅ Éxito' : `❌ Error (${results[name].status})`}
                </div>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(results[name], null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 