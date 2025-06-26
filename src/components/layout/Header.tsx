import React from 'react';
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  onMenuClick: () => void;
  notifications?: number;
}

export function Header({ onMenuClick, notifications = 3 }: HeaderProps) {
  const { user, logout } = useAuth();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'psychologist':
        return 'Psicólogo';
      case 'student':
        return 'Estudiante';
      default:
        return role;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </Button>
          
          <h1 className="text-gray-800 font-bold text-lg hidden sm:block">
            Sistema de Gestión de Citas
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notificaciones */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:bg-gray-100 relative"
          >
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <Badge 
                variant="danger" 
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {notifications > 9 ? '9+' : notifications}
              </Badge>
            )}
          </Button>

          {/* Usuario */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-gray-800 font-semibold text-sm">
                {user?.name}
              </p>
              <p className="text-gray-500 text-xs">
                {getRoleDisplayName(user?.role || '')}
              </p>
            </div>
            
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100 rounded-full w-9 h-9"
              >
                <User className="w-5 h-5" />
              </Button>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2" onClick={() => window.location.href = '/configuracion-cuenta'}>
                    <Settings className="w-4 h-4" />
                    <span>Configuración</span>
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}