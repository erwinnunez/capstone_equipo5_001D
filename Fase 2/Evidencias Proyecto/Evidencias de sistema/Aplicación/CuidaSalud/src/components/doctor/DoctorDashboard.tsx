// src/components/DoctorDashboard.tsx
import { useState } from 'react';
import { Button } from '../ui/button';
import { Users, AlertTriangle, TrendingUp, FileText, NotepadTextDashed, CheckSquare } from 'lucide-react';
import { DashboardLayout } from '../DashboardLayout';
import DoctorPatients from './DoctorPatients';
import DoctorAnalytics from './DoctorAnalytics';
import DoctorReports from './DoctorReports';
import MedicalDashboard from './MedicalDashboard'
import SOAPNoteForm from './SOAPNoteForm'
import FollowUpChecklist from './FollowUpChecklist'
import SeguimientoTendencias from './SeguimientoTendencias'

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

export function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [section, setSection] = useState('patients');

  const sidebarContent = (
    <nav className="space-y-2">
      <Button variant={section === 'patients' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setSection('patients')}>
        <Users className="h-4 w-4 mr-2" />
        Pacientes
      </Button>
      <Button variant={section === 'alerts' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setSection('alerts')}>
        <AlertTriangle className="h-4 w-4 mr-2" />
        Alertas
      </Button>
      <Button variant={section === 'soap' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setSection('soap')}>
        <FileText className="h-4 w-4 mr-2" />
        Soap
      </Button>
      <Button variant={section === 'analytics' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setSection('analytics')}>
        <TrendingUp className="h-4 w-4 mr-2" />
        Analítica
      </Button>
      <Button variant={section === 'Seguimiento' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setSection('Seguimiento')}>
        <CheckSquare className="h-4 w-4 mr-2" />
        Seguimiento
      </Button>
      <Button variant={section === 'Seguimiento v2' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setSection('Seguimiento v2')}>
        <CheckSquare className="h-4 w-4 mr-2" />
        Seguimiento v2
      </Button>
      <Button variant={section === 'reports' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setSection('reports')}>
        <NotepadTextDashed className="h-4 w-4 mr-2" />
        Reportes
      </Button>
    </nav>
  );

  let content;
  switch (section) {
    case 'patients':
      content = <DoctorPatients />;
      break;
    case 'analytics':
      content = <DoctorAnalytics />;
      break;
    case 'Seguimiento':
      content = <FollowUpChecklist />;
      break;
    case 'Seguimiento v2':
      content = <SeguimientoTendencias />;
      break;
    case 'reports':
      content = <DoctorReports />;
      break;
    case 'alerts':
      content = <MedicalDashboard />;
      break;
    case 'soap':
      content = <SOAPNoteForm />;
      break;
    default:
      content = <DoctorPatients />;
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout} sidebarContent={sidebarContent} notifications={8}>
      {content}
    </DashboardLayout>
  );
}
