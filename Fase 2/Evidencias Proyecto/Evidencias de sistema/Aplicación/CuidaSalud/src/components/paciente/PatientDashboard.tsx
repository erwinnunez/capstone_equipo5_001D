// src/components/paciente/PatientDashboard.tsx
import { useEffect, useState } from "react";
import { getGamificacionPerfil } from "../../services/gamificacion";
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
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);

  useEffect(() => {
    const rut = user.rutPaciente ? String(user.rutPaciente) : undefined;
    if (!rut) return;
  // setLoadingGamificacion(true); // eliminado, ya no se usa
    getGamificacionPerfil(rut)
      .then((perfil) => {
        setTotalPoints(perfil.puntos ?? 0);
        setCurrentStreak(perfil.racha_dias ?? 0);
      })
      .catch(() => {
        setTotalPoints(0);
        setCurrentStreak(0);
      })
  .finally(() => {}); // eliminado, ya no se usa
  }, [user.rutPaciente]);

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      sidebarContent={<PatientSidebar current={section} onSelect={setSection} />}
    >
      <div className="space-y-6">
        {section === "home" && (
          <PatientHome
            user={user}
            totalPoints={totalPoints}
            currentStreak={currentStreak}
          />
        )}

        {section === "measurements" && (
          <PatientMeasurements rutPaciente={user.rutPaciente?.toString()} />
        )}

        {section === "progress" && (
          <PatientProgress rutPaciente={user.rutPaciente} />
        )}

        {section === "medication" && (
          <MedicationTracker rutPaciente={user.rutPaciente} onBack={() => setSection("home")} />
        )}

        {section === "achievements" && <PatientAchievements />}
      </div>
    </DashboardLayout>
  );
}
