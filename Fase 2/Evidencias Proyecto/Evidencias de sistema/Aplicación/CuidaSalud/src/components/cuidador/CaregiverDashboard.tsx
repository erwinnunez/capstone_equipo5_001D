// src/components/cuidador/CaregiverDashboard.tsx
import { useState } from "react";
import { DashboardLayout } from "../DashboardLayout";
import CuidadorSidebar from "./CuidadorSidebar.tsx";
import type { CareSection } from "./CuidadorSidebar.tsx";
import CuidadorStats from "./CuidadorStats.tsx";
import CuidadorPacientes from "./CuidadorPacientes.tsx";
import CuidadorDataEntry from "./CuidadorDataEntry.tsx";
import CuidadorNotificaciones from "./CuidadorNotificaciones.tsx";
import CuidadorPreferencias from "./CuidadorPreferencias.tsx";
import PatientManagement from "./PatientManagement.tsx";
import { PatientsProvider } from "./PatientContext.tsx";
import { DailyChecklist } from "./DailyChecklist.tsx";

import { notifications, assignedPatients } from "../../data/cuidadorMock.ts";

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface CaregiverDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function CaregiverDashboard({ user, onLogout }: CaregiverDashboardProps) {
  const [section, setSection] = useState<CareSection>("patients");
  const criticalCount = notifications.filter((n) => n.type === "critical").length;

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      sidebarContent={<CuidadorSidebar current={section} onSelect={setSection} />}
      notifications={notifications.length}
    >
      <PatientsProvider>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">Caregiver Dashboard</h2>
            <p className="text-gray-600">Monitor and support your assigned patients</p>
          </div>

          <CuidadorStats assignedCount={assignedPatients.length} criticalCount={criticalCount} />

          {section === "patients" && <CuidadorPacientes onSelectPatient={(id) => console.log("select", id)} />}
          {section === "dataEntry" && <CuidadorDataEntry />}
          {section === "notifications" && <CuidadorNotificaciones />}
          {section === "management" && <PatientManagement />}
          {section === "checklist" && <DailyChecklist />}
          {section === "preferences" && <CuidadorPreferencias />}
        </div>
      </PatientsProvider>
    </DashboardLayout>
  );
}
