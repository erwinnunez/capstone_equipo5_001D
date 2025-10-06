// src/components/ui/PatientDashboard.tsx
import { useState } from 'react';
import { DashboardLayout } from '../DashboardLayout';
import { PatientSidebar } from '../paciente/PatientSidebar';
import type { SectionKey } from '../paciente/PatientSidebar';
import PatientHome from '../paciente/PatientHome';
import PatientMeasurements from '../paciente/PatientMeasurements';
import PatientProgress from '../paciente/PatientProgress';
import PatientAchievements from '../paciente/PatientAchievements';
import MedicationTracker from '../paciente/MedicationTracker';

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [section, setSection] = useState<SectionKey>('home');
  const totalPoints = 1250;
  const currentStreak = 14;

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      sidebarContent={<PatientSidebar current={section} onSelect={setSection} />}
      notifications={2}
    >
      <div className="space-y-6">
        {section === 'home' && (
          <PatientHome user={user} totalPoints={totalPoints} currentStreak={currentStreak} />
        )}
        {section === 'measurements' && <PatientMeasurements />}
        {section === 'progress' && (
          <PatientProgress currentStreak={currentStreak} totalPoints={totalPoints} />
        )}
        {section === 'medication' && (
          <MedicationTracker onBack={() => setSection('home')} />
        )}
        {section === 'achievements' && <PatientAchievements />}
      </div>
    </DashboardLayout>
  );
}
