// src/components/paciente/PatientDashboard.tsx
import { useState } from "react";
import { DashboardLayout } from "../DashboardLayout";
import { PatientSidebar } from "./PatientSidebar";
import type { SectionKey } from "./PatientSidebar";
import PatientHome from "./PatientHome";
import PatientMeasurements from "./PatientMeasurements";
import PatientProgress from "./PatientProgress";
import PatientAchievements from "./PatientAchievements";
import MedicationTracker from "./MedicationTracker";

type Role = "admin" | "doctor" | "caregiver" | "patient";

interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  // Usamos SIEMPRE camelCase en la UI:
  rutPaciente?: number;
}

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [section, setSection] = useState<SectionKey>("home");
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
        {section === "home" && (
          <PatientHome user={user} totalPoints={totalPoints} currentStreak={currentStreak} />
        )}

        {section === "measurements" && <PatientMeasurements rutPaciente={user.rutPaciente} />}

        {section === "progress" && (
          <PatientProgress
            currentStreak={currentStreak}
            totalPoints={totalPoints}
            rutPaciente={user.rutPaciente}
          />
        )}

        {section === "medication" && (
          <MedicationTracker rutPaciente={user.rutPaciente} onBack={() => setSection("home")} />
        )}

        {section === "achievements" && <PatientAchievements />}
      </div>
    </DashboardLayout>
  );
}
