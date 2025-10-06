import type { ReactNode } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Activity,
  LogOut,
  Settings,
  Bell,
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
  notifications?: number;
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
  notifications = 0,
}: DashboardLayoutProps) {
  const initials = getInitials(user?.name, user?.email);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-semibold text-gray-900">CuidaSalud</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0">
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Usuario logueado */}
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                {initials}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 leading-tight">{user.name}</p>
                <p className="text-xs text-gray-500 leading-tight">{user.email}</p>
                <div className="mt-1 flex justify-end">
                  <Badge variant="outline" className="capitalize">
                    {roleLabel(user.role)}
                  </Badge>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="sm" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </Button>

            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

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
