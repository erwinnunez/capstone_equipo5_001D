import type { ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Activity,
  LogOut,
  ChevronDown,
  User,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: string;   // 'admin' | 'doctor' | 'caregiver' | 'patient' (string para compat)
  email: string;
}

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
  sidebarContent?: ReactNode;
}

// Helpers
function getInitials(name?: string, email?: string) {
  const src = (name && name.trim()) || (email && email.split('@')[0]) || '';
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return 'U';
}

function roleLabel(role: string) {
  const map: Record<string, string> = {
    admin: 'Administrador',
    doctor: 'Médico',
    caregiver: 'Cuidador',
    patient: 'Paciente',
  };
  return map[role?.toLowerCase?.()] || role;
}

export function DashboardLayout({
  user,
  onLogout,
  children,
  sidebarContent,
}: DashboardLayoutProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(user?.name, user?.email);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
  {/* Top Navigation - fixed */}
  <header className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 w-full z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-semibold text-gray-900">CuidaSalud</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dropdown del Usuario - Implementación manual */}
            <div className="relative" ref={dropdownRef}>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                  {initials}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{user.name}</p>
                  <p className="text-xs text-gray-500 leading-tight">{user.email}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>

              {/* Dropdown Content */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-md z-50">
                  {/* Header con información del usuario */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <Badge variant="outline" className="capitalize w-fit text-xs">
                        {roleLabel(user.role)}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Opción de cerrar sesión */}
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
  </header>
  {/* Navbar invisible para reservar espacio y evitar que el contenido se solape */}
  <div style={{ height: '72px', width: '100%' }} aria-hidden="true"></div>

      <div className="flex">
        {/* Sidebar */}
        {sidebarContent && (
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <div className="p-6">{sidebarContent}</div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
