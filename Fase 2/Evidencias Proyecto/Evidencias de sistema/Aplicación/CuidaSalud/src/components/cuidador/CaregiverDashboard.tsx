// src/components/cuidador/CaregiverDashboard.tsx
import { useState } from "react";
import { DashboardLayout } from "../DashboardLayout";
import CuidadorSidebar from "./CuidadorSidebar.tsx";
import type { CareSection } from "./CuidadorSidebar.tsx";
import CuidadorStats from "./CuidadorStats.tsx";
import CuidadorPacientes from "./CuidadorPacientes.tsx";
import CuidadorDataEntry from "./CuidadorDataEntry.tsx";
import CuidadorNotificaciones from "./CuidadorNotificaciones.tsx";
import AddPatientButton from "./AddPatientButton.tsx";
import { PatientsProvider } from "./PatientContext.tsx";
import { DailyChecklist } from "./DailyChecklist.tsx";

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

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      sidebarContent={<CuidadorSidebar current={section} onSelect={setSection} />}
    >
      <PatientsProvider>
        <div className="space-y-6">
          {section === "patients" && (
            <div className="space-y-6">
              {/* Indicadores solo en la sección Mis Pacientes */}
              <CuidadorStats />
              
              {/* Botón Agregar Paciente debajo de los indicadores */}
              <div className="flex justify-start">
                <AddPatientButton />
              </div>

              <CuidadorPacientes onSelectPatient={(rutPaciente) => console.log("select paciente RUT:", rutPaciente)} />
            </div>
          )}
          {section === "dataEntry" && <CuidadorDataEntry />}
          {section === "notifications" && <CuidadorNotificaciones cuidadorId={user.id} />}
          {section === "checklist" && <DailyChecklist />}
        </div>
      </PatientsProvider>
    </DashboardLayout>
  );
}
