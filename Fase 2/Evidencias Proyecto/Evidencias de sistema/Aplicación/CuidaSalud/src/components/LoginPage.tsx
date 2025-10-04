import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Activity, Shield, Stethoscope, Heart, User } from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'doctor' | 'caregiver' | 'patient';
  email: string;
}

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const roles = [
    { value: 'admin', label: 'Administrator', icon: Shield, description: 'System management and audit' },
    { value: 'doctor', label: 'Doctor', icon: Stethoscope, description: 'Patient monitoring and reports' },
    { value: 'caregiver', label: 'Caregiver', icon: Heart, description: 'Patient data entry and care' },
    { value: 'patient', label: 'Patient', icon: User, description: 'Self-monitoring and progress' }
  ];

  const handleLogin = () => {
    if (!selectedRole || !email) return;
    
    const userData: User = {
      id: `${selectedRole}-${Date.now()}`,
      name: email.split('@')[0] || 'User',
      role: selectedRole as User['role'],
      email: email
    };
    
    onLogin(userData);
  };

  const quickLogin = (role: string) => {
    const userData: User = {
      id: `${role}-demo`,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role: role as User['role'],
      email: `demo@${role}.com`
    };
    onLogin(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Activity className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-semibold text-gray-900">HealthMonitor</h1>
          </div>
          <p className="text-lg text-gray-600">Professional Patient Monitoring System</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Access your healthcare monitoring dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
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
              <Button 
                onClick={handleLogin} 
                className="w-full"
                disabled={!email || !selectedRole}
              >
                Sign In
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Quick Demo Access</CardTitle>
              <CardDescription>
                Explore different user roles and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {roles.map((role) => (
                <Button
                  key={role.value}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => quickLogin(role.value)}
                >
                  <role.icon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{role.label}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
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