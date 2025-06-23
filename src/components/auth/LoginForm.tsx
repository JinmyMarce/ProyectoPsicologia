import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, UserRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, loading, error, setUser, setToken } = useAuth();

  // Manejar callback de Google OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      console.error('Error en autenticación:', errorParam);
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Guardar en localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Actualizar contexto
        setToken(token);
        setUser(user);
        
        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error procesando callback:', error);
        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [setUser, setToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.endsWith('@istta.edu.pe')) {
      // No mostrar error aquí, el backend se encargará de la validación
    }

    await login(email, password);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f2f3c6] via-[#d3b7a0] to-[#8e161a] p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-3xl border-0 bg-white/95 backdrop-blur-md" padding="lg">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mx-auto mb-3">
            <img 
              src={window.location.origin + "/images/icons/psicologia.png"}
              alt="Logo Institucional"
              className="w-72 h-72 object-contain drop-shadow-lg"
              style={{ maxWidth: '288px', maxHeight: '288px' }}
              onError={(e) => {
                console.log('Error cargando imagen:', e);
                const target = e.currentTarget;
                const nextSibling = target.nextElementSibling as HTMLElement;
                if (target && nextSibling) {
                  target.style.display = 'none';
                  nextSibling.style.display = 'flex';
                }
              }}
              onLoad={(e) => {
                console.log('Imagen cargada exitosamente');
              }}
            />
            <div className="w-72 h-72 bg-gradient-to-tr from-[#8e161a] to-[#d3b7a0] rounded-full flex items-center justify-center hidden">
              <UserRound className="w-40 h-40 text-white drop-shadow-lg" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-[#8e161a] mb-1 tracking-tight">
            Bienvenido
          </h1>
          <p className="text-gray-700 font-medium text-sm">
            Sistema de Gestión de Citas - Psicología
          </p>
          <p className="text-xs text-[#d3b7a0] mt-1 font-semibold">
            Instituto Túpac Amaru
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="email"
            label="Correo"
            placeholder="usuario@istta.edu.pe"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
            className="focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a]"
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
              className="focus:ring-2 focus:ring-[#8e161a] border-[#d3b7a0] focus:border-[#8e161a]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-[#d3b7a0] hover:text-[#8e161a] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-semibold">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#8e161a] to-[#d3b7a0] text-white font-bold py-3 rounded-xl shadow-md hover:from-[#6d1115] hover:to-[#b89a8a] transition-all duration-300 text-lg transform hover:scale-105"
            size="lg"
            loading={loading}
          >
            Iniciar Sesión
          </Button>
        </form>

        <div className="mt-7">
          <div className="relative mb-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#d3b7a0]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-[#8e161a] font-medium">O continúa con</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-4 border-2 border-[#d3b7a0] hover:border-[#8e161a] text-[#8e161a] font-semibold bg-white hover:bg-[#f2f3c6] transition-all duration-300"
            size="lg"
            onClick={handleGoogleLogin}
            loading={loading}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Google
          </Button>
        </div>

        <div className="mt-7 text-center">
          <p className="text-xs text-gray-600 font-medium">
            <span className="font-bold text-[#8e161a]">Estudiantes:</span> Use su cuenta de Google institucional<br/>
            <span className="font-bold text-[#d3b7a0]">Psicólogos/Admin:</span> Use su correo personal y contraseña
          </p>
        </div>
      </Card>
    </div>
  );
}