import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { CaregiverDashboard } from './components/CaregiverDashboard';
import { PatientDashboard } from './components/PatientDashboard';

type UserRole = 'admin' | 'doctor' | 'caregiver' | 'patient';

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    case 'doctor':
      return <DoctorDashboard user={user} onLogout={handleLogout} />;
    case 'caregiver':
      return <CaregiverDashboard user={user} onLogout={handleLogout} />;
    case 'patient':
      return <PatientDashboard user={user} onLogout={handleLogout} />;
    default:
      return <LoginPage onLogin={handleLogin} />;
  }
}