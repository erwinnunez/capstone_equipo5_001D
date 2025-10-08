// src/components/LoginPage.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Activity, Shield, Stethoscope, Heart, User } from 'lucide-react';

import { login as doLogin } from '../services/auth';
import type { FrontUser } from '../services/auth';
type Role = FrontUser['role'];

interface UserObj {
  id: string;
  name: string;
  role: Role;
  email: string;
  rutPaciente?: number;
}

interface LoginPageProps {
  onLogin: (user: UserObj) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const roles = [
    { value: 'admin',    label: 'Administrador', icon: Shield,      description: 'Gestión y auditoría de sistemas' },
    { value: 'doctor',   label: 'Doctor',        icon: Stethoscope, description: 'Monitoreo y reportes de pacientes' },
    { value: 'caregiver',label: 'Cuidador',      icon: Heart,       description: 'Entrada y atención de datos de pacientes' },
    { value: 'patient',  label: 'Paciente',      icon: User,        description: 'Autocontrol y progreso' }
  ] as const;

  const handleLogin = async () => {
    setErrorMsg('');
    if (!selectedRole || !email || !password) {
      setErrorMsg('Completa email, contraseña y rol.');
      return;
    }
    try {
      setLoading(true);
      const fu: FrontUser = await doLogin(email, password, selectedRole as Role);
      const mapped: UserObj = {
        id: fu.id,
        name: fu.name,
        role: fu.role,
        email: fu.email,
        rutPaciente: (fu as any).rut_paciente ?? (fu as any).rutPaciente,
      };
      onLogin(mapped);
    } catch (err: any) {
      setErrorMsg(err?.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: Role) => {
    const userData: UserObj = {
      id: `${role}-demo`,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role,
      email: `demo@${role}.com`,
      rutPaciente: role === 'patient' ? 12345678 : undefined
    };
    onLogin(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Activity className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-semibold text-gray-900">CuidaSalud</h1>
          </div>
          <p className="text-lg text-gray-600">Sistema de monitoreo de pacientes</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Iniciar sesión</CardTitle>
              <CardDescription>Acceda a su panel de control de seguimiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ingresar su email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresar su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(v: string) => setSelectedRole(v as Role)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar su rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center">
                          <role.icon className="h-4 w-4 mr-2" />
                          {role.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

              <Button
                onClick={handleLogin}
                className="w-full"
                disabled={!email || !password || !selectedRole || loading}
              >
                {loading ? 'Validando…' : 'Iniciar sesión'}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Usuarios demo</CardTitle>
              <CardDescription>Explorar los diferentes usuarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {roles.map((role) => (
                <Button
                  key={role.value}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => quickLogin(role.value as Role)}
                >
                  <role.icon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{role.label}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                    {role.value === 'patient' && (
                      <div className="text-xs text-gray-500 mt-1">
                        (Demo usa RUT 12345678)
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
