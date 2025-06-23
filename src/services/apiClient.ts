import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Configuración base del cliente API
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Si el token expiró, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Función para establecer el token de autenticación
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Función para remover el token de autenticación
export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
  delete apiClient.defaults.headers.common['Authorization'];
};

// Función para verificar si hay un token válido
export const hasValidToken = () => {
  const token = localStorage.getItem('auth_token');
  return !!token;
};

// Función para obtener el token actual
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
}; 