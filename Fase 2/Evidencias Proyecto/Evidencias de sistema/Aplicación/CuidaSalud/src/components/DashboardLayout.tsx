import { ReactNode } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  Activity, 
  LogOut, 
  Settings, 
  Bell,
  User
} from 'lucide-react';
import { Badge } from './ui/badge';

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
  sidebarContent?: ReactNode;
  notifications?: number;
}

export function DashboardLayout({ 
  user, 
  onLogout, 
  children, 
  sidebarContent,
  notifications = 0
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-semibold text-gray-900">HealthMonitor</h1>
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
            
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarContent && (
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <div className="p-6">
              {sidebarContent}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}